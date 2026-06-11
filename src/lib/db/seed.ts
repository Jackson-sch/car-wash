import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import * as schema from './schema';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ Error: DATABASE_URL no está definido en .env.local");
    process.exit(1);
  }

  console.log("⏳ Conectando a la base de datos...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log("🧹 Limpiando base de datos antes de sembrar...");
    // Eliminar en orden inverso de dependencias para evitar violaciones de clave foránea
    await db.delete(schema.auditoriaLogs);
    await db.delete(schema.cuponesUsos);
    await db.delete(schema.cuponServicios);
    await db.delete(schema.cupones);
    await db.delete(schema.notificaciones);
    await db.delete(schema.inventarioMovimientos);
    await db.delete(schema.inventario);
    await db.delete(schema.puntosFidelidad);
    await db.delete(schema.pagos);
    await db.delete(schema.ordenServicios);
    await db.delete(schema.ordenes);
    await db.delete(schema.turnosCaja);
    await db.delete(schema.paqueteServicios);
    await db.delete(schema.paquetes);
    await db.delete(schema.servicios);
    await db.delete(schema.categoriasServicio);
    await db.delete(schema.vehiculos);
    await db.delete(schema.clientes);
    await db.delete(schema.sesiones);
    await db.delete(schema.cuentas);
    await db.delete(schema.usuarios);
    await db.delete(schema.sucursales);
    await db.delete(schema.empresas);
    await db.delete(schema.planes);
    await db.delete(schema.configGlobal);
    console.log("✨ Base de datos limpia.");

    // --- 0. PLANES ---
    console.log("🌱 Sembrando planes...");
    await db.insert(schema.planes).values([
      {
        codigo: "free",
        nombre: "Free",
        descripcion: "Plan gratuito para pequeños emprendedores. Incluye 1 sucursal y hasta 5 usuarios.",
        precio: "0",
        limiteSucursales: 1,
        limiteUsuarios: 5,
        features: {
          ordenes: true,
          clientes: true,
          vehiculos: true,
          reportes: false,
          inventario: false,
          cupones: false,
          empleados: false,
          soporte_prioritario: false,
        },
        activo: true,
      },
      {
        codigo: "pro",
        nombre: "Pro",
        descripcion: "Plan profesional multi-sucursal con reportes e inventario.",
        precio: "99.99",
        limiteSucursales: null,
        limiteUsuarios: null,
        features: {
          ordenes: true,
          clientes: true,
          vehiculos: true,
          reportes: true,
          inventario: true,
          cupones: true,
          empleados: true,
          soporte_prioritario: false,
        },
        activo: true,
      },
      {
        codigo: "enterprise",
        nombre: "Enterprise",
        descripcion: "Plan corporativo con características ilimitadas y soporte prioritario.",
        precio: "299.99",
        limiteSucursales: null,
        limiteUsuarios: null,
        features: {
          ordenes: true,
          clientes: true,
          vehiculos: true,
          reportes: true,
          inventario: true,
          cupones: true,
          empleados: true,
          soporte_prioritario: true,
        },
        activo: true,
      },
    ]);

    // --- 1. EMPRESAS ---
    console.log("🌱 Sembrando empresas...");
    const [empresaDefault] = await db.insert(schema.empresas).values({
      nombre: "Car Wash Pro Perú",
      plan: "pro",
      activo: true,
    }).returning();

    // --- 2. SUCURSALES ---
    console.log("🌱 Sembrando sucursales...");
    const [sucursalMiraflores] = await db.insert(schema.sucursales).values({
      empresaId: empresaDefault.id,
      nombre: "Sucursal Lima - Miraflores",
      direccion: "Av. Santa Cruz 830, Miraflores, Lima",
      telefono: "01-4456789",
      email: "miraflores@carwashpro.pe",
      ruc: "20123456789",
      config: { igv: 18, moneda: "PEN" },
      activa: true,
    }).returning();

    const [sucursalSurco] = await db.insert(schema.sucursales).values({
      empresaId: empresaDefault.id,
      nombre: "Sucursal Lima - Surco",
      direccion: "Av. Primavera 1240, Santiago de Surco, Lima",
      telefono: "01-3728956",
      email: "surco@carwashpro.pe",
      ruc: "20123456780",
      config: { igv: 18, moneda: "PEN" },
      activa: true,
    }).returning();

    const [sucursalSanIsidro] = await db.insert(schema.sucursales).values({
      empresaId: empresaDefault.id,
      nombre: "Sucursal Lima - San Isidro",
      direccion: "Av. Javier Prado Oeste 1150, San Isidro, Lima",
      telefono: "01-4219854",
      email: "sanisidro@carwashpro.pe",
      ruc: "20123456781",
      config: { igv: 18, moneda: "PEN" },
      activa: true,
    }).returning();

    // --- 3. USUARIOS ---
    console.log("🌱 Sembrando usuarios...");
    const usersData = [
      // Super Admin global
      {
        id: "usr_superadmin",
        empresaId: null,
        sucursalId: null,
        nombre: "Super",
        apellido: "Admin",
        email: "superadmin@washmaster.com",
        emailVerified: true,
        rol: "superadmin" as const,
        telefono: "999999999",
      },
      // Administrador global
      {
        id: "usr_admin",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Alex",
        apellido: "Administrador",
        email: "admin@carwashpro.com",
        emailVerified: true,
        rol: "admin" as const,
        telefono: "999888777",
      },
      // Miraflores Staff
      {
        id: "usr_sup_mira",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Roberto",
        apellido: "Supervisor Miraflores",
        email: "roberto.mira@carwashpro.com",
        emailVerified: true,
        rol: "supervisor" as const,
        telefono: "987654321",
      },
      {
        id: "usr_cajero_mira",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Doris",
        apellido: "Cajera Miraflores",
        email: "doris.mira@carwashpro.com",
        emailVerified: true,
        rol: "cajero" as const,
        telefono: "956341278",
      },
      {
        id: "usr_lavador_mira1",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Carlos",
        apellido: "Lavador Miraflores 1",
        email: "carlos.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "951478632",
      },
      {
        id: "usr_lavador_mira2",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Juan",
        apellido: "Lavador Miraflores 2",
        email: "juan.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "953214789",
      },
      {
        id: "usr_lavador_mira3",
        empresaId: empresaDefault.id,
        sucursalId: sucursalMiraflores.id,
        nombre: "Pedro",
        apellido: "Lavador Miraflores 3",
        email: "pedro.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "955112233",
      },
      // Surco Staff
      {
        id: "usr_sup_surco",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSurco.id,
        nombre: "Patricia",
        apellido: "Supervisor Surco",
        email: "patricia.surco@carwashpro.com",
        emailVerified: true,
        rol: "supervisor" as const,
        telefono: "912345678",
      },
      {
        id: "usr_cajero_surco",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSurco.id,
        nombre: "Esteban",
        apellido: "Cajero Surco",
        email: "esteban.surco@carwashpro.com",
        emailVerified: true,
        rol: "cajero" as const,
        telefono: "963258741",
      },
      {
        id: "usr_lavador_surco1",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSurco.id,
        nombre: "Luis",
        apellido: "Lavador Surco 1",
        email: "luis.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "948756123",
      },
      {
        id: "usr_lavador_surco2",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSurco.id,
        nombre: "Miguel",
        apellido: "Lavador Surco 2",
        email: "miguel.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "932145687",
      },
      {
        id: "usr_lavador_surco3",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSurco.id,
        nombre: "Jorge",
        apellido: "Lavador Surco 3",
        email: "jorge.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "944556677",
      },
      // San Isidro Staff
      {
        id: "usr_sup_sanisidro",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSanIsidro.id,
        nombre: "Fernando",
        apellido: "Supervisor San Isidro",
        email: "fernando.si@carwashpro.com",
        emailVerified: true,
        rol: "supervisor" as const,
        telefono: "966442211",
      },
      {
        id: "usr_cajero_sanisidro",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSanIsidro.id,
        nombre: "Andrea",
        apellido: "Cajera San Isidro",
        email: "andrea.si@carwashpro.com",
        emailVerified: true,
        rol: "cajero" as const,
        telefono: "977881122",
      },
      {
        id: "usr_lavador_sanisidro1",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSanIsidro.id,
        nombre: "David",
        apellido: "Lavador San Isidro 1",
        email: "david.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "988776655",
      },
      {
        id: "usr_lavador_sanisidro2",
        empresaId: empresaDefault.id,
        sucursalId: sucursalSanIsidro.id,
        nombre: "Mario",
        apellido: "Lavador San Isidro 2",
        email: "mario.lav@carwashpro.com",
        emailVerified: true,
        rol: "lavador" as const,
        telefono: "999112233",
      },
    ];

    for (const u of usersData) {
      await db.insert(schema.usuarios).values(u);
    }

    // --- 3.5. CUENTAS (PASSWORDS) ---
    console.log("🔑 Sembrando contraseñas para usuarios...");
    const defaultPassword = "CarWash2026!";
    const hashedPassword = await hashPassword(defaultPassword);

    for (const u of usersData) {
      await db.insert(schema.cuentas).values({
        id: `acc_${u.id}`,
        accountId: u.id,
        providerId: "credential",
        userId: u.id,
        password: hashedPassword,
      });
    }

    // --- 4. CLIENTES ---
    console.log("🌱 Sembrando clientes...");
    const clientesData = [
      // Sucursal Miraflores
      { sucursalId: sucursalMiraflores.id, nombre: "Juan", apellido: "Pérez", telefono: "987123456", email: "juan.perez@gmail.com", tipoDoc: "DNI" as const, nroDoc: "45678912" },
      { sucursalId: sucursalMiraflores.id, nombre: "María", apellido: "Gonzáles", telefono: "965478321", email: "maria.g@outlook.com", tipoDoc: "DNI" as const, nroDoc: "12345678" },
      { sucursalId: sucursalMiraflores.id, nombre: "Inversiones", apellido: "Tacna S.A.C.", telefono: "988777666", email: "contacto@itacna.pe", tipoDoc: "RUC" as const, nroDoc: "20547896541" },
      { sucursalId: sucursalMiraflores.id, nombre: "Carlos", apellido: "Rodríguez", telefono: "941236587", email: "crodriguez@hotmail.com", tipoDoc: "CE" as const, nroDoc: "00124578" },
      { sucursalId: sucursalMiraflores.id, nombre: "Pedro", apellido: "Castro", telefono: "981472583", email: "pcastro@gmail.com", tipoDoc: "DNI" as const, nroDoc: "23456789" },
      { sucursalId: sucursalMiraflores.id, nombre: "Elena", apellido: "Beltrán", telefono: "972148563", email: "ebeltran@yahoo.com", tipoDoc: "DNI" as const, nroDoc: "34567890" },
      { sucursalId: sucursalMiraflores.id, nombre: "Constructora del Pacífico", apellido: "S.A.", telefono: "944888222", email: "logistica@copacifico.com.pe", tipoDoc: "RUC" as const, nroDoc: "20875412965" },
      
      // Sucursal Surco
      { sucursalId: sucursalSurco.id, nombre: "Ana", apellido: "Martínez", telefono: "932654789", email: "ana.m@gmail.com", tipoDoc: "DNI" as const, nroDoc: "78945612" },
      { sucursalId: sucursalSurco.id, nombre: "Luis", apellido: "Quispe", telefono: "945123789", email: "lquispe@gmail.com", tipoDoc: "DNI" as const, nroDoc: "98745632" },
      { sucursalId: sucursalSurco.id, nombre: "Sofía", apellido: "Alva", telefono: "987456123", email: "sofia.alva@outlook.com", tipoDoc: "DNI" as const, nroDoc: "32165498" },
      { sucursalId: sucursalSurco.id, nombre: "Logística Express", apellido: "E.I.R.L.", telefono: "999777555", email: "informes@logex.pe", tipoDoc: "RUC" as const, nroDoc: "20658741235" },
      { sucursalId: sucursalSurco.id, nombre: "Ricardo", apellido: "Palma", telefono: "984251639", email: "rpalma@gmail.com", tipoDoc: "DNI" as const, nroDoc: "45671239" },
      { sucursalId: sucursalSurco.id, nombre: "Carmen", apellido: "Ludeña", telefono: "963524187", email: "carmen.lud@gmail.com", tipoDoc: "DNI" as const, nroDoc: "56781230" },

      // Sucursal San Isidro
      { sucursalId: sucursalSanIsidro.id, nombre: "Javier", apellido: "Mendoza", telefono: "914253678", email: "jmendoza@sanisidro.pe", tipoDoc: "DNI" as const, nroDoc: "67890123" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Lucía", apellido: "Guerrero", telefono: "925364789", email: "lucia.guerrero@live.com", tipoDoc: "DNI" as const, nroDoc: "78901234" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Hugo", apellido: "Sánchez", telefono: "936475821", email: "hugo.sanchez@gmail.com", tipoDoc: "DNI" as const, nroDoc: "89012345" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Claudia", apellido: "Vargas", telefono: "947586932", email: "cvargas@gmail.com", tipoDoc: "DNI" as const, nroDoc: "90123456" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Tomás", apellido: "Ortiz", telefono: "958697043", email: "tortiz@gmail.com", tipoDoc: "CE" as const, nroDoc: "00987456" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Gloria", apellido: "Delgado", telefono: "969708154", email: "gloria.del@outlook.com", tipoDoc: "DNI" as const, nroDoc: "01234567" },
      { sucursalId: sucursalSanIsidro.id, nombre: "Víctor", apellido: "Solís", telefono: "980819265", email: "vsolis@gmail.com", tipoDoc: "DNI" as const, nroDoc: "12345670" },
    ];

    const insertedClientes: any[] = [];
    for (const c of clientesData) {
      const [inserted] = await db.insert(schema.clientes).values(c).returning();
      insertedClientes.push(inserted);
    }

    // --- 5. VEHÍCULOS ---
    console.log("🌱 Sembrando vehículos...");
    const vehiculosData = [
      { clienteId: insertedClientes[0].id, placa: "ABC-123", marca: "Toyota", modelo: "Corolla", anio: 2021, color: "Negro", tipo: "sedan" as const, notas: "Cuidado con pintura mate" },
      { clienteId: insertedClientes[1].id, placa: "XYZ-987", marca: "Hyundai", modelo: "Tucson", anio: 2022, color: "Gris", tipo: "suv" as const, notas: "Tiene cámara posterior sensible" },
      { clienteId: insertedClientes[2].id, placa: "F2G-456", marca: "Ford", modelo: "Ranger", anio: 2020, color: "Blanco", tipo: "pickup" as const, notas: "Remover barro de guardafangos" },
      { clienteId: insertedClientes[3].id, placa: "M4T-789", marca: "Yamaha", modelo: "R3", anio: 2023, color: "Azul", tipo: "moto" as const, notas: "Limpieza de cadena detallada" },
      { clienteId: insertedClientes[4].id, placa: "P5T-752", marca: "Kia", modelo: "Cerato", anio: 2018, color: "Rojo", tipo: "sedan" as const },
      { clienteId: insertedClientes[5].id, placa: "A9Q-143", marca: "Mazda", modelo: "CX-5", anio: 2021, color: "Azul", tipo: "suv" as const },
      { clienteId: insertedClientes[6].id, placa: "D7C-901", marca: "Mitsubishi", modelo: "L200", anio: 2019, color: "Plata", tipo: "pickup" as const },
      
      { clienteId: insertedClientes[7].id, placa: "B7Z-888", marca: "Honda", modelo: "Civic", anio: 2019, color: "Rojo", tipo: "sedan" as const, notas: "Llantas con aros de aleación pulidos" },
      { clienteId: insertedClientes[8].id, placa: "K9Y-111", marca: "Kia", modelo: "Sportage", anio: 2023, color: "Plata", tipo: "suv" as const, notas: "Limpiar sunroof con cuidado" },
      { clienteId: insertedClientes[9].id, placa: "P5R-222", marca: "Suzuki", modelo: "Swift", anio: 2018, color: "Azul", tipo: "sedan" as const },
      { clienteId: insertedClientes[10].id, placa: "T8U-333", marca: "Chevrolet", modelo: "N300", anio: 2021, color: "Blanco", tipo: "furgon" as const, notas: "Furgón de reparto de mercancía" },
      { clienteId: insertedClientes[11].id, placa: "M8U-456", marca: "Volkswagen", modelo: "Gol", anio: 2017, color: "Gris", tipo: "sedan" as const },
      { clienteId: insertedClientes[12].id, placa: "Z9P-123", marca: "Nissan", modelo: "Frontier", anio: 2022, color: "Negro", tipo: "pickup" as const },

      { clienteId: insertedClientes[13].id, placa: "X4E-123", marca: "BMW", modelo: "X5", anio: 2022, color: "Blanco", tipo: "suv" as const },
      { clienteId: insertedClientes[14].id, placa: "A5F-456", marca: "Audi", modelo: "A4", anio: 2020, color: "Gris", tipo: "sedan" as const },
      { clienteId: insertedClientes[15].id, placa: "P9O-789", marca: "Jeep", modelo: "Grand Cherokee", anio: 2021, color: "Negro", tipo: "suv" as const },
      { clienteId: insertedClientes[16].id, placa: "K2W-432", marca: "KTM", modelo: "Duke 390", anio: 2022, color: "Naranja", tipo: "moto" as const },
      { clienteId: insertedClientes[17].id, placa: "V3S-987", marca: "Volvo", modelo: "FH12", anio: 2015, color: "Blanco", tipo: "camion" as const, notas: "Solo lavado exterior" },
      { clienteId: insertedClientes[18].id, placa: "D2F-111", marca: "Toyota", modelo: "Hilux", anio: 2023, color: "Plata", tipo: "pickup" as const },
      { clienteId: insertedClientes[19].id, placa: "S4D-999", marca: "Subaru", modelo: "Impreza", anio: 2018, color: "Azul", tipo: "sedan" as const }
    ];

    const insertedVehiculos: any[] = [];
    for (const v of vehiculosData) {
      const [inserted] = await db.insert(schema.vehiculos).values(v).returning();
      insertedVehiculos.push(inserted);
    }

    // --- 6. CATEGORÍAS DE SERVICIO ---
    console.log("🌱 Sembrando categorías de servicio...");
    // Miraflores
    const [catLavado] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalMiraflores.id, nombre: "Lavado Básico", orden: 1 }).returning();
    const [catEstetica] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalMiraflores.id, nombre: "Estética y Pulido", orden: 2 }).returning();
    const [catTratamientos] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalMiraflores.id, nombre: "Tratamientos Especiales", orden: 3 }).returning();
    const [catInterior] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalMiraflores.id, nombre: "Servicios de Interior", orden: 4 }).returning();

    // Surco
    const [catLavadoSurco] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSurco.id, nombre: "Lavado Básico", orden: 1 }).returning();
    const [catEsteticaSurco] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSurco.id, nombre: "Estética y Pulido", orden: 2 }).returning();
    const [catTratamientosSurco] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSurco.id, nombre: "Tratamientos Especiales", orden: 3 }).returning();

    // San Isidro
    const [catLavadoSI] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSanIsidro.id, nombre: "Lavado Básico", orden: 1 }).returning();
    const [catEsteticaSI] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSanIsidro.id, nombre: "Estética y Pulido", orden: 2 }).returning();
    const [catTratamientosSI] = await db.insert(schema.categoriasServicio).values({ sucursalId: sucursalSanIsidro.id, nombre: "Tratamientos Especiales", orden: 3 }).returning();

    // --- 7. SERVICIOS ---
    console.log("🌱 Sembrando servicios...");
    const serviciosData = [
      // Miraflores
      { sucursalId: sucursalMiraflores.id, categoriaId: catLavado.id, nombre: "Lavado Simple", descripcion: "Lavado exterior a presión, aspirado rápido y silicona de llantas", precio: "25.00", duracionMin: 25, aplicaA: ["sedan", "suv", "moto"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catLavado.id, nombre: "Lavado Premium", descripcion: "Lavado Simple + Aspirado profundo, cera líquida protectora y purificación de aire", precio: "45.00", duracionMin: 45, aplicaA: ["sedan", "suv", "pickup", "furgon"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catLavado.id, nombre: "Lavado de Motor", descripcion: "Lavado con vapor a presión y aplicación de dieléctrico protector", precio: "50.00", duracionMin: 30, aplicaA: ["sedan", "suv", "pickup", "camion"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catEstetica.id, nombre: "Encerado Orbital", descripcion: "Descontaminado de pintura con Claybar y cera carnauba premium", precio: "100.00", duracionMin: 60, aplicaA: ["sedan", "suv", "pickup", "moto"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catEstetica.id, nombre: "Lavado de Salón Completo", descripcion: "Desmontado de asientos, lavado de alfombras, techo, consola e hidratación", precio: "250.00", duracionMin: 240, aplicaA: ["sedan", "suv", "pickup"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catEstetica.id, nombre: "Pulido Corrección 1 Paso", descripcion: "Corrección de micro-rayas (swirls) y abrillantado de pintura", precio: "300.00", duracionMin: 180, aplicaA: ["sedan", "suv", "moto"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catTratamientos.id, nombre: "Tratamiento Cerámico 9H", descripcion: "Corrección en 2 pasos + Sellador cerámico de alta repelencia", precio: "750.00", duracionMin: 480, aplicaA: ["sedan", "suv", "pickup"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catInterior.id, nombre: "Desinfección Ozono y Vapor", descripcion: "Eliminación de olores y bacterias en habitáculo", precio: "60.00", duracionMin: 30, aplicaA: ["sedan", "suv", "pickup", "furgon"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catInterior.id, nombre: "Aspirado Detallado", descripcion: "Aspirado minucioso de ranuras y maletera", precio: "30.00", duracionMin: 20, aplicaA: ["sedan", "suv", "pickup", "furgon", "camion"] },
      { sucursalId: sucursalMiraflores.id, categoriaId: catInterior.id, nombre: "Pulido de Faros", descripcion: "Restauración de faros amarillentos (par)", precio: "80.00", duracionMin: 40, aplicaA: ["sedan", "suv", "pickup"] },

      // Surco
      { sucursalId: sucursalSurco.id, categoriaId: catLavadoSurco.id, nombre: "Lavado Simple", descripcion: "Lavado exterior a presión, aspirado rápido y silicona de llantas", precio: "25.00", duracionMin: 25, aplicaA: ["sedan", "suv", "moto"] },
      { sucursalId: sucursalSurco.id, categoriaId: catLavadoSurco.id, nombre: "Lavado Premium", descripcion: "Lavado Simple + Aspirado profundo, cera líquida protectora y purificación de aire", precio: "45.00", duracionMin: 45, aplicaA: ["sedan", "suv", "pickup", "furgon"] },
      { sucursalId: sucursalSurco.id, categoriaId: catLavadoSurco.id, nombre: "Lavado de Motor", descripcion: "Lavado con vapor a presión y aplicación de dieléctrico protector", precio: "50.00", duracionMin: 30, aplicaA: ["sedan", "suv", "pickup", "camion"] },
      { sucursalId: sucursalSurco.id, categoriaId: catEsteticaSurco.id, nombre: "Encerado Orbital", descripcion: "Descontaminado de pintura con Claybar y cera carnauba premium", precio: "100.00", duracionMin: 60, aplicaA: ["sedan", "suv", "pickup", "moto"] },
      { sucursalId: sucursalSurco.id, categoriaId: catEsteticaSurco.id, nombre: "Lavado de Salón Completo", descripcion: "Desmontado de asientos, lavado de alfombras, techo, consola e hidratación", precio: "250.00", duracionMin: 240, aplicaA: ["sedan", "suv", "pickup"] },
      { sucursalId: sucursalSurco.id, categoriaId: catTratamientosSurco.id, nombre: "Tratamiento Cerámico 9H", descripcion: "Corrección en 2 pasos + Sellador cerámico de alta repelencia", precio: "750.00", duracionMin: 480, aplicaA: ["sedan", "suv", "pickup"] },

      // San Isidro
      { sucursalId: sucursalSanIsidro.id, categoriaId: catLavadoSI.id, nombre: "Lavado Simple", descripcion: "Lavado exterior a presión, aspirado rápido y silicona de llantas", precio: "25.00", duracionMin: 25, aplicaA: ["sedan", "suv", "moto"] },
      { sucursalId: sucursalSanIsidro.id, categoriaId: catLavadoSI.id, nombre: "Lavado Premium", descripcion: "Lavado Simple + Aspirado profundo, cera líquida protectora y purificación de aire", precio: "45.00", duracionMin: 45, aplicaA: ["sedan", "suv", "pickup", "furgon"] },
      { sucursalId: sucursalSanIsidro.id, categoriaId: catLavadoSI.id, nombre: "Lavado de Motor", descripcion: "Lavado con vapor a presión y aplicación de dieléctrico protector", precio: "50.00", duracionMin: 30, aplicaA: ["sedan", "suv", "pickup", "camion"] },
      { sucursalId: sucursalSanIsidro.id, categoriaId: catEsteticaSI.id, nombre: "Encerado Orbital", descripcion: "Descontaminado de pintura con Claybar y cera carnauba premium", precio: "100.00", duracionMin: 60, aplicaA: ["sedan", "suv", "pickup", "moto"] },
      { sucursalId: sucursalSanIsidro.id, categoriaId: catEsteticaSI.id, nombre: "Lavado de Salón Completo", descripcion: "Desmontado de asientos, lavado de alfombras, techo, consola e hidratación", precio: "250.00", duracionMin: 240, aplicaA: ["sedan", "suv", "pickup"] },
      { sucursalId: sucursalSanIsidro.id, categoriaId: catTratamientosSI.id, nombre: "Tratamiento Cerámico 9H", descripcion: "Corrección en 2 pasos + Sellador cerámico de alta repelencia", precio: "750.00", duracionMin: 480, aplicaA: ["sedan", "suv", "pickup"] },
    ];

    const insertedServicios = [];
    for (const s of serviciosData) {
      const [inserted] = await db.insert(schema.servicios).values(s).returning();
      insertedServicios.push(inserted);
    }

    // Filtros de servicios para Miraflores (usado para paquetes y bucle)
    const miraServicios = insertedServicios.filter(s => s.sucursalId === sucursalMiraflores.id);
    const surcoServicios = insertedServicios.filter(s => s.sucursalId === sucursalSurco.id);
    const siServicios = insertedServicios.filter(s => s.sucursalId === sucursalSanIsidro.id);

    // --- 8. PAQUETES ---
    console.log("🌱 Sembrando paquetes...");
    // Miraflores
    const [paqueteFull] = await db.insert(schema.paquetes).values({
      sucursalId: sucursalMiraflores.id,
      nombre: "Combo Brillo Extremo",
      descripcion: "Lavado Premium + Encerado Orbital con Carnauba",
      precio: "125.00",
      activo: true,
    }).returning();

    const [paqueteSalonMotor] = await db.insert(schema.paquetes).values({
      sucursalId: sucursalMiraflores.id,
      nombre: "Combo Renovación Total",
      descripcion: "Lavado de Salón + Lavado de Motor + Encerado Orbital",
      precio: "350.00",
      activo: true,
    }).returning();

    const [paqueteProtector] = await db.insert(schema.paquetes).values({
      sucursalId: sucursalMiraflores.id,
      nombre: "Combo Protector Interior",
      descripcion: "Lavado Premium + Desinfección con Ozono y Vapor",
      precio: "85.00",
      activo: true,
    }).returning();

    // --- 9. RELACIONES PAQUETE-SERVICIOS ---
    console.log("🌱 Enlazando paquete-servicios...");
    // Combo Brillo Extremo
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteFull.id, servicioId: miraServicios[1].id }); // Premium
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteFull.id, servicioId: miraServicios[3].id }); // Encerado

    // Combo Renovación Total
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteSalonMotor.id, servicioId: miraServicios[4].id }); // Salón
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteSalonMotor.id, servicioId: miraServicios[2].id }); // Motor
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteSalonMotor.id, servicioId: miraServicios[3].id }); // Encerado

    // Combo Protector Interior
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteProtector.id, servicioId: miraServicios[1].id }); // Premium
    await db.insert(schema.paqueteServicios).values({ paqueteId: paqueteProtector.id, servicioId: miraServicios[7].id }); // Ozono

    // --- 10. INVENTARIO Y MOVIMIENTOS INICIALES ---
    console.log("🌱 Sembrando catálogo de inventario...");
    const itemsInventario = [
      {
        sucursalId: sucursalMiraflores.id,
        nombre: "Shampoo Car Wash pH Neutro (Galón)",
        descripcion: "Limpiador concentrado espumante con cera biodegradable",
        unidad: "Galones",
        stock: "15.000",
        stockMinimo: "5.000",
        precioCompra: "35.50",
        proveedor: "Sonax Perú",
        activo: true,
      },
      {
        sucursalId: sucursalMiraflores.id,
        nombre: "Paño de Microfibra 40x40cm",
        descripcion: "Paño absorbente de secado sin rayas (300 GSM)",
        unidad: "Unidades",
        stock: "8.000",
        stockMinimo: "10.000", // Alerta: bajo el mínimo
        precioCompra: "4.50",
        proveedor: "Distribuidora 3M Lima",
        activo: true,
      },
      {
        sucursalId: sucursalMiraflores.id,
        nombre: "Cera en Pasta Carnauba Premium 300g",
        descripcion: "Cera en pasta para brillo profundo espejo",
        unidad: "Potes",
        stock: "12.000",
        stockMinimo: "3.000",
        precioCompra: "65.00",
        proveedor: "Meguiar's Importaciones",
        activo: true,
      },
      {
        sucursalId: sucursalMiraflores.id,
        nombre: "APC All Purpose Cleaner (Galón)",
        descripcion: "Limpiador multiusos para plásticos y tapizados",
        unidad: "Galones",
        stock: "3.000",
        stockMinimo: "4.000", // Alerta: bajo el mínimo
        precioCompra: "28.90",
        proveedor: "Sonax Perú",
        activo: true,
      },
      {
        sucursalId: sucursalMiraflores.id,
        nombre: "Silicona de Llantas Alto Brillo",
        descripcion: "Protector e hidratador de neumáticos efecto mojado",
        unidad: "Galones",
        stock: "10.000",
        stockMinimo: "3.000",
        precioCompra: "22.00",
        proveedor: "Química Industrial Lima",
        activo: true,
      }
    ];

    const insertedItems: any[] = [];
    for (const item of itemsInventario) {
      const [inserted] = await db.insert(schema.inventario).values(item).returning();
      insertedItems.push(inserted);
    }

    // Registrar compras iniciales (movimiento entrada)
    for (const item of insertedItems) {
      await db.insert(schema.inventarioMovimientos).values({
        itemId: item.id,
        tipo: "entrada" as const,
        cantidad: "25.000",
        motivo: "Compra e ingreso inicial del almacén central",
        usuarioId: "usr_admin",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // Hace 8 días
      });
    }


    // --- 11. GENERACIÓN DINÁMICA DE HISTORIAL DE 8 DÍAS ---
    console.log("🌱 Generando historial financiero de 8 días...");

    const sucursalesList = [
      {
        info: sucursalMiraflores,
        cajeroId: "usr_cajero_mira",
        lavadores: ["usr_lavador_mira1", "usr_lavador_mira2", "usr_lavador_mira3"],
        servicios: miraServicios,
        clientes: insertedClientes.filter(c => c.sucursalId === sucursalMiraflores.id),
        vehiculos: insertedVehiculos.filter(v => insertedClientes.find(c => c.id === v.clienteId)?.sucursalId === sucursalMiraflores.id),
        ticketPrefix: "T-MIRA"
      },
      {
        info: sucursalSurco,
        cajeroId: "usr_cajero_surco",
        lavadores: ["usr_lavador_surco1", "usr_lavador_surco2", "usr_lavador_surco3"],
        servicios: surcoServicios,
        clientes: insertedClientes.filter(c => c.sucursalId === sucursalSurco.id),
        vehiculos: insertedVehiculos.filter(v => insertedClientes.find(c => c.id === v.clienteId)?.sucursalId === sucursalSurco.id),
        ticketPrefix: "T-SURC"
      },
      {
        info: sucursalSanIsidro,
        cajeroId: "usr_cajero_sanisidro",
        lavadores: ["usr_lavador_sanisidro1", "usr_lavador_sanisidro2"],
        servicios: siServicios,
        clientes: insertedClientes.filter(c => c.sucursalId === sucursalSanIsidro.id),
        vehiculos: insertedVehiculos.filter(v => insertedClientes.find(c => c.id === v.clienteId)?.sucursalId === sucursalSanIsidro.id),
        ticketPrefix: "T-SANI"
      }
    ];

    let ticketCounter = 1000;

    // Bucle para los últimos 8 días (del día -7 a hoy 0)
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const isToday = dayOffset === 0;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - dayOffset);
      
      const dateString = targetDate.toDateString();
      console.log(`  📅 Procesando día: ${targetDate.toLocaleDateString('es-PE')} (${isToday ? 'Hoy' : 'Historial'})`);

      for (const branch of sucursalesList) {
        // En cada sucursal abrimos un turno de caja
        const aperturaTime = new Date(targetDate);
        aperturaTime.setHours(8, 0, 0, 0);

        // Turno inicial
        const montoInicial = "200.00";
        let totalCajaDia = parseFloat(montoInicial);

        const [turno] = await db.insert(schema.turnosCaja).values({
          sucursalId: branch.info.id,
          empleadoId: branch.cajeroId,
          apertura: aperturaTime,
          montoInicial: montoInicial,
          observaciones: isToday ? "Turno activo de hoy" : `Cierre diario consolidado para el ${targetDate.toLocaleDateString()}`,
          createdAt: aperturaTime
        }).returning();

        // Número de órdenes del día en esta sucursal (entre 2 y 5 órdenes por día)
        const numOrders = Math.floor(Math.random() * 4) + 2; 
        
        for (let i = 0; i < numOrders; i++) {
          ticketCounter++;
          const orderTime = new Date(aperturaTime);
          // Distribuir órdenes a lo largo del día entre las 9 AM y las 6 PM
          orderTime.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0);

          // Seleccionar vehículo y lavador
          const vehiculo = branch.vehiculos[Math.floor(Math.random() * branch.vehiculos.length)];
          if (!vehiculo) continue;
          
          const lavadorId = branch.lavadores[Math.floor(Math.random() * branch.lavadores.length)];

          // Determinar estado de la orden
          let estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado" = "cobrado";
          
          if (isToday) {
            // Hoy hay órdenes en diferentes estados
            const rand = Math.random();
            if (rand < 0.15) estado = "pendiente";
            else if (rand < 0.35) estado = "en_proceso";
            else if (rand < 0.50) estado = "completado";
            else if (rand < 0.90) estado = "cobrado";
            else estado = "cancelado";
          } else {
            // Historial: mayormente cobrado, pocas canceladas
            estado = Math.random() < 0.08 ? "cancelado" : "cobrado";
          }

          // Seleccionar 1 o 2 servicios
          const cantServicios = Math.random() < 0.85 ? 1 : 2;
          const selectedServs: any[] = [];
          for (let sIdx = 0; sIdx < cantServicios; sIdx++) {
            const serv = branch.servicios[Math.floor(Math.random() * branch.servicios.length)];
            if (serv && !selectedServs.includes(serv)) {
              selectedServs.push(serv);
            }
          }

          if (selectedServs.length === 0) continue;

          // Calcular importes
          let subtotal = 0;
          for (const s of selectedServs) {
            subtotal += parseFloat(s.precio);
          }

          // Si es Miraflores y se puede agrupar como paquete, a veces simular el paquete
          let nombreTicketServicio = selectedServs[0].nombre;
          let esPaquete = false;
          let paqueteIdRef = null;

          if (branch.info.id === sucursalMiraflores.id && selectedServs.length === 2 && Math.random() < 0.5) {
            // Cambiar a precio Combo Brillo Extremo
            subtotal = 125.00;
            nombreTicketServicio = "Combo Brillo Extremo";
            esPaquete = true;
            paqueteIdRef = paqueteFull.id;
          }

          const descuento = 0.00;
          const total = subtotal - descuento;
          // IGV del total (18% incluido en el Perú)
          const igv = total * 0.18;

          // Crear la orden
          const [orden] = await db.insert(schema.ordenes).values({
            sucursalId: branch.info.id,
            turnoId: turno.id,
            vehiculoId: vehiculo.id,
            empleadoId: estado === "pendiente" ? null : lavadorId,
            cajeroId: branch.cajeroId,
            estado: estado,
            prioridad: Math.random() < 0.2 ? 1 : 0,
            subtotal: subtotal.toFixed(2),
            descuento: descuento.toFixed(2),
            igv: igv.toFixed(2),
            total: total.toFixed(2),
            nroTicket: `${branch.ticketPrefix}-${ticketCounter}`,
            notas: estado === "cancelado" ? "Cancelado por el cliente por demora" : undefined,
            createdAt: orderTime,
            updatedAt: orderTime
          }).returning();

          // Detalle de servicios
          if (esPaquete && paqueteIdRef) {
            // Relación con el primer servicio del combo
            await db.insert(schema.ordenServicios).values({
              ordenId: orden.id,
              servicioId: selectedServs[0].id,
              nombreServicio: "Combo Brillo Extremo - Lavado Premium",
              precioUnitario: "75.00",
              cantidad: 1,
              subtotal: "75.00",
              createdAt: orderTime
            });
            // Segundo servicio
            await db.insert(schema.ordenServicios).values({
              ordenId: orden.id,
              servicioId: selectedServs[1].id,
              nombreServicio: "Combo Brillo Extremo - Encerado",
              precioUnitario: "50.00",
              cantidad: 1,
              subtotal: "50.00",
              createdAt: orderTime
            });
          } else {
            for (const s of selectedServs) {
              await db.insert(schema.ordenServicios).values({
                ordenId: orden.id,
                servicioId: s.id,
                nombreServicio: s.nombre,
                precioUnitario: s.precio,
                cantidad: 1,
                subtotal: s.precio,
                createdAt: orderTime
              });
            }
          }

          // Si está cobrado, agregar pago e historial de fidelidad
          if (estado === "cobrado") {
            const pagoMetodos: ("efectivo" | "tarjeta" | "yape" | "plin" | "transferencia")[] = ["efectivo", "tarjeta", "yape", "plin", "transferencia"];
            const metodoPago = pagoMetodos[Math.floor(Math.random() * pagoMetodos.length)];
            
            await db.insert(schema.pagos).values({
              ordenId: orden.id,
              turnoId: turno.id,
              metodo: metodoPago,
              monto: total.toFixed(2),
              referencia: metodoPago !== "efectivo" ? `OP-${Math.floor(100000 + Math.random() * 900000)}` : null,
              cajeroId: branch.cajeroId,
              createdAt: new Date(orderTime.getTime() + 15 * 60 * 1000) // 15 minutos después
            });

            // Registrar puntos ganados (1 punto por cada 10 soles)
            const puntosGanados = Math.floor(total / 10);
            if (puntosGanados > 0) {
              await db.insert(schema.puntosFidelidad).values({
                clienteId: vehiculo.clienteId,
                ordenId: orden.id,
                puntos: puntosGanados,
                tipo: "ganado" as const,
                descripcion: `Ganado por consumo ticket ${orden.nroTicket}`,
                createdAt: orderTime
              });
            }

            totalCajaDia += total;
          }

          // Simular consumo de insumos de inventario de manera aleatoria por cada lavado simple/premium
          if (branch.info.id === sucursalMiraflores.id && estado === "cobrado") {
            const itemShampoo = insertedItems[0];
            const itemMicrofibra = insertedItems[1];

            // Consumo de shampoo: 0.1 galones por lavado
            await db.insert(schema.inventarioMovimientos).values({
              itemId: itemShampoo.id,
              tipo: "salida" as const,
              cantidad: "0.100",
              motivo: `Consumo lavado ticket ${orden.nroTicket}`,
              usuarioId: lavadorId,
              createdAt: orderTime
            });

            // 10% de probabilidad de descarte de un paño por deterioro
            if (Math.random() < 0.10) {
              await db.insert(schema.inventarioMovimientos).values({
                itemId: itemMicrofibra.id,
                tipo: "salida" as const,
                cantidad: "1.000",
                motivo: `Descarte por desgaste lavado ticket ${orden.nroTicket}`,
                usuarioId: lavadorId,
                createdAt: orderTime
              });
            }
          }
        }

        // Cierre de caja para días pasados
        if (!isToday) {
          const cierreTime = new Date(aperturaTime);
          cierreTime.setHours(19, 0, 0, 0); // 7:00 PM

          await db.update(schema.turnosCaja)
            .set({
              cierre: cierreTime,
              montoFinal: totalCajaDia.toFixed(2),
            })
            .where(eq(schema.turnosCaja.id, turno.id));
        }
      }
    }

    // --- 12. NOTIFICACIONES DE ALERTA ---
    console.log("🌱 Sembrando notificaciones de alerta...");
    await db.insert(schema.notificaciones).values({
      usuarioId: "usr_admin",
      tipo: "inventario_bajo",
      titulo: "¡Stock Mínimo Superado!",
      mensaje: "El stock de 'Paño de Microfibra 40x40cm' (8 unidades) está por debajo del mínimo configurado (10 unidades).",
      leida: false,
    });

    await db.insert(schema.notificaciones).values({
      usuarioId: "usr_admin",
      tipo: "inventario_bajo",
      titulo: "¡Stock Mínimo Superado!",
      mensaje: "El stock de 'APC All Purpose Cleaner (Galón)' (3 unidades) está por debajo del mínimo configurado (4 unidades).",
      leida: false,
    });

    await db.insert(schema.notificaciones).values({
      usuarioId: "usr_sup_mira",
      tipo: "inventario_bajo",
      titulo: "¡Alerta de Reabastecimiento!",
      mensaje: "Paño de Microfibra 40x40cm requiere compra urgente.",
      leida: false,
    });

    await db.insert(schema.notificaciones).values({
      usuarioId: "usr_sup_mira",
      tipo: "caja_alerta",
      titulo: "Cierre de Turno Exitoso",
      mensaje: "El turno de Doris Cajera en Miraflores del día de ayer cuadró correctamente.",
      leida: true,
    });

    console.log("🎉 ¡Database Seeding completado con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la siembra de la base de datos:", error);
    process.exit(1);
  }
}

main();

import * as dotenv from 'dotenv';
import * as fs from 'fs';

if (fs.existsSync('.env.development.local')) {
  dotenv.config({ path: '.env.development.local' });
}
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL no está definido.");
    process.exit(1);
  }

  console.log("⏳ Conectando a la base de datos...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("🚀 Aplicando migraciones...");
    await migrate(db, { migrationsFolder: './src/lib/db/migrations' });
    console.log("✅ ¡Migraciones aplicadas con éxito en la base de datos local!");
  } catch (error) {
    console.error("❌ Error al aplicar migraciones:", error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

runMigrations();

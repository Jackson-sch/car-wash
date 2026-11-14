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
    console.error("[ERROR] DATABASE_URL no está definido.");
    process.exit(1);
  }

  console.log("[INFO] Conectando a la base de datos...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("[INFO] Aplicando migraciones...");
    await migrate(db, { migrationsFolder: './src/lib/db/migrations' });
    console.log("[SUCCESS] ¡Migraciones aplicadas con éxito en la base de datos local!");
  } catch (error) {
    console.error("[ERROR] Error al aplicar migraciones:", error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

runMigrations();

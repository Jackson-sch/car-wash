import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize the database client.');
}

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const isDev = process.env.NODE_ENV === 'development';

const client = globalForDb.client ??= postgres(connectionString, {
  max: isDev ? 5 : 1, // En Serverless (Vercel), 1 conexión por instancia evita agotar el pooler de Supabase
  idle_timeout: 10, // Liberar conexiones inactivas rápidamente
  max_lifetime: 60 * 2,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;

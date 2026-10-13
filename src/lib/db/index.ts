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
  max: isDev ? 10 : 1, // En dev mantenemos hasta 10 para soportar requests paralelos sin bloquear
  idle_timeout: 30, // Mantener conexiones calientes por 30s para evitar TLS handshake repetitivo
  max_lifetime: 60 * 30, // 30 minutos de vida máxima por conexión
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;

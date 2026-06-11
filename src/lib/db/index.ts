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

const client = globalForDb.client ??= postgres(connectionString, {
  max: 5,
  idle_timeout: 30,
  max_lifetime: 60 * 5,
  connect_timeout: 10,
  prepare: false,
});
export const db = drizzle(client, { schema });
export type Db = typeof db;

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Cargar .env.development.local si existe para desarrollo local, con fallback a .env.local y .env
if (fs.existsSync('.env.development.local')) {
  dotenv.config({ path: '.env.development.local' });
}
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema:    './src/lib/db/schema.ts',
  out:       './src/lib/db/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

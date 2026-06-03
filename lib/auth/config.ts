import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as dbSchema from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: dbSchema.usuarios,
      session: dbSchema.sesiones,
      account: dbSchema.cuentas,
      verification: dbSchema.verificaciones,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-secret',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24,     // renovar cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      rol: {
        type: 'string',
        required: true,
        defaultValue: 'cajero',
      },
      sucursalId: {
        type: 'string',
        required: false,
      },
    },
  },
});

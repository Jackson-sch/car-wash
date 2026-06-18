import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
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
  plugins: [
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
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
  },
  user: {
    fields: {
      name: 'nombre',
    },
    additionalFields: {
      rol: {
        type: 'string',
        required: true,
        defaultValue: 'cajero',
        input: true,
      },
      empresaId: {
        type: 'string',
        required: false,
        input: true,
      },
      sucursalId: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
});


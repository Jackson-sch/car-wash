ALTER TABLE "ordenes" ADD COLUMN IF NOT EXISTS "comprobante_tipo" text;--> statement-breakpoint
ALTER TABLE "ordenes" ADD COLUMN IF NOT EXISTS "comprobante_serie" text;--> statement-breakpoint
ALTER TABLE "ordenes" ADD COLUMN IF NOT EXISTS "comprobante_numero" text;--> statement-breakpoint
ALTER TABLE "ordenes" ADD COLUMN IF NOT EXISTS "facturado_at" timestamp with time zone;
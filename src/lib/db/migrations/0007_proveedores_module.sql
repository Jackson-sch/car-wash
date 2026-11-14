CREATE TABLE IF NOT EXISTS "proveedores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sucursal_id" uuid NOT NULL,
	"ruc" text,
	"razon_social" text NOT NULL,
	"nombre_comercial" text,
	"direccion" text,
	"telefono" text,
	"email" text,
	"contacto_nombre" text,
	"banco" text,
	"cuenta_bancaria" text,
	"cci" text,
	"notas" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_proveedores_sucursal_ruc" UNIQUE("sucursal_id","ruc")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_sucursal_id_sucursales_id_fk" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursales"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_proveedores_ruc" ON "proveedores" USING btree ("ruc");
--> statement-breakpoint
ALTER TABLE "compras" ADD COLUMN IF NOT EXISTS "proveedor_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "compras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sucursal_id" uuid NOT NULL,
	"usuario_id" text,
	"proveedor_nombre" text NOT NULL,
	"proveedor_ruc" text,
	"tipo_comprobante" text DEFAULT 'factura' NOT NULL,
	"numero_comprobante" text NOT NULL,
	"fecha_emision" timestamp with time zone DEFAULT now() NOT NULL,
	"metodo_pago" text DEFAULT 'transferencia' NOT NULL,
	"estado" text DEFAULT 'completada' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"igv" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compras_detalles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compra_id" uuid NOT NULL,
	"insumo_id" uuid NOT NULL,
	"descripcion" text NOT NULL,
	"cantidad" numeric(10, 3) NOT NULL,
	"costo_unitario" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compras" ADD CONSTRAINT "compras_sucursal_id_sucursales_id_fk" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursales"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compras" ADD CONSTRAINT "compras_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compras_detalles" ADD CONSTRAINT "compras_detalles_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compras_detalles" ADD CONSTRAINT "compras_detalles_insumo_id_inventario_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."inventario"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

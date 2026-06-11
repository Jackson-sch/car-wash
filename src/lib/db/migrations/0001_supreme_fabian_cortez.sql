CREATE TYPE "public"."tipo_descuento" AS ENUM('porcentaje', 'fijo');--> statement-breakpoint
CREATE TABLE "cupon_servicios" (
	"cupon_id" uuid NOT NULL,
	"servicio_id" uuid NOT NULL,
	CONSTRAINT "cupon_servicios_cupon_id_servicio_id_pk" PRIMARY KEY("cupon_id","servicio_id")
);
--> statement-breakpoint
CREATE TABLE "cupones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sucursal_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"tipo_descuento" "tipo_descuento" NOT NULL,
	"valor_descuento" numeric(10, 2) NOT NULL,
	"compra_minima" numeric(10, 2),
	"fecha_inicio" timestamp with time zone,
	"fecha_fin" timestamp with time zone,
	"limite_total" integer,
	"limite_por_cliente" integer DEFAULT 1,
	"activo" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "cupones_sucursal_id_codigo_unique" UNIQUE("sucursal_id","codigo")
);
--> statement-breakpoint
CREATE TABLE "cupones_usos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cupon_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"orden_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cupon_servicios" ADD CONSTRAINT "cupon_servicios_cupon_id_cupones_id_fk" FOREIGN KEY ("cupon_id") REFERENCES "public"."cupones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupon_servicios" ADD CONSTRAINT "cupon_servicios_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupones" ADD CONSTRAINT "cupones_sucursal_id_sucursales_id_fk" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupones_usos" ADD CONSTRAINT "cupones_usos_cupon_id_cupones_id_fk" FOREIGN KEY ("cupon_id") REFERENCES "public"."cupones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupones_usos" ADD CONSTRAINT "cupones_usos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupones_usos" ADD CONSTRAINT "cupones_usos_orden_id_ordenes_id_fk" FOREIGN KEY ("orden_id") REFERENCES "public"."ordenes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cupones_codigo" ON "cupones" USING btree ("codigo");
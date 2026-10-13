CREATE TABLE "egresos_caja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sucursal_id" uuid NOT NULL,
	"turno_id" uuid NOT NULL,
	"monto" numeric(10, 2) NOT NULL,
	"motivo" text NOT NULL,
	"categoria" text DEFAULT 'otro' NOT NULL,
	"comprobante_num" text,
	"registrado_por_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidaciones_comisiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sucursal_id" uuid NOT NULL,
	"empleado_id" text NOT NULL,
	"fecha_desde" timestamp with time zone NOT NULL,
	"fecha_hasta" timestamp with time zone NOT NULL,
	"total_ordenes" integer DEFAULT 0 NOT NULL,
	"monto_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"metodo_pago" text DEFAULT 'efectivo' NOT NULL,
	"referencia" text,
	"notas" text,
	"pagado_por_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicio_recetas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"servicio_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"cantidad_consumo" numeric(10, 3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "servicio_recetas_servicio_id_item_id_unique" UNIQUE("servicio_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "ordenes" ADD COLUMN "liquidacion_id" uuid;--> statement-breakpoint
ALTER TABLE "egresos_caja" ADD CONSTRAINT "egresos_caja_sucursal_id_sucursales_id_fk" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresos_caja" ADD CONSTRAINT "egresos_caja_turno_id_turnos_caja_id_fk" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos_caja"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresos_caja" ADD CONSTRAINT "egresos_caja_registrado_por_id_usuarios_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_comisiones" ADD CONSTRAINT "liquidaciones_comisiones_sucursal_id_sucursales_id_fk" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_comisiones" ADD CONSTRAINT "liquidaciones_comisiones_empleado_id_usuarios_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_comisiones" ADD CONSTRAINT "liquidaciones_comisiones_pagado_por_id_usuarios_id_fk" FOREIGN KEY ("pagado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicio_recetas" ADD CONSTRAINT "servicio_recetas_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicio_recetas" ADD CONSTRAINT "servicio_recetas_item_id_inventario_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_egresos_caja_turno" ON "egresos_caja" USING btree ("turno_id");--> statement-breakpoint
CREATE INDEX "idx_egresos_caja_sucursal" ON "egresos_caja" USING btree ("sucursal_id");--> statement-breakpoint
CREATE INDEX "idx_liq_comisiones_sucursal" ON "liquidaciones_comisiones" USING btree ("sucursal_id");--> statement-breakpoint
CREATE INDEX "idx_liq_comisiones_empleado" ON "liquidaciones_comisiones" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_servicio_recetas_servicio" ON "servicio_recetas" USING btree ("servicio_id");--> statement-breakpoint
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_liquidacion_id_liquidaciones_comisiones_id_fk" FOREIGN KEY ("liquidacion_id") REFERENCES "public"."liquidaciones_comisiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_orden_servicios_orden" ON "orden_servicios" USING btree ("orden_id");--> statement-breakpoint
CREATE INDEX "idx_ordenes_empleado" ON "ordenes" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_pagos_orden" ON "pagos" USING btree ("orden_id");--> statement-breakpoint
CREATE INDEX "idx_pagos_turno" ON "pagos" USING btree ("turno_id");--> statement-breakpoint
CREATE INDEX "idx_turnos_caja_sucursal" ON "turnos_caja" USING btree ("sucursal_id");--> statement-breakpoint
CREATE INDEX "idx_turnos_caja_empleado" ON "turnos_caja" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_usuarios_sucursal" ON "usuarios" USING btree ("sucursal_id");--> statement-breakpoint
CREATE INDEX "idx_usuarios_empresa" ON "usuarios" USING btree ("empresa_id");
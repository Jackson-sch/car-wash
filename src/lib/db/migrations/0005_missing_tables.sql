CREATE TABLE IF NOT EXISTS "planes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"precio" numeric(10, 2) DEFAULT '0' NOT NULL,
	"limite_sucursales" integer,
	"limite_usuarios" integer,
	"features" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "planes_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auditoria_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" text NOT NULL,
	"usuario_nombre" text NOT NULL,
	"accion" text NOT NULL,
	"descripcion" text NOT NULL,
	"entidad" text,
	"entidad_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "config_global" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mantenimiento_activo" boolean DEFAULT false NOT NULL,
	"mantenimiento_mensaje" text DEFAULT 'Estamos realizando tareas de mantenimiento. Vuelve pronto.' NOT NULL,
	"nombre_app" text DEFAULT 'WashMaster Pro' NOT NULL,
	"logo_url" text,
	"smtp_host" text,
	"smtp_port" integer,
	"smtp_user" text,
	"smtp_pass" text,
	"smtp_from_email" text,
	"smtp_from_name" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

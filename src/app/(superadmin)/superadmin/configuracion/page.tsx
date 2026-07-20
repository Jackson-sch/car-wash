import { db } from "@/lib/db";
import { configGlobal } from "@/lib/db/schema";
import { ConfigForm } from "./config-form";


export default async function ConfiguracionPage() {
  let [config] = await db.select().from(configGlobal).limit(1);
  if (!config) {
    [config] = await db.insert(configGlobal).values({}).returning();
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Configuración Global
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra la configuración general del sistema WashMaster.
        </p>
      </div>

      <ConfigForm config={config} />
    </div>
  );
}

import { redirect } from "next/navigation";
import BootstrapForm from "./bootstrap-form";
import { checkSystemStatus } from "@/lib/actions/bootstrap";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inicializar Sistema - CarWash Pro",
  description: "Asistente de inicialización de la plataforma CarWash Pro.",
};

export default async function RegisterPage() {
  const status = await checkSystemStatus();
  
  if (status.hasUsers) {
    redirect("/login");
  }

  return <BootstrapForm />;
}

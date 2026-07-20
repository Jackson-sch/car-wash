import { redirect } from "next/navigation";
import BootstrapForm from "./bootstrap-form";
import { checkSystemStatus } from "@/lib/actions/bootstrap";


export const metadata = {
  title: "Inicializar Sistema - WashMaster Pro",
  description: "Asistente de inicialización de la plataforma WashMaster Pro.",
};

export default async function RegisterPage() {
  const status = await checkSystemStatus();
  
  if (status.hasUsers) {
    redirect("/login");
  }

  return <BootstrapForm />;
}

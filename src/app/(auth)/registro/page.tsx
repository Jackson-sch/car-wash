import RegisterForm from "./register-form";
import { getActiveSucursales } from "@/lib/actions/sucursales";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registro - CarWash Pro",
  description: "Crea una nueva cuenta de usuario en la plataforma CarWash Pro.",
};

export default async function RegisterPage() {
  const branches = await getActiveSucursales();
  return <RegisterForm branches={branches} />;
}

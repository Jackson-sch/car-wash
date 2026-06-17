import { Car, Truck, Bike, Van } from "lucide-react";

export function TipoIcon({ tipo, className = "h-5 w-5" }: { tipo: string | null; className?: string }) {
  switch (tipo) {
    case "sedan":
    case "suv":
      return <Car className={className} />;
    case "pickup":
      return <Truck className={className} />;
    case "moto":
      return <Bike className={className} />;
    case "camion":
      return <Truck className={className} />;
    case "furgon":
      return <Van className={className} />;
    default:
      return <Car className={className} />;
  }
}

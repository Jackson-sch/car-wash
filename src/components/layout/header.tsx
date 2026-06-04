"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { Bell, MapPin, ChevronRight, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Generate Breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label: label.replace(/-/g, " "), href };
  });

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
          Inicio
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-teal-400 font-bold">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-zinc-300 transition-colors">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-4">
        {/* Sucursal Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">
          <MapPin className="h-3.5 w-3.5 text-teal-400" />
          <span>Sucursal Principal</span>
        </div>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 hover:brightness-110 flex items-center justify-center font-bold text-white text-xs border border-zinc-700/50 cursor-pointer"
            >
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-300">
            <DropdownMenuLabel className="text-white font-bold">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
              <User className="mr-2.5 h-4 w-4 text-zinc-400" />
              <span>Ver Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
              <Settings className="mr-2.5 h-4 w-4 text-zinc-400" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer text-zinc-400 py-2"
            >
              <LogOut className="mr-2.5 h-4 w-4 text-rose-500/70" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

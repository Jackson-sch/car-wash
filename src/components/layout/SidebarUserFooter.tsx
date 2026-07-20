"use client";

import { useRouter } from "next/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { signOut, useSession } from "@/lib/auth-client";
import {
  SidebarFooter,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarUserFooter() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const rol = session?.user?.rol || "cajero";

  return (
    <SidebarFooter className="border-t border-sidebar-border/50 p-3 bg-sidebar-accent/5 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size="lg"
              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-sidebar-border/50 data-[state=open]:bg-sidebar-accent/50"
            />
          }
        >
          <div className="h-8.5 w-8.5 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs border border-secondary/20 shrink-0 shadow-md shadow-secondary/15">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-bold text-white/90 truncate">{session?.user?.name || "Usuario"}</p>
            <span className="inline-block text-[8px] text-white/70 font-extrabold uppercase tracking-widest mt-0.5 bg-white/10 px-1.5 py-0.5 rounded">
              {rol}
            </span>
          </div>
          <DynamicIcon name="EllipsisVertical" className="h-4 w-4 text-zinc-400 ml-auto shrink-0 group-data-[collapsible=icon]:hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="end"
          sideOffset={12}
          className="w-56 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95 dark"
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-normal">
            <div className="flex items-center gap-2.5 text-left text-sm">
              <div className="h-8.5 w-8.5 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs border border-secondary/20 shrink-0 shadow-md">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-foreground">{session?.user?.name || "Usuario"}</span>
                <span className="truncate text-[10px] text-muted-foreground font-medium">
                  {session?.user?.email || "usuario@washmaster.com"}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/40 my-1" />
          <DropdownMenuItem
            onClick={() => router.push("/configuracion")}
            className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
          >
            <DynamicIcon name="Settings" className="h-4 w-4 text-muted-foreground" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/40 my-1" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-450 cursor-pointer text-foreground py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <DynamicIcon name="LogOut" className="h-4 w-4 text-rose-500/70" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

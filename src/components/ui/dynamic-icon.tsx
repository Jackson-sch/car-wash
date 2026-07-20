"use client";

import { useLucideIcon } from "@/lib/hooks/useLucideIcon";

/**
 * Available lucide-react icon names used in this project.
 * This type provides autocompletion for the most commonly used icons.
 */
export type IconName =
  | "AlertCircle" | "AlertTriangle" | "ArrowDownCircle" | "ArrowLeft"
  | "ArrowUpCircle" | "ArrowUpDown" | "ArrowUpRight" | "Award"
  | "BadgePercent" | "Ban" | "BarChart3" | "Bell" | "Bike"
  | "BrainCircuit" | "Brush" | "Building" | "Building2" | "Calendar"
  | "Car" | "CarFront" | "Check" | "CheckCheck" | "CheckCircle"
  | "CheckCircle2" | "ChevronDownIcon" | "ChevronLeftIcon" | "ChevronRightIcon"
  | "ClipboardCheck" | "ClipboardList" | "Clock" | "Coins" | "Copy"
  | "CreditCard" | "Database" | "DollarSign" | "Download" | "Edit"
  | "Edit3" | "EllipsisVertical" | "ExternalLink" | "Eye" | "EyeOff"
  | "FileText" | "Filter" | "Gauge" | "Gift" | "Hash" | "HelpCircle"
  | "History" | "Image" | "Info" | "Infinity" | "KeyRound" | "Landmark"
  | "Layers" | "LayoutDashboard" | "List" | "Loader2" | "Lock" | "LogOut"
  | "Mail" | "MapPin" | "MessageSquare" | "Moon" | "MoreHorizontalIcon"
  | "MoreVertical" | "OctagonXIcon" | "Package" | "Pencil" | "Phone"
  | "PieChart" | "Play" | "Plus" | "PlusCircle" | "Power" | "PowerOff"
  | "Printer" | "Receipt" | "RefreshCw" | "Save" | "Search" | "Settings"
  | "Settings2" | "ShieldAlert" | "ShieldCheck" | "ShoppingBag"
  | "Smartphone" | "Sparkles" | "Star" | "Store" | "Sun" | "Tag"
  | "Target" | "Timer" | "Trash2" | "TrendingDown" | "TrendingUp" | "Truck"
  | "Unlock" | "Upload" | "User" | "UserCog" | "UserCheck" | "UserMinus"
  | "UserPlus" | "Users" | "Van" | "Wallet" | "Wrench" | "X" | "XCircle"
  | "XIcon" | "Zap" | "SwitchCamera" | "Activity" | "MessageSquare"
  | "History" | "LayoutGrid" | "Receipt" | "RefreshCw" | "Timer"
  | "Wallet" | "Wrench" | "CreditCard" | "Landmark" | "MessageSquare"
  | "Smartphone" | "TrendingDown" | "UserCog" | "UserMinus" | "UserPlus"
  | "VolumeX" | "Volume2" | "Camera" | "PanelLeftIcon";

interface DynamicIconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  /** The name of the lucide-react icon to render. */
  name: IconName | string;
  /** Icon size in pixels (maps to both width & height, default 20). */
  size?: number;
}

/**
 * Lazily renders a lucide-react icon using a dynamic import.
 *
 * The module is loaded once and cached — subsequent renders with any icon name
 * resolve synchronously from the cache. While loading, an invisible placeholder
 * of the same dimensions is rendered to prevent layout shift.
 *
 * @example
 * ```tsx
 * <Icon name="ArrowRight" className="h-4 w-4" />
 * <Icon name="X" size={16} onClick={handleClose} />
 * ```
 */
export function DynamicIcon({ name, size = 20, className, ...props }: DynamicIconProps) {
  // Dynamic icon loading — the hook returns a component type which is
  // safe to render as JSX after the null check below.
   
  const Icon = useLucideIcon(name);

  // ── Placeholder: reserves space while icon is loading ──────────────
  if (!Icon) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          display: "inline-block",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    );
  }

  // eslint-disable-next-line react-hooks/static-components
  return <Icon size={size} className={className} {...props} />;
}

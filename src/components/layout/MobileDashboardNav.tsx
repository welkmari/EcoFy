"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRingingIcon,
  SquaresFourIcon,
  TargetIcon,
  UsersIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/overview", label: "Início", icon: SquaresFourIcon },
  { href: "/transactions", label: "Gastos", icon: WalletIcon },
  { href: "/recurring", label: "Fixas", icon: BellRingingIcon },
  { href: "/goals", label: "Metas", icon: TargetIcon },
  { href: "/users", label: "Perfil", icon: UsersIcon },
] as const;

export default function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-default bg-base/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors",
                active
                  ? "bg-surface text-purple-300"
                  : "text-text-muted hover:bg-surface/60 hover:text-text-primary",
              )}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

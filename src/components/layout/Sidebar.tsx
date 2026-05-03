"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  SquaresFourIcon,
  CurrencyDollarIcon,
  GearSixIcon,
  CaretRightIcon,
  SignOutIcon,
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
  BellRingingIcon,
  WalletIcon,
  ListIcon,
  CaretLeftIcon,
  CreditCardIcon,
  LightningIcon,
  TargetIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import Logo from "@/components/layout/Logo";
import { cn } from "@/lib/cn";

const NAV_SECTIONS = [
  {
    key: "home",
    label: "Home",
    icon: SquaresFourIcon,
    color: "text-purple-500",
    items: [
      { href: "/overview", label: "Visão Geral", icon: SquaresFourIcon },
      { href: "/transactions", label: "Transações", icon: WalletIcon },
      { href: "/recurring", label: "Contas Fixas", icon: BellRingingIcon },
    ],
  },
  {
    key: "planning",
    label: "Planejamento",
    icon: CurrencyDollarIcon,
    color: "text-purple-400",
    items: [{ href: "/goals", label: "Metas Financeiras", icon: TargetIcon }],
  },
] as const;

const NAV_SINGLES = [
  { href: "/users", label: "Usuário", icon: UsersIcon },
  { href: "/settings", label: "Configurações", icon: GearSixIcon },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    home: true,
  });

  const toggleSection = (key: string) => {
    if (isCollapsed) return;
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-base text-text-secondary border-r border-border-default transition-all duration-300 shrink-0",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center justify-center px-4 h-20 border-b border-border-default shrink-0">
        {!isCollapsed && (
          <div className="flex-1">
            <Logo isCollapsed={false} />
          </div>
        )}
        {isCollapsed && <Logo isCollapsed={true} />}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <CaretLeftIcon size={20} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center px-2 pt-4 shrink-0">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors"
          >
            <ListIcon size={22} />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="relative px-4 pt-5 pb-2 shrink-0">
          <MagnifyingGlassIcon className="absolute left-7 top-1/2 translate-y-0.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Pesquise aqui..."
            className="w-full bg-surface border border-border-default rounded-lg py-2.5 pl-9 pr-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-colors placeholder:text-text-muted"
          />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-1">
        {NAV_SECTIONS.map(({ key, label, icon: Icon, color, items }) => {
          const isOpen = openSections[key];
          const sectionActive = items.some((i) => pathname === i.href);

          return (
            <div key={key}>
              <button
                onClick={() => toggleSection(key)}
                className={cn(
                  "flex items-center w-full rounded-lg transition-colors",
                  isCollapsed
                    ? "justify-center p-3"
                    : "justify-between px-3 py-2.5",
                  sectionActive || isOpen
                    ? color
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/40",
                )}
              >
                <div
                  className={cn("flex items-center", !isCollapsed && "gap-3")}
                >
                  <Icon size={22} />
                  {!isCollapsed && (
                    <span className="text-amber-50 font-medium">{label}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <CaretRightIcon
                    size={15}
                    className={cn(
                      "transition-transform duration-200 text-text-muted shrink-0",
                      isOpen && "rotate-90",
                    )}
                  />
                )}
              </button>

              {isOpen && !isCollapsed && (
                <div className="ml-3 mt-1 pl-4 border-l border-border-default space-y-0.5">
                  {items.map(({ href, label: itemLabel, icon: ItemIcon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          active
                            ? "bg-surface text-text-primary font-medium border-l-2 border-purple-500 ml-px rounded-l-none"
                            : "text-text-muted hover:text-text-primary hover:bg-surface/30",
                        )}
                      >
                        <ItemIcon
                          size={17}
                          className={active ? "text-purple-400" : ""}
                        />
                        {itemLabel}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-1 space-y-0.5">
          {NAV_SINGLES.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center w-full rounded-lg transition-colors",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  active
                    ? "text-purple-400 bg-surface/30 font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/20",
                )}
              >
                <Icon size={22} />
                {!isCollapsed && <span className="text-amber-50">{label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="pt-3">
          <PremiumSection pathname={pathname} isCollapsed={isCollapsed} />
        </div>
      </nav>

      <div className="shrink-0 border-t border-border-default px-3 py-4 space-y-1">
        <Link
          href="/users"
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-surface",
            isCollapsed && "justify-center",
            pathname === "/users" && "bg-surface ring-1 ring-border-active",
          )}
        >
          <img
            src="https://github.com/mariaroberta.png"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-border-default shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                Maria Roberta
              </p>
              <p className="text-xs text-text-muted truncate">
                Junior Developer
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={() => router.push("/login")}
          className={cn(
            "flex items-center w-full rounded-lg transition-all text-text-muted hover:text-red-400 hover:bg-red-500/10",
            isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
          )}
        >
          <SignOutIcon size={22} />
          {!isCollapsed && <span className="text-amber-50">Sair da conta</span>}
        </button>
      </div>
    </div>
  );
}

function PremiumSection({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isPremiumPath =
    pathname.includes("premium") || pathname.includes("payments");

  return (
    <div
      className={cn(
        "rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-2",
        isCollapsed && "flex justify-center",
      )}
    >
      <button
        onClick={() => !isCollapsed && setOpen((v) => !v)}
        className={cn(
          "flex items-center w-full rounded-lg transition-colors",
          isCollapsed ? "justify-center p-3" : "justify-between px-1 py-2",
          isPremiumPath || open
            ? "text-yellow-400"
            : "text-yellow-500/70 hover:text-yellow-400",
        )}
      >
        <div className={cn("flex items-center", !isCollapsed && "gap-3")}>
          <LightningIcon size={22} weight="fill" />
          {!isCollapsed && (
            <span className="text-amber-50 font-semibold">EcoPlus</span>
          )}
        </div>
        {!isCollapsed && (
          <CaretRightIcon
            size={15}
            className={cn(
              "transition-transform duration-200 shrink-0",
              open && "rotate-90",
            )}
          />
        )}
      </button>

      {open && !isCollapsed && (
        <div className="mt-1 space-y-0.5">
          {[
            { href: "/premium", label: "Ver Planos", icon: LightningIcon },
            { href: "/payments", label: "Pagamentos", icon: CreditCardIcon },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "text-yellow-300 bg-yellow-500/10 font-medium"
                    : "text-yellow-500/60 hover:text-yellow-400 hover:bg-yellow-500/10",
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

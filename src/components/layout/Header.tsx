"use client";

import { BellIcon, CaretDownIcon } from "@phosphor-icons/react";
import { getInitials, useUserPreferences } from "@/lib/useUserPreferences";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
}

export default function Header({
  userName,
  userRole,
  avatarUrl,
}: HeaderProps) {
  const { preferences } = useUserPreferences();
  const name = userName ?? preferences.displayName;
  const role =
    userRole ?? "Aqui estão as informações sobre todas as suas finanças.";
  const avatar = avatarUrl ?? preferences.avatarUrl;
  const firstName = name.split(" ")[0] || "tudo certo";

  return (
    <header className="flex items-center justify-between w-full px-10 pt-12 pb-5 bg-base">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-primary font-black text-3xl tracking-tight">
          Bem-Vindo(a), {firstName}!
        </h1>
        <p className="text-purple-400/80 text-sm font-medium">{role}</p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-surface text-text-secondary hover:text-purple-400 hover:bg-surface transition-all shadow-sm">
          <BellIcon size={22} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-surface" />
        </button>

        <button className="flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-2xl bg-surface border border-border-default hover:border-border-active hover:bg-surface transition-all shadow-lg">
          <div className="relative shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name}
                className="w-9 h-9 rounded-xl border-2 border-border-active object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border-active bg-purple-500/20 text-xs font-black text-purple-200">
                {getInitials(name)}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" />
          </div>
          <div className="hidden lg:flex lg:flex-col lg:justify-center text-left mr-1">
            {" "}
            <span className="text-text-primary text-sm font-bold leading-tight">
              {name}
            </span>
            <span className="text-[10px] text-text-muted uppercase font-black leading-tight tracking-tighter">
              {preferences.role}
            </span>
          </div>
          <CaretDownIcon size={16} className="text-text-muted shrink-0" />{" "}
        </button>
      </div>
    </header>
  );
}

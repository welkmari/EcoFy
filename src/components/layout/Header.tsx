"use client";

import {
  BellIcon,
  CaretDownIcon,
  CurrencyCircleDollarIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { FancySelect } from "@/components/ui/FancySelect";
import { useToast } from "@/components/feedback/ToastProvider";
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
  const { preferences, savePreferences } = useUserPreferences();
  const { showToast } = useToast();
  const name = userName ?? preferences.displayName;
  const role =
    userRole ?? "Aqui estão as informações sobre todas as suas finanças.";
  const avatar = avatarUrl ?? preferences.avatarUrl;
  const firstName = name.split(" ")[0] || "tudo certo";
  const isDark = preferences.theme !== "light";
  const ThemeIcon = isDark ? MoonIcon : SunIcon;

  return (
    <header className="flex w-full flex-col gap-4 bg-base px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-5">
      
      <div className="flex min-w-0 flex-col justify-center">
        <h1 className="truncate text-2xl font-black tracking-tight text-text-primary sm:text-2xl">
          Bem-vindo(a), {firstName}!
        </h1>
        <p className="mt-1 text-sm font-medium text-purple-400/80">{role}</p>
      </div>

      {/* Lado Direito: Ações */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end lg:gap-3">
        
        {/* Botão de Tema */}
        <button
          type="button"
          onClick={() => savePreferences({ theme: isDark ? "light" : "dark" })}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-default bg-surface text-text-secondary shadow-sm transition-colors hover:border-border-active hover:text-purple-400"
          aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
          title={isDark ? "Tema escuro" : "Tema claro"}
        >
          <ThemeIcon size={21} />
        </button>

        {/* Seletor de Moeda */}
        <div className="hidden h-11 w-auto min-w-[140px] shrink-0 items-center gap-2 rounded-2xl border border-border-default bg-surface pl-3 pr-1 shadow-sm sm:flex">
          <CurrencyCircleDollarIcon size={20} className="text-cyan-400 shrink-0" />
          <FancySelect
            value={preferences.currency}
            onChange={(currency) => {
              savePreferences({ currency });
              showToast({
                title: `Moeda alterada para ${currency}`,
                description:
                  currency === "BRL"
                    ? "Valores principais voltaram para real."
                    : "Valores do app passam a usar a nova moeda como referência.",
                type: "info",
              });
            }}
            options={[
              { value: "BRL", label: "BRL" },
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
            ]}
            className="w-full flex-1 border-none bg-transparent p-0 shadow-none focus:border-none focus:ring-0" 
          />
        </div>

        {/* Botão de Notificações */}
        <button
          type="button"
          onClick={() =>
            showToast({
              title: "Notificações contextuais ativas",
              description:
                "Avisos de orçamento, contas vencendo e metas aparecem aqui.",
              type: "info",
            })
          }
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-default bg-surface text-text-secondary shadow-sm transition-all hover:border-border-active hover:text-purple-400"
          aria-label="Abrir notificações"
        >
          <BellIcon size={22} />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-purple-500" />
        </button>

        {/* Botão do Perfil do Usuário */}
        <button className="flex h-11 items-center gap-2.5 rounded-2xl border border-border-default bg-surface px-3 shadow-sm transition-all hover:border-border-active hover:bg-surface">
          <div className="relative flex shrink-0 items-center justify-center">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name}
                className="h-7 w-7 rounded-xl border-2 border-border-active object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-xl border-2 border-border-active bg-purple-500/20 text-[10px] font-black text-purple-200">
                {getInitials(name)}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-cyan-500" />
          </div>
          
          <div className="hidden text-left sm:flex sm:flex-col sm:justify-center">
            <span className="mb-0.5 text-sm font-bold leading-none text-text-primary">
              {name}
            </span>
            <span className="text-[9px] font-black uppercase leading-none tracking-wider text-text-muted">
              {preferences.role || "USUÁRIO ECOFY"}
            </span>
          </div>
          <CaretDownIcon size={14} className="shrink-0 text-text-muted" />
        </button>

      </div>
    </header>
  );
}
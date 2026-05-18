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
    <header className="flex w-full flex-col gap-4 bg-base px-4 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 lg:pt-12">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
          Bem-vindo(a), {firstName}!
        </h1>
        <p className="text-sm font-medium text-purple-400/80">{role}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end lg:gap-3">
        <button
          type="button"
          onClick={() => savePreferences({ theme: isDark ? "light" : "dark" })}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-default bg-surface text-text-secondary shadow-sm transition-colors hover:border-border-active hover:text-purple-400"
          aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
          title={isDark ? "Tema escuro" : "Tema claro"}
        >
          <ThemeIcon size={21} />
        </button>

        <div className="hidden items-center gap-2 rounded-2xl border border-border-default bg-surface/75 px-2 py-1 sm:flex">
          <CurrencyCircleDollarIcon size={18} className="text-cyan-400" />
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
            className="w-28"
          />
        </div>

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
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-text-secondary shadow-sm transition-all hover:bg-surface hover:text-purple-400"
          aria-label="Abrir notificações"
        >
          <BellIcon size={22} />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-surface bg-purple-500" />
        </button>

        <button className="flex items-center gap-2.5 rounded-2xl border border-border-default bg-surface py-2 pl-3 pr-3 shadow-lg transition-all hover:border-border-active hover:bg-surface">
          <div className="relative shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name}
                className="h-9 w-9 rounded-xl border-2 border-border-active object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border-active bg-purple-500/20 text-xs font-black text-purple-200">
                {getInitials(name)}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-cyan-500" />
          </div>
          <div className="mr-1 hidden text-left lg:flex lg:flex-col lg:justify-center">
            <span className="text-sm font-bold leading-tight text-text-primary">
              {name}
            </span>
            <span className="text-[10px] font-black uppercase leading-tight tracking-normal text-text-muted">
              {preferences.role}
            </span>
          </div>
          <CaretDownIcon size={16} className="shrink-0 text-text-muted" />
        </button>
      </div>
    </header>
  );
}

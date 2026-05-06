"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  DatabaseIcon,
  DownloadSimpleIcon,
  GearSixIcon,
  GlobeIcon,
  LockIcon,
  MoonIcon,
  ShieldCheckIcon,
  TranslateIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FancySelect } from "@/components/ui/FancySelect";
import { useUserPreferences } from "@/lib/useUserPreferences";

const tabs = [
  { id: "general", label: "Geral", icon: GlobeIcon },
  { id: "security", label: "Segurança", icon: LockIcon },
  { id: "data", label: "Dados", icon: DatabaseIcon },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const { preferences, savePreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [draft, setDraft] = useState(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Sync the editable draft after preferences arrive from localStorage/Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(preferences);
  }, [preferences]);

  const save = async () => {
    await savePreferences(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="h-full overflow-y-auto scrollbar-hide p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-300">
                <GearSixIcon size={24} />
              </span>
              <div>
                <h1 className="text-3xl font-black text-text-primary">
                  Configurações
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  Ajustes essenciais da sua conta.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border-default bg-surface/50 p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors",
                  activeTab === id
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/15"
                    : "text-text-muted hover:bg-base/60 hover:text-text-primary",
                )}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </header>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircleIcon size={18} weight="fill" />
            Alterações salvas.
          </div>
        )}

        {activeTab === "general" && (
          <SettingsCard title="Preferências">
            <SettingRow
              icon={<MoonIcon size={22} />}
              title="Modo escuro"
              description="Mantém a interface em alto contraste."
              control={
                <Toggle
                  checked={draft.darkMode}
                  onChange={(darkMode) =>
                    setDraft((prev) => ({ ...prev, darkMode }))
                  }
                />
              }
            />
            <SettingRow
              icon={<TranslateIcon size={22} />}
              title="Idioma"
              description="Idioma usado nas telas e relatórios."
              control={
                <FancySelect
                  value={draft.language}
                  onChange={(language) =>
                    setDraft((prev) => ({ ...prev, language }))
                  }
                  options={[
                    { value: "pt-BR", label: "Português" },
                    { value: "en-US", label: "English" },
                  ]}
                />
              }
            />
            <SettingRow
              icon={<WalletIcon size={22} />}
              title="Moeda"
              description="Moeda principal para saldos."
              control={
                <FancySelect
                  value={draft.currency}
                  onChange={(currency) =>
                    setDraft((prev) => ({ ...prev, currency }))
                  }
                  options={[
                    { value: "BRL", label: "BRL" },
                    { value: "USD", label: "USD" },
                  ]}
                />
              }
            />
            <SettingRow
              icon={<BellIcon size={22} />}
              title="Alertas de orçamento"
              description="Avisos quando gastos se aproximarem do limite."
              control={
                <Toggle
                  checked={draft.budgetAlerts}
                  onChange={(budgetAlerts) =>
                    setDraft((prev) => ({ ...prev, budgetAlerts }))
                  }
                />
              }
            />
          </SettingsCard>
        )}

        {activeTab === "security" && (
          <SettingsCard title="Segurança">
            <ActionRow
              icon={<ShieldCheckIcon size={22} />}
              title="Autenticação em duas etapas"
              description="Camada extra para proteger sua conta."
              action="Configurar"
              featured
            />
            <ActionRow
              icon={<LockIcon size={22} />}
              title="Sessões ativas"
              description="Revise acessos e dispositivos conectados."
              action="Revisar"
            />
          </SettingsCard>
        )}

        {activeTab === "data" && (
          <SettingsCard title="Dados">
            <ActionRow
              icon={<DownloadSimpleIcon size={22} />}
              title="Exportar transações"
              description="Baixe seus dados financeiros quando precisar."
              action="Exportar"
            />
            <ActionRow
              icon={<DatabaseIcon size={22} />}
              title="Preferências locais"
              description="Perfil e ajustes ficam disponíveis neste navegador."
              action="Ativo"
            />
          </SettingsCard>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDraft(preferences)}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            Descartar
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-linear-to-r from-purple-500 to-blue-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-500/15 transition-opacity hover:opacity-90"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </main>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border-default bg-surface/50">
      <div className="border-b border-border-default px-6 py-5">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      </div>
      <div className="divide-y divide-border-default">{children}</div>
    </section>
  );
}

function SettingRow({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-base/70 text-text-secondary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary">{title}</p>
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

function ActionRow({
  icon,
  title,
  description,
  action,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "m-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4",
        featured
          ? "border-purple-500/30 bg-purple-500/10"
          : "border-border-default bg-base/35",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-purple-300">{icon}</span>
        <div className="min-w-0">
          <p className="font-bold text-text-primary">{title}</p>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <button className="rounded-xl border border-border-active bg-base/60 px-4 py-2 text-sm font-bold text-text-primary transition-colors hover:bg-purple-500/20">
        {action}
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border p-0.5 transition-colors",
        checked
          ? "border-purple-400/50 bg-purple-500/80"
          : "border-border-default bg-base",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full border shadow-sm transition-transform",
          checked
            ? "translate-x-5 border-white/30 bg-white"
            : "translate-x-0 border-border-default bg-text-muted",
        )}
      />
    </button>
  );
}

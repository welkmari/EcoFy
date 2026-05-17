"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  DatabaseIcon,
  DownloadSimpleIcon,
  GearSixIcon,
  LockIcon,
  ShieldCheckIcon,
  TranslateIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FancySelect } from "@/components/ui/FancySelect";
import { useUserPreferences } from "@/lib/useUserPreferences";
import SettingsNav, { TabId } from "./SettingsNav";
import PrivacySettings from "./PrivacySettings";
import SystemPreferences from "./SystemPreferences";

export default function SettingsPage() {
  const { preferences, savePreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [draft, setDraft] = useState(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(preferences);

  const save = async () => {
    await savePreferences(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const discard = () => setDraft(preferences);

  const handleExport = () => {
    const data = JSON.stringify(preferences, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecofy-preferences.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="h-full overflow-y-auto scrollbar-hide p-4 sm:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-300">
              <GearSixIcon size={24} />
            </span>
            <div>
              <h1 className="text-3xl font-black text-text-primary">Configurações</h1>
              <p className="mt-1 text-sm text-text-muted">Ajustes essenciais da sua conta.</p>
            </div>
          </div>
          <SettingsNav active={activeTab} onChange={setActiveTab} />
        </header>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircleIcon size={18} weight="fill" />
            Alterações salvas com sucesso.
          </div>
        )}

        {isDirty && !saved && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
            Você tem alterações não salvas.
          </div>
        )}

        {activeTab === "general" && (
          <div className="flex flex-col gap-6">
            <SettingsCard title="Preferências">
              <SettingRow
                icon={<TranslateIcon size={22} />}
                title="Idioma"
                description="Idioma usado nas telas e relatórios."
                control={
                  <FancySelect
                    value={draft.language}
                    onChange={(language) => setDraft((prev) => ({ ...prev, language }))}
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
                    onChange={(currency) => setDraft((prev) => ({ ...prev, currency }))}
                    options={[
                      { value: "BRL", label: "BRL" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
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
                    onChange={(budgetAlerts) => setDraft((prev) => ({ ...prev, budgetAlerts }))}
                  />
                }
              />
            </SettingsCard>

            <SystemPreferences
              value={draft.theme}
              onChange={(theme) => setDraft((prev) => ({ ...prev, theme, darkMode: theme === "dark" }))}
            />
          </div>
        )}

        {activeTab === "security" && (
          <div className="flex flex-col gap-6">
            <SettingsCard title="Segurança">
              <ActionRow
                icon={<ShieldCheckIcon size={22} />}
                title="Autenticação em duas etapas"
                description="Camada extra para proteger sua conta."
                action="Configurar"
                featured
                onClick={() => alert("Integre com seu provedor de 2FA")}
              />
              <ActionRow
                icon={<LockIcon size={22} />}
                title="Sessões ativas"
                description="Revise acessos e dispositivos conectados."
                action="Revisar"
                onClick={() => alert("Integre com sua API de sessões")}
              />
            </SettingsCard>
            <PrivacySettings />
          </div>
        )}

        {activeTab === "data" && (
          <SettingsCard title="Dados">
            <ActionRow
              icon={<DownloadSimpleIcon size={22} />}
              title="Exportar preferências"
              description="Baixe seus dados e configurações em JSON."
              action="Exportar"
              onClick={handleExport}
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
            onClick={discard}
            disabled={!isDirty}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Descartar
          </button>
          <button
            onClick={save}
            disabled={!isDirty}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-500/15 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </main>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  featured?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "m-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4",
        featured ? "border-purple-500/30 bg-purple-500/10" : "border-border-default bg-base/35",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-purple-300">{icon}</span>
        <div className="min-w-0">
          <p className="font-bold text-text-primary">{title}</p>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="rounded-xl border border-border-active bg-base/60 px-4 py-2 text-sm font-bold text-text-primary transition-colors hover:bg-purple-500/20"
      >
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
        checked ? "border-purple-400/50 bg-purple-500/80" : "border-border-default bg-base",
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
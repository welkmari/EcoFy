"use client";

import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  CrownIcon,
  ExportIcon,
  HeadsetIcon,
  InfinityIcon,
  LockKeyIcon,
  RadioButtonIcon,
  SparkleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type Billing = "monthly" | "yearly";
type PlanId = "free" | "pro" | "ultra";

type Plan = {
  id: PlanId;
  name: string;
  eyebrow: string;
  description: string;
  monthly: number | null;
  yearly: number | null;
  accent: string;
  popular?: boolean;
  features: string[];
  missing: string[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    eyebrow: "Começo",
    description: "Para organizar o básico sem compromisso.",
    monthly: null,
    yearly: null,
    accent: "text-text-secondary",
    features: ["3 cofrinhos", "Pagamentos", "Overview mensal"],
    missing: ["Exportação", "Metas recorrentes"],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Melhor escolha",
    description: "Para acompanhar metas e rotina financeira com mais clareza.",
    monthly: 19,
    yearly: 152,
    accent: "text-purple-300",
    popular: true,
    features: ["Cofrinhos ilimitados", "Relatórios avançados", "CSV/PDF"],
    missing: ["Suporte 24/7"],
  },
  {
    id: "ultra",
    name: "Ultra",
    eyebrow: "Completo",
    description: "Para quem quer suporte e automação sem limite.",
    monthly: 39,
    yearly: 312,
    accent: "text-cyan-300",
    features: ["Tudo do Pro", "Suporte 24/7", "Prioridade em novidades"],
    missing: [],
  },
];

const COMPARISON = [
  ["Cofrinhos", "3", "Ilimitados", "Ilimitados"],
  ["Pagamentos e transações", "Sim", "Sim", "Sim"],
  ["Relatórios", "Básicos", "Avançados", "Avançados"],
  ["Exportação", "Não", "CSV/PDF", "CSV/PDF"],
  ["Suporte", "Comunidade", "E-mail", "Prioritário"],
];

export default function PricePage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const selected = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlan) ?? PLANS[1],
    [selectedPlan],
  );

  const handleSubscribe = () => {
    console.log("Subscribe to:", selectedPlan, billing);
  };

  return (
    <main className="h-full overflow-y-auto bg-base p-4 pb-24 scrollbar-hide sm:p-6 md:pb-6">
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-border-default bg-surface/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                <CrownIcon size={23} weight="fill" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">
                  EcoPlus
                </p>
                <h1 className="text-2xl font-black text-text-primary">
                  Assinatura
                </h1>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border-default bg-base/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-text-muted">
                    Plano atual
                  </p>
                  <p className="mt-1 text-xl font-black text-text-primary">
                    Gratuito
                  </p>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-black text-cyan-300">
                  Ativo
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <Usage label="Cofrinhos" value="2/3" pct={67} />
                <Usage label="Relatórios" value="Básico" pct={35} />
                <Usage label="Exportação" value="Bloqueado" pct={0} muted />
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <Benefit icon={InfinityIcon} label="Cofrinhos ilimitados no Pro" />
              <Benefit icon={ExportIcon} label="CSV/PDF para relatórios" />
              <Benefit icon={LockKeyIcon} label="Dados protegidos na conta" />
              <Benefit icon={HeadsetIcon} label="Suporte nos planos pagos" />
            </div>
          </section>
        </aside>

        <section className="flex min-w-0 flex-col gap-5">
          <header className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface/70 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                Upgrade
              </p>
              <h2 className="mt-1 text-2xl font-black text-text-primary">
                Escolha como quer evoluir
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-text-muted">
                Menos enfeite, mais decisão: compare planos, preço e recursos em um só lugar.
              </p>
            </div>
            <div className="flex w-full rounded-lg border border-border-default bg-base/45 p-1 sm:w-auto">
              <BillingButton active={billing === "monthly"} onClick={() => setBilling("monthly")}>
                Mensal
              </BillingButton>
              <BillingButton active={billing === "yearly"} onClick={() => setBilling("yearly")}>
                Anual
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black text-cyan-300">
                  -33%
                </span>
              </BillingButton>
            </div>
          </header>

          <div className="overflow-hidden rounded-xl border border-border-default bg-surface/70">
            {PLANS.map((plan) => {
              const active = selectedPlan === plan.id;
              const price = billing === "monthly" ? plan.monthly : plan.yearly;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "grid w-full gap-4 border-b border-border-default px-4 py-4 text-left transition-colors last:border-b-0 lg:grid-cols-[28px_minmax(0,1fr)_170px_150px] lg:items-center lg:px-5",
                    active ? "bg-purple-500/[0.08]" : "hover:bg-base/30",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 flex h-6 w-6 items-center justify-center rounded-full border lg:mt-0",
                      active
                        ? "border-purple-300 bg-purple-500 text-white"
                        : "border-border-default text-text-muted",
                    )}
                  >
                    {active ? (
                      <CheckCircleIcon size={18} weight="fill" />
                    ) : (
                      <RadioButtonIcon size={17} />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("text-lg font-black", active ? plan.accent : "text-text-primary")}>
                        {plan.name}
                      </p>
                      <span className="rounded-full bg-base/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-text-muted">
                        {plan.eyebrow}
                      </span>
                      {plan.popular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-black text-white">
                          <SparkleIcon size={11} weight="fill" />
                          recomendado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{plan.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plan.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300"
                        >
                          {feature}
                        </span>
                      ))}
                      {plan.missing.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-base/45 px-2.5 py-1 text-xs font-bold text-text-muted"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {price === null ? (
                      <p className="text-2xl font-black text-text-primary">Grátis</p>
                    ) : (
                      <p className="text-2xl font-black text-text-primary">
                        R$ {price.toLocaleString("pt-BR")}
                        <span className="text-sm font-bold text-text-muted">
                          /{billing === "monthly" ? "mês" : "ano"}
                        </span>
                      </p>
                    )}
                  </div>

                  <span
                    className={cn(
                      "inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-black",
                      active
                        ? "bg-purple-500 text-white"
                        : "border border-border-default bg-base/40 text-text-secondary",
                    )}
                  >
                    {active ? "Selecionado" : "Selecionar"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <section className="rounded-xl border border-border-default bg-surface/70">
              <div className="grid grid-cols-[minmax(0,1fr)_90px_110px_110px] border-b border-border-default px-4 py-3 text-xs font-black uppercase tracking-wide text-text-muted sm:px-5">
                <span>Recurso</span>
                <span>Free</span>
                <span>Pro</span>
                <span>Ultra</span>
              </div>
              <div className="divide-y divide-border-default">
                {COMPARISON.map(([feature, free, pro, ultra]) => (
                  <div
                    key={feature}
                    className="grid grid-cols-[minmax(0,1fr)_90px_110px_110px] px-4 py-3 text-sm sm:px-5"
                  >
                    <span className="font-bold text-text-primary">{feature}</span>
                    <CompareCell value={free} />
                    <CompareCell value={pro} featured />
                    <CompareCell value={ultra} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-purple-400/35 bg-purple-500/[0.08] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-300">
                Pronto para assinar
              </p>
              <h3 className="mt-2 text-2xl font-black text-text-primary">
                {selected.name}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{selected.description}</p>
              <button
                type="button"
                onClick={handleSubscribe}
                className="mt-5 w-full rounded-lg bg-purple-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-purple-600"
              >
                {selected.id === "free" ? "Manter plano gratuito" : "Continuar"}
              </button>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function BillingButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition-colors sm:flex-none",
        active
          ? "bg-purple-500 text-white"
          : "text-text-muted hover:bg-surface hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Usage({
  label,
  value,
  pct,
  muted,
}: {
  label: string;
  value: string;
  pct: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-bold text-text-secondary">{label}</span>
        <span className={cn("font-black", muted ? "text-text-muted" : "text-text-primary")}>
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full", muted ? "bg-text-muted/25" : "bg-cyan-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <Icon size={17} className="text-purple-300" />
      <span>{label}</span>
    </div>
  );
}

function CompareCell({
  value,
  featured,
}: {
  value: string;
  featured?: boolean;
}) {
  const negative = value === "Não";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
        negative
          ? "bg-base/40 text-text-muted"
          : featured
            ? "bg-purple-500/10 text-purple-300"
            : "bg-base/40 text-text-secondary",
      )}
    >
      {negative ? (
        <XCircleIcon size={13} weight="fill" />
      ) : (
        featured && <CheckCircleIcon size={13} weight="fill" />
      )}
      {value}
    </span>
  );
}

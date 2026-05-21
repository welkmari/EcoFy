"use client";

import { useState } from "react";
import { LightningIcon, ShieldIcon, SparkleIcon } from "@phosphor-icons/react";
import PricingCard, { Plan } from "./PricingCard";

const PLANS_MONTHLY: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    description: "Para quem está começando a organizar suas finanças.",
    price: null,
    period: null,
    highlighted: false,
    features: [
      { label: "Até 3 cofrinhos", included: true },
      { label: "Depósitos ilimitados", included: true },
      { label: "Relatórios básicos", included: true },
      { label: "Exportar dados", included: false },
      { label: "Metas recorrentes", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "pro-monthly",
    name: "Pro",
    description: "Para quem leva metas financeiras a sério.",
    price: 19,
    period: "mês",
    highlighted: true,
    badge: "Mais popular",
    features: [
      { label: "Cofrinhos ilimitados", included: true },
      { label: "Depósitos ilimitados", included: true },
      { label: "Relatórios avançados", included: true },
      { label: "Exportar dados (CSV/PDF)", included: true },
      { label: "Metas recorrentes", included: true },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "ultra-monthly",
    name: "Ultra",
    description: "Controle total com suporte dedicado.",
    price: 39,
    period: "mês",
    highlighted: false,
    features: [
      { label: "Cofrinhos ilimitados", included: true },
      { label: "Depósitos ilimitados", included: true },
      { label: "Relatórios avançados", included: true },
      { label: "Exportar dados (CSV/PDF)", included: true },
      { label: "Metas recorrentes", included: true },
      { label: "Suporte prioritário 24/7", included: true },
    ],
  },
];

const PLANS_YEARLY: Plan[] = [
  { ...PLANS_MONTHLY[0] },
  {
    id: "pro-yearly",
    name: "Pro",
    description: "Para quem leva metas financeiras a sério.",
    price: 152,
    period: "ano",
    highlighted: true,
    badge: "Mais popular",
    features: PLANS_MONTHLY[1].features,
  },
  {
    id: "ultra-yearly",
    name: "Ultra",
    description: "Controle total com suporte dedicado.",
    price: 312,
    period: "ano",
    highlighted: false,
    features: PLANS_MONTHLY[2].features,
  },
];

const PERKS = [
  {
    icon: LightningIcon,
    title: "Rápido e seguro",
    description: "Seus dados ficam protegidos com criptografia de ponta a ponta.",
  },
  {
    icon: ShieldIcon,
    title: "Cancele quando quiser",
    description: "Sem multa, sem burocracia. Você está no controle.",
  },
  {
    icon: SparkleIcon,
    title: "Novidades todo mês",
    description: "Recursos novos lançados constantemente para assinantes.",
  },
];

export default function PricePage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const plans = billing === "monthly" ? PLANS_MONTHLY : PLANS_YEARLY;

  const handleSubscribe = (planId: string) => {
    console.log("Subscribe to:", planId);
  };

  return (
    <div className="min-h-screen w-full bg-base px-4 py-12 pb-20 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs tracking-widest text-text-muted uppercase">
            Planos
          </p>
          <h1 className="mb-3 text-3xl font-black text-text-primary sm:text-4xl">
            Escolha seu{" "}
            <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              plano ideal
            </span>
          </h1>
          <p className="mx-auto max-w-md text-sm text-text-secondary sm:text-base">
            Comece grátis e evolua conforme suas metas crescem.
          </p>
        </div>

        <div className="mb-12 -mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-border-default bg-surface p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all sm:px-5 ${billing === "monthly"
                  ? "bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-all sm:gap-2 sm:px-5 ${billing === "yearly"
                  ? "bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              Anual
              <span className="whitespace-nowrap rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-black text-cyan-400 sm:px-2">
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - AUMENTADO PARA mb-32 para dar espaço ao scale-105 */}
        <div className="mx-auto mb-32 grid max-w-md grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 -mt-12">
          {PERKS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-border-default bg-surface p-4 sm:p-5"
            >
              <div className="shrink-0 rounded-xl border border-border-default bg-base p-3 text-purple-400">
                <Icon size={20} />
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-text-primary">
                  {title}
                </p>
                <p className="text-xs leading-relaxed text-text-muted">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
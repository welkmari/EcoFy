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
    description:
      "Seus dados ficam protegidos com criptografia de ponta a ponta.",
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
    <div className="min-h-screen bg-base px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
            Planos
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary mb-3">
            Escolha seu{" "}
            <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              plano ideal
            </span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
            Comece grátis e evolua conforme suas metas crescem.
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex items-center bg-surface border border-border-default rounded-2xl p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                billing === "monthly"
                  ? "bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 ${
                billing === "yearly"
                  ? "bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Anual
              <span className="text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 whitespace-nowrap">
                -33%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 sm:mb-16">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {PERKS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 bg-surface border border-border-default rounded-2xl p-4 sm:p-5"
            >
              <div className="p-3 rounded-xl bg-base border border-border-default text-purple-400 shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-text-primary font-bold text-sm mb-1">
                  {title}
                </p>
                <p className="text-text-muted text-xs leading-relaxed">
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

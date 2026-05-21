"use client";

import { Check, X, Star } from "@phosphor-icons/react";
import SubscribeButton from "./SubscribeButton";

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  period: "mês" | "ano" | null;
  highlighted: boolean;
  badge?: string;
  features: { label: string; included: boolean }[];
};

type Props = {
  plan: Plan;
  onSubscribe: (planId: string) => void;
};

export default function PricingCard({ plan, onSubscribe }: Props) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 transition-all duration-300 sm:p-6 ${
        plan.highlighted
          ? "border-purple-500/50 bg-surface shadow-[0_0_40px_rgba(139,92,246,0.15)] lg:z-10 lg:scale-105"
          : "border-border-default bg-surface hover:border-border-active"
      }`}
    >
      {/* Glow Effect */}
      {plan.highlighted && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-b-xl bg-linear-to-r from-purple-600 to-cyan-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            <Star size={10} weight="fill" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 mt-2">
        <p className="mb-1 text-xs tracking-widest text-text-muted uppercase">
          {plan.name}
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">
          {plan.description}
        </p>
      </div>

      {/* Preço */}
      <div className="mb-6">
        {plan.price === null ? (
          <p className="text-3xl font-black text-text-primary sm:text-4xl">
            Grátis
          </p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="mt-1 self-start text-sm font-bold text-text-muted">
              R$
            </span>
            <span className="text-4xl font-black leading-none text-text-primary">
              {plan.price.toLocaleString("pt-BR")}
            </span>
            <span className="mb-1 text-sm text-text-muted">/{plan.period}</span>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="mb-6 flex flex-col gap-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className={`shrink-0 rounded-full p-1 ${
                f.included
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "bg-base text-text-muted"
              }`}
            >
              {f.included ? (
                <Check size={12} weight="bold" />
              ) : (
                <X size={12} weight="bold" />
              )}
            </span>
            <span
              className={`text-xs ${
                f.included
                  ? "text-text-secondary"
                  : "line-through text-text-muted"
              }`}
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-2">
        <SubscribeButton
          planId={plan.id}
          highlighted={plan.highlighted}
          label={plan.price === null ? "Começar grátis" : "Assinar agora"}
          onSubscribe={onSubscribe}
        />
      </div>
    </div>
  );
}
"use client";

import { CheckIcon, CrownIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
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
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border bg-surface/70 p-4 transition-colors sm:p-5",
        plan.highlighted
          ? "border-purple-400/45 bg-purple-500/[0.06]"
          : "border-border-default hover:border-border-active",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
            {plan.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {plan.description}
          </p>
        </div>
        {plan.badge && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-500 px-2.5 py-1 text-[10px] font-black text-white">
            <CrownIcon size={11} weight="fill" />
            {plan.badge}
          </span>
        )}
      </div>

      <div className="mt-5">
        {plan.price === null ? (
          <p className="text-3xl font-black text-text-primary">Grátis</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="mb-1 text-sm font-bold text-text-muted">R$</span>
            <span className="text-4xl font-black leading-none text-text-primary">
              {plan.price.toLocaleString("pt-BR")}
            </span>
            <span className="mb-1 text-sm text-text-muted">/{plan.period}</span>
          </div>
        )}
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                feature.included
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "bg-base/60 text-text-muted",
              )}
            >
              {feature.included ? (
                <CheckIcon size={12} weight="bold" />
              ) : (
                <XIcon size={12} weight="bold" />
              )}
            </span>
            <span
              className={cn(
                "text-sm",
                feature.included
                  ? "text-text-secondary"
                  : "text-text-muted line-through",
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <SubscribeButton
          planId={plan.id}
          highlighted={plan.highlighted}
          label={plan.price === null ? "Manter grátis" : "Escolher plano"}
          onSubscribe={onSubscribe}
        />
      </div>
    </article>
  );
}

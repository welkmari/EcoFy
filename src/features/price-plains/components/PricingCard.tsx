'use client';

import { Check, X, Star } from '@phosphor-icons/react';

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  period: 'mês' | 'ano' | null;
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
      className={`relative flex flex-col rounded-3xl p-5 sm:p-6 border transition-all duration-300 group overflow-hidden ${
        plan.highlighted
          ? 'bg-surface border-purple-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
          : 'bg-surface border-border-default hover:border-border-active'
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-b-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
            <Star size={10} weight="fill" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mt-4 mb-5">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{plan.name}</p>
        <p className="text-text-secondary text-sm leading-relaxed">{plan.description}</p>
      </div>

      {/* Preço */}
      <div className="mb-6 sm:mb-8">
        {plan.price === null ? (
          <p className="text-3xl sm:text-4xl font-black text-text-primary">Grátis</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-text-muted text-sm font-bold self-start mt-1 sm:mt-2">R$</span>
            <span className="text-4xl sm:text-5xl font-black text-text-primary leading-none">
              {plan.price.toLocaleString('pt-BR')}
            </span>
            <span className="text-text-muted text-sm mb-1">/{plan.period}</span>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className={`flex-shrink-0 rounded-full p-[3px] ${
                f.included ? 'text-cyan-400 bg-cyan-400/10' : 'text-text-muted bg-base'
              }`}
            >
              {f.included ? <Check size={12} weight="bold" /> : <X size={12} weight="bold" />}
            </span>
            <span
              className={`text-sm ${
                f.included ? 'text-text-secondary' : 'text-text-muted line-through'
              }`}
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSubscribe(plan.id)}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
          plan.highlighted
            ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
            : 'bg-base border border-border-default text-text-secondary hover:border-purple-500/40 hover:text-text-primary'
        }`}
      >
        {plan.price === null ? 'Começar grátis' : 'Assinar agora'}
      </button>
    </div>
  );
}
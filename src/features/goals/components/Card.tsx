'use client';

import { PlusCircle } from '@phosphor-icons/react';
import { Cofrinho } from '../types/cofrinho';

type Props = Cofrinho & {
  onDeposit: (id: string) => void;
};

export default function Card({ id, title, current, total, icon: Icon, onDeposit }: Props) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="bg-surface border border-border-default rounded-3xl p-6 hover:border-border-active transition-all group relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />

      <div className="flex justify-between items-start mb-6">
        <div className="p-4 rounded-2xl bg-base border border-border-default text-cyan-400 group-hover:scale-110 transition-transform">
          <Icon size={28} />
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-text-primary">{percentage.toFixed(0)}%</span>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">Concluído</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-purple-400 transition-colors">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-text-secondary">R$ {current.toLocaleString('pt-BR')}</span>
          <span className="text-xs text-text-muted">de R$ {total.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="relative w-full h-4 bg-base rounded-full p-[2px] mb-8 border border-border-default">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute right-0 top-0 w-2 h-full bg-white/20 blur-[2px] rounded-full" />
        </div>
      </div>

      <button
        onClick={() => onDeposit(id)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-base hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500 text-text-secondary hover:text-text-primary rounded-xl text-sm font-bold border border-border-default hover:border-transparent transition-all active:scale-95"
      >
        <PlusCircle size={18} />
        Depositar no Cofrinho
      </button>
    </div>
  );
}

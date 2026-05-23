"use client";

import { cn } from "@/lib/cn";
import type { Installment } from "../types";

type Props = {
  installment: Installment;
  onClick: () => void;
};

export default function InstallmentRow({ installment: i, onClick }: Props) {
  const pct = Math.round((i.paidInstallments / i.totalInstallments) * 100);
  const monthlyAmount = i.totalAmount / i.totalInstallments;
  const remaining = i.totalAmount - i.paidAmount;
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const progressColor =
    pct >= 75 ? "bg-cyan-400" : pct >= 40 ? "bg-purple-400" : "bg-yellow-500";

  return (
    <div
      onClick={onClick}
      className="bg-surface/50 border border-border-default rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-purple-400/40 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-primary font-semibold">{i.name}</p>
          <p className="text-text-muted text-xs mt-0.5">
            {i.category} · Vence dia {i.dueDay}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-text-primary font-bold">
            {fmt(monthlyAmount)}
            <span className="text-text-muted text-xs font-normal">/mês</span>
          </p>
          <p className="text-text-muted text-xs mt-0.5">
            Parcela {i.paidInstallments + 1} de {i.totalInstallments}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-text-muted">
          <span>
            Pago:{" "}
            <span className="text-cyan-400 font-medium">
              {fmt(i.paidAmount)}
            </span>
          </span>
          <span>{pct}%</span>
          <span>
            Restante:{" "}
            <span className="text-red-400 font-medium">{fmt(remaining)}</span>
          </span>
        </div>
        <div className="w-full h-2 bg-base rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressColor,
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-text-muted text-xs text-right">
          Total: {fmt(i.totalAmount)}
        </p>
      </div>
    </div>
  );
}

"use client";

import { XIcon, CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Installment } from "../types";

type Props = {
  installment: Installment | null;
  onClose: () => void;
  onToggleInstallment: (id: string, paidInstallments: number) => void;
};

export default function InstallmentDetailModal({
  installment,
  onClose,
  onToggleInstallment,
}: Props) {
  if (!installment) return null;

  const monthlyAmount = installment.totalAmount / installment.totalInstallments;
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const pct = Math.round(
    (installment.paidInstallments / installment.totalInstallments) * 100,
  );

  const progressColor =
    pct >= 75 ? "bg-cyan-400" : pct >= 40 ? "bg-purple-400" : "bg-yellow-500";

  const handleToggle = (index: number) => {
    // Se clicar em uma parcela não paga, marca até ela
    // Se clicar na última paga, desmarca ela
    const newPaid = index < installment.paidInstallments ? index : index + 1;
    onToggleInstallment(installment.id, newPaid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-purple-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {installment.name}
            </h2>
            <p className="text-text-muted text-xs mt-0.5">
              {installment.category} · Vence dia {installment.dueDay}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Resumo */}
        <div className="px-6 pb-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Por parcela</p>
              <p className="text-white font-bold text-sm mt-1">
                {fmt(monthlyAmount)}
              </p>
            </div>
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Pago</p>
              <p className="text-cyan-400 font-bold text-sm mt-1">
                {fmt(installment.paidAmount)}
              </p>
            </div>
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Restante</p>
              <p className="text-red-400 font-bold text-sm mt-1">
                {fmt(installment.totalAmount - installment.paidAmount)}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-text-muted">
              <span>
                {installment.paidInstallments} de{" "}
                {installment.totalInstallments} parcelas pagas
              </span>
              <span>{pct}%</span>
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
          </div>
        </div>

        {/* Lista de parcelas */}
        <div className="px-6 pb-6 flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-hide">
          <p className="text-text-muted text-xs font-medium mb-1">
            Parcelas — clique para marcar/desmarcar
          </p>
          {Array.from({ length: installment.totalInstallments }).map((_, i) => {
            const isPaid = i < installment.paidInstallments;
            const isNext = i === installment.paidInstallments;

            return (
              <button
                key={i}
                onClick={() => handleToggle(i)}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left",
                  isPaid
                    ? "bg-cyan-400/10 border-cyan-400/20 hover:border-cyan-400/40"
                    : isNext
                      ? "bg-purple-400/5 border-purple-400/30 hover:border-purple-400/50"
                      : "bg-base border-border-default opacity-50 hover:opacity-70",
                )}
              >
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <CheckCircleIcon
                      size={18}
                      className="text-cyan-400"
                      weight="fill"
                    />
                  ) : (
                    <CircleIcon
                      size={18}
                      className={isNext ? "text-purple-400" : "text-text-muted"}
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPaid
                        ? "text-cyan-400"
                        : isNext
                          ? "text-text-primary"
                          : "text-text-muted",
                    )}
                  >
                    Parcela {i + 1}
                    {isNext && (
                      <span className="ml-2 text-xs text-purple-400 font-normal">
                        próxima
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    isPaid ? "text-cyan-400" : "text-text-muted",
                  )}
                >
                  {fmt(monthlyAmount)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  CreditCardIcon,
  PencilSimpleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Installment } from "../types";

type Props = {
  installments: Installment[];
  onOpen: (installment: Installment) => void;
};

export default function InstallmentsTable({ installments, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface/80 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <div className="block md:hidden">
        {installments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-white/5">
            {installments.map((installment) => (
              <InstallmentListItem
                key={installment.id}
                installment={installment}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </div>

      <table className="hidden w-full border-collapse text-left md:table">
        <thead className="bg-surface/70 text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Parcelamento</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Vencimento</th>
            <th className="px-4 py-3 font-medium">Parcela</th>
            <th className="px-4 py-3 font-medium">Valor mensal</th>
            <th className="px-4 py-3 font-medium">Progresso</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {installments.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState />
              </td>
            </tr>
          ) : (
            installments.map((installment) => (
              <InstallmentTableRow
                key={installment.id}
                installment={installment}
                onOpen={onOpen}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function InstallmentTableRow({
  installment,
  onOpen,
}: {
  installment: Installment;
  onOpen: (installment: Installment) => void;
}) {
  const data = getInstallmentData(installment);

  return (
    <tr className="border-t border-white/5 transition-colors hover:bg-base/35">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <CreditCardIcon size={18} weight="fill" />
          </span>
          <span className="font-bold text-text-primary">{installment.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {installment.category}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        Dia {installment.dueDay}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {data.nextInstallment} de {installment.totalInstallments}
      </td>
      <td className="px-4 py-3 text-sm font-black text-text-primary">
        {formatMoney(data.monthlyAmount)}
      </td>
      <td className="px-4 py-3">
        <Progress pct={data.pct} />
      </td>
      <td className="px-4 py-3">
        <OpenButton onClick={() => onOpen(installment)} />
      </td>
    </tr>
  );
}

function InstallmentListItem({
  installment,
  onOpen,
}: {
  installment: Installment;
  onOpen: (installment: Installment) => void;
}) {
  const data = getInstallmentData(installment);

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <CreditCardIcon size={19} weight="fill" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-text-primary">
              {installment.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              {installment.category} · dia {installment.dueDay} ·{" "}
              {data.nextInstallment}/{installment.totalInstallments}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-black text-text-primary">
          {formatMoney(data.monthlyAmount)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Progress pct={data.pct} />
        <OpenButton onClick={() => onOpen(installment)} />
      </div>
    </div>
  );
}

function Progress({ pct }: { pct: number }) {
  const done = pct >= 100;

  return (
    <div className="flex min-w-36 items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-base">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done ? "bg-emerald-500" : "bg-cyan-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "w-10 text-right text-xs font-black",
          done ? "text-emerald-500" : "text-cyan-500",
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

function OpenButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl bg-base/45 px-3 py-1.5 text-xs font-bold text-text-primary transition-colors hover:bg-base/70"
    >
      <PencilSimpleIcon size={14} />
      Detalhes
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <CheckCircleIcon size={24} className="text-text-muted" />
      <p className="mt-2 text-sm font-bold text-text-primary">
        Nenhum parcelamento cadastrado.
      </p>
      <p className="mt-1 max-w-sm text-xs text-text-muted">
        Adicione um parcelamento para acompanhar parcelas e progresso.
      </p>
    </div>
  );
}

function getInstallmentData(installment: Installment) {
  const monthlyAmount = installment.totalAmount / installment.totalInstallments;
  const pct = Math.round(
    (installment.paidInstallments / installment.totalInstallments) * 100,
  );
  const nextInstallment = Math.min(
    installment.paidInstallments + 1,
    installment.totalInstallments,
  );

  return { monthlyAmount, pct, nextInstallment };
}

function formatMoney(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

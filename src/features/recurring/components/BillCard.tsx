"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { FixedBill, BillStatus } from "../types";

type Props = {
  bill: FixedBill;
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit?: (bill: FixedBill) => void;
  onDelete?: (bill: FixedBill) => void;
};

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Pago",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    icon: <CheckCircleIcon size={22} weight="fill" />,
  },
  pending: {
    label: "Pendente",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: <ClockIcon size={22} weight="fill" />,
  },
  overdue: {
    label: "Vencido",
    color: "text-red-400",
    bg: "bg-red-400/10",
    icon: <WarningCircleIcon size={22} weight="fill" />,
  },
};

const RECURRENCE_LABEL: Record<string, string> = {
  monthly: "Mensal",
  annual: "Anual",
  weekly: "Semanal",
};

export default function BillCard({
  bill,
  onMarkPaid,
  onUndo,
  onEdit,
  onDelete,
}: Props) {
  const config = STATUS_CONFIG[bill.status];
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div
      className={cn(
    "bg-surface/50 border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-border-active/70",
        bill.status === "overdue"
          ? "border-red-400/30"
          : "border-border-default",
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
          {config.icon}
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right">
            <p className="text-white text-xl font-bold">{fmt(bill.amount)}</p>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                config.bg,
                config.color,
              )}
            >
              {bill.status === "paid" ? "✓ Concluído" : config.label}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(bill)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-purple-400/10 hover:text-purple-400"
              aria-label="Editar conta fixa"
            >
              <PencilSimpleIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(bill)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-400/10 hover:text-red-400"
              aria-label="Excluir conta fixa"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-white font-semibold">{bill.name}</p>
        <p className="text-text-muted text-xs mt-0.5">
          {bill.category} · vence dia{" "}
          <span className="font-medium text-text-secondary">{bill.dueDay}</span>{" "}
          · {RECURRENCE_LABEL[bill.recurrence]}
        </p>
      </div>

      {bill.status === "paid" ? (
        <div className="flex items-center justify-between gap-2 py-2.5 px-4 rounded-xl bg-cyan-400/10 text-cyan-400 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} />
            Pagamento confirmado
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUndo(bill.id);
            }}
            className="p-1 rounded-lg hover:bg-cyan-400/20 transition-colors"
            title="Desfazer"
          >
            <ArrowCounterClockwiseIcon size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onMarkPaid(bill.id)}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-bold transition-all",
            bill.status === "overdue"
              ? "bg-red-400 hover:bg-red-300 text-white"
              : "bg-surface border border-border-default text-text-primary hover:border-border-active hover:text-white",
          )}
        >
          Marcar como pago
        </button>
      )}
    </div>
  );
}

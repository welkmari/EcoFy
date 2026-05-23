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
  isUpdating?: boolean;
};

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Pago",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
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
  isUpdating = false,
}: Props) {
  const config = STATUS_CONFIG[bill.status];
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div
      className={cn(
        "bg-surface/50 border rounded-2xl p-4 flex flex-col gap-4 transition-all hover:border-border-active/70",
        bill.status === "overdue"
          ? "border-red-400/30 bg-red-400/5"
          : bill.status === "paid"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-border-default",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={cn("shrink-0 p-2 rounded-xl", config.bg, config.color)}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-text-primary">
              {bill.name}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {bill.category} · vence dia{" "}
              <span className="font-bold text-text-secondary">{bill.dueDay}</span>{" "}
              · {RECURRENCE_LABEL[bill.recurrence]}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className="text-lg font-black text-text-primary">{fmt(bill.amount)}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <div className="flex gap-0.5">
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

      {bill.status === "paid" ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-500">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} />
            Pagamento confirmado
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUndo(bill.id);
            }}
            className="p-1 rounded-lg transition-colors hover:bg-emerald-500/20"
            title="Desfazer"
          >
            <ArrowCounterClockwiseIcon size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onMarkPaid(bill.id)}
          disabled={isUpdating}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-bold transition-all",
            bill.status === "overdue"
              ? "bg-red-400 hover:bg-red-300 text-white"
              : "bg-surface border border-border-default text-text-primary hover:border-border-active",
            isUpdating && "cursor-not-allowed opacity-70",
          )}
        >
          {isUpdating ? "Confirmando..." : "Marcar como pago"}
        </button>
      )}
    </div>
  );
}

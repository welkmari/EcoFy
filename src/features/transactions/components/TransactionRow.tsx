"use client";

import {
  PencilSimpleIcon,
  TrashIcon,
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";
import type { Transaction } from "../types";

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  recebido: "bg-cyan-400/10 text-cyan-400",
  pendente: "bg-yellow-500/10 text-yellow-500",
  pago: "bg-purple-400/10 text-purple-400",
};

const STATUS_LABELS: Record<string, string> = {
  recebido: "Recebido",
  pendente: "Pendente",
  pago: "Pago",
};

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  compact = false,
}: Props) {
  const { preferences } = useUserPreferences();
  const isEntrada = transaction.type === "entrada";
  const fmt = (v: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(v);

  if (compact) {
    return (
      <div className="group flex items-center gap-3 bg-surface/35 px-4 py-3">
        <div
          className={cn(
            "rounded-xl p-2",
            isEntrada
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-red-400/10 text-red-400",
          )}
        >
          {isEntrada ? (
            <ArrowCircleUpIcon size={18} />
          ) : (
            <ArrowCircleDownIcon size={18} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">
            {transaction.description}
          </p>
          <p className="truncate text-xs text-text-muted">
            {transaction.category} · Conta principal
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-black",
              isEntrada ? "text-cyan-400" : "text-red-400",
            )}
          >
            {isEntrada ? "+" : "-"}
            {fmt(transaction.amount)}
          </p>
          <div className="mt-1 flex justify-end gap-1">
            <button
              onClick={() => onEdit(transaction)}
              className="rounded-lg p-1.5 text-purple-300 transition-colors hover:bg-purple-400/10 hover:text-purple-200"
              aria-label="Editar transação"
            >
              <PencilSimpleIcon size={14} />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="rounded-lg p-1.5 text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200"
              aria-label="Excluir transação"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="group border-b border-border-default hover:bg-white/5 transition-colors">
      <td className="px-4 py-3 text-text-muted text-sm">
        {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-lg shrink-0",
              isEntrada
                ? "bg-cyan-400/10 text-cyan-400"
                : "bg-red-400/10 text-red-400",
            )}
          >
            {isEntrada ? (
              <ArrowCircleUpIcon size={16} />
            ) : (
              <ArrowCircleDownIcon size={16} />
            )}
          </div>
          <span className="text-text-primary text-sm font-medium">
            {transaction.description}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-text-muted text-sm">
        {transaction.category}
      </td>
      <td className="px-4 py-3 text-text-muted text-sm">
        Conta principal
      </td>
      <td
        className={cn(
          "px-4 py-3 text-sm font-bold",
          isEntrada ? "text-cyan-400" : "text-red-400",
        )}
      >
        {isEntrada ? "+" : "-"}
        {fmt(transaction.amount)}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            STATUS_STYLES[transaction.status],
          )}
        >
          {STATUS_LABELS[transaction.status]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-purple-300 hover:text-purple-200 hover:bg-purple-400/10 transition-colors"
            aria-label="Editar transação"
          >
            <PencilSimpleIcon size={15} />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-400/10 transition-colors"
            aria-label="Excluir transação"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

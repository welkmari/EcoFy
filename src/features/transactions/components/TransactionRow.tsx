"use client";

import {
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";
import type { Transaction } from "../types";
import CategoryIcon, { getCategoryStyle } from "./CategoryIcon";
import { getStatusTransacao } from "../utils";

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  pago: "bg-emerald-400/[0.08] text-emerald-400",
  pendente: "bg-yellow-500/[0.08] text-yellow-500",
  agendado: "bg-purple-500/[0.08] text-purple-400",
};

const STATUS_LABELS: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  agendado: "Agendado",
};

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  compact = false,
}: Props) {
  const { preferences } = useUserPreferences();
  const isEntrada = transaction.type === "entrada";
  const categoryStyle = getCategoryStyle(transaction.category, transaction.type);
  const dataPagamento =
    transaction.status === "pago" || transaction.status === "recebido"
      ? transaction.date
      : null;
  const visualStatus = getStatusTransacao(transaction.date, dataPagamento);
  const fmt = (v: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(v);

  if (compact) {
    return (
      <div className="group flex items-center gap-3 bg-surface/20 px-4 py-3">
        <CategoryIcon
          category={transaction.category}
          type={transaction.type}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">
            {transaction.description}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "max-w-28 truncate rounded-full px-2 py-0.5 text-[11px] font-bold",
                categoryStyle.bg,
                categoryStyle.text,
              )}
            >
              {transaction.category}
            </span>
            <span className="truncate text-xs text-text-muted">
              Conta principal
            </span>
          </div>
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
    <tr className="group border-b border-white/[0.04] transition-colors hover:bg-base/28">
      <td className="px-4 py-3 text-text-muted text-sm">
        {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CategoryIcon
            category={transaction.category}
            type={transaction.type}
            size="sm"
          />
          <span className="text-text-primary text-sm font-medium">
            {transaction.description}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex max-w-40 items-center rounded-full px-2.5 py-1 text-xs font-bold",
            categoryStyle.bg,
            categoryStyle.text,
          )}
        >
          <span className="truncate">{transaction.category}</span>
        </span>
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
            STATUS_STYLES[visualStatus],
          )}
        >
          {STATUS_LABELS[visualStatus]}
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

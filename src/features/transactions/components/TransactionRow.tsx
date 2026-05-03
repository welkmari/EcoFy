"use client";

import {
  PencilSimpleIcon,
  TrashIcon,
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Transaction } from "../types";

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
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
}: Props) {
  const isEntrada = transaction.type === "entrada";
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <tr className="group border-b border-border-default hover:bg-white/5 transition-colors">
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
        {new Date(transaction.date).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            isEntrada
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-red-400/10 text-red-400",
          )}
        >
          {isEntrada ? "Entrada" : "Gasto"}
        </span>
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
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-400/10 transition-colors"
          >
            <PencilSimpleIcon size={15} />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

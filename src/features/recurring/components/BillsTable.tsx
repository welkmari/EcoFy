"use client";

import {
  ArrowCounterClockwiseIcon,
  BookOpenIcon,
  CarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  ForkKnifeIcon,
  GraduationCapIcon,
  HeartbeatIcon,
  HouseIcon,
  LightningIcon,
  PencilSimpleIcon,
  PillIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  TrashIcon,
  WarningCircleIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { BillStatus, FixedBill } from "../types";

type Props = {
  bills: FixedBill[];
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
  updatingBillId?: string | null;
  emptyTitle: string;
  emptyDescription: string;
};

const STATUS_CONFIG: Record<
  BillStatus,
  {
    label: string;
    icon: React.ElementType;
    text: string;
    bg: string;
    row: string;
  }
> = {
  paid: {
    label: "Pago",
    icon: CheckCircleIcon,
    text: "text-emerald-400",
    bg: "bg-emerald-400/[0.08]",
    row: "",
  },
  pending: {
    label: "Pendente",
    icon: ClockIcon,
    text: "text-yellow-500",
    bg: "bg-yellow-500/[0.08]",
    row: "",
  },
  overdue: {
    label: "Vencido",
    icon: WarningCircleIcon,
    text: "text-red-400",
    bg: "bg-red-400/[0.08]",
    row: "",
  },
};

const RECURRENCE_LABEL: Record<string, string> = {
  monthly: "Mensal",
  annual: "Anual",
  weekly: "Semanal",
};

function getBillVisual(bill: FixedBill) {
  const text = `${bill.name} ${bill.category}`.toLowerCase();

  if (text.includes("remédio") || text.includes("remedio") || text.includes("farm")) {
    return {
      icon: PillIcon,
      bg: "bg-emerald-400/[0.08]",
      text: "text-emerald-400",
    };
  }
  if (
    text.includes("faculdade") ||
    text.includes("educ") ||
    text.includes("curso") ||
    text.includes("escola")
  ) {
    return {
      icon: GraduationCapIcon,
      bg: "bg-purple-400/[0.10]",
      text: "text-purple-300",
    };
  }
  if (
    text.includes("operadora") ||
    text.includes("telefone") ||
    text.includes("celular") ||
    text.includes("claro") ||
    text.includes("vivo") ||
    text.includes("tim")
  ) {
    return {
      icon: DeviceMobileIcon,
      bg: "bg-cyan-400/[0.10]",
      text: "text-cyan-300",
    };
  }
  if (text.includes("internet") || text.includes("wifi")) {
    return {
      icon: WifiHighIcon,
      bg: "bg-cyan-400/[0.10]",
      text: "text-cyan-300",
    };
  }
  if (text.includes("aluguel") || text.includes("condomínio") || text.includes("casa")) {
    return {
      icon: HouseIcon,
      bg: "bg-yellow-500/[0.10]",
      text: "text-yellow-500",
    };
  }
  if (text.includes("energia") || text.includes("luz")) {
    return {
      icon: LightningIcon,
      bg: "bg-yellow-500/[0.10]",
      text: "text-yellow-500",
    };
  }
  if (text.includes("mercado") || text.includes("compra")) {
    return {
      icon: ShoppingCartIcon,
      bg: "bg-emerald-400/[0.08]",
      text: "text-emerald-400",
    };
  }
  if (text.includes("aliment") || text.includes("restaurante")) {
    return {
      icon: ForkKnifeIcon,
      bg: "bg-red-400/[0.08]",
      text: "text-red-300",
    };
  }
  if (text.includes("transporte") || text.includes("carro") || text.includes("uber")) {
    return {
      icon: CarIcon,
      bg: "bg-purple-400/[0.10]",
      text: "text-purple-300",
    };
  }
  if (text.includes("cartão") || text.includes("cartao") || text.includes("fatura")) {
    return {
      icon: CreditCardIcon,
      bg: "bg-purple-400/[0.10]",
      text: "text-purple-300",
    };
  }
  if (text.includes("saúde") || text.includes("saude") || text.includes("médico")) {
    return {
      icon: HeartbeatIcon,
      bg: "bg-emerald-400/[0.08]",
      text: "text-emerald-400",
    };
  }
  if (text.includes("livro") || text.includes("assinatura")) {
    return {
      icon: BookOpenIcon,
      bg: "bg-cyan-400/[0.10]",
      text: "text-cyan-300",
    };
  }

  return {
    icon: ReceiptIcon,
    bg: "bg-surface",
    text: "text-text-secondary",
  };
}


export default function BillsTable({
  bills,
  onMarkPaid,
  onUndo,
  onEdit,
  onDelete,
  updatingBillId,
  emptyTitle,
  emptyDescription,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface/72 shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
      <div className="block md:hidden">
        {bills.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="divide-y divide-white/5">
            {bills.map((bill) => (
              <BillListItem
                key={bill.id}
                bill={bill}
                onMarkPaid={onMarkPaid}
                onUndo={onUndo}
                onEdit={onEdit}
                onDelete={onDelete}
                isUpdating={updatingBillId === bill.id}
              />
            ))}
          </div>
        )}
      </div>

      <table className="hidden w-full border-collapse text-left md:table">
        <thead className="bg-base/20 text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Conta</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Vencimento</th>
            <th className="px-4 py-3 font-medium">Recorrência</th>
            <th className="px-4 py-3 font-medium">Valor</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            bills.map((bill) => (
              <BillTableRow
                key={bill.id}
                bill={bill}
                onMarkPaid={onMarkPaid}
                onUndo={onUndo}
                onEdit={onEdit}
                onDelete={onDelete}
                isUpdating={updatingBillId === bill.id}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BillTableRow({
  bill,
  onMarkPaid,
  onUndo,
  onEdit,
  onDelete,
  isUpdating,
}: {
  bill: FixedBill;
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
  isUpdating: boolean;
}) {
  const config = STATUS_CONFIG[bill.status];
  const visual = getBillVisual(bill);
  const Icon = visual.icon;

  return (
    <tr
      className={cn(
        "border-t border-white/[0.04] transition-colors hover:bg-base/28",
        config.row,
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={cn("grid h-9 w-9 place-items-center rounded-xl", visual.bg, visual.text)}>
            <Icon size={18} weight="fill" />
          </span>
          <span className="font-bold text-text-primary">{bill.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{bill.category}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">Dia {bill.dueDay}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {RECURRENCE_LABEL[bill.recurrence]}
      </td>
      <td className="px-4 py-3 text-sm font-black text-text-primary">
        {formatMoney(bill.amount)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={bill.status} />
      </td>
      <td className="px-4 py-3">
        <RowActions
          bill={bill}
          onMarkPaid={onMarkPaid}
          onUndo={onUndo}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isUpdating}
        />
      </td>
    </tr>
  );
}

function BillListItem({
  bill,
  onMarkPaid,
  onUndo,
  onEdit,
  onDelete,
  isUpdating,
}: {
  bill: FixedBill;
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
  isUpdating: boolean;
}) {
  const config = STATUS_CONFIG[bill.status];
  const visual = getBillVisual(bill);
  const Icon = visual.icon;

  return (
    <div className={cn("flex flex-col gap-3 px-4 py-3", config.row)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", visual.bg, visual.text)}>
            <Icon size={19} weight="fill" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-text-primary">
              {bill.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              {bill.category} · dia {bill.dueDay} ·{" "}
              {RECURRENCE_LABEL[bill.recurrence]}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-text-primary">
            {formatMoney(bill.amount)}
          </p>
          <StatusBadge status={bill.status} />
        </div>
      </div>
      <RowActions
        bill={bill}
        onMarkPaid={onMarkPaid}
        onUndo={onUndo}
        onEdit={onEdit}
        onDelete={onDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
}

function RowActions({
  bill,
  onMarkPaid,
  onUndo,
  onEdit,
  onDelete,
  isUpdating,
}: {
  bill: FixedBill;
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {bill.status === "paid" ? (
        <button
          type="button"
          onClick={() => onUndo(bill.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-400/[0.12]"
        >
          <ArrowCounterClockwiseIcon size={14} />
          Marcar pendente
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onMarkPaid(bill.id)}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 rounded-xl bg-base/45 px-3 py-1.5 text-xs font-bold text-text-primary transition-colors hover:bg-base/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon size={14} />
          {isUpdating ? "Confirmando..." : "Marcar pago"}
        </button>
      )}
      <button
        type="button"
        onClick={() => onEdit(bill)}
        className="rounded-lg p-1.5 text-purple-300 transition-colors hover:bg-purple-400/10 hover:text-purple-200"
        aria-label="Editar conta fixa"
      >
        <PencilSimpleIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(bill)}
        className="rounded-lg p-1.5 text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200"
        aria-label="Excluir conta fixa"
      >
        <TrashIcon size={15} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: BillStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm font-bold text-text-primary">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>
    </div>
  );
}

function formatMoney(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

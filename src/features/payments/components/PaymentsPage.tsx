"use client";

import { useMemo, useState } from "react";
import {
  ArrowsDownUpIcon,
  BankIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  WalletIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useSelectedMonth } from "@/lib/selectedMonth";
import { useToast } from "@/components/feedback/ToastProvider";
import { useUserPreferences } from "@/lib/useUserPreferences";
import TransactionModal from "@/features/transactions/components/TransactionsModal";
import CategoryIcon from "@/features/transactions/components/CategoryIcon";
import type {
  FilterType,
  Transaction,
  TransactionStatus,
} from "@/features/transactions/types";

const INITIAL_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Desenvolvimento",
  "Investimentos",
  "Trabalho",
  "Assinatura",
  "Conta fixa",
  "Fatura",
  "Outros",
];

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Tudo", value: "todos" },
  { label: "Entradas", value: "entrada" },
  { label: "Saídas", value: "gasto" },
];

const methods = [
  {
    id: "card",
    name: "Cartão principal",
    detail: "Visa final 8421",
    badge: "Padrão",
    icon: CreditCardIcon,
    tone: "text-purple-300 bg-purple-500/10 border-purple-400/20",
  },
  {
    id: "pix",
    name: "Pix Ecofy",
    detail: "mari@ecofy.app",
    badge: "Instantâneo",
    icon: LightningIcon,
    tone: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  },
  {
    id: "bank",
    name: "Conta bancária",
    detail: "Banco conectado",
    badge: "Verificado",
    icon: BankIcon,
    tone: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  },
] as const;

type MethodId = (typeof methods)[number]["id"];

async function fetchTransactions(month: string) {
  const params = new URLSearchParams({ month });
  const response = await fetch(`/api/transactions?${params.toString()}`);
  if (!response.ok) throw new Error("Falha ao carregar transações");
  return (await response.json()) as Transaction[];
}

async function createTransaction(transaction: Omit<Transaction, "id">) {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error("Falha ao salvar transação");
  return (await response.json()) as Transaction;
}

async function updateTransaction({
  id,
  transaction,
}: {
  id: string;
  transaction: Omit<Transaction, "id">;
}) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error("Falha ao atualizar transação");
  return (await response.json()) as Transaction;
}

async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Falha ao remover transação");
}

function matchesSearch(transaction: Transaction, term: string) {
  if (!term.trim()) return true;
  const normalized = term.toLowerCase().trim();
  return [
    transaction.description,
    transaction.category,
    transaction.date,
    transaction.type,
    transaction.status,
    String(transaction.amount),
  ].some((value) => value.toLowerCase().includes(normalized));
}

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState<MethodId>("card");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const { month } = useSelectedMonth();
  const { preferences } = useUserPreferences();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => fetchTransactions(month),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      showToast({ title: "Transação adicionada", type: "success" });
    },
    onError: () => {
      showToast({
        title: "Não consegui salvar a transação",
        description: "Confira os dados e tente novamente.",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      showToast({ title: "Transação atualizada", type: "success" });
    },
    onError: () => {
      showToast({ title: "Não consegui atualizar a transação", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      showToast({ title: "Transação excluída", type: "success" });
    },
    onError: () => {
      showToast({ title: "Não consegui remover a transação", type: "error" });
    },
  });

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => filter === "todos" || transaction.type === filter)
        .filter((transaction) => matchesSearch(transaction, search))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [filter, search, transactions],
  );

  const pendingPayments = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "gasto" && transaction.status !== "pago",
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions],
  );

  const paidTransactions = transactions.filter((t) =>
    t.type === "entrada" ? t.status === "recebido" : t.status === "pago",
  );
  const totalDue = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayDue = pendingPayments.filter((payment) => payment.date <= today).length;
  const income = transactions
    .filter((transaction) => transaction.type === "entrada")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "gasto")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleSave = async (transaction: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({
        id: editingTransaction.id,
        transaction,
      });
      setEditingTransaction(null);
      return;
    }

    await createMutation.mutateAsync(transaction);
  };

  const markAsPaid = async (transaction: Transaction) => {
    await updateMutation.mutateAsync({
      id: transaction.id,
      transaction: { ...transaction, status: "pago" },
    });
  };

  const exportCsv = () => {
    const rows = [
      ["Descrição", "Categoria", "Data", "Tipo", "Status", "Valor"],
      ...filteredTransactions.map((transaction) => [
        transaction.description,
        transaction.category,
        transaction.date,
        transaction.type,
        transaction.status,
        String(transaction.amount).replace(".", ","),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(";"),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ecofy-transacoes-${month}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="h-full overflow-y-auto p-4 pb-24 scrollbar-hide sm:p-6 md:pb-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <CreditCardIcon size={24} weight="fill" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Pagamentos
              </p>
              <h1 className="text-2xl font-black text-text-primary sm:text-3xl">
                Central de pagamentos
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                Pagamentos e transações no mesmo fluxo.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition-colors hover:border-border-active"
            >
              <DownloadSimpleIcon size={17} />
              Extrato
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-purple-600"
            >
              <PlusIcon size={17} />
              Nova transação
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="overflow-hidden rounded-2xl border border-border-default bg-surface/70">
            <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-secondary">
                  Total para pagar
                </p>
                <p className="mt-2 text-3xl font-black text-text-primary sm:text-4xl">
                  {formatMoney(totalDue)}
                </p>
                <p className="mt-2 max-w-xl text-sm text-text-muted">
                  Entradas de {formatMoney(income)} e saídas de{" "}
                  {formatMoney(expenses)} neste mês.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:w-72">
                <MiniStat label="Hoje" value={String(todayDue)} tone="text-cyan-300" />
                <MiniStat
                  label="Aberto"
                  value={String(pendingPayments.length)}
                  tone="text-yellow-500"
                />
                <MiniStat
                  label="Pago"
                  value={String(paidTransactions.length)}
                  tone="text-emerald-400"
                />
              </div>
            </div>
            <div className="border-t border-border-default p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-text-primary">Próximos pagamentos</h2>
                  <p className="text-xs text-text-muted">
                    Saídas pendentes registradas em transações.
                  </p>
                </div>
                <span className="rounded-full bg-base/55 px-3 py-1 text-xs font-bold text-text-secondary">
                  {pendingPayments.length} itens
                </span>
              </div>
              <div className="grid gap-3">
                {isLoading && <SkeletonRows />}
                {!isLoading && pendingPayments.length === 0 && (
                  <EmptyState text="Nenhum pagamento pendente neste mês." />
                )}
                {pendingPayments.map((payment) => (
                  <PaymentItem
                    key={payment.id}
                    payment={payment}
                    formatMoney={formatMoney}
                    onPay={() => void markAsPaid(payment)}
                    onEdit={() => {
                      setEditingTransaction(payment);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-border-default bg-surface/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-text-primary">Forma de pagamento</h2>
                  <p className="text-xs text-text-muted">Escolha o método padrão.</p>
                </div>
                <WalletIcon size={21} className="text-cyan-300" />
              </div>
              <div className="grid gap-2">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const active = selectedMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        active
                          ? "border-border-active bg-base/60"
                          : "border-border-default bg-base/25 hover:bg-base/45",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                          method.tone,
                        )}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-text-primary">
                          {method.name}
                        </span>
                        <span className="block truncate text-xs text-text-muted">
                          {method.detail}
                        </span>
                      </span>
                      <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-black text-text-muted">
                        {method.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border-default bg-surface/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheckIcon size={20} className="text-emerald-400" />
                <h2 className="font-bold text-text-primary">Segurança</h2>
              </div>
              <div className="grid gap-3 text-sm">
                <SecurityLine label="Pagamentos protegidos" />
                <SecurityLine label="Confirmação antes de debitar" />
                <SecurityLine label="Alertas de vencimento ativos" />
              </div>
            </section>
          </aside>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface/70">
          <div className="grid gap-4 border-b border-border-default px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-5">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-text-primary">
                <ArrowsDownUpIcon size={18} />
                Transações do mês
              </h2>
              <p className="text-xs text-text-muted">
                Histórico real, com edição e exclusão.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 sm:w-64">
                <MagnifyingGlassIcon
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar transações"
                  className="w-full rounded-xl border border-border-default bg-base/55 py-2 pl-10 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                      filter === option.value
                        ? "bg-purple-500 text-white"
                        : "bg-base/55 text-text-muted hover:text-text-primary",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y divide-border-default">
            {isLoading && <SkeletonRows />}
            {isError && (
              <EmptyState text="Não consegui carregar suas transações agora." />
            )}
            {!isLoading && !isError && filteredTransactions.length === 0 && (
              <EmptyState text="Nenhuma transação encontrada." />
            )}
            {filteredTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                formatMoney={formatMoney}
                onEdit={() => {
                  setEditingTransaction(transaction);
                  setModalOpen(true);
                }}
                onDelete={() => deleteMutation.mutate(transaction.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        initialTransaction={editingTransaction}
        categories={categories}
        onAddCategory={(category) => setCategories((prev) => [...prev, category])}
      />
    </main>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-base/45 p-3 text-center">
      <p className={cn("text-xl font-black", tone)}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase text-text-muted">
        {label}
      </p>
    </div>
  );
}

function PaymentItem({
  payment,
  formatMoney,
  onPay,
  onEdit,
}: {
  payment: Transaction;
  formatMoney: (value: number) => string;
  onPay: () => void;
  onEdit: () => void;
}) {
  const isOverdue = payment.date < new Date().toISOString().slice(0, 10);
  const StatusIcon = isOverdue ? WarningCircleIcon : ClockIcon;

  return (
    <article className="grid gap-3 rounded-xl border border-border-default bg-base/35 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isOverdue
              ? "bg-yellow-500/10 text-yellow-500"
              : "bg-cyan-400/10 text-cyan-300",
          )}
        >
          <StatusIcon size={19} weight="fill" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-text-primary">
            {payment.description}
          </p>
          <p className="text-xs text-text-muted">
            {payment.category} - vence {formatDate(payment.date)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <p className="text-sm font-black text-text-primary">
          {formatMoney(payment.amount)}
        </p>
        <button
          type="button"
          onClick={onPay}
          className="rounded-xl bg-surface px-3 py-2 text-xs font-black text-text-primary transition-colors hover:bg-emerald-400/15 hover:text-emerald-300"
        >
          Pagar
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-purple-300 transition-colors hover:bg-purple-400/10"
          aria-label="Editar pagamento"
        >
          <PencilSimpleIcon size={15} />
        </button>
      </div>
    </article>
  );
}

function TransactionListItem({
  transaction,
  formatMoney,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  formatMoney: (value: number) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isEntrada = transaction.type === "entrada";

  return (
    <div className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_130px_130px_92px] sm:items-center sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIcon
          category={transaction.category}
          type={transaction.type}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-text-primary">
            {transaction.description}
          </p>
          <p className="text-xs text-text-muted">
            {transaction.category} - {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      <StatusBadge status={transaction.status} />
      <p
        className={cn(
          "text-sm font-black",
          isEntrada ? "text-cyan-300" : "text-red-300",
        )}
      >
        {isEntrada ? "+" : "-"}
        {formatMoney(transaction.amount)}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-purple-300 transition-colors hover:bg-purple-400/10"
          aria-label="Editar transação"
        >
          <PencilSimpleIcon size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-400/10"
          aria-label="Excluir transação"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    recebido: "bg-cyan-400/10 text-cyan-300",
    pendente: "bg-yellow-500/10 text-yellow-500",
    pago: "bg-emerald-400/10 text-emerald-400",
  };
  const labels: Record<TransactionStatus, string> = {
    recebido: "Recebido",
    pendente: "Pendente",
    pago: "Pago",
  };

  return (
    <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-bold", styles[status])}>
      {labels[status]}
    </span>
  );
}

function SecurityLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <CheckCircleIcon size={16} weight="fill" className="text-emerald-400" />
      <span>{label}</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      <div className="h-16 animate-pulse rounded-xl bg-base/45" />
      <div className="h-16 animate-pulse rounded-xl bg-base/35" />
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center text-sm font-semibold text-text-muted">
      {text}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

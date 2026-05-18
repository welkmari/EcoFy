"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsDownUpIcon,
  CalendarBlankIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { FancySelect } from "@/components/ui/FancySelect";
import { useToast } from "@/components/feedback/ToastProvider";
import type { FilterType, Transaction } from "./types";
import SummaryCards from "./components/SummaryCards";
import TransactionsTable from "./components/TransactionsTable";
import TransactionModal from "./components/TransactionsModal";

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Todos", value: "todos" },
  { label: "Entradas", value: "entrada" },
  { label: "Gastos", value: "gasto" },
];

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
  "Outros",
];

async function fetchTransactions() {
  const response = await fetch("/api/transactions");
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
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao remover transação");
}

function shiftMonth(month: string, offset: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, (monthIndex || 1) - 1 + offset, 1)
    .toISOString()
    .slice(0, 7);
}

function getMonthOptions() {
  const base = new Date();
  return Array.from({ length: 19 }, (_, index) => {
    const offset = index - 9;
    const date = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const value = date.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date);

    return { value, label };
  });
}

function getMonthTone(month: string) {
  const current = new Date().toISOString().slice(0, 7);
  if (month === current) return "Mês atual";
  return month > current ? "Planejamento futuro" : "Histórico";
}

function matchesSearch(transaction: Transaction, term: string) {
  if (!term) return true;
  const normalized = term.toLowerCase().trim();
  const formattedAmount = transaction.amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  return [
    transaction.description,
    transaction.category,
    transaction.date,
    transaction.type,
    transaction.status,
    formattedAmount,
    String(transaction.amount),
  ].some((value) => value.toLowerCase().includes(normalized));
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>("todos");
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
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
      showToast({
        title: "Não consegui atualizar a transação",
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: () => {
      showToast({
        title: "Não consegui remover a transação",
        type: "error",
      });
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const typeMatch = filter === "todos" || transaction.type === filter;
        const monthMatch = transaction.date.startsWith(month);
        return (
          typeMatch &&
          monthMatch &&
          matchesSearch(transaction, debouncedSearch)
        );
      }),
    [debouncedSearch, filter, month, transactions],
  );

  const handleSave = async (t: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({
        id: editingTransaction.id,
        transaction: t,
      });
      setEditingTransaction(null);
      return;
    }

    await createMutation.mutateAsync(t);
  };

  const handleAddCategory = (c: string) => {
    setCategories((prev) => [...prev, c]);
  };

  const handleDelete = async (id: string) => {
    const removed = transactions.find((transaction) => transaction.id === id);
    if (!removed) return;

    await deleteMutation.mutateAsync(id);
    showToast({
      title: "Transação excluída",
      description: "Você tem alguns segundos para desfazer.",
      actionLabel: "Desfazer",
      duration: 5000,
      onAction: () => {
        const payload = {
          description: removed.description,
          category: removed.category,
          date: removed.date,
          type: removed.type,
          amount: removed.amount,
          status: removed.status,
        };
        createMutation.mutate(payload);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-xl border border-border-default text-purple-400">
            <ArrowsDownUpIcon size={22} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Transações</h1>
            <p className="text-text-muted text-sm">
              Gerencie entradas, gastos e projeções do mês.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border border-border-default bg-surface/70 p-1.5">
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-text-primary"
              aria-label="Mês anterior"
            >
              <CalendarBlankIcon size={18} />
            </button>
            <FancySelect
              value={month}
              onChange={setMonth}
              options={getMonthOptions()}
              className="w-44"
            />
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-text-primary"
              aria-label="Próximo mês"
            >
              <CalendarBlankIcon size={18} weight="fill" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-surface border border-border-default text-text-secondary hover:text-text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <FunnelIcon size={16} />
            Filtros
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <PlusIcon size={16} />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border-default bg-surface/70 px-3 py-1 text-xs font-bold text-text-secondary">
          {getMonthTone(month)}
        </span>
      </div>

      <SummaryCards transactions={transactions} month={month} />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface/40 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar transações"
            className="w-full rounded-xl border border-border-default bg-base/70 py-2.5 pl-11 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active"
          />
        </div>
        <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === opt.value
                ? "bg-purple-500 text-white"
                : "bg-surface border border-border-default text-text-muted hover:text-text-primary",
            )}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-text-muted text-xs">
          {filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"}
        </span>
        </div>
      </div>

      <TransactionsTable
        transactions={filtered}
        searchTerm={debouncedSearch}
        onDelete={(id) => void handleDelete(id)}
        onEdit={(transaction) => {
          setEditingTransaction(transaction);
          setModalOpen(true);
        }}
      />

      {isLoading && (
        <div className="grid gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-surface/70" />
          <div className="h-16 animate-pulse rounded-2xl bg-surface/50" />
        </div>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar suas transações agora.
        </p>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        initialTransaction={editingTransaction}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}

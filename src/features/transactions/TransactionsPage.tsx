"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowsDownUpIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/feedback/ToastProvider";
import { useSelectedMonth } from "@/lib/selectedMonth";
import type { FilterType, Transaction } from "./types";
import SummaryCards from "./components/SummaryCards";
import TransactionsTable from "./components/TransactionsTable";
import TransactionModal from "./components/TransactionsModal";
import CategoryFilter from "./components/CategoryFilter";

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

async function fetchTransactions({
  month,
  category,
}: {
  month: string;
  category: string | null;
}) {
  const params = new URLSearchParams({ month });
  if (category) params.set("category", category);

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
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao remover transação");
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const { month } = useSelectedMonth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["transactions", month, selectedCategory],
    queryFn: () => fetchTransactions({ month, category: selectedCategory }),
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
        return (
          typeMatch &&
          matchesSearch(transaction, debouncedSearch)
        );
      }),
    [debouncedSearch, filter, transactions],
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
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 pb-24 scrollbar-hide sm:gap-6 sm:p-6 md:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-surface/80 p-2 text-purple-400 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
            <ArrowsDownUpIcon size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-text-primary text-2xl font-bold">Transações</h1>
            <p className="text-text-muted text-sm">
              Gerencie entradas, gastos e projeções do mês.
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory
                ? "bg-cyan-400/[0.08] text-cyan-400"
                : "bg-surface/80 text-text-secondary hover:bg-surface hover:text-text-primary",
            )}
          >
            <FunnelIcon size={16} />
            Filtros
            {selectedCategory && (
              <span className="rounded-full bg-cyan-400 px-1.5 py-0.5 text-[10px] font-black text-base">
                1
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-600"
          >
            <PlusIcon size={16} />
            Nova Transação
          </button>

          {filtersOpen && (
            <div className="absolute right-0 top-12 z-30 w-[min(92vw,520px)] rounded-2xl bg-surface p-4 shadow-2xl shadow-black/35">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-text-primary">
                    Filtrar por categoria
                  </p>
                  <p className="text-xs text-text-muted">
                    Combina com o mês ativo sem resetar ao navegar.
                  </p>
                </div>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="shrink-0 rounded-xl bg-base/45 px-3 py-1.5 text-xs font-bold text-text-secondary transition-colors hover:bg-base/70 hover:text-text-primary"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface/70 px-3 py-1 text-xs font-bold text-text-secondary shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
          {getMonthTone(month)}
        </span>
      </div>

      <SummaryCards transactions={transactions} month={month} />

      <div className="flex flex-col gap-3 rounded-2xl bg-surface/70 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.14)] lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar transações"
            className="w-full rounded-xl bg-base/70 py-2.5 pl-11 pr-4 text-sm text-text-primary outline-none ring-1 ring-transparent transition placeholder:text-text-muted focus:ring-purple-500/35"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === opt.value
                ? "bg-purple-500 text-white"
                : "bg-surface/70 text-text-muted hover:bg-surface hover:text-text-primary",
            )}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-muted max-sm:w-full">
          {filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"}
        </span>
        </div>
      </div>

      <TransactionsTable
        transactions={filtered}
        searchTerm={debouncedSearch}
        month={month}
        selectedCategory={selectedCategory}
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

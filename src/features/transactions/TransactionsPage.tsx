"use client";

import { useState, useMemo } from "react";
import { ArrowsDownUpIcon, FunnelIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
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

async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao remover transação");
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>("todos");
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const filtered = useMemo(
    () =>
      filter === "todos"
        ? transactions
        : transactions.filter((t) => t.type === filter),
    [filter, transactions],
  );

  const handleSave = async (t: Omit<Transaction, "id">) => {
    await createMutation.mutateAsync(t);
  };

  const handleAddCategory = (c: string) => {
    setCategories((prev) => [...prev, c]);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-xl border border-border-default text-purple-400">
            <ArrowsDownUpIcon size={22} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Transações</h1>
            <p className="text-text-muted text-sm">
              Gerencie suas entradas e gastos do mês.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface border border-border-default text-text-secondary hover:text-text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <FunnelIcon size={16} />
            Filtros
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <PlusIcon size={16} />
            Nova Transação
          </button>
        </div>
      </div>

      <SummaryCards transactions={transactions} />

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

      <TransactionsTable
        transactions={filtered}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={() => { }}
      />

      {isLoading && (
        <p className="text-text-muted text-sm">Carregando transações...</p>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar suas transações agora.
        </p>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}

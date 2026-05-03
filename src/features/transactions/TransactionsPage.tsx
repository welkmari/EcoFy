"use client";

import { useState, useMemo } from "react";
import { ArrowsDownUpIcon, FunnelIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { FilterType, Transaction } from "./types";
import { MOCK_TRANSACTIONS } from "./data";
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

export default function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>("todos");
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "todos"
        ? transactions
        : transactions.filter((t) => t.type === filter),
    [filter, transactions],
  );

  const handleSave = (t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
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
        onDelete={() => { }}
        onEdit={() => { }}
      />

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

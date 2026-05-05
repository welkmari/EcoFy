"use client";

import { useState, useRef, useEffect } from "react";
import {
  XIcon,
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
  PlusIcon,
  CheckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  AlignLeftIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Transaction, TransactionType, TransactionStatus } from "../types";

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: "recebido", label: "Recebido" },
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, "id">) => void;
  categories: string[];
  onAddCategory: (c: string) => void;
};

type FormState = {
  type: TransactionType;
  description: string;
  amount: string;
  date: string;
  status: TransactionStatus;
  category: string;
};

const EMPTY_FORM: FormState = {
  type: "entrada",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  status: "recebido",
  category: "",
};

export default function TransactionModal({
  open,
  onClose,
  onSave,
  categories,
  onAddCategory,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const isEntrada = form.type === "entrada";

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setNewCategory("");
    setShowNewCategory(false);
    setCategoryOpen(false);
    onClose();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setForm((f) => ({ ...f, category: trimmed }));
    setNewCategory("");
    setShowNewCategory(false);
    setCategoryOpen(false);
  };

  const handleSubmit = () => {
    if (!form.description || !form.amount || !form.category) return;
    onSave({
      description: form.description,
      category: form.category,
      date: form.date,
      type: form.type,
      amount: parseFloat(form.amount.replace(",", ".")),
      status: form.status,
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
        <div
          className={cn("h-1 w-full", isEntrada ? "bg-cyan-400" : "bg-red-400")}
        />

        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">Nova Transação</h2>
            <p className="text-text-muted text-xs mt-0.5">
              Preencha os dados abaixo
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <div className="flex rounded-xl overflow-hidden border border-border-default">
            <button
              onClick={() =>
                setForm((f) => ({ ...f, type: "entrada", status: "recebido" }))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all",
                isEntrada
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5",
              )}
            >
              <ArrowCircleUpIcon size={18} />
              Entrada
            </button>
            <div className="w-px bg-border-default" />
            <button
              onClick={() =>
                setForm((f) => ({ ...f, type: "gasto", status: "pago" }))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all",
                !isEntrada
                  ? "bg-red-400/15 text-red-400"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5",
              )}
            >
              <ArrowCircleDownIcon size={18} />
              Gasto
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          <Field icon={<AlignLeftIcon size={16} />} label="Descrição">
            <input
              type="text"
              placeholder="Ex: Freelance React"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full bg-transparent text-sm text-white placeholder:text-text-muted outline-none"
            />
          </Field>

          <Field icon={<CurrencyDollarIcon size={16} />} label="Valor">
            <span className="text-text-muted text-sm shrink-0">R$</span>
            <input
              type="number"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              className="w-full bg-transparent text-sm text-white placeholder:text-text-muted outline-none ml-1"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs font-medium flex items-center gap-1.5">
              <TagIcon size={14} />
              Categoria
            </label>
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm transition-colors hover:border-border-active"
              >
                <span
                  className={form.category ? "text-white" : "text-text-muted"}
                >
                  {form.category || "Selecione uma categoria"}
                </span>
                <span className="text-text-muted text-xs">▾</span>
              </button>

              {categoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-default rounded-xl overflow-hidden z-20 shadow-xl">
                  <div className="max-h-44 overflow-y-auto scrollbar-hide">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setForm((f) => ({ ...f, category: cat }));
                          setCategoryOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5",
                          form.category === cat
                            ? "text-white font-medium"
                            : "text-text-secondary",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border-default p-2">
                    {showNewCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Nova categoria..."
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddCategory()
                          }
                          className="flex-1 bg-base border border-border-default rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-text-muted outline-none focus:border-border-active"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="p-1.5 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
                        >
                          <CheckIcon size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewCategory(true)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <PlusIcon size={14} />
                        Criar categoria
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Field icon={<CalendarIcon size={16} />} label="Data">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-transparent text-sm text-white outline-none scheme:dark"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs font-medium">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm((f) => ({ ...f, status: opt.value }))}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                    form.status === opt.value
                      ? opt.value === "recebido"
                        ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/30"
                        : opt.value === "pendente"
                          ? "bg-yellow-500/15 text-yellow-500 border-yellow-500/30"
                          : "bg-purple-400/15 text-purple-400 border-purple-400/30"
                      : "bg-transparent text-text-muted border-border-default hover:border-border-active",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.description || !form.amount || !form.category}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-all mt-1",
              isEntrada
                ? "bg-cyan-400 hover:bg-cyan-300 text-base disabled:bg-cyan-400/30 disabled:text-cyan-400/50"
                : "bg-red-400 hover:bg-red-300 text-white disabled:bg-red-400/30 disabled:text-red-400/50",
              "disabled:cursor-not-allowed",
            )}
          >
            {isEntrada ? "Salvar Entrada" : "Salvar Gasto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-muted text-xs font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2 bg-base border border-border-default rounded-xl px-3 py-2.5 focus-within:border-border-active transition-colors">
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FancySelect } from "@/components/ui/FancySelect";
import type { BillPayload, FixedBill, Recurrence } from "../types";

type Props = {
  bill: FixedBill | null;
  onClose: () => void;
  onSave: (id: string, payload: BillPayload) => Promise<void> | void;
  isSaving?: boolean;
};

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "monthly", label: "Mensal" },
  { value: "annual", label: "Anual" },
  { value: "weekly", label: "Semanal" },
];

const CATEGORIES = [
  "Software",
  "Moradia",
  "Infraestrutura",
  "Lazer",
  "Tecnologia",
  "Educação",
  "Saúde",
  "Eletrodoméstico",
  "Outros",
];

type FormState = {
  name: string;
  category: string;
  amount: string;
  recurrence: Recurrence;
  dueDay: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function EditBillModal({
  bill,
  onClose,
  onSave,
  isSaving = false,
}: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    category: "",
    amount: "",
    recurrence: "monthly",
    dueDay: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!bill) return;
    const frame = window.requestAnimationFrame(() => {
      setForm({
        name: bill.name,
        category: bill.category,
        amount: String(bill.amount),
        recurrence: bill.recurrence,
        dueDay: String(bill.dueDay),
      });
      setErrors({});
      setSubmitError("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [bill]);

  if (!bill) return null;

  const validate = () => {
    const nextErrors: FormErrors = {};
    const amount = Number(form.amount);
    const dueDay = Number(form.dueDay);

    if (!form.name.trim()) nextErrors.name = "Informe o nome da conta.";
    if (!form.category.trim()) nextErrors.category = "Escolha uma categoria.";
    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      nextErrors.dueDay = "Use um dia entre 1 e 31.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validate() || isSaving) return;

    try {
      await onSave(bill.id, {
        name: form.name.trim(),
        category: form.category.trim(),
        amount: Number(form.amount),
        recurrence: form.recurrence,
        dueDay: Number(form.dueDay),
      });
    } catch {
      setSubmitError("Não foi possível salvar a edição. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl">
        <div className="h-1 bg-purple-500" />
        <div className="flex items-start justify-between gap-3 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-text-primary">
              Editar conta fixa
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Ajuste os dados e salve para atualizar o card.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-base hover:text-text-primary"
            aria-label="Fechar edição"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          <Input
            label="Nome"
            value={form.name}
            error={errors.name}
            onChange={(name) => setForm((current) => ({ ...current, name }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Categoria
            </label>
            <FancySelect
              value={form.category}
              onChange={(category) =>
                setForm((current) => ({ ...current, category }))
              }
              options={CATEGORIES.map((category) => ({
                value: category,
                label: category,
              }))}
              placeholder="Selecione..."
            />
            {errors.category && (
              <p className="text-xs font-medium text-red-400">
                {errors.category}
              </p>
            )}
          </div>
          <Input
            label="Valor"
            type="number"
            value={form.amount}
            error={errors.amount}
            onChange={(amount) =>
              setForm((current) => ({ ...current, amount }))
            }
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Recorrência
            </label>
            <FancySelect
              value={form.recurrence}
              onChange={(recurrence) =>
                setForm((current) => ({
                  ...current,
                  recurrence: recurrence as Recurrence,
                }))
              }
              options={RECURRENCE_OPTIONS}
            />
          </div>
          <Input
            label="Dia do vencimento"
            type="number"
            value={form.dueDay}
            error={errors.dueDay}
            onChange={(dueDay) =>
              setForm((current) => ({ ...current, dueDay }))
            }
          />

          {submitError && (
            <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-400">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : "Salvar edição"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "rounded-xl border bg-base px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active",
          error ? "border-red-400/60" : "border-border-default",
        )}
      />
      {error && <span className="text-xs font-medium text-red-400">{error}</span>}
    </label>
  );
}

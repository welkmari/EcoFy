"use client";

import { useState } from "react";
import { XIcon, RepeatIcon, CreditCardIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FancySelect } from "@/components/ui/FancySelect";
import type { FixedBill, Installment, Recurrence } from "../types";

type Mode = "bill" | "installment";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaveBill: (b: Omit<FixedBill, "id" | "status">) => void;
  onSaveInstallment: (
    i: Omit<
      Installment,
      "id" | "paidAmount" | "paidInstallments" | "startDate"
    >,
  ) => void;
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

const EMPTY_BILL = {
  name: "",
  category: "",
  amount: "",
  recurrence: "monthly" as Recurrence,
  dueDay: "",
};

const EMPTY_INST = {
  name: "",
  category: "",
  totalAmount: "",
  totalInstallments: "",
  dueDay: "",
};

export default function AddRecurringModal({
  open,
  onClose,
  onSaveBill,
  onSaveInstallment,
}: Props) {
  const [mode, setMode] = useState<Mode>("bill");
  const [bill, setBill] = useState(EMPTY_BILL);
  const [inst, setInst] = useState(EMPTY_INST);

  const handleClose = () => {
    setBill(EMPTY_BILL);
    setInst(EMPTY_INST);
    setMode("bill");
    onClose();
  };

  const monthlyPreview =
    inst.totalAmount && inst.totalInstallments
      ? (
          parseFloat(inst.totalAmount) / parseInt(inst.totalInstallments)
        ).toFixed(2)
      : null;

  const handleSubmit = () => {
    if (mode === "bill") {
      if (!bill.name || !bill.amount || !bill.category || !bill.dueDay) return;
      onSaveBill({
        name: bill.name,
        category: bill.category,
        amount: parseFloat(bill.amount),
        recurrence: bill.recurrence,
        dueDay: parseInt(bill.dueDay),
      });
    } else {
      if (
        !inst.name ||
        !inst.totalAmount ||
        !inst.totalInstallments ||
        !inst.category ||
        !inst.dueDay
      )
        return;
      onSaveInstallment({
        name: inst.name,
        category: inst.category,
        totalAmount: parseFloat(inst.totalAmount),
        totalInstallments: parseInt(inst.totalInstallments),
        dueDay: parseInt(inst.dueDay),
      });
    }
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
          className={cn(
            "h-1 w-full",
            mode === "bill" ? "bg-purple-400" : "bg-cyan-400",
          )}
        />

        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-text-primary font-semibold text-lg">
              Novo Compromisso
            </h2>
            <p className="text-text-muted text-xs mt-0.5">
              Conta fixa ou parcelamento
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-base transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <div className="flex rounded-xl overflow-hidden border border-border-default">
            <button
              onClick={() => setMode("bill")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all",
                mode === "bill"
                  ? "bg-purple-400/15 text-purple-400"
                  : "text-text-muted hover:bg-white/5",
              )}
            >
              <RepeatIcon size={16} />
              Conta Fixa
            </button>
            <div className="w-px bg-border-default" />
            <button
              onClick={() => setMode("installment")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all",
                mode === "installment"
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-text-muted hover:bg-white/5",
              )}
            >
              <CreditCardIcon size={16} />
              Parcelamento
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {mode === "bill" ? (
            <>
              <Input
                label="Nome"
                placeholder="Ex: Netflix"
                value={bill.name}
                onChange={(v) => setBill((f) => ({ ...f, name: v }))}
              />
              <SelectField
                label="Categoria"
                value={bill.category}
                onChange={(v) => setBill((f) => ({ ...f, category: v }))}
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
              />
              <Input
                label="Valor (R$)"
                placeholder="0,00"
                type="number"
                value={bill.amount}
                onChange={(v) => setBill((f) => ({ ...f, amount: v }))}
              />
              <SelectField
                label="Recorrência"
                value={bill.recurrence}
                onChange={(v) =>
                  setBill((f) => ({ ...f, recurrence: v as Recurrence }))
                }
                options={RECURRENCE_OPTIONS}
              />
              <Input
                label="Dia do vencimento"
                placeholder="Ex: 10"
                type="number"
                value={bill.dueDay}
                onChange={(v) => setBill((f) => ({ ...f, dueDay: v }))}
              />
            </>
          ) : (
            <>
              <Input
                label="Nome"
                placeholder="Ex: MacBook Pro"
                value={inst.name}
                onChange={(v) => setInst((f) => ({ ...f, name: v }))}
              />
              <SelectField
                label="Categoria"
                value={inst.category}
                onChange={(v) => setInst((f) => ({ ...f, category: v }))}
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
              />
              <Input
                label="Valor total (R$)"
                placeholder="0,00"
                type="number"
                value={inst.totalAmount}
                onChange={(v) => setInst((f) => ({ ...f, totalAmount: v }))}
              />
              <Input
                label="Número de parcelas"
                placeholder="Ex: 12"
                type="number"
                value={inst.totalInstallments}
                onChange={(v) =>
                  setInst((f) => ({ ...f, totalInstallments: v }))
                }
              />
              {monthlyPreview && (
                <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl px-4 py-3 text-sm text-cyan-400 font-medium">
                  Valor mensal: R${" "}
                  {parseFloat(monthlyPreview).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}
              <Input
                label="Dia do vencimento"
                placeholder="Ex: 10"
                type="number"
                value={inst.dueDay}
                onChange={(v) => setInst((f) => ({ ...f, dueDay: v }))}
              />
            </>
          )}

          <button
            onClick={handleSubmit}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-all mt-1 text-white",
              mode === "bill"
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-cyan-500 hover:bg-cyan-400",
            )}
          >
            {mode === "bill" ? "Salvar Conta Fixa" : "Salvar Parcelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-muted text-xs font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border-active transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-muted text-xs font-medium">{label}</label>
      <FancySelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Selecione..."
      />
    </div>
  );
}

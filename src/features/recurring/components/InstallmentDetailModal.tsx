"use client";

import { useEffect, useState } from "react";
import {
  XIcon,
  CheckCircleIcon,
  CircleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type {
  Installment,
  InstallmentEditPayload,
  InstallmentEditScope,
} from "../types";

type Props = {
  installment: Installment | null;
  onClose: () => void;
  onToggleInstallment: (id: string, paidInstallments: number) => void;
  onEditInstallment?: (id: string, payload: InstallmentEditPayload) => void;
  isSavingEdit?: boolean;
};

export default function InstallmentDetailModal({
  installment,
  onClose,
  onToggleInstallment,
  onEditInstallment,
  isSavingEdit = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [scope, setScope] = useState<InstallmentEditScope>("current");
  const [draft, setDraft] = useState({
    name: "",
    category: "",
    totalAmount: "",
    totalInstallments: "",
    dueDay: "",
  });

  useEffect(() => {
    if (!installment) return;
    const frame = window.requestAnimationFrame(() => {
      setEditing(false);
      setScope("current");
      setDraft({
        name: installment.name,
        category: installment.category,
        totalAmount: String(installment.totalAmount),
        totalInstallments: String(installment.totalInstallments),
        dueDay: String(installment.dueDay),
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [installment]);

  if (!installment) return null;

  const monthlyAmount = installment.totalAmount / installment.totalInstallments;
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const pct = Math.round(
    (installment.paidInstallments / installment.totalInstallments) * 100,
  );

  const progressColor =
    pct >= 75 ? "bg-cyan-400" : pct >= 40 ? "bg-purple-400" : "bg-yellow-500";

  const handleToggle = (index: number) => {
    // Se clicar em uma parcela não paga, marca até ela
    // Se clicar na última paga, desmarca ela
    const newPaid = index < installment.paidInstallments ? index : index + 1;
    onToggleInstallment(installment.id, newPaid);
  };

  const hasActiveInstallments =
    installment.totalInstallments > 1 &&
    installment.paidInstallments < installment.totalInstallments;
  const canSaveEdit =
    draft.name.trim() &&
    draft.category.trim() &&
    Number(draft.totalAmount) > 0 &&
    Number(draft.totalInstallments) >= 1 &&
    Number(draft.dueDay) >= 1 &&
    Number(draft.dueDay) <= 31;

  const handleSaveEdit = () => {
    if (!canSaveEdit || !onEditInstallment) return;
    onEditInstallment(installment.id, {
      name: draft.name.trim(),
      category: draft.category.trim(),
      totalAmount: Number(draft.totalAmount),
      totalInstallments: Number(draft.totalInstallments),
      dueDay: Number(draft.dueDay),
      scope,
    });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-purple-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-text-primary font-semibold text-lg">
              {installment.name}
            </h2>
            <p className="text-text-muted text-xs mt-0.5">
              {installment.category} · Vence dia {installment.dueDay}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-base transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Resumo */}
        <div className="px-6 pb-4 flex flex-col gap-3">
          {hasActiveInstallments && (
            <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-xs text-purple-400">
              Parcelamento ativo detectado. Ao editar, escolha o alcance da
              alteração antes de salvar.
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Por parcela</p>
              <p className="text-text-primary font-bold text-sm mt-1">
                {fmt(monthlyAmount)}
              </p>
            </div>
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Pago</p>
              <p className="text-cyan-400 font-bold text-sm mt-1">
                {fmt(installment.paidAmount)}
              </p>
            </div>
            <div className="bg-base rounded-xl p-3 border border-border-default">
              <p className="text-text-muted text-xs">Restante</p>
              <p className="text-red-400 font-bold text-sm mt-1">
                {fmt(installment.totalAmount - installment.paidAmount)}
              </p>
            </div>
          </div>

          {onEditInstallment && (
            <div className="rounded-xl border border-border-default bg-base/40 p-3">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-surface px-3 py-2 text-sm font-bold text-text-primary transition-colors hover:border-border-active"
                >
                  <PencilSimpleIcon size={16} />
                  Editar parcelamento
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <EditInput
                      label="Nome"
                      value={draft.name}
                      onChange={(name) => setDraft((d) => ({ ...d, name }))}
                    />
                    <EditInput
                      label="Categoria"
                      value={draft.category}
                      onChange={(category) =>
                        setDraft((d) => ({ ...d, category }))
                      }
                    />
                    <EditInput
                      label="Valor total"
                      type="number"
                      value={draft.totalAmount}
                      onChange={(totalAmount) =>
                        setDraft((d) => ({ ...d, totalAmount }))
                      }
                    />
                    <EditInput
                      label="Parcelas"
                      type="number"
                      value={draft.totalInstallments}
                      onChange={(totalInstallments) =>
                        setDraft((d) => ({ ...d, totalInstallments }))
                      }
                    />
                    <EditInput
                      label="Vencimento"
                      type="number"
                      value={draft.dueDay}
                      onChange={(dueDay) =>
                        setDraft((d) => ({ ...d, dueDay }))
                      }
                    />
                  </div>

                  {hasActiveInstallments && (
                    <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface/60 p-3">
                      {[
                        ["current", "Editar apenas esta parcela"],
                        ["future", "Editar esta e todas as próximas parcelas da sequência"],
                        ["all", "Editar todo o histórico deste parcelamento"],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary"
                        >
                          <input
                            type="radio"
                            checked={scope === value}
                            onChange={() =>
                              setScope(value as InstallmentEditScope)
                            }
                            className="accent-purple-500"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-xl px-3 py-2 text-sm font-bold text-text-muted transition-colors hover:text-text-primary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!canSaveEdit || isSavingEdit}
                      className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSavingEdit ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-text-muted">
              <span>
                {installment.paidInstallments} de{" "}
                {installment.totalInstallments} parcelas pagas
              </span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-base rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressColor,
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de parcelas */}
        <div className="px-6 pb-6 flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-hide">
          <p className="text-text-muted text-xs font-medium mb-1">
            Parcelas — clique para marcar/desmarcar
          </p>
          {Array.from({ length: installment.totalInstallments }).map((_, i) => {
            const isPaid = i < installment.paidInstallments;
            const isNext = i === installment.paidInstallments;

            return (
              <button
                key={i}
                onClick={() => handleToggle(i)}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left",
                  isPaid
                    ? "bg-cyan-400/10 border-cyan-400/20 hover:border-cyan-400/40"
                    : isNext
                      ? "bg-purple-400/5 border-purple-400/30 hover:border-purple-400/50"
                      : "bg-base border-border-default opacity-50 hover:opacity-70",
                )}
              >
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <CheckCircleIcon
                      size={18}
                      className="text-cyan-400"
                      weight="fill"
                    />
                  ) : (
                    <CircleIcon
                      size={18}
                      className={isNext ? "text-purple-400" : "text-text-muted"}
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPaid
                        ? "text-cyan-400"
                        : isNext
                          ? "text-text-primary"
                          : "text-text-muted",
                    )}
                  >
                    Parcela {i + 1}
                    {isNext && (
                      <span className="ml-2 text-xs text-purple-400 font-normal">
                        próxima
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    isPaid ? "text-cyan-400" : "text-text-muted",
                  )}
                >
                  {fmt(monthlyAmount)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EditInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-border-default bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active"
      />
    </label>
  );
}

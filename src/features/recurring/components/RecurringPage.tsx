"use client";

import { useState, useCallback } from "react";
import { RepeatIcon, PlusIcon, TrophyIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/feedback/ToastProvider";
import type { BillStatus, FixedBill, Installment } from "../types";
import SummaryBar from "./SummaryBar";
import BillCard from "./BillCard";
import InstallmentRow from "./InstallmentRow";
import AddRecurringModal from "./AddRecurringModal";
import InstallmentDetailModal from "./InstallmentDetailModal";

type BillFilter = "all" | BillStatus;
type ToastState = { billId: string; previousStatus: BillStatus } | null;

const BILL_FILTERS: { value: BillFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "overdue", label: "Vencidas" },
  { value: "paid", label: "Pagas" },
];

type RecurringData = {
  bills: FixedBill[];
  installments: Installment[];
};

async function fetchRecurring() {
  const response = await fetch("/api/recurring");
  if (!response.ok) throw new Error("Falha ao carregar recorrentes");
  return (await response.json()) as RecurringData;
}

async function createBill(bill: Omit<FixedBill, "id" | "status">) {
  const response = await fetch("/api/recurring/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bill),
  });
  if (!response.ok) throw new Error("Falha ao salvar conta fixa");
  return (await response.json()) as FixedBill;
}

async function updateBillStatus({
  id,
  status,
}: {
  id: string;
  status: BillStatus;
}) {
  const response = await fetch(`/api/recurring/bills/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Falha ao atualizar conta fixa");
  return (await response.json()) as FixedBill;
}

async function deleteBill(id: string) {
  const response = await fetch(`/api/recurring/bills/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao excluir conta fixa");
}

async function createInstallment(
  installment: Omit<
    Installment,
    "id" | "paidAmount" | "paidInstallments" | "startDate"
  >,
) {
  const response = await fetch("/api/recurring/installments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(installment),
  });
  if (!response.ok) throw new Error("Falha ao salvar parcelamento");
  return (await response.json()) as Installment;
}

async function updateInstallmentProgress({
  id,
  paidInstallments,
}: {
  id: string;
  paidInstallments: number;
}) {
  const response = await fetch(`/api/recurring/installments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paidInstallments }),
  });
  if (!response.ok) throw new Error("Falha ao atualizar parcelamento");
  return (await response.json()) as Installment;
}

export default function RecurringPage() {
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [billToDelete, setBillToDelete] = useState<FixedBill | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recurring"],
    queryFn: fetchRecurring,
  });

  const bills = data?.bills ?? [];
  const installments = data?.installments ?? [];

  const invalidateRecurring = () => {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["overview"] });
  };

  const createBillMutation = useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      invalidateRecurring();
      showToast({ title: "Conta fixa adicionada", type: "success" });
    },
  });

  const billStatusMutation = useMutation({
    mutationFn: updateBillStatus,
    onSuccess: (updated) => {
      invalidateRecurring();
      if (updated.status === "paid") {
        showToast({
          title: "Meta concluída",
          description: `${updated.name} foi marcada como paga.`,
          type: "success",
        });
      }
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      invalidateRecurring();
      setBillToDelete(null);
      showToast({ title: "Conta fixa excluída", type: "success" });
    },
  });

  const createInstallmentMutation = useMutation({
    mutationFn: createInstallment,
    onSuccess: invalidateRecurring,
  });

  const installmentMutation = useMutation({
    mutationFn: updateInstallmentProgress,
    onSuccess: (updated) => {
      invalidateRecurring();
      setSelectedInstallment(updated);
    },
  });

  const filteredBills =
    billFilter === "all" ? bills : bills.filter((b) => b.status === billFilter);
  const sortedBills = [...filteredBills].sort((a, b) => {
    const order: Record<BillStatus, number> = { pending: 0, overdue: 1, paid: 2 };
    return order[a.status] - order[b.status] || a.dueDay - b.dueDay;
  });
  const paidCount = bills.filter((bill) => bill.status === "paid").length;

  const handleMarkPaid = (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setToast({ billId: id, previousStatus: bill.status });
    billStatusMutation.mutate({ id, status: "paid" });
  };

  const handleUndo = useCallback(() => {
    if (!toast) return;
    billStatusMutation.mutate({
      id: toast.billId,
      status: toast.previousStatus,
    });
    setToast(null);
  }, [billStatusMutation, toast]);

  const handleToggleInstallment = (id: string, paidInstallments: number) => {
    installmentMutation.mutate({ id, paidInstallments });
  };

  const handleSaveBill = (b: Omit<FixedBill, "id" | "status">) =>
    createBillMutation.mutate(b);

  const handleSaveInstallment = (
    i: Omit<
      Installment,
      "id" | "paidAmount" | "paidInstallments" | "startDate"
    >,
  ) =>
    createInstallmentMutation.mutate(i);

  return (
    <div className="flex flex-col gap-8 p-6 h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-xl border border-border-default text-purple-400">
            <RepeatIcon size={22} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Contas Fixas</h1>
            <p className="text-text-muted text-sm">
              Contas, parcelamentos e conquistas do mês em um só lugar.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <PlusIcon size={16} />
          Adicionar
        </button>
      </div>

      <SummaryBar bills={bills} installments={installments} />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-border-default bg-surface/60"
            />
          ))}
        </div>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar contas fixas e parcelamentos agora.
        </p>
      )}

      {/* Fixed Bills */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-white font-semibold">Pendências do mês</h2>
            <p className="text-xs text-text-muted">
              {paidCount} de {bills.length} metas pagas este mês
            </p>
          </div>
          <div className="flex items-center gap-2">
            {BILL_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setBillFilter(f.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  billFilter === f.value
                    ? "bg-purple-500 text-white"
                    : "bg-surface border border-border-default text-text-muted hover:text-text-primary",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {bills.length > 0 && (
        <div className="rounded-2xl border border-border-default bg-surface/50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <TrophyIcon size={18} weight="fill" />
              Suas conquistas
            </span>
            <span className="text-xs font-black text-purple-400">
              {bills.length ? Math.round((paidCount / bills.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-base/60">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-600 to-cyan-400 transition-all duration-700"
              style={{
                width: `${bills.length ? (paidCount / bills.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onMarkPaid={handleMarkPaid}
              onUndo={handleUndo}
              onEdit={(item) =>
                showToast({
                  title: "Edição rápida",
                  description: `${item.name} pode ser ajustada no próximo modal de edição.`,
                  type: "info",
                })
              }
              onDelete={setBillToDelete}
            />
          ))}
          {!isLoading && sortedBills.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface/30 px-6 py-12 text-center">
              <p className="text-base font-bold text-text-primary">
                Nenhuma conta fixa cadastrada ainda.
              </p>
              <p className="mt-1 max-w-sm text-sm text-text-muted">
                Adicione sua primeira para acompanhar vencimentos e conquistas.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 rounded-xl bg-purple-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-purple-600"
              >
                Adicionar primeira conta
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Installments */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold">Parcelamentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installments.map((i) => (
            <InstallmentRow
              key={i.id}
              installment={i}
              onClick={() => setSelectedInstallment(i)}
            />
          ))}
        </div>
      </section>

      <AddRecurringModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveBill={handleSaveBill}
        onSaveInstallment={handleSaveInstallment}
      />

      <InstallmentDetailModal
        installment={selectedInstallment}
        onClose={() => setSelectedInstallment(null)}
        onToggleInstallment={handleToggleInstallment}
      />

      {billToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBillToDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border-default bg-surface p-5 shadow-2xl">
            <h3 className="text-lg font-black text-text-primary">
              Excluir conta fixa?
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              {billToDelete.name} será removida da sua lista de contas fixas.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteBillMutation.mutate(billToDelete.id)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-red-400"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

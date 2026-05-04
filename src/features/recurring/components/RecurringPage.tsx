"use client";

import { useState, useCallback } from "react";
import { RepeatIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import type { BillStatus, FixedBill, Installment } from "../types";
import SummaryBar from "./SummaryBar";
import BillCard from "./BillCard";
import InstallmentRow from "./InstallmentRow";
import AddRecurringModal from "./AddRecurringModal";
import InstallmentDetailModal from "./InstallmentDetailModal";

type BillFilter = "all" | BillStatus;
type ToastState = { billId: string; previousStatus: BillStatus } | null;

const BILL_FILTERS: { value: BillFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
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
  const queryClient = useQueryClient();

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
    onSuccess: invalidateRecurring,
  });

  const billStatusMutation = useMutation({
    mutationFn: updateBillStatus,
    onSuccess: invalidateRecurring,
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
            <h1 className="text-white text-2xl font-bold">Recurring</h1>
            <p className="text-text-muted text-sm">
              Fixed bills and installments in one place.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <PlusIcon size={16} />
          Add New
        </button>
      </div>

      <SummaryBar bills={bills} installments={installments} />

      {isLoading && (
        <p className="text-text-muted text-sm">Carregando recorrentes...</p>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar contas fixas e parcelamentos agora.
        </p>
      )}

      {/* Fixed Bills */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Fixed Bills</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onMarkPaid={handleMarkPaid}
              onUndo={handleUndo}
            />
          ))}
          {filteredBills.length === 0 && (
            <p className="text-text-muted text-sm col-span-3 py-8 text-center">
              Nenhuma conta encontrada.
            </p>
          )}
        </div>
      </section>

      {/* Installments */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold">Installments</h2>
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
    </div>
  );
}

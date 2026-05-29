"use client";

import { useState, useCallback } from "react";
import { RepeatIcon, PlusIcon, TrophyIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/feedback/ToastProvider";
import { useSelectedMonth } from "@/lib/selectedMonth";
import type {
  BillPayload,
  BillStatus,
  FixedBill,
  Installment,
  InstallmentEditPayload,
} from "../types";
import SummaryBar from "./SummaryBar";
import BillsTable from "./BillsTable";
import InstallmentsTable from "./InstallmentsTable";
import AddRecurringModal from "./AddRecurringModal";
import InstallmentDetailModal from "./InstallmentDetailModal";
import EditBillModal from "./EditBillModal";

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

async function fetchRecurring(month: string) {
  const params = new URLSearchParams({ month });
  const response = await fetch(`/api/recurring?${params.toString()}`);
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
  month,
}: {
  id: string;
  status: BillStatus;
  month: string;
}) {
  const response = await fetch(`/api/recurring/bills/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, month }),
  });
  if (![200, 201].includes(response.status)) {
    throw new Error("Falha ao atualizar conta fixa");
  }
  return (await response.json()) as FixedBill;
}

async function updateBillDetails({
  id,
  payload,
}: {
  id: string;
  payload: BillPayload;
}) {
  const response = await fetch(`/api/recurring/bills/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (![200, 201].includes(response.status)) {
    throw new Error("Falha ao editar conta fixa");
  }
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

async function updateInstallmentDetails({
  id,
  payload,
}: {
  id: string;
  payload: InstallmentEditPayload;
}) {
  const response = await fetch(`/api/recurring/installments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao editar parcelamento");
  return (await response.json()) as Installment;
}

export default function RecurringPage() {
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [billToDelete, setBillToDelete] = useState<FixedBill | null>(null);
  const [billToEdit, setBillToEdit] = useState<FixedBill | null>(null);
  const [updatingBillId, setUpdatingBillId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { month } = useSelectedMonth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recurring", month],
    queryFn: () => fetchRecurring(month),
  });

  const bills = data?.bills ?? [];
  const installments = data?.installments ?? [];

  const invalidateRecurring = () => {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    onMutate: async ({ id, status }) => {
      setUpdatingBillId(id);
      await queryClient.cancelQueries({ queryKey: ["recurring", month] });
      const previous = queryClient.getQueryData<RecurringData>([
        "recurring",
        month,
      ]);
      queryClient.setQueryData<RecurringData>(["recurring", month], (current) => {
        if (!current) return current;
        return {
          ...current,
          bills: current.bills.map((bill) =>
            bill.id === id ? { ...bill, status } : bill,
          ),
        };
      });
      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<RecurringData>(["recurring", month], (current) => {
        if (!current) return current;
        return {
          ...current,
          bills: current.bills.map((bill) =>
            bill.id === updated.id ? updated : bill,
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      if (updated.status === "paid") {
        showToast({
          title: "Meta concluída",
          description: `${updated.name} foi marcada como paga.`,
          type: "success",
        });
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recurring", month], context.previous);
      }
      showToast({
        title: "Não foi possível confirmar o pagamento. Tente novamente.",
        type: "error",
      });
    },
    onSettled: () => {
      setUpdatingBillId(null);
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
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

  const editBillMutation = useMutation({
    mutationFn: updateBillDetails,
    onSuccess: (updated) => {
      queryClient.setQueryData<RecurringData>(["recurring"], (current) => {
        if (!current) return current;
        return {
          ...current,
          bills: current.bills.map((bill) =>
            bill.id === updated.id ? updated : bill,
          ),
        };
      });
      setBillToEdit(null);
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      showToast({ title: "Conta fixa atualizada", type: "success" });
    },
    onError: () => {
      showToast({
        title: "Não consegui salvar a edição",
        description: "Confira os campos e tente novamente.",
        type: "error",
      });
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

  const installmentEditMutation = useMutation({
    mutationFn: updateInstallmentDetails,
    onSuccess: (updated) => {
      invalidateRecurring();
      setSelectedInstallment(updated);
      showToast({ title: "Parcelamento atualizado", type: "success" });
    },
    onError: () => {
      showToast({
        title: "Não consegui editar o parcelamento",
        description: "Confira os dados e tente novamente.",
        type: "error",
      });
    },
  });

  const filteredBills =
    billFilter === "all"
      ? bills
      : bills.filter((b) => b.status === billFilter);
  const sortedBills = [...filteredBills].sort((a, b) => {
    const order: Record<BillStatus, number> = { pending: 0, overdue: 1, paid: 2 };
    return order[a.status] - order[b.status] || a.dueDay - b.dueDay;
  });
  const paidCount = bills.filter((bill) => bill.status === "paid").length;

  const handleMarkPaid = (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setToast({ billId: id, previousStatus: bill.status });
    billStatusMutation.mutate({ id, status: "paid", month });
  };

  const handleUndo = useCallback((id: string) => {
    billStatusMutation.mutate({
      id,
      status: toast?.billId === id ? toast.previousStatus : "pending",
      month,
    });
    setToast(null);
  }, [billStatusMutation, month, toast]);

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
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4 pb-24 scrollbar-hide sm:gap-8 sm:p-6 md:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-surface/80 p-2 text-purple-400 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
            <RepeatIcon size={22} />
          </div>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Contas Fixas</h1>
            <p className="text-text-muted text-sm">
              Contas, parcelamentos e conquistas do mês em um só lugar.
            </p>
            <p className="mt-1 text-xs font-bold text-purple-400">
              Período sincronizado: {month}
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-600 sm:shrink-0"
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
              className="h-44 animate-pulse rounded-2xl bg-surface/60"
            />
          ))}
        </div>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar contas fixas e parcelamentos agora.
        </p>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="text-text-primary font-semibold">Contas do mês</h2>
            <p className="text-xs text-text-muted">
              {paidCount} de {bills.length} contas pagas este mês
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {BILL_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setBillFilter(f.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  billFilter === f.value
                    ? "bg-purple-500 text-white"
                    : "bg-surface/70 text-text-muted hover:bg-surface hover:text-text-primary",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {bills.length > 0 && (
        <div className="rounded-2xl bg-surface/70 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <TrophyIcon size={18} weight="fill" />
              Progresso de pagamentos
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
        <BillsTable
          bills={sortedBills}
          onMarkPaid={handleMarkPaid}
          onUndo={handleUndo}
          onEdit={setBillToEdit}
          onDelete={setBillToDelete}
          updatingBillId={updatingBillId}
          emptyTitle="Nenhuma conta encontrada."
          emptyDescription="Adicione uma conta fixa ou ajuste o filtro de status."
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-text-primary font-semibold">Parcelamentos</h2>
          <p className="text-xs text-text-muted">
            Acompanhe parcelas, valores mensais e progresso.
          </p>
        </div>
        <InstallmentsTable
          installments={installments}
          onOpen={setSelectedInstallment}
        />
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
        onEditInstallment={(id, payload) =>
          installmentEditMutation.mutate({ id, payload })
        }
        isSavingEdit={installmentEditMutation.isPending}
      />

      <EditBillModal
        bill={billToEdit}
        onClose={() => setBillToEdit(null)}
        onSave={async (id, payload) => {
          await editBillMutation.mutateAsync({ id, payload });
        }}
        isSaving={editBillMutation.isPending}
      />

      {billToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBillToDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 shadow-2xl shadow-black/35">
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

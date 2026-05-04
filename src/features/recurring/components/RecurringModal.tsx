"use client";

import { useState } from "react";
import { RepeatIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { MOCK_BILLS, MOCK_INSTALLMENTS } from "../data";
import type { BillStatus, FixedBill, Installment } from "../types";
import SummaryBar from "./SummaryBar";
import BillCard from "./BillCard";
import InstallmentRow from "./InstallmentRow";
import AddRecurringModal from "./AddRecurringModal";
import InstallmentDetailModal from "./InstallmentDetailModal";

type BillFilter = "all" | BillStatus;

const BILL_FILTERS: { value: BillFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export default function RecurringPage() {
  const [bills, setBills] = useState<FixedBill[]>(MOCK_BILLS);
  const [installments, setInstallments] =
    useState<Installment[]>(MOCK_INSTALLMENTS);
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);

  const filteredBills =
    billFilter === "all" ? bills : bills.filter((b) => b.status === billFilter);

  const handleMarkPaid = (id: string) =>
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "paid" } : b)),
    );

  const handleUndo = (id: string) =>
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "pending" } : b)),
    );

  const handleToggleInstallment = (id: string, paidInstallments: number) => {
    setInstallments((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const monthlyAmount = i.totalAmount / i.totalInstallments;
        return {
          ...i,
          paidInstallments,
          paidAmount: monthlyAmount * paidInstallments,
        };
      }),
    );
    setSelectedInstallment((prev) => {
      if (!prev || prev.id !== id) return prev;
      const monthlyAmount = prev.totalAmount / prev.totalInstallments;
      return {
        ...prev,
        paidInstallments,
        paidAmount: monthlyAmount * paidInstallments,
      };
    });
  };

  const handleSaveBill = (b: Omit<FixedBill, "id" | "status">) =>
    setBills((prev) => [
      { ...b, id: crypto.randomUUID(), status: "pending" },
      ...prev,
    ]);

  const handleSaveInstallment = (
    i: Omit<
      Installment,
      "id" | "paidAmount" | "paidInstallments" | "startDate"
    >,
  ) =>
    setInstallments((prev) => [
      {
        ...i,
        id: crypto.randomUUID(),
        paidAmount: 0,
        paidInstallments: 0,
        startDate: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);

  return (
    <div className="flex flex-col gap-8 p-6 h-full overflow-y-auto scrollbar-hide">
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold ">Fixed Bills</h2>
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

      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold ">Installments</h2>
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

import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills, installments, transactions } from "@/lib/schema";

type BillStatus = "paid" | "pending" | "overdue";

function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function currentMonth() {
  return todayInSaoPaulo().slice(0, 7);
}

function currentDay() {
  return Number(todayInSaoPaulo().slice(8, 10));
}

function normalizeMonth(month: string | null) {
  return month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth();
}

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, (monthIndex || 1) - 1, 1);
  const end = new Date(year, monthIndex || 1, 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getPaymentDescription(name: string) {
  return `Conta fixa: ${name}`;
}

function getBillStatusForMonth({
  bill,
  paidDescriptions,
  month,
}: {
  bill: typeof fixedBills.$inferSelect;
  paidDescriptions: Set<string>;
  month: string;
}): BillStatus {
  if (paidDescriptions.has(getPaymentDescription(bill.name))) return "paid";
  if (month < currentMonth()) return "overdue";
  if (month === currentMonth() && bill.dueDay < currentDay()) return "overdue";
  return "pending";
}

function serializeBill(
  row: typeof fixedBills.$inferSelect,
  status: BillStatus,
) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amount: toNumber(row.amount),
    recurrence: row.recurrence,
    dueDay: row.dueDay,
    status,
  };
}

function serializeInstallment(row: typeof installments.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    totalAmount: toNumber(row.totalAmount),
    paidAmount: toNumber(row.paidAmount),
    totalInstallments: row.totalInstallments,
    paidInstallments: row.paidInstallments,
    dueDay: row.dueDay,
    startDate: row.startDate,
  };
}

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const month = normalizeMonth(new URL(request.url).searchParams.get("month"));
  const range = getMonthRange(month);

  const [billRows, installmentRows, paidRows] = await Promise.all([
    db
      .select()
      .from(fixedBills)
      .where(eq(fixedBills.userId, user.id))
      .orderBy(desc(fixedBills.createdAt)),
    db
      .select()
      .from(installments)
      .where(eq(installments.userId, user.id))
      .orderBy(desc(installments.createdAt)),
    db
      .select({ description: transactions.description })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.type, "gasto"),
          eq(transactions.status, "pago"),
          gte(transactions.date, range.start),
          lt(transactions.date, range.end),
        ),
      ),
  ]);

  const paidDescriptions = new Set(paidRows.map((row) => row.description));

  return Response.json({
    bills: billRows.map((bill) =>
      serializeBill(
        bill,
        getBillStatusForMonth({ bill, paidDescriptions, month }),
      ),
    ),
    installments: installmentRows.map(serializeInstallment),
  });
}

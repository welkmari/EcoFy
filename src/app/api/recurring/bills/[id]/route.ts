import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills, transactions } from "@/lib/schema";

const billUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  recurrence: z.enum(["monthly", "annual", "weekly"]).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

function serialize(row: typeof fixedBills.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amount: toNumber(row.amount),
    recurrence: row.recurrence,
    dueDay: row.dueDay,
    status: row.status,
  };
}

function getTodayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getMonthRangeFromMonth(month: string) {
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

function getPaymentDateForMonth(month: string, dueDay: number) {
  const currentMonth = getTodayInSaoPaulo().slice(0, 7);
  if (month === currentMonth) return getTodayInSaoPaulo();

  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(year, monthIndex || 1, 0).getDate();
  const day = String(Math.min(dueDay, lastDay)).padStart(2, "0");
  return `${month}-${day}`;
}

async function createPaymentHistoryFromBill({
  bill,
  userId,
  month,
}: {
  bill: typeof fixedBills.$inferSelect;
  userId: string;
  month: string;
}) {
  const paymentDate = getPaymentDateForMonth(month, bill.dueDay);
  const monthRange = getMonthRangeFromMonth(month);
  const description = getPaymentDescription(bill.name);

  const [existing] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.description, description),
        eq(transactions.category, bill.category),
        eq(transactions.type, "gasto"),
        eq(transactions.status, "pago"),
        gte(transactions.date, monthRange.start),
        lt(transactions.date, monthRange.end),
      ),
    )
    .limit(1);

  if (existing) return;

  await db.insert(transactions).values({
    userId,
    description,
    category: bill.category,
    date: paymentDate,
    type: "gasto",
    amount: bill.amount,
    status: "pago",
  });
}

async function deletePaymentHistoryFromBill({
  bill,
  userId,
  month,
}: {
  bill: typeof fixedBills.$inferSelect;
  userId: string;
  month: string;
}) {
  const monthRange = getMonthRangeFromMonth(month);

  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.description, getPaymentDescription(bill.name)),
        eq(transactions.category, bill.category),
        eq(transactions.type, "gasto"),
        eq(transactions.status, "pago"),
        gte(transactions.date, monthRange.start),
        lt(transactions.date, monthRange.end),
      ),
    );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = billUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid bill update" }, { status: 400 });
  }

  const { status, month, ...billData } = parsed.data;
  const updateData = {
    ...billData,
    amount:
      billData.amount === undefined
        ? undefined
        : billData.amount.toFixed(2),
  };

  const { id } = await params;
  const [current] = await db
    .select()
    .from(fixedBills)
    .where(and(eq(fixedBills.id, id), eq(fixedBills.userId, user.id)))
    .limit(1);

  if (!current) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  const hasBillChanges = Object.values(updateData).some(
    (value) => value !== undefined,
  );
  const [updated] = hasBillChanges
    ? await db
        .update(fixedBills)
        .set(updateData)
        .where(and(eq(fixedBills.id, id), eq(fixedBills.userId, user.id)))
        .returning()
    : [current];

  if (status && month) {
    if (status === "paid") {
      await createPaymentHistoryFromBill({ bill: updated, userId: user.id, month });
    } else {
      await deletePaymentHistoryFromBill({ bill: updated, userId: user.id, month });
    }
  }

  return Response.json({
    ...serialize(updated),
    status: status ?? updated.status,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  await db
    .delete(fixedBills)
    .where(and(eq(fixedBills.id, id), eq(fixedBills.userId, user.id)));

  return Response.json({ ok: true });
}

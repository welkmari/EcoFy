import { desc, eq } from "drizzle-orm";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills, installments } from "@/lib/schema";

function serializeBill(row: typeof fixedBills.$inferSelect) {
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

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const [billRows, installmentRows] = await Promise.all([
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
  ]);

  return Response.json({
    bills: billRows.map(serializeBill),
    installments: installmentRows.map(serializeInstallment),
  });
}

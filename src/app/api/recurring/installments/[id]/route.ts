import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { installments } from "@/lib/schema";

const paidSchema = z.object({
  paidInstallments: z.coerce.number().int().min(0),
});

function serialize(row: typeof installments.$inferSelect) {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = paidSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid installment amount" }, { status: 400 });
  }

  const { id } = await params;
  const [current] = await db
    .select()
    .from(installments)
    .where(and(eq(installments.id, id), eq(installments.userId, user.id)));

  if (!current) {
    return Response.json({ error: "Installment not found" }, { status: 404 });
  }

  const paidInstallments = Math.min(
    parsed.data.paidInstallments,
    current.totalInstallments,
  );
  const monthlyAmount = toNumber(current.totalAmount) / current.totalInstallments;
  const paidAmount = monthlyAmount * paidInstallments;

  const [updated] = await db
    .update(installments)
    .set({
      paidInstallments,
      paidAmount: paidAmount.toFixed(2),
    })
    .where(and(eq(installments.id, id), eq(installments.userId, user.id)))
    .returning();

  return Response.json(serialize(updated));
}

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { installments } from "@/lib/schema";

const paidSchema = z.object({
  paidInstallments: z.coerce.number().int().min(0).optional(),
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  totalAmount: z.coerce.number().positive().optional(),
  totalInstallments: z.coerce.number().int().min(1).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  scope: z.enum(["current", "future", "all"]).optional(),
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

  const totalInstallments =
    parsed.data.totalInstallments ?? current.totalInstallments;
  const totalAmount = parsed.data.totalAmount ?? toNumber(current.totalAmount);
  const paidInstallments = Math.min(
    parsed.data.paidInstallments ?? current.paidInstallments,
    totalInstallments,
  );
  const monthlyAmount = totalAmount / totalInstallments;
  const paidAmount = monthlyAmount * paidInstallments;

  const [updated] = await db
    .update(installments)
    .set({
      name: parsed.data.name ?? current.name,
      category: parsed.data.category ?? current.category,
      totalAmount: totalAmount.toFixed(2),
      totalInstallments,
      dueDay: parsed.data.dueDay ?? current.dueDay,
      paidInstallments,
      paidAmount: paidAmount.toFixed(2),
    })
    .where(and(eq(installments.id, id), eq(installments.userId, user.id)))
    .returning();

  return Response.json(serialize(updated));
}

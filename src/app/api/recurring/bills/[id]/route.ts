import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills } from "@/lib/schema";

const billUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  recurrence: z.enum(["monthly", "annual", "weekly"]).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
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

  const updateData = {
    ...parsed.data,
    amount:
      parsed.data.amount === undefined
        ? undefined
        : parsed.data.amount.toFixed(2),
  };

  const { id } = await params;
  const [updated] = await db
    .update(fixedBills)
    .set(updateData)
    .where(and(eq(fixedBills.id, id), eq(fixedBills.userId, user.id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  return Response.json(serialize(updated));
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

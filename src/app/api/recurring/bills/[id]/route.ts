import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills } from "@/lib/schema";

const statusSchema = z.object({
  status: z.enum(["paid", "pending", "overdue"]),
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

  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid bill status" }, { status: 400 });
  }

  const { id } = await params;
  const [updated] = await db
    .update(fixedBills)
    .set({ status: parsed.data.status })
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

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { savingsGoals } from "@/lib/schema";

const depositSchema = z.object({
  amount: z.coerce.number().positive(),
});

function serialize(row: typeof savingsGoals.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    current: toNumber(row.current),
    total: toNumber(row.total),
    iconKey: row.iconKey,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = depositSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid deposit" }, { status: 400 });
  }

  const { id } = await params;
  const [current] = await db
    .select()
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, user.id)));

  if (!current) {
    return Response.json({ error: "Savings goal not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(savingsGoals)
    .set({ current: (toNumber(current.current) + parsed.data.amount).toFixed(2) })
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, user.id)))
    .returning();

  return Response.json(serialize(updated));
}

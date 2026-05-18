import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";

const transactionSchema = z.object({
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["entrada", "gasto"]),
  amount: z.coerce.number().positive(),
  status: z.enum(["recebido", "pendente", "pago"]),
});

function serialize(row: typeof transactions.$inferSelect) {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    date: row.date,
    type: row.type,
    amount: Number(row.amount),
    status: row.status,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = transactionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const { id } = await params;
  const [updated] = await db
    .update(transactions)
    .set({
      ...parsed.data,
      amount: parsed.data.amount.toFixed(2),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
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
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  return Response.json({ ok: true });
}

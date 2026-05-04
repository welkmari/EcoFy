import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
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
    amount: toNumber(row.amount),
    status: row.status,
  };
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  return Response.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = transactionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const [created] = await db
    .insert(transactions)
    .values({
      userId: user.id,
      ...parsed.data,
      amount: parsed.data.amount.toFixed(2),
    })
    .returning();

  return Response.json(serialize(created), { status: 201 });
}

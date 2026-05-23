import { and, desc, eq, gte, lt } from "drizzle-orm";
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

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, (monthIndex || 1) - 1, 1);
  const end = new Date(year, monthIndex || 1, 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const params = new URL(request.url).searchParams;
  const month = params.get("month");
  const category = params.get("category");
  const range = month && /^\d{4}-\d{2}$/.test(month) ? getMonthRange(month) : null;
  const filters = [
    eq(transactions.userId, user.id),
    range ? gte(transactions.date, range.start) : undefined,
    range ? lt(transactions.date, range.end) : undefined,
    category ? eq(transactions.category, category) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...filters))
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

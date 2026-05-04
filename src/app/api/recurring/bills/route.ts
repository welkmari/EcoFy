import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills } from "@/lib/schema";

const billSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  recurrence: z.enum(["monthly", "annual", "weekly"]),
  dueDay: z.coerce.number().int().min(1).max(31),
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

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = billSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid fixed bill" }, { status: 400 });
  }

  const [created] = await db
    .insert(fixedBills)
    .values({
      userId: user.id,
      ...parsed.data,
      amount: parsed.data.amount.toFixed(2),
      status: "pending",
    })
    .returning();

  return Response.json(serialize(created), { status: 201 });
}

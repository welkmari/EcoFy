import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { installments } from "@/lib/schema";

const installmentSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  totalAmount: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1),
  dueDay: z.coerce.number().int().min(1).max(31),
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

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = installmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid installment" }, { status: 400 });
  }

  const [created] = await db
    .insert(installments)
    .values({
      userId: user.id,
      ...parsed.data,
      totalAmount: parsed.data.totalAmount.toFixed(2),
      paidAmount: "0.00",
      paidInstallments: 0,
      startDate: new Date().toISOString().split("T")[0],
    })
    .returning();

  return Response.json(serialize(created), { status: 201 });
}

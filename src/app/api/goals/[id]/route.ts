import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { savingsGoals } from "@/lib/schema";

const goalUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  total: z.coerce.number().positive().optional(),
  iconKey: z.string().trim().min(1).optional(),
  coverImage: z.string().trim().url().optional(),
});

function serializeCompat(row: {
  id: string;
  title: string;
  current: string;
  total: string;
  iconKey: string;
  coverImage?: string | null;
}) {
  return {
    id: row.id,
    title: row.title,
    current: toNumber(row.current),
    total: toNumber(row.total),
    iconKey: row.iconKey,
    coverImage: row.coverImage ?? null,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = goalUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid savings goal" }, { status: 400 });
  }

  const { id } = await params;
  const [updated] = await db
    .update(savingsGoals)
    .set({
      title: parsed.data.title,
      total:
        parsed.data.total === undefined
          ? undefined
          : parsed.data.total.toFixed(2),
      iconKey: parsed.data.iconKey,
      coverImage: parsed.data.coverImage,
    })
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, user.id)))
    .returning({
      id: savingsGoals.id,
      title: savingsGoals.title,
      current: savingsGoals.current,
      total: savingsGoals.total,
      iconKey: savingsGoals.iconKey,
      coverImage: savingsGoals.coverImage,
    });

  if (!updated) {
    return Response.json({ error: "Savings goal not found" }, { status: 404 });
  }

  return Response.json(serializeCompat(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  await db
    .delete(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, user.id)));

  return Response.json({ ok: true });
}

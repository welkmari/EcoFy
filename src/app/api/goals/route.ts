import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { savingsGoals } from "@/lib/schema";

const goalSchema = z.object({
  title: z.string().trim().min(1),
  current: z.coerce.number().min(0).default(0),
  total: z.coerce.number().positive(),
  iconKey: z.string().trim().min(1).default("target"),
  coverImage: z.string().trim().url().optional(),
});

function serialize(row: typeof savingsGoals.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    current: toNumber(row.current),
    total: toNumber(row.total),
    iconKey: row.iconKey,
    coverImage: row.coverImage ?? null,
  };
}

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

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const rows = await db
    .select({
      id: savingsGoals.id,
      title: savingsGoals.title,
      current: savingsGoals.current,
      total: savingsGoals.total,
      iconKey: savingsGoals.iconKey,
    })
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, user.id))
    .orderBy(desc(savingsGoals.createdAt));

  return Response.json(rows.map(serializeCompat));
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = goalSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid savings goal" }, { status: 400 });
  }

  const values = {
    userId: user.id,
    title: parsed.data.title,
    current: parsed.data.current.toFixed(2),
    total: parsed.data.total.toFixed(2),
    iconKey: parsed.data.iconKey,
  };

  const [created] = await db
    .insert(savingsGoals)
    .values(values)
    .returning();

  return Response.json(serialize(created), { status: 201 });
}

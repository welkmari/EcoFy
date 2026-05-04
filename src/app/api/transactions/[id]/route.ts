import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";

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

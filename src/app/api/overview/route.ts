import { and, eq, gte, lt } from "drizzle-orm";
import { requireUser, toNumber } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { fixedBills, installments, savingsGoals, transactions } from "@/lib/schema";

const DONUT_COLORS = ["#818cf8", "#34d399", "#fb7185", "#fbbf24", "#64748b"];

function formatDay(date: string) {
  return date.split("-")[2] ?? date;
}

function getMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, (monthIndex || 1) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
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
  const currentMonth = new Date().toISOString().slice(0, 7);
  const month = new URL(request.url).searchParams.get("month") ?? currentMonth;
  const range = getMonthRange(month);

  const [transactionRows, billRows, installmentRows, goalRows] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.date, range.start),
          lt(transactions.date, range.end),
        ),
      ),
    db.select().from(fixedBills).where(eq(fixedBills.userId, user.id)),
    db.select().from(installments).where(eq(installments.userId, user.id)),
    db.select().from(savingsGoals).where(eq(savingsGoals.userId, user.id)),
  ]);

  const income = transactionRows
    .filter((item) => item.type === "entrada")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const expenses = transactionRows
    .filter((item) => item.type === "gasto")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const monthlyBills = billRows.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const investments = goalRows.reduce((sum, item) => sum + toNumber(item.current), 0);

  const flowByDay = new Map<string, { day: string; entradas: number; saidas: number }>();
  for (const item of transactionRows) {
    const day = formatDay(item.date);
    const current = flowByDay.get(day) ?? { day, entradas: 0, saidas: 0 };
    if (item.type === "entrada") {
      current.entradas += toNumber(item.amount);
    } else {
      current.saidas += toNumber(item.amount);
    }
    flowByDay.set(day, current);
  }

  const spendingByCategory = new Map<string, number>();
  for (const item of transactionRows.filter((row) => row.type === "gasto")) {
    spendingByCategory.set(
      item.category,
      (spendingByCategory.get(item.category) ?? 0) + toNumber(item.amount),
    );
  }
  if (monthlyBills > 0) {
    spendingByCategory.set(
      "Contas Fixas",
      (spendingByCategory.get("Contas Fixas") ?? 0) + monthlyBills,
    );
  }

  const spending = Array.from(spendingByCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], index) => ({
      name,
      value,
      color: DONUT_COLORS[index] ?? "#64748b",
    }));

  const budgetCategories = spending.slice(0, 4).map((item) => ({
    label: item.name,
    spent: item.value,
    budget: Math.max(item.value * 1.2, 1),
    color: item.color,
  }));
  const totalBudget = Math.max(income, expenses + monthlyBills, 1);

  return Response.json({
    metrics: {
      income,
      investments,
      expenses,
      monthlyBills,
    },
    flow: Array.from(flowByDay.values()).sort((a, b) => a.day.localeCompare(b.day)),
    spending,
    budget: {
      categories: budgetCategories,
      totalSpent: expenses + monthlyBills,
      totalBudget,
    },
    period: {
      month,
      label: getMonthLabel(month),
    },
    installmentDebt: installmentRows.reduce(
      (sum, item) => sum + toNumber(item.totalAmount) - toNumber(item.paidAmount),
      0,
    ),
  });
}

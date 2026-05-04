"use client";

import { useQuery } from "@tanstack/react-query";

export type OverviewData = {
  metrics: {
    income: number;
    investments: number;
    expenses: number;
    monthlyBills: number;
  };
  flow: Array<{ day: string; entradas: number; saidas: number }>;
  spending: Array<{ name: string; value: number; color: string }>;
  budget: {
    categories: Array<{
      label: string;
      spent: number;
      budget: number;
      color: string;
    }>;
    totalSpent: number;
    totalBudget: number;
  };
};

async function fetchOverview() {
  const response = await fetch("/api/overview");
  if (!response.ok) throw new Error("Falha ao carregar overview");
  return (await response.json()) as OverviewData;
}

export function useOverViewData() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: fetchOverview,
  });
}

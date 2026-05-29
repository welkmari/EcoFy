"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type OverviewData = {
  metrics: {
    income: number;
    investments: number;
    investmentsTarget: number;
    investmentsRemaining: number;
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
  period: {
    month: string;
    label: string;
  };
};

async function fetchOverview(month: string) {
  const response = await fetch(`/api/overview?month=${encodeURIComponent(month)}`);
  if (!response.ok) throw new Error("Falha ao carregar overview");
  return (await response.json()) as OverviewData;
}

export function useOverViewData(month: string) {
  return useQuery({
    queryKey: ["overview", month],
    queryFn: () => fetchOverview(month),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  });
}

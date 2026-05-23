"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SelectedMonthContextValue = {
  month: string;
  setMonth: (month: string) => void;
  shiftMonth: (offset: number) => void;
};

const SelectedMonthContext = createContext<SelectedMonthContextValue | null>(
  null,
);

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function normalizeMonth(month: string | null) {
  return month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth();
}

function addMonths(month: string, offset: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, (monthIndex || 1) - 1 + offset, 1)
    .toISOString()
    .slice(0, 7);
}

export function SelectedMonthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [month, setMonthState] = useState(currentMonth);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const urlMonth = params.get("month");
      if (urlMonth) {
        setMonthState(normalizeMonth(urlMonth));
      } else {
        localStorage.removeItem("ecofy-month");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setMonth = useCallback((nextMonth: string) => {
    const normalized = normalizeMonth(nextMonth);
    setMonthState(normalized);
    localStorage.setItem("ecofy-month", normalized);

    const url = new URL(window.location.href);
    url.searchParams.set("month", normalized);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const shiftMonth = useCallback(
    (offset: number) => setMonth(addMonths(month, offset)),
    [month, setMonth],
  );

  const value = useMemo(
    () => ({ month, setMonth, shiftMonth }),
    [month, setMonth, shiftMonth],
  );

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  );
}

export function useSelectedMonth() {
  const context = useContext(SelectedMonthContext);
  if (!context) {
    throw new Error("useSelectedMonth must be used inside SelectedMonthProvider");
  }
  return context;
}

"use client";

import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

export type UserPreferences = {
  darkMode: boolean;
  language: string;
  currency: string;
  budgetAlerts: boolean;
  theme: Theme;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: true,
  language: "pt-BR",
  currency: "BRL",
  budgetAlerts: true,
  theme: "dark",
};

const STORAGE_KEY = "ecofy:preferences";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        setPreferences(parsed);
        applyTheme(parsed.theme);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (preferences.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preferences.theme]);

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setPreferences(prefs);
      applyTheme(prefs.theme);
    } catch {}
  }, []);

  return { preferences, savePreferences };
}
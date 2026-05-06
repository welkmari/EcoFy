"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserPreferences = {
  displayName: string;
  role: string;
  bio: string;
  location: string;
  avatarUrl: string;
  monthlyBudget: number;
  darkMode: boolean;
  language: string;
  currency: string;
  emailAlerts: boolean;
  budgetAlerts: boolean;
};

const STORAGE_KEY = "ecofy:user-preferences";
const EVENT_NAME = "ecofy:user-preferences-updated";

export const defaultPreferences: UserPreferences = {
  displayName: "Minha Conta",
  role: "Usuário EcoFy",
  bio: "Organizando minhas finanças com clareza.",
  location: "Brasil",
  avatarUrl: "",
  monthlyBudget: 3000,
  darkMode: true,
  language: "pt-BR",
  currency: "BRL",
  emailAlerts: true,
  budgetAlerts: true,
};

function normalizePreferences(value: Partial<UserPreferences> | null | undefined) {
  return {
    ...defaultPreferences,
    ...value,
    monthlyBudget: Number(value?.monthlyBudget) > 0
      ? Number(value?.monthlyBudget)
      : defaultPreferences.monthlyBudget,
  };
}

function readLocalPreferences() {
  if (typeof window === "undefined") return defaultPreferences;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizePreferences(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultPreferences;
  }
}

function writeLocalPreferences(preferences: UserPreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: preferences }));
}

export function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "EF";
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const local = readLocalPreferences();
      if (mounted) setPreferences(local);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      const metadata = user?.user_metadata?.ecofyPreferences as
        | Partial<UserPreferences>
        | undefined;
      const merged = normalizePreferences({
        ...local,
        ...metadata,
        displayName:
          metadata?.displayName ??
          user?.user_metadata?.full_name ??
          user?.email?.split("@")[0] ??
          local.displayName,
        avatarUrl:
          metadata?.avatarUrl ??
          user?.user_metadata?.avatar_url ??
          local.avatarUrl,
      });

      setPreferences(merged);
      setEmail(user?.email ?? "");
      setCreatedAt(user?.created_at ?? "");
      writeLocalPreferences(merged);
      setIsReady(true);
    }

    load();

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<UserPreferences>).detail;
      if (detail) setPreferences(normalizePreferences(detail));
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
      mounted = false;
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const savePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    const next = normalizePreferences({ ...readLocalPreferences(), ...patch });
    setPreferences(next);
    writeLocalPreferences(next);

    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        full_name: next.displayName,
        avatar_url: next.avatarUrl,
        ecofyPreferences: next,
      },
    });

    return next;
  }, []);

  const avatarFallback = useMemo(
    () => getInitials(preferences.displayName),
    [preferences.displayName],
  );

  return {
    preferences,
    email,
    createdAt,
    isReady,
    avatarFallback,
    savePreferences,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  defaultPreferences,
  normalizePreferences,
  sanitizeAvatarUrl,
  type UserPreferences,
} from "@/lib/userPreferences";

const STORAGE_KEY = "ecofy:user-preferences";
const EVENT_NAME = "ecofy:user-preferences-updated";

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
        avatar_url: sanitizeAvatarUrl(next.avatarUrl),
        ecofyPreferences: null,
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

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import OnboardingCoach from "@/components/onboarding/OnboardingCoach";
import { useUserPreferences } from "@/lib/useUserPreferences";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PreferenceEffects />
        {children}
        <OnboardingCoach />
        <AccessibilityPanel />
      </ToastProvider>
    </QueryClientProvider>
  );
}

function PreferenceEffects() {
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark =
        preferences.theme === "system" ? systemDark : preferences.theme === "dark";
      root.classList.toggle("theme-light", !dark);
      root.classList.toggle("theme-dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
    };

    apply();
    if (preferences.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preferences.theme]);

  return null;
}

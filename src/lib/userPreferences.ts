export type ThemePreference = "light" | "dark" | "system";
export type FontScalePreference = "normal" | "large" | "larger";

export type UserPreferences = {
  displayName: string;
  role: string;
  bio: string;
  location: string;
  avatarUrl: string;
  monthlyBudget: number;
  darkMode: boolean;
  theme: ThemePreference;
  language: string;
  currency: string;
  showConvertedValues: boolean;
  secondaryCurrency: string;
  emailAlerts: boolean;
  budgetAlerts: boolean;
  fixedBillAlerts: boolean;
  goalAlerts: boolean;
  weeklySummaryAlerts: boolean;
  fontScale: FontScalePreference;
  highContrast: boolean;
  reduceMotion: boolean;
  increasedSpacing: boolean;
};

const MAX_PROFILE_TEXT_LENGTH = 240;
const MAX_AVATAR_URL_LENGTH = 512;

export const defaultPreferences: UserPreferences = {
  displayName: "Minha Conta",
  role: "Usuário EcoFy",
  bio: "Organizando minhas finanças com clareza.",
  location: "Brasil",
  avatarUrl: "",
  monthlyBudget: 3000,
  darkMode: true,
  theme: "dark",
  language: "pt-BR",
  currency: "BRL",
  showConvertedValues: false,
  secondaryCurrency: "USD",
  emailAlerts: true,
  budgetAlerts: true,
  fixedBillAlerts: true,
  goalAlerts: true,
  weeklySummaryAlerts: false,
  fontScale: "normal",
  highContrast: false,
  reduceMotion: false,
  increasedSpacing: false,
};

export function normalizePreferences(
  value: Partial<UserPreferences> | null | undefined,
) {
  const normalizedTheme = normalizeChoice<ThemePreference>(
    value?.theme ?? (value?.darkMode === false ? "light" : "dark"),
    ["light", "dark", "system"],
    defaultPreferences.theme,
  );

  return {
    ...defaultPreferences,
    ...value,
    displayName: limitText(value?.displayName, defaultPreferences.displayName, 80),
    role: limitText(value?.role, defaultPreferences.role, 80),
    bio: limitText(value?.bio, defaultPreferences.bio, MAX_PROFILE_TEXT_LENGTH),
    location: limitText(value?.location, defaultPreferences.location, 80),
    avatarUrl: sanitizeAvatarUrl(value?.avatarUrl),
    monthlyBudget:
      Number(value?.monthlyBudget) > 0
        ? Number(value?.monthlyBudget)
        : defaultPreferences.monthlyBudget,
    theme: normalizedTheme,
    darkMode: normalizedTheme === "dark",
    currency: normalizeChoice(
      value?.currency,
      ["BRL", "USD", "EUR"],
      defaultPreferences.currency,
    ),
    secondaryCurrency: normalizeChoice(
      value?.secondaryCurrency,
      ["USD", "EUR", "BRL"],
      defaultPreferences.secondaryCurrency,
    ),
    fontScale: normalizeChoice(
      value?.fontScale,
      ["normal", "large", "larger"],
      defaultPreferences.fontScale,
    ),
    showConvertedValues: Boolean(value?.showConvertedValues),
    highContrast: Boolean(value?.highContrast),
    reduceMotion: Boolean(value?.reduceMotion),
    increasedSpacing: Boolean(value?.increasedSpacing),
    emailAlerts: value?.emailAlerts ?? defaultPreferences.emailAlerts,
    budgetAlerts: value?.budgetAlerts ?? defaultPreferences.budgetAlerts,
    fixedBillAlerts: value?.fixedBillAlerts ?? defaultPreferences.fixedBillAlerts,
    goalAlerts: value?.goalAlerts ?? defaultPreferences.goalAlerts,
    weeklySummaryAlerts:
      value?.weeklySummaryAlerts ?? defaultPreferences.weeklySummaryAlerts,
  };
}

function normalizeChoice<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
) {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

function limitText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

export function sanitizeAvatarUrl(value: unknown) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_AVATAR_URL_LENGTH) return "";

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" ? trimmed : "";
  } catch {
    return "";
  }
}

export function getCompactUserMetadata(
  metadata: Record<string, unknown> | null | undefined,
  fallbackEmail?: string,
) {
  const fullName =
    limitText(metadata?.full_name, "", 80) ||
    fallbackEmail?.split("@")[0] ||
    defaultPreferences.displayName;

  return {
    full_name: fullName,
    avatar_url: sanitizeAvatarUrl(metadata?.avatar_url),
    ecofyPreferences: null,
  };
}

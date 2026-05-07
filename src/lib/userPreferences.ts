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
  language: "pt-BR",
  currency: "BRL",
  emailAlerts: true,
  budgetAlerts: true,
};

export function normalizePreferences(
  value: Partial<UserPreferences> | null | undefined,
) {
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
  };
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

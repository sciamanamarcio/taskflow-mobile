import Constants from "expo-constants";

/**
 * Resolves the API base URL:
 * 1. EXPO_PUBLIC_API_URL, when set
 * 2. the same host that serves the app in development (Metro), on port 3333
 * 3. localhost, for simulators running on the same machine
 */
export function resolveApiUrl(
  envUrl: string | undefined = process.env.EXPO_PUBLIC_API_URL,
  hostUri: string | undefined = Constants.expoConfig?.hostUri,
): string {
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = hostUri?.split(":")[0];
  return `http://${host || "localhost"}:3333`;
}

export const API_URL = resolveApiUrl();

import { API_URL } from "../config";
import { loadStoredToken, removeStoredToken, saveStoredToken } from "./storage";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// The token lives in memory for fast access and in SecureStore to survive restarts
let token: string | null = null;

export async function restoreToken(): Promise<string | null> {
  token = await loadStoredToken();
  return token;
}

export async function setToken(value: string): Promise<void> {
  token = value;
  await saveStoredToken(value);
}

export async function clearToken(): Promise<void> {
  token = null;
  await removeStoredToken();
}

export const getToken = () => token;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection.");
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    // Expired token: log out. A wrong password uses auth: false and does not land here.
    if (res.status === 401 && auth) unauthorizedHandler?.();
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.message ?? "Unexpected error",
      err?.details,
    );
  }

  return data as T;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "VALIDATION_ERROR" && err.details && typeof err.details === "object") {
      for (const [field, messages] of Object.entries(
        err.details as Record<string, string[] | undefined>,
      )) {
        if (messages?.length) return `${field}: ${messages[0]}`;
      }
    }
    return err.message;
  }
  return "Something went wrong";
}

export const api = {
  register: (input: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: input, auth: false }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: input, auth: false }),

  me: () => request<{ user: User }>("/auth/me"),
};

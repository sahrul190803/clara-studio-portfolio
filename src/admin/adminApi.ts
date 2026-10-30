import type { Project } from "../data/portfolio";

export interface AdminContent {
  projects: Project[];
  categories: string[];
  updatedAt: string;
}

export class ApiError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || `Permintaan gagal (HTTP ${response.status}).`,
      data && typeof data === "object" ? data : undefined,
    );
  }
  return data as T;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers ?? {}),
    },
  });
  return parseResponse<T>(response);
}

export async function uploadImage(file: File): Promise<{ url: string; name: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "same-origin",
    body: form,
    headers: { Accept: "application/json" },
  });
  return parseResponse<{ url: string; name: string }>(response);
}

export function formatDate(value: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

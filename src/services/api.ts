import { API_URL_V2 } from "@/constants/Config";
import { getToken } from "@services/session";

const DEFAULT_TIMEOUT_MS = 8000;

/** Construye la URL absoluta del backend para un path relativo (ej. `/recipes`). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL_V2}${normalized}`;
}

/** Lee el body JSON de error y devuelve un mensaje listo para mostrar al usuario. */
export async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    // Ignore JSON parsing errors.
  }
  return "Error de servidor";
}

type ApiFetchOptions = Omit<RequestInit, "headers" | "signal"> & {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function fetchWithTimeout(
  url: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que el backend esté encendido y que la IP del .env sea la correcta.",
      );
    }
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión o la URL del backend.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  return fetchWithTimeout(apiUrl(path), options);
}

/**
 * Igual que fetch() pero inyecta `Authorization: Bearer <token>`
 * cuando hay sesión guardada en SecureStore.
 */
export async function authedFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetchWithTimeout(apiUrl(path), { ...options, headers });
}

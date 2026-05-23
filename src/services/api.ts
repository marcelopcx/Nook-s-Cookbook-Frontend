import { API_URL_V2 } from "@/constants/Config";

/** Construye la URL absoluta del backend para un path relativo (ej. `/recipes`). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL_V2}${normalized}`;
}

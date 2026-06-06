import type {
  IngredienteResponse,
  LogroResponse,
  PerfilPublicoResponse,
  PerfilResponse,
  TipoIngredienteResponse,
  TipoUtensilioResponse,
  UsuarioLogroResponse,
  UtensilioResponse,
} from "@/types/api";
import { apiFetch } from "./http";

export async function getMe(): Promise<PerfilResponse> {
  return apiFetch<PerfilResponse>("/auth/me");
}

export async function updateMe(body: {
  username?: string;
  public?: boolean;
  password?: string;
  nombre?: string;
  apellido?: string | null;
  correo?: string;
  telefono?: string | null;
}): Promise<PerfilResponse> {
  return apiFetch<PerfilResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteMe(): Promise<void> {
  await apiFetch("/auth/me", { method: "DELETE", parseJson: false });
}

export async function getPublicProfile(
  userId: number,
): Promise<PerfilPublicoResponse> {
  return apiFetch<PerfilPublicoResponse>(`/usuarios/${userId}`);
}

export async function listAchievements(): Promise<LogroResponse[]> {
  return apiFetch<LogroResponse[]>("/logros");
}

export async function listMyAchievements(): Promise<UsuarioLogroResponse[]> {
  return apiFetch<UsuarioLogroResponse[]>("/auth/me/logros");
}

export async function claimAchievement(
  nombre: string,
): Promise<UsuarioLogroResponse> {
  return apiFetch<UsuarioLogroResponse>("/auth/me/logros/reclamar", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export async function listIngredients(): Promise<IngredienteResponse[]> {
  return apiFetch<IngredienteResponse[]>("/ingredientes");
}

export async function listIngredientTypes(): Promise<TipoIngredienteResponse[]> {
  return apiFetch<TipoIngredienteResponse[]>("/tipos-ingrediente");
}

export async function listUtensils(): Promise<UtensilioResponse[]> {
  return apiFetch<UtensilioResponse[]>("/utensilios");
}

export async function listUtensilTypes(): Promise<TipoUtensilioResponse[]> {
  return apiFetch<TipoUtensilioResponse[]>("/tipos-utensilio");
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health", { auth: false });
}

import type {
  CreateGrupoRequest,
  GrupoDetalleResponse,
  GrupoListItem,
  RecetaListItem,
  SeguidorResponse,
  UpdateGrupoRequest,
} from "@/types/api";
import { apiFetch } from "./http";

export async function listGroups(): Promise<GrupoListItem[]> {
  return apiFetch<GrupoListItem[]>("/grupos", { auth: false });
}

export async function getGroup(id: number): Promise<GrupoDetalleResponse> {
  return apiFetch<GrupoDetalleResponse>(`/grupos/${id}`);
}

export async function createGroup(body: CreateGrupoRequest): Promise<GrupoListItem> {
  return apiFetch<GrupoListItem>("/grupos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateGroup(
  id: number,
  body: UpdateGrupoRequest,
): Promise<GrupoListItem> {
  return apiFetch<GrupoListItem>(`/grupos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteGroup(id: number): Promise<void> {
  await apiFetch(`/grupos/${id}`, { method: "DELETE", parseJson: false });
}

export async function listGroupRecipes(id: number): Promise<RecetaListItem[]> {
  return apiFetch<RecetaListItem[]>(`/grupos/${id}/recetas`, { auth: false });
}

export async function addRecipeToGroup(
  groupId: number,
  recipeId: number,
): Promise<void> {
  await apiFetch(`/grupos/${groupId}/recetas/${recipeId}`, {
    method: "POST",
    parseJson: false,
  });
}

export async function removeRecipeFromGroup(
  groupId: number,
  recipeId: number,
): Promise<void> {
  await apiFetch(`/grupos/${groupId}/recetas/${recipeId}`, {
    method: "DELETE",
    parseJson: false,
  });
}

export async function followGroup(id: number): Promise<void> {
  await apiFetch(`/grupos/${id}/seguir`, { method: "POST", parseJson: false });
}

export async function unfollowGroup(id: number): Promise<void> {
  await apiFetch(`/grupos/${id}/seguir`, {
    method: "DELETE",
    parseJson: false,
  });
}

export async function listGroupFollowers(id: number): Promise<SeguidorResponse[]> {
  return apiFetch<SeguidorResponse[]>(`/grupos/${id}/seguidores`, {
    auth: false,
  });
}

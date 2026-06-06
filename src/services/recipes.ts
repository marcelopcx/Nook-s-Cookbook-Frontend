import type {
  CreateRecetaRequest,
  CreatePuntuacionRequest,
  ImagenUploadResponse,
  PuntuacionResponse,
  RecetaDetalleResponse,
  RecetaListItem,
  UpdatePuntuacionRequest,
  UpdateRecetaRequest,
} from "@/types/api";
import { apiUrl } from "./api";
import { getToken } from "./auth";
import { apiFetch } from "./http";

export async function listRecipes(): Promise<RecetaListItem[]> {
  return apiFetch<RecetaListItem[]>("/recetas");
}

export async function getRecipe(id: number): Promise<RecetaDetalleResponse> {
  return apiFetch<RecetaDetalleResponse>(`/recetas/${id}`);
}

export async function createRecipe(
  body: CreateRecetaRequest,
): Promise<RecetaListItem> {
  return apiFetch<RecetaListItem>("/recetas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateRecipe(
  id: number,
  body: UpdateRecetaRequest,
): Promise<RecetaListItem> {
  return apiFetch<RecetaListItem>(`/recetas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteRecipe(id: number): Promise<void> {
  await apiFetch(`/recetas/${id}`, { method: "DELETE", parseJson: false });
}

export async function uploadRecipeImage(uri: string): Promise<string> {
  const formData = new FormData();
  const filename = uri.split("/").pop() || "imagen.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  const token = await getToken();

  const response = await fetch(apiUrl("/recetas/imagen"), {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al subir imagen (${response.status})`);
  }

  const data = (await response.json()) as ImagenUploadResponse;
  return data.secure_url;
}

export async function addFavorite(recipeId: number): Promise<void> {
  await apiFetch(`/recetas/${recipeId}/favorito`, {
    method: "POST",
    parseJson: false,
  });
}

export async function removeFavorite(recipeId: number): Promise<void> {
  await apiFetch(`/recetas/${recipeId}/favorito`, {
    method: "DELETE",
    parseJson: false,
  });
}

export async function listRatings(
  recipeId: number,
): Promise<PuntuacionResponse[]> {
  return apiFetch<PuntuacionResponse[]>(`/recetas/${recipeId}/puntuaciones`);
}

export async function createRating(
  recipeId: number,
  body: CreatePuntuacionRequest,
): Promise<PuntuacionResponse> {
  return apiFetch<PuntuacionResponse>(`/recetas/${recipeId}/puntuaciones`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateRating(
  recipeId: number,
  body: UpdatePuntuacionRequest,
): Promise<PuntuacionResponse> {
  return apiFetch<PuntuacionResponse>(`/recetas/${recipeId}/puntuaciones`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteRating(recipeId: number): Promise<void> {
  await apiFetch(`/recetas/${recipeId}/puntuaciones`, {
    method: "DELETE",
    parseJson: false,
  });
}

export async function listMyRecipes(): Promise<RecetaListItem[]> {
  return apiFetch<RecetaListItem[]>("/auth/me/recetas");
}

export async function listMyFavorites(): Promise<RecetaListItem[]> {
  return apiFetch<RecetaListItem[]>("/auth/me/favoritos");
}

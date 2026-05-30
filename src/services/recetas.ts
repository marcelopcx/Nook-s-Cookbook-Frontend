import { apiFetch, authedFetch, parseErrorMessage } from "./api";

export type RecetaListItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  raciones: number | null;
  tiempo: string | null;
  promedio_puntuacion: number | null;
  dificultad: string | null;
  imagen: string | null;
  id_usuario_creador: number;
};

export type PasoInput = {
  numero_paso: number;
  instruccion: string;
};

export type IngredienteRecetaInput = {
  id_ingrediente: number;
  cantidad: string | null;
};

export type UtensilioRecetaInput = {
  id_utensilio: number;
  cantidad: string | null;
};

export type CreateRecetaRequest = {
  nombre: string;
  descripcion?: string | null;
  raciones?: number | null;
  tiempo?: string | null;
  dificultad?: string | null;
  imagen?: string | null;
  pasos: PasoInput[];
  ingredientes: IngredienteRecetaInput[];
  utensilios: UtensilioRecetaInput[];
};

export type Paso = {
  numero_paso: number;
  instruccion: string;
};

export type IngredienteReceta = {
  id_ingrediente: number;
  nombre: string;
  cantidad: string | null;
  tipo_nombre: string | null;
};

export type UtensilioReceta = {
  id_utensilio: number;
  nombre: string;
  cantidad: string | null;
  tipo_nombre: string | null;
};

export type RecetaDetalle = RecetaListItem & {
  creador_username: string;
  pasos: Paso[];
  ingredientes: IngredienteReceta[];
  utensilios: UtensilioReceta[];
};

export async function listarRecetas(): Promise<RecetaListItem[]> {
  const response = await apiFetch("/recetas");
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as RecetaListItem[];
}

export async function obtenerReceta(id: number): Promise<RecetaDetalle> {
  const response = await apiFetch(`/recetas/${id}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as RecetaDetalle;
}

export async function crearReceta(
  request: CreateRecetaRequest,
): Promise<RecetaListItem> {
  const response = await authedFetch("/recetas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as RecetaListItem;
}

export async function subirImagenReceta(
  uri: string,
  filename: string,
  mimeType: string,
): Promise<string> {
  const form = new FormData();
  // En React Native, FormData admite el shape { uri, name, type } para
  // archivos. Los tipos del DOM no lo reflejan, por eso el cast a any.
  form.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  // No setear Content-Type: RN arma el boundary automáticamente.
  const response = await authedFetch("/recetas/imagen", {
    method: "POST",
    body: form as unknown as BodyInit,
    timeoutMs: 30000,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

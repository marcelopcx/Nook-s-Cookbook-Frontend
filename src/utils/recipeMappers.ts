import type {
  RecetaDetalleResponse,
  RecetaListItem,
} from "@/types/api";

export type Recipe = {
  id: string;
  title: string;
  category: string;
  rating: number;
  timeMinutes: number;
  difficulty: string;
  imageUrl: string;
  isFeatured: boolean;
  isSaved: boolean;
  isFavorite: boolean;
  creatorId?: number;
  iconName?: string;
};

export type IngredientStructure = {
  id_ingrediente?: number;
  nombre: string;
  cantidad: string;
  tipo_nombre?: string | null;
};

export type RecipeDetails = {
  id: string;
  servings: number;
  description: string;
  creatorUsername: string;
  ingredients: IngredientStructure[];
  utensils: IngredientStructure[];
  steps: string[];
  tips: string[];
};

export type RecipeGroup = {
  id: string;
  name: string;
  description: string | null;
  publico: boolean;
  creatorUsername: string;
  numSeguidores: number;
  numRecetas: number;
  sigue: boolean;
  creatorId: number;
  recipeIds: string[];
};

export function parseTimeMinutes(tiempo: string | null | undefined): number {
  if (!tiempo) return 0;
  const match = tiempo.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function formatTimeMinutes(minutes: number): string {
  return `${minutes} min`;
}

function inferCategory(descripcion: string | null): string {
  if (!descripcion) return "Comidas";
  const lower = descripcion.toLowerCase();
  if (lower.includes("postre") || lower.includes("dulce")) return "Postres";
  if (lower.includes("bebida") || lower.includes("jugo")) return "Bebidas";
  return "Comidas";
}

export function mapRecetaToRecipe(
  receta: RecetaListItem,
  options?: {
    isFavorite?: boolean;
    isSaved?: boolean;
    isFeatured?: boolean;
  },
): Recipe {
  return {
    id: String(receta.id),
    title: receta.nombre,
    category: inferCategory(receta.descripcion),
    rating: receta.promedio_puntuacion ?? 0,
    timeMinutes: parseTimeMinutes(receta.tiempo),
    difficulty: receta.dificultad ?? "Media",
    imageUrl: receta.imagen ?? "",
    isFeatured: options?.isFeatured ?? false,
    isSaved: options?.isSaved ?? false,
    isFavorite: options?.isFavorite ?? false,
    creatorId: receta.id_usuario_creador,
  };
}

export function mapDetalleToDetails(detalle: RecetaDetalleResponse): RecipeDetails {
  return {
    id: String(detalle.id),
    servings: detalle.raciones ?? 1,
    description: detalle.descripcion ?? "",
    creatorUsername: detalle.creador_username,
    ingredients: detalle.ingredientes.map((item) => ({
      id_ingrediente: item.id_ingrediente,
      nombre: item.nombre,
      cantidad: item.cantidad ?? "",
      tipo_nombre: item.tipo_nombre,
    })),
    utensils: detalle.utensilios.map((item) => ({
      id_ingrediente: item.id_utensilio,
      nombre: item.nombre,
      cantidad: item.cantidad ?? "",
      tipo_nombre: item.tipo_nombre,
    })),
    steps: detalle.pasos
      .slice()
      .sort((a, b) => a.numero_paso - b.numero_paso)
      .map((paso) => paso.instruccion),
    tips: [],
  };
}

export function mapDetalleToRecipe(
  detalle: RecetaDetalleResponse,
  options?: {
    isFavorite?: boolean;
    isSaved?: boolean;
    isFeatured?: boolean;
  },
): Recipe {
  return mapRecetaToRecipe(detalle, options);
}

import recipeDetailsData from "@/data/recipe-details.json";
import recipesData from "@/data/recipes.json";
import { recetasService } from "@/services";
import type { RecetaListItem } from "@/services/recetas";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FALLBACK_IMAGE_URL =
  "https://v0-animal-crossing-recipes-ui.vercel.app/cherry-pie.jpg";

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
  iconName?: string;
};

export type RecipeDetails = {
  id: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string[];
};

type RecipesContextValue = {
  recipes: Recipe[];
  recipeDetails: RecipeDetails[];
  isLoading: boolean;
  loadError: string | null;
  getRecipeById: (id: string) => Recipe | undefined;
  getDetailsById: (id: string) => RecipeDetails | undefined;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  updateDetails: (id: string, patch: Partial<RecipeDetails>) => void;
  deleteRecipe: (id: string) => void;
  addRecipe: (recipe: Recipe, details?: RecipeDetails) => void;
  refresh: () => Promise<void>;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

/** Convierte "30 min" o "1h 30 min" en minutos. Fallback a 0 si no se puede. */
function parseTiempoToMinutes(raw: string | null): number {
  if (!raw) return 0;
  const text = raw.toLowerCase();

  let total = 0;
  const hourMatch = text.match(/(\d+)\s*h/);
  if (hourMatch) total += Number(hourMatch[1]) * 60;
  const minMatch = text.match(/(\d+)\s*m/);
  if (minMatch) total += Number(minMatch[1]);

  if (total > 0) return total;

  const onlyDigits = text.match(/\d+/);
  return onlyDigits ? Number(onlyDigits[0]) : 0;
}

export function mapRecetaToRecipe(item: RecetaListItem): Recipe {
  return {
    id: String(item.id),
    title: item.nombre,
    category: "General",
    rating: item.promedio_puntuacion ?? 0,
    timeMinutes: parseTiempoToMinutes(item.tiempo),
    difficulty: item.dificultad ?? "Fácil",
    imageUrl: item.imagen ?? FALLBACK_IMAGE_URL,
    isFeatured: false,
    isSaved: true,
    isFavorite: false,
  };
}

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(recipesData as Recipe[]);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails[]>(
    recipeDetailsData as RecipeDetails[],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const remote = await recetasService.listarRecetas();
      setRecipes(remote.map(mapRecetaToRecipe));
    } catch (error) {
      // Conservar los mocks como fallback offline.
      setLoadError(
        error instanceof Error ? error.message : "Error al cargar recetas",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<RecipesContextValue>(() => {
    const getRecipeById = (id: string) => recipes.find((r) => r.id === id);
    const getDetailsById = (id: string) =>
      recipeDetails.find((d) => d.id === id);

    const updateRecipe = (id: string, patch: Partial<Recipe>) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
    };

    const updateDetails = (id: string, patch: Partial<RecipeDetails>) => {
      setRecipeDetails((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    };

    const deleteRecipe = (id: string) => {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setRecipeDetails((prev) => prev.filter((d) => d.id !== id));
    };

    const addRecipe = (recipe: Recipe, details?: RecipeDetails) => {
      setRecipes((prev) => [recipe, ...prev.filter((r) => r.id !== recipe.id)]);
      if (details) {
        setRecipeDetails((prev) => [
          details,
          ...prev.filter((d) => d.id !== details.id),
        ]);
      }
    };

    return {
      recipes,
      recipeDetails,
      isLoading,
      loadError,
      getRecipeById,
      getDetailsById,
      updateRecipe,
      updateDetails,
      deleteRecipe,
      addRecipe,
      refresh,
    };
  }, [recipes, recipeDetails, isLoading, loadError, refresh]);

  return (
    <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return ctx;
}

import recipeDetailsData from "@/data/recipe-details.json";
import recipesData from "@/data/recipes.json";
import React, { createContext, useContext, useMemo, useState } from "react";

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

export type RecipeGroup = {
  id: string;
  name: string;
  recipeIds: string[];
};

type RecipesContextValue = {
  recipes: Recipe[];
  recipeDetails: RecipeDetails[];
  groups: RecipeGroup[];
  getRecipeById: (id: string) => Recipe | undefined;
  getDetailsById: (id: string) => RecipeDetails | undefined;
  getGroupById: (id: string) => RecipeGroup | undefined;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  updateDetails: (id: string, patch: Partial<RecipeDetails>) => void;
  deleteRecipe: (id: string) => void;

  createGroup: (name: string, recipeIds: string[]) => void;
  updateGroup: (
    id: string,
    patch: Partial<Pick<RecipeGroup, "name" | "recipeIds">>,
  ) => void;
  deleteGroup: (id: string) => void;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState(recipesData as Recipe[]);
  const [recipeDetails, setRecipeDetails] = useState(
    recipeDetailsData as RecipeDetails[],
  );
  const [groups, setGroups] = useState<RecipeGroup[]>([]);

  const value = useMemo<RecipesContextValue>(() => {
    const getRecipeById = (id: string) => recipes.find((r) => r.id === id);
    const getDetailsById = (id: string) =>
      recipeDetails.find((d) => d.id === id);
    const getGroupById = (id: string) => groups.find((g) => g.id === id);

    const normalizeRecipeIds = (ids: string[]) => {
      const existing = new Set(recipes.map((r) => r.id));
      const unique: string[] = [];
      const seen = new Set<string>();
      for (const id of ids) {
        if (!existing.has(id)) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        unique.push(id);
      }
      return unique;
    };

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

      // Mantener consistencia: si una receta se elimina, se quita de todos los grupos.
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          recipeIds: g.recipeIds.filter((rid) => rid !== id),
        })),
      );
    };

    const createGroup = (name: string, recipeIds: string[]) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const normalized = normalizeRecipeIds(recipeIds);
      const newId = Date.now().toString();

      setGroups((prev) => {
        return [
          ...prev,
          { id: newId, name: trimmedName, recipeIds: normalized },
        ];
      });
    };

    const updateGroup = (
      id: string,
      patch: Partial<Pick<RecipeGroup, "name" | "recipeIds">>,
    ) => {
      setGroups((prev) => {
        const target = prev.find((g) => g.id === id);
        if (!target) return prev;

        const nextName = (patch.name ?? target.name).trim();
        const nextRecipeIds = patch.recipeIds
          ? normalizeRecipeIds(patch.recipeIds)
          : target.recipeIds;

        return prev.map((g) =>
          g.id === id
            ? { ...g, name: nextName || g.name, recipeIds: nextRecipeIds }
            : g,
        );
      });
    };

    const deleteGroup = (id: string) => {
      const group = getGroupById(id);
      if (!group) return;

      const recipeIdSet = new Set(group.recipeIds);

      // Eliminar recetas del grupo (y sus detalles)
      setRecipes((prev) => prev.filter((r) => !recipeIdSet.has(r.id)));
      setRecipeDetails((prev) => prev.filter((d) => !recipeIdSet.has(d.id)));

      // Quitar el grupo y limpiar referencias en otros grupos (por consistencia)
      setGroups((prev) =>
        prev
          .filter((g) => g.id !== id)
          .map((g) => ({
            ...g,
            recipeIds: g.recipeIds.filter((rid) => !recipeIdSet.has(rid)),
          })),
      );
    };

    return {
      recipes,
      recipeDetails,
      groups,
      getRecipeById,
      getDetailsById,
      getGroupById,
      updateRecipe,
      updateDetails,
      deleteRecipe,
      createGroup,
      updateGroup,
      deleteGroup,
    };
  }, [groups, recipeDetails, recipes]);

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

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

type RecipesContextValue = {
  recipes: Recipe[];
  recipeDetails: RecipeDetails[];
  getRecipeById: (id: string) => Recipe | undefined;
  getDetailsById: (id: string) => RecipeDetails | undefined;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  updateDetails: (id: string, patch: Partial<RecipeDetails>) => void;
  deleteRecipe: (id: string) => void;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState(recipesData as Recipe[]);
  const [recipeDetails, setRecipeDetails] = useState(
    recipeDetailsData as RecipeDetails[],
  );

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

    return {
      recipes,
      recipeDetails,
      getRecipeById,
      getDetailsById,
      updateRecipe,
      updateDetails,
      deleteRecipe,
    };
  }, [recipeDetails, recipes]);

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

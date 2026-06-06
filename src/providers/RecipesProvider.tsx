import * as groupsService from "@/services/groups";
import * as recipesService from "@/services/recipes";
import { useAchievements } from "@/providers/AchievementsProvider";
import type { CreateRecetaRequest, UpdateRecetaRequest } from "@/types/api";
import {
  mapDetalleToDetails,
  mapDetalleToRecipe,
  mapRecetaToRecipe,
  type Recipe,
  type RecipeDetails,
  type RecipeGroup,
} from "@/utils/recipeMappers";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type { Recipe, RecipeDetails, RecipeGroup, IngredientStructure } from "@/utils/recipeMappers";

type RecipesContextValue = {
  recipes: Recipe[];
  recipeDetails: RecipeDetails[];
  groups: RecipeGroup[];
  favoriteIds: Set<string>;
  myRecipeIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  refreshRecipes: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  getDetailsById: (id: string) => RecipeDetails | undefined;
  getGroupById: (id: string) => RecipeGroup | undefined;
  fetchRecipeDetail: (id: string) => Promise<{
    recipe: Recipe;
    details: RecipeDetails;
  } | null>;
  toggleFavorite: (id: string) => Promise<void>;
  createRecipe: (payload: CreateRecetaRequest) => Promise<string>;
  updateRecipeApi: (id: string, payload: UpdateRecetaRequest) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  createGroup: (
    name: string,
    recipeIds: string[],
    description?: string,
  ) => Promise<void>;
  updateGroup: (
    id: string,
    patch: Partial<
      Pick<RecipeGroup, "name" | "description" | "publico" | "recipeIds">
    >,
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  followGroup: (id: string) => Promise<void>;
  unfollowGroup: (id: string) => Promise<void>;
  fetchGroupDetail: (id: string) => Promise<RecipeGroup | null>;
  fetchGroupRecipes: (groupId: string) => Promise<Recipe[]>;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const { checkForNewAchievements } = useAchievements();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails[]>([]);
  const [groups, setGroups] = useState<RecipeGroup[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [myRecipeIds, setMyRecipeIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRecipes = useCallback(async () => {
    const [allRecipes, favorites, myRecipes] = await Promise.all([
      recipesService.listRecipes(),
      recipesService.listMyFavorites().catch(() => []),
      recipesService.listMyRecipes().catch(() => []),
    ]);

    const favSet = new Set(favorites.map((r) => String(r.id)));
    const mineSet = new Set(myRecipes.map((r) => String(r.id)));

    setFavoriteIds(favSet);
    setMyRecipeIds(mineSet);

    const mapped = allRecipes.map((receta) =>
      mapRecetaToRecipe(receta, {
        isFavorite: favSet.has(String(receta.id)),
        isSaved: mineSet.has(String(receta.id)),
        isFeatured: mineSet.has(String(receta.id)),
      }),
    );

    setRecipes(mapped);
  }, []);

  const refreshGroups = useCallback(async () => {
    const apiGroups = await groupsService.listGroups();
    const mapped: RecipeGroup[] = apiGroups.map((grupo) => ({
      id: String(grupo.id),
      name: grupo.nombre,
      description: grupo.descripcion,
      publico: grupo.publico,
      creatorUsername: grupo.creador_username,
      numSeguidores: grupo.num_seguidores,
      numRecetas: grupo.num_recetas,
      sigue: false,
      creatorId: grupo.id_usuario_creador,
      recipeIds: [],
    }));
    setGroups(mapped);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([refreshRecipes(), refreshGroups()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [refreshGroups, refreshRecipes]);

  React.useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes],
  );

  const getDetailsById = useCallback(
    (id: string) => recipeDetails.find((d) => d.id === id),
    [recipeDetails],
  );

  const getGroupById = useCallback(
    (id: string) => groups.find((g) => g.id === id),
    [groups],
  );

  const fetchRecipeDetail = useCallback(
    async (id: string) => {
      try {
        const detalle = await recipesService.getRecipe(Number(id));
        const recipe = mapDetalleToRecipe(detalle, {
          isFavorite: favoriteIds.has(id),
          isSaved: myRecipeIds.has(id),
          isFeatured: myRecipeIds.has(id),
        });
        const details = mapDetalleToDetails(detalle);

        setRecipes((prev) => {
          const exists = prev.some((r) => r.id === id);
          if (exists) {
            return prev.map((r) => (r.id === id ? recipe : r));
          }
          return [...prev, recipe];
        });

        setRecipeDetails((prev) => {
          const exists = prev.some((d) => d.id === id);
          if (exists) {
            return prev.map((d) => (d.id === id ? details : d));
          }
          return [...prev, details];
        });

        return { recipe, details };
      } catch {
        return null;
      }
    },
    [favoriteIds, myRecipeIds],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const isFavorite = favoriteIds.has(id);
      if (isFavorite) {
        await recipesService.removeFavorite(Number(id));
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await recipesService.addFavorite(Number(id));
        setFavoriteIds((prev) => new Set(prev).add(id));
        await checkForNewAchievements();
      }

      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isFavorite: !isFavorite } : r,
        ),
      );
    },
    [favoriteIds, checkForNewAchievements],
  );

  const createRecipe = useCallback(
    async (payload: CreateRecetaRequest) => {
      const created = await recipesService.createRecipe(payload);
      await refreshRecipes();
      await checkForNewAchievements();
      return String(created.id);
    },
    [refreshRecipes, checkForNewAchievements],
  );

  const updateRecipeApi = useCallback(
    async (id: string, payload: UpdateRecetaRequest) => {
      await recipesService.updateRecipe(Number(id), payload);
      await fetchRecipeDetail(id);
      await refreshRecipes();
    },
    [fetchRecipeDetail, refreshRecipes],
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      await recipesService.deleteRecipe(Number(id));
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setRecipeDetails((prev) => prev.filter((d) => d.id !== id));
      setMyRecipeIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [],
  );

  const createGroup = useCallback(
    async (name: string, recipeIds: string[], description?: string) => {
      const created = await groupsService.createGroup({
        nombre: name.trim(),
        descripcion: description ?? null,
        publico: true,
      });

      await Promise.all(
        recipeIds.map((recipeId) =>
          groupsService.addRecipeToGroup(created.id, Number(recipeId)),
        ),
      );

      await refreshGroups();
      await checkForNewAchievements();
    },
    [refreshGroups, checkForNewAchievements],
  );

  const updateGroup = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<RecipeGroup, "name" | "description" | "publico" | "recipeIds">
      >,
    ) => {
      const current = groups.find((g) => g.id === id);
      if (!current) return;

      await groupsService.updateGroup(Number(id), {
        nombre: patch.name?.trim() ?? undefined,
        descripcion: patch.description,
        publico: patch.publico,
      });

      if (patch.recipeIds) {
        const currentIds = new Set(current.recipeIds);
        const nextIds = new Set(patch.recipeIds);

        const toAdd = patch.recipeIds.filter((rid) => !currentIds.has(rid));
        const toRemove = current.recipeIds.filter((rid) => !nextIds.has(rid));

        await Promise.all([
          ...toAdd.map((recipeId) =>
            groupsService.addRecipeToGroup(Number(id), Number(recipeId)),
          ),
          ...toRemove.map((recipeId) =>
            groupsService.removeRecipeFromGroup(Number(id), Number(recipeId)),
          ),
        ]);
      }

      await refreshGroups();
    },
    [groups, refreshGroups],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      await groupsService.deleteGroup(Number(id));
      setGroups((prev) => prev.filter((g) => g.id !== id));
    },
    [],
  );

  const followGroup = useCallback(async (id: string) => {
    await groupsService.followGroup(Number(id));
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              sigue: true,
              numSeguidores: g.numSeguidores + 1,
            }
          : g,
      ),
    );
  }, []);

  const unfollowGroup = useCallback(async (id: string) => {
    await groupsService.unfollowGroup(Number(id));
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              sigue: false,
              numSeguidores: Math.max(0, g.numSeguidores - 1),
            }
          : g,
      ),
    );
  }, []);

  const fetchGroupDetail = useCallback(async (id: string) => {
    const detalle = await groupsService.getGroup(Number(id));
    const group: RecipeGroup = {
      id: String(detalle.id),
      name: detalle.nombre,
      description: detalle.descripcion,
      publico: detalle.publico,
      creatorUsername: detalle.creador_username,
      numSeguidores: detalle.num_seguidores,
      numRecetas: detalle.num_recetas,
      sigue: detalle.sigue,
      creatorId: detalle.id_usuario_creador,
      recipeIds: [],
    };

    setGroups((prev) => {
      const exists = prev.some((g) => g.id === id);
      if (exists) {
        return prev.map((g) => (g.id === id ? group : g));
      }
      return [...prev, group];
    });

    return group;
  }, []);

  const fetchGroupRecipes = useCallback(
    async (groupId: string) => {
      const recetas = await groupsService.listGroupRecipes(Number(groupId));
      const mapped = recetas.map((receta) =>
        mapRecetaToRecipe(receta, {
          isFavorite: favoriteIds.has(String(receta.id)),
          isSaved: myRecipeIds.has(String(receta.id)),
          isFeatured: myRecipeIds.has(String(receta.id)),
        }),
      );

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, recipeIds: mapped.map((r) => r.id) }
            : g,
        ),
      );

      setRecipes((prev) => {
        const byId = new Map(prev.map((r) => [r.id, r]));
        for (const recipe of mapped) {
          byId.set(recipe.id, recipe);
        }
        return Array.from(byId.values());
      });

      return mapped;
    },
    [favoriteIds, myRecipeIds],
  );

  const value = useMemo<RecipesContextValue>(
    () => ({
      recipes,
      recipeDetails,
      groups,
      favoriteIds,
      myRecipeIds,
      isLoading,
      error,
      refreshAll,
      refreshRecipes,
      refreshGroups,
      getRecipeById,
      getDetailsById,
      getGroupById,
      fetchRecipeDetail,
      toggleFavorite,
      createRecipe,
      updateRecipeApi,
      deleteRecipe,
      createGroup,
      updateGroup,
      deleteGroup,
      followGroup,
      unfollowGroup,
      fetchGroupDetail,
      fetchGroupRecipes,
    }),
    [
      recipes,
      recipeDetails,
      groups,
      favoriteIds,
      myRecipeIds,
      isLoading,
      error,
      refreshAll,
      refreshRecipes,
      refreshGroups,
      getRecipeById,
      getDetailsById,
      getGroupById,
      fetchRecipeDetail,
      toggleFavorite,
      createRecipe,
      updateRecipeApi,
      deleteRecipe,
      createGroup,
      updateGroup,
      deleteGroup,
      followGroup,
      unfollowGroup,
      fetchGroupDetail,
      fetchGroupRecipes,
    ],
  );

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

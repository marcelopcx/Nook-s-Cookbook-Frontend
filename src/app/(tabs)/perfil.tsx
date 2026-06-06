import {
  AchievementCard,
  AppHeader,
  StatCard,
  RecipeCard,
} from "@/components/dashboard";
import { useAuth } from "@/providers/AuthProvider";
import { useAchievements } from "@/providers/AchievementsProvider";
import * as recipesService from "@/services/recipes";
import type { RecetaListItem } from "@/types/api";
import { mapRecetaToRecipe } from "@/utils/recipeMappers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";

const ACHIEVEMENT_ICONS = [
  "star",
  "medal",
  "trophy",
  "chef-hat",
  "heart",
  "basket",
  "music-off",
  "delete-outline",
] as const;

export default function PerfilScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    allAchievements,
    myAchievementIds,
    isLoading: achievementsLoading,
    refreshAchievements,
  } = useAchievements();

  const [section, setSection] = useState<"achievements" | "saved" | "created">(
    "achievements",
  );
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecetaListItem[]>([]);
  const [createdRecipes, setCreatedRecipes] = useState<RecetaListItem[]>([]);

  const loadRecipeData = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const [favoritos, misRecetas] = await Promise.all([
        recipesService.listMyFavorites(),
        recipesService.listMyRecipes(),
      ]);
      setFavoriteRecipes(favoritos);
      setCreatedRecipes(misRecetas);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshAchievements();
      void loadRecipeData();
    }, [refreshAchievements, loadRecipeData]),
  );

  const loading = achievementsLoading || recipesLoading;

  const derivedUsername =
    user?.nombre && user.nombre.trim() !== "" ? user.nombre : "Usuario de Nook";

  const avatarIconName = "account" as React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  const { width } = useWindowDimensions();
  const containerPadding = 16;
  const gap = 16;
  const available = Math.max(0, width - containerPadding * 2);
  const itemWidth = Math.floor((available - gap) / 2);

  const completedAchievementsCount = myAchievementIds.size;

  const handleOpenRecipe = (id: string) => {
    router.push({ pathname: "/receta/[id]", params: { id } });
  };

  const achievementsView = useMemo(
    () =>
      allAchievements.map((achievement, idx) => (
        <View
          key={achievement.id}
          style={{
            width: itemWidth,
            height: 148,
            marginRight: idx % 2 === 0 ? gap : 0,
            marginBottom: gap,
          }}
        >
          <AchievementCard
            title={achievement.nombre}
            description={achievement.descripcion ?? ""}
            iconName={ACHIEVEMENT_ICONS[idx % ACHIEVEMENT_ICONS.length]}
            completed={myAchievementIds.has(achievement.id)}
          />
        </View>
      )),
    [allAchievements, itemWidth, gap, myAchievementIds],
  );

  const favoriteCards = useMemo(
    () =>
      favoriteRecipes.map((receta, idx) => {
        const recipe = mapRecetaToRecipe(receta, { isFavorite: true });
        return (
          <View
            key={recipe.id}
            style={{
              width: itemWidth,
              marginRight: idx % 2 === 0 ? gap : 0,
              marginBottom: gap,
            }}
          >
            <RecipeCard
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              rating={recipe.rating}
              timeMinutes={recipe.timeMinutes}
              onPress={() => handleOpenRecipe(recipe.id)}
            />
          </View>
        );
      }),
    [favoriteRecipes, itemWidth, gap],
  );

  const createdCards = useMemo(
    () =>
      createdRecipes.map((receta, idx) => {
        const recipe = mapRecetaToRecipe(receta, { isFeatured: true });
        return (
          <View
            key={recipe.id}
            style={{
              width: itemWidth,
              marginRight: idx % 2 === 0 ? gap : 0,
              marginBottom: gap,
            }}
          >
            <RecipeCard
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              rating={recipe.rating}
              timeMinutes={recipe.timeMinutes}
              onPress={() => handleOpenRecipe(recipe.id)}
            />
          </View>
        );
      }),
    [createdRecipes, itemWidth, gap],
  );

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View className="px-4 pt-4">
          <View className="mb-4 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="relative h-20 w-20 items-center justify-center rounded-full bg-[#d4a574]">
                <MaterialCommunityIcons
                  name={avatarIconName}
                  size={28}
                  color="#fff"
                />
              </View>
              <View className="flex-1 justify-center">
                <Text className="text-xl font-bold text-[#5c4a3d]">
                  {derivedUsername}
                </Text>
                {user?.username ? (
                  <Text className="mt-1 text-xs text-[#8b7355]">
                    @{user.username}
                  </Text>
                ) : null}
                <View className="mt-1 flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#f9d77e"
                  />
                  <Text className="text-xs text-[#8b7355]">
                    Chef isleño
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            className="mb-4"
            style={{ flexDirection: "row", flexWrap: "wrap" }}
          >
            <View
              style={{ width: itemWidth, marginRight: gap, marginBottom: gap }}
            >
              <StatCard
                label="Recetas Favoritas"
                value={favoriteRecipes.length}
                iconName="heart"
                backgroundClassName="bg-[#f4b8c5]/20"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: 0, marginBottom: gap }}
            >
              <StatCard
                label="Mis Creaciones"
                value={createdRecipes.length}
                iconName="basket"
                backgroundClassName="bg-[#7cb69d]/20"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: gap, marginBottom: gap }}
            >
              <StatCard
                label="Logros Completados"
                value={`${completedAchievementsCount} / ${allAchievements.length}`}
                iconName="medal"
                backgroundClassName="bg-[#ffd9b3]/30"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: 0, marginBottom: gap }}
            >
              <StatCard
                label="Nivel Chef"
                value={Math.min(10, completedAchievementsCount + 1)}
                iconName="star"
                backgroundClassName="bg-[#f9d77e]/30"
              />
            </View>
          </View>

          <View className="mb-4 flex-row gap-2">
            <Pressable
              onPress={() => setSection("achievements")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "achievements" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={section === "achievements" ? "#ffffff" : "#f9d77e"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "achievements" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Logros
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSection("saved")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "saved" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="heart"
                  size={16}
                  color={section === "saved" ? "#ffffff" : "#f4b8c5"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "saved" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Favoritas
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSection("created")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "created" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="basket"
                  size={16}
                  color={section === "created" ? "#ffffff" : "#7cb69d"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "created" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Creadas
                </Text>
              </View>
            </Pressable>
          </View>

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#7cb69d" />
            </View>
          ) : (
            <View className="gap-3">
              {section === "achievements" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {achievementsView}
                </View>
              ) : section === "saved" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {favoriteCards.length > 0 ? (
                    favoriteCards
                  ) : (
                    <Text className="text-sm text-[#8b7355]">
                      No tienes recetas favoritas aún.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {createdCards.length > 0 ? (
                    createdCards
                  ) : (
                    <Text className="text-sm text-[#8b7355]">
                      No hay recetas creadas aún.
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
          <View className="h-6" />
        </View>
      </ScrollView>
    </View>
  );
}

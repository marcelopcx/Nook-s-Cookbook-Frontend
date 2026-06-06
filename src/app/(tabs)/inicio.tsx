import {
  AppHeader,
  CategoryTab,
  FeaturedRecipeCard,
  RecipeCard,
  SearchBar,
  SectionTitle,
} from "@/components/dashboard";
import { KeyboardAwareScrollView } from "@/components";
import categoriesData from "@/data/categories.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function InicioScreen() {
  const router = useRouter();
  const { recipes, isLoading, error, refreshRecipes } = useRecipes();
  const [search, setSearch] = useState("");
  const [selectedTabId, setSelectedTabId] = useState(
    categoriesData.tabs.find((t) => t.id === "Todo")?.id ??
      categoriesData.tabs[0]?.id ??
      "Todo",
  );

  const handleOpenRecipe = (id: string) => {
    router.push({ pathname: "/receta/[id]", params: { id } });
  };

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesTab = (() => {
        if (selectedTabId === "Todo") return true;
        if (selectedTabId === "favoritos") return recipe.isFavorite;

        return recipe.category.toLowerCase() === selectedTabId.toLowerCase();
      })();

      if (!matchesTab) return false;
      if (query.length === 0) return true;

      return recipe.title.toLowerCase().includes(query);
    });
  }, [recipes, selectedTabId, search]);

  const featuredRecipe = useMemo(
    () => filteredRecipes.find((recipe) => recipe.isFeatured) ?? filteredRecipes[0],
    [filteredRecipes],
  );

  const moreRecipes = useMemo(
    () => filteredRecipes.filter((recipe) => recipe.id !== featuredRecipe?.id),
    [filteredRecipes, featuredRecipe],
  );

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <View className="my-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator color="#7cb69d" />
          </View>
        ) : null}

        {error ? (
          <View className="mx-4 mb-4 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
            <Text className="text-sm text-[#c15757]">{error}</Text>
            <Text
              className="mt-2 text-sm font-semibold text-[#7cb69d]"
              onPress={() => void refreshRecipes()}
            >
              Reintentar
            </Text>
          </View>
        ) : null}

        <View className="mb-6 px-4">
          <View className="w-full flex-row">
            {categoriesData.tabs.map((tab) => (
              <View key={tab.id} className="flex-1 px-1">
                <CategoryTab
                  label={tab.label}
                  iconName={tab.iconName}
                  active={tab.id === selectedTabId}
                  onPress={() => setSelectedTabId(tab.id)}
                />
              </View>
            ))}
          </View>
        </View>

        {featuredRecipe ? (
          <View className="mb-6">
            <FeaturedRecipeCard
              title={featuredRecipe.title}
              imageUrl={featuredRecipe.imageUrl}
              rating={featuredRecipe.rating}
              timeMinutes={featuredRecipe.timeMinutes}
              difficulty={featuredRecipe.difficulty}
              onPress={() => handleOpenRecipe(featuredRecipe.id)}
            />
          </View>
        ) : null}

        <SectionTitle title="Recetas" />
        <View className="flex flex-row flex-wrap justify-between gap-y-4 px-4">
          {moreRecipes.map((recipe) => (
            <View key={recipe.id} className="w-[48%]">
              <RecipeCard
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                rating={recipe.rating}
                timeMinutes={recipe.timeMinutes}
                onPress={() => handleOpenRecipe(recipe.id)}
              />
            </View>
          ))}
        </View>
      </KeyboardAwareScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 h-[120px]"
        pointerEvents="none"
      />
    </View>
  );
}

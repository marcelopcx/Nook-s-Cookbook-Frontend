import {
  AppHeader,
  CategoryTab,
  RecipeCard,
  SearchBar,
  SectionTitle,
} from "@/components/dashboard";
import categoriesData from "@/data/categories.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

type Recipe = {
  id: string;
  title: string;
  category: string;
  rating: number;
  timeMinutes: number;
  imageUrl: string;
  isSaved: boolean;
  isFavorite: boolean;
};

export default function MisRecetasScreen() {
  const router = useRouter();
  const { recipes } = useRecipes();
  const [search, setSearch] = useState("");
  const [selectedTabId, setSelectedTabId] = useState(
    categoriesData.tabs.find((t) => t.id === "favoritos")?.id ??
      categoriesData.tabs[0]?.id ??
      "Todo",
  );

  const handleOpenRecipe = (id: string) => {
    router.push({
      pathname: "/receta/[id]",
      params: { id, source: "mis-recetas" },
    });
  };

  const savedRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allSaved = (recipes as Recipe[]).filter((recipe) => recipe.isSaved);

    return allSaved.filter((recipe) => {
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

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <View className="mb-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

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

        <SectionTitle title="Mis Recetas" />
        <View className="flex flex-row flex-wrap justify-between gap-y-4 px-4">
          {savedRecipes.map((recipe) => (
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
      </ScrollView>
    </View>
  );
}

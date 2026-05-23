import {
  AppHeader,
  CategoryTab,
  RecipeCard,
  SearchBar,
  SectionTitle,
} from "@/components/dashboard";
import categoriesData from "@/data/categories.json";
import recipesData from "@/data/recipes.json";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

type Recipe = {
  id: string;
  title: string;
  rating: number;
  timeMinutes: number;
  imageUrl: string;
  isSaved: boolean;
};

export default function MisRecetasScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleOpenRecipe = (id: string) => {
    router.push({ pathname: "/receta/[id]", params: { id } });
  };

  const savedRecipes = useMemo(
    () => recipesData.filter((recipe) => recipe.isSaved),
    [],
  ) as Recipe[];

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
          >
            {categoriesData.tabs.map((tab) => (
              <CategoryTab
                key={tab.id}
                label={tab.label}
                iconName={tab.iconName}
                active={tab.id === "favoritos"}
              />
            ))}
          </ScrollView>
        </View>

        <SectionTitle title="Mis Recetas" />
        <View className="grid grid-cols-2 gap-3 px-4">
          {savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              rating={recipe.rating}
              timeMinutes={recipe.timeMinutes}
              onPress={() => handleOpenRecipe(recipe.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

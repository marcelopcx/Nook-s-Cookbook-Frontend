import {
  AppHeader,
  CategoryTab,
  CategoryTile,
  FeaturedRecipeCard,
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
  category: string;
  rating: number;
  timeMinutes: number;
  difficulty: string;
  imageUrl: string;
  isFeatured: boolean;
  isSaved: boolean;
  isFavorite: boolean;
};

export default function InicioScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inicio");

  const handleOpenRecipe = (id: string) => {
    router.push({ pathname: "/receta/[id]", params: { id } });
  };

  const featuredRecipe = useMemo(
    () => recipesData.find((recipe) => recipe.isFeatured),
    [],
  ) as Recipe | undefined;

  const moreRecipes = useMemo(
    () => recipesData.filter((recipe) => !recipe.isFeatured),
    [],
  ) as Recipe[];

  return (
    <View className="flex-1 bg-[#fdf8f3] ">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <View className="my-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        <View className="mb-5 px-[14px]">
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
                active={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id)}
              />
            ))}
          </ScrollView>
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
      </ScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 h-[120px]"
        pointerEvents="none"
      />
    </View>
  );
}

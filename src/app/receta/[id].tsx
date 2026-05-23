import RatingStars from "@/components/dashboard/RatingStars";
import recipeDetailsData from "@/data/recipe-details.json";
import recipesData from "@/data/recipes.json";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type Recipe = {
  id: string;
  title: string;
  category: string;
  rating: number;
  timeMinutes: number;
  difficulty: string;
  imageUrl: string;
};

type RecipeDetails = {
  id: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string[];
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipesData.find((item) => item.id === id) as
    | Recipe
    | undefined;
  const details = recipeDetailsData.find((item) => item.id === id) as
    | RecipeDetails
    | undefined;

  if (!recipe || !details) {
    return (
      <View className="flex-1 bg-[#fdf8f3] px-6 pt-16">
        <Pressable
          onPress={() => router.back()}
          className="mb-6 flex-row items-center gap-2"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color="#5c4a3d"
          />
          <Text className="text-sm font-semibold text-[#5c4a3d]">Volver</Text>
        </Pressable>
        <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-6">
          <Text className="text-lg font-bold text-[#5c4a3d]">
            Receta no encontrada
          </Text>
          <Text className="mt-2 text-sm text-[#8b7355]">
            Regresa al listado para seleccionar otra receta.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <Image source={{ uri: recipe.imageUrl }} className="h-64 w-full" />
          <View className="absolute left-4 top-12 right-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={22}
                color="#5c4a3d"
              />
            </Pressable>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/90">
              <MaterialCommunityIcons name="heart" size={18} color="#f4b8c5" />
            </View>
          </View>
        </View>

        <View className="-mt-6 rounded-t-3xl border-t-2 border-[#e8dfd4] bg-[#fdf8f3] px-5 pt-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-extrabold text-[#5c4a3d]">
                {recipe.title}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-[#8b7355]">
                {recipe.category}
              </Text>
            </View>
            <View className="items-end">
              <RatingStars rating={recipe.rating} size={14} />
              <Text className="mt-1 text-xs text-[#8b7355]">
                {recipe.rating} / 5
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons name="clock" size={14} color="#8b7355" />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {recipe.timeMinutes} min
              </Text>
            </View>
            <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons
                name="chef-hat"
                size={14}
                color="#8b7355"
              />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {recipe.difficulty}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={14}
                color="#8b7355"
              />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {details.servings} porciones
              </Text>
            </View>
          </View>

          <View className="mt-6 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <MaterialCommunityIcons name="basket" size={16} color="#7cb69d" />
              <Text className="text-base font-bold text-[#5c4a3d]">
                Ingredientes
              </Text>
            </View>
            <View className="gap-2">
              {details.ingredients.map((item, index) => (
                <View
                  key={`ingredient-${index}`}
                  className="flex-row items-center gap-3"
                >
                  <View className="h-2 w-2 rounded-full bg-[#7cb69d]" />
                  <Text className="flex-1 text-sm text-[#5c4a3d]">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={16}
                color="#f4b8c5"
              />
              <Text className="text-base font-bold text-[#5c4a3d]">
                Preparacion
              </Text>
            </View>
            <View className="gap-3">
              {details.steps.map((item, index) => (
                <View key={`step-${index}`} className="flex-row gap-3">
                  <View className="h-6 w-6 items-center justify-center">
                    <Text className="text-xs font-bold text-[#f4b8c5]">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-sm text-[#5c4a3d]">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <MaterialCommunityIcons name="star" size={16} color="#f9d77e" />
              <Text className="text-base font-bold text-[#5c4a3d]">
                Tip del dia
              </Text>
            </View>
            <View className="gap-2">
              {details.tips.map((item, index) => (
                <View
                  key={`tip-${index}`}
                  className="flex-row items-center gap-3"
                >
                  <View className="h-2 w-2 rounded-full bg-[#f9d77e]" />
                  <Text className="flex-1 text-sm text-[#5c4a3d]">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-6">
            <Pressable className="items-center rounded-2xl bg-[#7cb69d] py-4">
              <Text className="text-sm font-bold text-white">
                Guardar en Mis Recetas
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

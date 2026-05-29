import RatingStars from "@/components/dashboard/RatingStars";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

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
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const { getRecipeById, getDetailsById, deleteRecipe } = useRecipes();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const recipe = useMemo(
    () => (id ? (getRecipeById(id) as Recipe | undefined) : undefined),
    [getRecipeById, id],
  );
  const details = useMemo(
    () => (id ? (getDetailsById(id) as RecipeDetails | undefined) : undefined),
    [getDetailsById, id],
  );

  const canManage = source === "mis-recetas";

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
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={22}
                color="#5c4a3d"
              />
            </Pressable>
            <View className="h-10 w-10 items-center justify-center rounded-full">
              <MaterialCommunityIcons name="heart" size={18} color="#f4b8c5" />
            </View>
          </View>

          {canManage ? (
            <View className="absolute bottom-4 right-4 flex-row items-center gap-2">
              <Pressable
                onPress={() => setShowDeleteModal(true)}
                className="h-10 w-10 mb-2 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={18}
                  color="#7cb69d"
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/cesta",
                    params: { editId: id, editKey: Date.now().toString() },
                  })
                }
                className="h-10 w-10 mb-2 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#5c4a3d"
                />
              </Pressable>
            </View>
          ) : null}
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
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowDeleteModal(false)}
          />
          <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="flex-1">
                <Text className="text-base font-bold text-[#5c4a3d]">
                  Eliminar receta
                </Text>
                <Text className="text-xs text-[#8b7355]">
                  Esta acción no se puede deshacer.
                </Text>
              </View>
            </View>

            <Text className="text-sm text-[#5c4a3d]">
              ¿Seguro que deseas eliminar: “{recipe.title}”?
            </Text>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2"
              >
                <Text className="text-sm font-bold text-[#8b7355]">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  deleteRecipe(id);
                  router.back();
                }}
                className="flex-1 items-center rounded-2xl bg-[#c15757] py-2"
              >
                <Text className="text-sm font-bold text-white">Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

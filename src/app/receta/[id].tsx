import RatingStars from "@/components/dashboard/RatingStars";
import { KeyboardAwareModal, KeyboardAwareScrollView } from "@/components";
import { useScrollIntoViewOnFocus } from "@/components/hooks/useScrollIntoViewOnFocus";
import { useKeyboardHeight } from "@/components/hooks/useKeyboardHeight";
import { useAuth } from "@/providers/AuthProvider";
import { useRecipes } from "@/providers/RecipesProvider";
import * as recipesService from "@/services/recipes";
import type { PuntuacionResponse } from "@/types/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const {
    getRecipeById,
    getDetailsById,
    fetchRecipeDetail,
    deleteRecipe,
    toggleFavorite,
    myRecipeIds,
  } = useRecipes();

  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ratings, setRatings] = useState<PuntuacionResponse[]>([]);
  const [myRating, setMyRating] = useState<PuntuacionResponse | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [ratingInputFocused, setRatingInputFocused] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const ratingSectionRef = useRef<View>(null);
  const scrollIntoView = useScrollIntoViewOnFocus(scrollRef, contentRef);
  const keyboardHeight = useKeyboardHeight();

  const scrollToRatingSection = useCallback(() => {
    scrollIntoView(ratingSectionRef, { extraOffset: 12, headerOffset: 64 });
  }, [scrollIntoView]);

  useEffect(() => {
    if (ratingInputFocused && keyboardHeight > 0) {
      scrollToRatingSection();
    }
  }, [ratingInputFocused, keyboardHeight, scrollToRatingSection]);

  const recipe = useMemo(
    () => (id ? getRecipeById(id) : undefined),
    [getRecipeById, id],
  );
  const details = useMemo(
    () => (id ? getDetailsById(id) : undefined),
    [getDetailsById, id],
  );

  const canManage = source === "mis-recetas" || (id ? myRecipeIds.has(id) : false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await fetchRecipeDetail(id);
      const puntuaciones = await recipesService.listRatings(Number(id));
      setRatings(puntuaciones);
      const mine = user?.id
        ? puntuaciones.find((p) => p.id_usuario === user.id) ?? null
        : null;
      setMyRating(mine);
      if (mine) {
        setRatingValue(mine.puntuacion);
        setRatingComment(mine.comentario ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchRecipeDetail, id, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleFavorite = async () => {
    if (!id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      await toggleFavorite(id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSaveRating = async () => {
    if (!id || ratingLoading) return;
    setRatingLoading(true);
    try {
      if (myRating) {
        const updated = await recipesService.updateRating(Number(id), {
          puntuacion: ratingValue,
          comentario: ratingComment.trim() || null,
        });
        setMyRating(updated);
        setRatings((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await recipesService.createRating(Number(id), {
          puntuacion: ratingValue,
          comentario: ratingComment.trim() || null,
        });
        setMyRating(created);
        setRatings((prev) => [...prev, created]);
      }
      await fetchRecipeDetail(id);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!id || ratingLoading) return;
    setRatingLoading(true);
    try {
      await recipesService.deleteRating(Number(id));
      setMyRating(null);
      setRatings((prev) => prev.filter((p) => p.id_usuario !== user?.id));
      setRatingValue(5);
      setRatingComment("");
      await fetchRecipeDetail(id);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading && (!recipe || !details)) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fdf8f3]">
        <ActivityIndicator color="#7cb69d" size="large" />
      </View>
    );
  }

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
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 12 }}
        keyboardExtraPadding={8}
        showsVerticalScrollIndicator={false}
      >
        <View ref={contentRef} collapsable={false}>
        <View className="relative">
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} className="h-64 w-full" />
          ) : (
            <View className="h-64 w-full items-center justify-center bg-[#e8dfd4]">
              <MaterialCommunityIcons name="image-off" size={40} color="#8b7355" />
            </View>
          )}
          <View className="absolute left-4 top-12 right-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/80"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={22}
                color="#5c4a3d"
              />
            </Pressable>
            <Pressable
              onPress={() => void handleToggleFavorite()}
              disabled={favoriteLoading}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/80"
            >
              <MaterialCommunityIcons
                name={recipe.isFavorite ? "heart" : "heart-outline"}
                size={18}
                color="#f4b8c5"
              />
            </Pressable>
          </View>

          {canManage ? (
            <View className="absolute bottom-4 right-4 flex-row items-center gap-2">
              <Pressable
                onPress={() => setShowDeleteModal(true)}
                className="h-10 w-10 mb-2 items-center justify-center rounded-full bg-white/80"
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={18}
                  color="#5c4a3d"
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/cesta",
                    params: { editId: id, editKey: Date.now().toString() },
                  })
                }
                className="h-10 w-10 mb-2 items-center justify-center rounded-full bg-white/80"
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
                por {details.creatorUsername}
              </Text>
              {details.description ? (
                <Text className="mt-2 text-sm text-[#5c4a3d]">
                  {details.description}
                </Text>
              ) : null}
            </View>
            <View className="items-end">
              <RatingStars rating={recipe.rating} size={14} />
              <Text className="mt-1 text-xs text-[#8b7355]">
                {recipe.rating.toFixed(1)} / 5
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
                  <Text className="flex-1 text-sm text-[#5c4a3d]">
                    {[item.cantidad, item.nombre].filter(Boolean).join(" ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {details.utensils.length > 0 ? (
            <View className="mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <MaterialCommunityIcons name="pot-steam" size={16} color="#7cb69d" />
                <Text className="text-base font-bold text-[#5c4a3d]">
                  Utensilios
                </Text>
              </View>
              <View className="gap-2">
                {details.utensils.map((item, index) => (
                  <View
                    key={`utensil-${index}`}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-2 w-2 rounded-full bg-[#7cb69d]" />
                    <Text className="flex-1 text-sm text-[#5c4a3d]">
                      {[item.cantidad, item.nombre].filter(Boolean).join(" ")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

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

          <View
            ref={ratingSectionRef}
            collapsable={false}
            className="mt-3 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-3"
          >
            <View className="mb-2 flex-row items-center gap-2">
              <MaterialCommunityIcons name="star" size={15} color="#f9d77e" />
              <Text className="text-sm font-bold text-[#5c4a3d]">
                Tu puntuación
              </Text>
            </View>
            <View className="mb-2 flex-row gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable key={value} onPress={() => setRatingValue(value)}>
                  <MaterialCommunityIcons
                    name={value <= ratingValue ? "star" : "star-outline"}
                    size={22}
                    color="#f9d77e"
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="Comentario opcional..."
              placeholderTextColor="#b8a899"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              onFocus={() => {
                setRatingInputFocused(true);
                scrollToRatingSection();
              }}
              onBlur={() => setRatingInputFocused(false)}
              className="mb-2 min-h-[44px] max-h-[56px] rounded-xl border-2 border-[#e8dfd4] bg-white px-3 py-2 text-sm text-[#5c4a3d]"
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => void handleSaveRating()}
                disabled={ratingLoading}
                className="flex-1 items-center rounded-xl bg-[#7cb69d] py-2"
              >
                <Text className="text-sm font-bold text-white">
                  {myRating ? "Actualizar" : "Puntuar"}
                </Text>
              </Pressable>
              {myRating ? (
                <Pressable
                  onPress={() => void handleDeleteRating()}
                  disabled={ratingLoading}
                  className="items-center rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-2"
                >
                  <Text className="text-sm font-bold text-[#c15757]">
                    Quitar
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {ratings.length > 0 ? (
            <View className="mt-3 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-3">
              <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                Comentarios ({ratings.length})
              </Text>
              <View className="gap-2">
                {ratings.map((rating) => (
                  <View
                    key={rating.id}
                    className="rounded-xl border border-[#e8dfd4] bg-white p-2.5"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-[#5c4a3d]">
                        {rating.username}
                      </Text>
                      <RatingStars rating={rating.puntuacion} size={12} />
                    </View>
                    {rating.comentario ? (
                      <Text className="mt-1 text-sm text-[#8b7355]">
                        {rating.comentario}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardAwareModal
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
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
              ¿Seguro que deseas eliminar: "{recipe.title}"?
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
                  void (async () => {
                    setShowDeleteModal(false);
                    await deleteRecipe(id!);
                    router.back();
                  })();
                }}
                className="flex-1 items-center rounded-2xl bg-[#c15757] py-2"
              >
                <Text className="text-sm font-bold text-white">Eliminar</Text>
              </Pressable>
            </View>
      </KeyboardAwareModal>
    </View>
  );
}

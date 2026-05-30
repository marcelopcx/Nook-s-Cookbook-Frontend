import RatingStars from "@/components/dashboard/RatingStars";
import { useRecipes } from "@/providers/RecipesProvider";
import { recetasService } from "@/services";
import type {
  IngredienteReceta,
  Paso,
  RecetaDetalle,
} from "@/services/recetas";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const FALLBACK_IMAGE_URL =
  "https://v0-animal-crossing-recipes-ui.vercel.app/cherry-pie.jpg";

function ingredienteToString(ing: IngredienteReceta): string {
  if (ing.cantidad && ing.cantidad.trim().length > 0) {
    return `${ing.cantidad.trim()} ${ing.nombre}`.trim();
  }
  return ing.nombre;
}

function sortPasos(pasos: Paso[]): Paso[] {
  return [...pasos].sort((a, b) => a.numero_paso - b.numero_paso);
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const { deleteRecipe, getRecipeById } = useRecipes();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [detalle, setDetalle] = useState<RecetaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const numericId = id ? Number(id) : NaN;

  /**
   * Datos básicos del listado (cargados con `GET /recetas`). Sirven como
   * fallback cuando `GET /recetas/{id}` aún no está disponible o falla.
   */
  const fallbackRecipe = useMemo(
    () => (id ? getRecipeById(id) : undefined),
    [getRecipeById, id],
  );

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setDetalle(null);
      setIsLoading(false);
      setLoadError("ID de receta inválido");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setDetalle(null);

    (async () => {
      try {
        const data = await recetasService.obtenerReceta(numericId);
        if (!cancelled) setDetalle(data);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la receta",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [numericId]);

  const canManage = source === "mis-recetas";

  if (isLoading) {
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
        <View className="items-center gap-3 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-6">
          <ActivityIndicator color="#7cb69d" />
          <Text className="text-sm text-[#8b7355]">Cargando receta...</Text>
        </View>
      </View>
    );
  }

  // Sin detalle del backend pero tampoco hay fallback → realmente no encontrada.
  if ((loadError || !detalle) && !fallbackRecipe) {
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
            {loadError ?? "Regresa al listado para seleccionar otra receta."}
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Datos a renderizar: usamos `detalle` cuando existe, sino caemos al
   * `fallbackRecipe` del listado. El bloque "Preparación" muestra un aviso
   * cuando solo tenemos los datos básicos.
   */
  const usingFallback = !detalle && !!fallbackRecipe;

  const imageUrl =
    detalle?.imagen ?? fallbackRecipe?.imageUrl ?? FALLBACK_IMAGE_URL;
  const titulo = detalle?.nombre ?? fallbackRecipe?.title ?? "Receta";
  const rating =
    detalle?.promedio_puntuacion ?? fallbackRecipe?.rating ?? 0;
  const dificultad =
    detalle?.dificultad ?? fallbackRecipe?.difficulty ?? "Fácil";
  const tiempoLabel =
    detalle?.tiempo ??
    (fallbackRecipe ? `${fallbackRecipe.timeMinutes} min` : "—");
  const raciones = detalle?.raciones ?? null;
  const descripcion = detalle?.descripcion ?? null;
  /**
   * `creador_username` puede llegar con un `@` dentro (p. ej. un correo),
   * por lo que mostramos solo la parte previa al `@`.
   */
  const creadorDisplay = detalle?.creador_username
    ? detalle.creador_username.split("@")[0]?.trim() ||
      detalle.creador_username
    : null;
  const subtitle = creadorDisplay
    ? `Por @${creadorDisplay}`
    : (fallbackRecipe?.category ?? "General");

  const ingredientesDisplay = detalle
    ? detalle.ingredientes.map(ingredienteToString)
    : [];
  const pasosOrdenados = detalle ? sortPasos(detalle.pasos) : [];
  const utensilios = detalle?.utensilios ?? [];

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <Image source={{ uri: imageUrl }} className="h-64 w-full" />
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
                {titulo}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-[#8b7355]">
                {subtitle}
              </Text>
            </View>
            <View className="items-end">
              <RatingStars rating={rating} size={14} />
              <Text className="mt-1 text-xs text-[#8b7355]">{rating} / 5</Text>
            </View>
          </View>

          {descripcion ? (
            <Text className="mt-3 text-sm text-[#5c4a3d]">{descripcion}</Text>
          ) : null}

          {usingFallback ? (
            <View className="mt-3 flex-row items-start gap-2 rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color="#8b7355"
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 text-xs text-[#8b7355]">
                Mostrando datos básicos. Los pasos e ingredientes detallados se
                cargarán cuando el servidor los habilite.
              </Text>
            </View>
          ) : null}

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons name="clock" size={14} color="#8b7355" />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {tiempoLabel}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
              <MaterialCommunityIcons
                name="chef-hat"
                size={14}
                color="#8b7355"
              />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {dificultad}
              </Text>
            </View>
            {raciones !== null ? (
              <View className="flex-row items-center gap-2 rounded-full bg-[#fff9f0] px-3 py-2">
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={14}
                  color="#8b7355"
                />
                <Text className="text-xs font-semibold text-[#8b7355]">
                  {raciones} porciones
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-6 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <MaterialCommunityIcons name="basket" size={16} color="#7cb69d" />
              <Text className="text-base font-bold text-[#5c4a3d]">
                Ingredientes
              </Text>
            </View>
            <View className="gap-2">
              {usingFallback ? (
                <Text className="text-xs text-[#8b7355]">
                  Detalles aún no disponibles.
                </Text>
              ) : ingredientesDisplay.length === 0 ? (
                <Text className="text-xs text-[#8b7355]">
                  Esta receta no tiene ingredientes registrados.
                </Text>
              ) : (
                ingredientesDisplay.map((item, index) => (
                  <View
                    key={`ingredient-${index}`}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-2 w-2 rounded-full bg-[#7cb69d]" />
                    <Text className="flex-1 text-sm text-[#5c4a3d]">
                      {item}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {utensilios.length > 0 ? (
            <View className="mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={16}
                  color="#8b7355"
                />
                <Text className="text-base font-bold text-[#5c4a3d]">
                  Utensilios
                </Text>
              </View>
              <View className="gap-2">
                {utensilios.map((u, index) => (
                  <View
                    key={`utensilio-${u.id_utensilio}-${index}`}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-2 w-2 rounded-full bg-[#8b7355]" />
                    <Text className="flex-1 text-sm text-[#5c4a3d]">
                      {u.cantidad && u.cantidad.trim().length > 0
                        ? `${u.cantidad.trim()} ${u.nombre}`
                        : u.nombre}
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
              {usingFallback ? (
                <Text className="text-xs text-[#8b7355]">
                  Detalles aún no disponibles.
                </Text>
              ) : pasosOrdenados.length === 0 ? (
                <Text className="text-xs text-[#8b7355]">
                  Esta receta aún no tiene pasos.
                </Text>
              ) : (
                pasosOrdenados.map((paso, index) => (
                  <View
                    key={`step-${paso.numero_paso}-${index}`}
                    className="flex-row gap-3"
                  >
                    <View className="h-6 w-6 items-center justify-center">
                      <Text className="text-xs font-bold text-[#f4b8c5]">
                        {paso.numero_paso}
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm text-[#5c4a3d]">
                      {paso.instruccion}
                    </Text>
                  </View>
                ))
              )}
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
              ¿Seguro que deseas eliminar: “{titulo}”?
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
                  if (id) deleteRecipe(id);
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

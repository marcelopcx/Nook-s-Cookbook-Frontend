import { AppHeader } from "@/components/dashboard";
import {
  pickReceiptImage,
  type PickedImage,
} from "@/components/hooks/useImagePicker";
import basketData from "@/data/basket.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { useSession } from "@/providers/SessionProvider";
import { ingredientesService, recetasService } from "@/services";
import type { Ingrediente } from "@/services/ingredientes";
import type {
  CreateRecetaRequest,
  IngredienteRecetaInput,
  PasoInput,
} from "@/services/recetas";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type IngredienteRow = {
  /** ID real del catálogo del backend; null si es legacy del mock. */
  id_ingrediente: number | null;
  nombre: string;
  cantidad: string | null;
};

function rowToDisplayString(row: IngredienteRow): string {
  if (row.cantidad && row.cantidad.trim().length > 0) {
    return `${row.cantidad.trim()} ${row.nombre}`.trim();
  }
  return row.nombre;
}

function legacyStringToRow(raw: string): IngredienteRow {
  return { id_ingrediente: null, nombre: raw, cantidad: null };
}

/** Quita acentos para comparar de forma amigable. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const steps = [
  "Detalles",
  "Informacion",
  "Ingredientes",
  "Pasos",
  "Resumen",
];

export default function CestaScreen() {
  const router = useRouter();
  const { editId, editKey } = useLocalSearchParams<{
    editId?: string;
    editKey?: string;
  }>();
  const [ignoreEditId, setIgnoreEditId] = useState(false);
  const lastEditKeyRef = useRef<string | undefined>(undefined);
  const effectiveEditId = ignoreEditId ? undefined : editId;
  const isEditing =
    typeof effectiveEditId === "string" && effectiveEditId.length > 0;
  const {
    getRecipeById,
    getDetailsById,
    updateRecipe,
    updateDetails,
    addRecipe,
  } = useRecipes();
  const { token } = useSession();

  const [ingredientesCatalog, setIngredientesCatalog] = useState<Ingrediente[]>(
    [],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catálogo de ingredientes del backend (para mapear strings libres a IDs).
  // Se carga en background; si falla, se mantiene array vacío y caemos al
  // flujo offline (guardado local) sin romper la UI.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await ingredientesService.listarIngredientes();
        if (!cancelled) setIngredientesCatalog(list);
      } catch {
        if (!cancelled) setIngredientesCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutedTextColor = "#8b7355";
  const placeholderColor = "#8b7355";
  const [step, setStep] = useState(0);
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(basketData.categories[0]);
  const [timeMinutes, setTimeMinutes] = useState(basketData.times[0]);
  const [servings, setServings] = useState(basketData.servings[0]);
  const [difficulty, setDifficulty] = useState(basketData.difficulties[0].id);
  const [selectedIngredienteId, setSelectedIngredienteId] = useState<
    number | null
  >(null);
  const [cantidadInput, setCantidadInput] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredienteRow[]>([]);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [imagePickerError, setImagePickerError] = useState<string | null>(null);
  const [stepInput, setStepInput] = useState("");
  const [stepsList, setStepsList] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saved, setSaved] = useState(false);

  const resetForm = useCallback(() => {
    setRecipeName("");
    setDescription("");
    setCategory(basketData.categories[0]);
    setTimeMinutes(basketData.times[0]);
    setServings(basketData.servings[0]);
    setDifficulty(basketData.difficulties[0].id);
    setSelectedIngredienteId(null);
    setCantidadInput("");
    setIngredientSearch("");
    setSelectedTipo(null);
    setIngredients([]);
    setPickedImage(null);
    setImagePickerError(null);
    setStepInput("");
    setStepsList([]);
    setSaved(false);
    setShowErrors(false);
    setStep(0);
    setSubmitError(null);
    setIsSubmitting(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (ignoreEditId) {
        const hasEditId = typeof editId === "string" && editId.length > 0;
        const hasEditKey = typeof editKey === "string" && editKey.length > 0;

        if (hasEditId && hasEditKey && editKey !== lastEditKeyRef.current) {
          setIgnoreEditId(false);
        }

        if (!hasEditId) {
          setIgnoreEditId(false);
        }
      }

      return () => {
        if (isEditing) {
          lastEditKeyRef.current =
            typeof editKey === "string" ? editKey : undefined;
          setIgnoreEditId(true);
          resetForm();
        }
      };
    }, [editId, editKey, ignoreEditId, isEditing, resetForm]),
  );

  useEffect(() => {
    if (!isEditing) return;
    if (saved) return;

    const recipe = getRecipeById(effectiveEditId);
    const details = getDetailsById(effectiveEditId);
    if (!recipe || !details) return;

    const difficultyId =
      basketData.difficulties.find(
        (d) => d.label.toLowerCase() === recipe.difficulty.toLowerCase(),
      )?.id ?? basketData.difficulties[0].id;

    setRecipeName(recipe.title);
    setDescription("");
    setCategory(recipe.category);
    setTimeMinutes(recipe.timeMinutes);
    setServings(details.servings);
    setDifficulty(difficultyId);
    setIngredients(details.ingredients.map(legacyStringToRow));
    setStepsList(details.steps);
    setSelectedIngredienteId(null);
    setCantidadInput("");
    setIngredientSearch("");
    setSelectedTipo(null);
    setPickedImage(null);
    setImagePickerError(null);
    setStepInput("");
    setSaved(false);
    setShowErrors(false);
    setStep(0);
  }, [effectiveEditId, getDetailsById, getRecipeById, isEditing, saved]);

  useEffect(() => {
    if (isEditing) return;
    resetForm();
  }, [isEditing]);

  const difficultyLabel = useMemo(() => {
    return (
      basketData.difficulties.find((item) => item.id === difficulty)?.label ||
      ""
    );
  }, [difficulty]);

  /** Tipos de ingrediente únicos (Vegetal, Fruta, Proteína, ...). */
  const tiposIngrediente = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const ing of ingredientesCatalog) {
      const tipo = ing.tipo_nombre?.trim();
      if (tipo && !seen.has(tipo)) {
        seen.add(tipo);
        result.push(tipo);
      }
    }
    return result.sort((a, b) => a.localeCompare(b, "es"));
  }, [ingredientesCatalog]);

  /** Catálogo filtrado por buscador + tipo seleccionado. */
  const filteredIngredientes = useMemo(() => {
    const query = normalize(ingredientSearch.trim());
    return ingredientesCatalog
      .filter((ing) => {
        if (selectedTipo && ing.tipo_nombre !== selectedTipo) return false;
        if (query.length === 0) return true;
        return normalize(ing.nombre).includes(query);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [ingredientesCatalog, ingredientSearch, selectedTipo]);

  const selectedIngrediente = useMemo(
    () =>
      selectedIngredienteId !== null
        ? ingredientesCatalog.find((i) => i.id === selectedIngredienteId)
        : undefined,
    [ingredientesCatalog, selectedIngredienteId],
  );

  const canAdvance = useMemo(() => {
    if (step === 0) {
      return (
        recipeName.trim().length > 0 &&
        (isEditing ? true : description.trim().length > 0)
      );
    }
    if (step === 1) {
      return Boolean(timeMinutes && servings && difficulty);
    }
    if (step === 2) {
      return ingredients.length > 0;
    }
    if (step === 3) {
      return stepsList.length > 0;
    }
    if (step === 4) {
      return true;
    }
    return false;
  }, [
    description,
    difficulty,
    ingredients.length,
    isEditing,
    recipeName,
    servings,
    step,
    stepsList.length,
    timeMinutes,
  ]);

  const handleNext = () => {
    if (!canAdvance) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    setShowErrors(false);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleAddIngredient = () => {
    if (selectedIngredienteId === null) return;
    const ingrediente = ingredientesCatalog.find(
      (i) => i.id === selectedIngredienteId,
    );
    if (!ingrediente) return;
    if (ingredients.some((row) => row.id_ingrediente === ingrediente.id)) {
      setSelectedIngredienteId(null);
      setCantidadInput("");
      return;
    }
    const cantidad = cantidadInput.trim();
    setIngredients((prev) => [
      ...prev,
      {
        id_ingrediente: ingrediente.id,
        nombre: ingrediente.nombre,
        cantidad: cantidad.length > 0 ? cantidad : null,
      },
    ]);
    setSelectedIngredienteId(null);
    setCantidadInput("");
  };

  const handleRemoveIngredient = (row: IngredienteRow, index: number) => {
    setIngredients((prev) =>
      prev.filter((item, i) => {
        if (row.id_ingrediente !== null) {
          return item.id_ingrediente !== row.id_ingrediente;
        }
        return i !== index;
      }),
    );
  };

  const handlePickImage = async () => {
    setImagePickerError(null);
    try {
      const picked = await pickReceiptImage();
      if (!picked) return;
      setPickedImage(picked);
    } catch (error) {
      setImagePickerError(
        error instanceof Error
          ? error.message
          : "No se pudo seleccionar la imagen",
      );
    }
  };

  const handleClearImage = () => {
    setPickedImage(null);
    setImagePickerError(null);
  };

  const handleAddStep = () => {
    const trimmed = stepInput.trim();
    if (!trimmed) return;
    setStepsList((prev) => [...prev, trimmed]);
    setStepInput("");
  };

  const handleRemoveStep = (item: string) => {
    setStepsList((prev) => prev.filter((stepItem) => stepItem !== item));
  };

  const buildCreateRecetaRequest = useCallback(
    (imagenUrl: string | null): CreateRecetaRequest => {
      const pasos: PasoInput[] = stepsList.map((instruccion, index) => ({
        numero_paso: index + 1,
        instruccion: instruccion.trim(),
      }));

      const ingredientesPayload: IngredienteRecetaInput[] = ingredients
        .filter(
          (row): row is IngredienteRow & { id_ingrediente: number } =>
            row.id_ingrediente !== null,
        )
        .map<IngredienteRecetaInput>((row) => ({
          id_ingrediente: row.id_ingrediente,
          cantidad: row.cantidad,
        }));

      return {
        nombre: recipeName.trim(),
        descripcion: description.trim() || null,
        raciones: typeof servings === "number" ? servings : null,
        tiempo:
          typeof timeMinutes === "number" ? `${timeMinutes} min` : timeMinutes,
        dificultad: difficultyLabel || null,
        imagen: imagenUrl,
        pasos,
        ingredientes: ingredientesPayload,
        utensilios: [],
      };
    },
    [
      description,
      difficultyLabel,
      ingredients,
      recipeName,
      servings,
      stepsList,
      timeMinutes,
    ],
  );

  const handleSave = async () => {
    if (!canAdvance) {
      setShowErrors(true);
      return;
    }

    const ingredientsAsStrings = ingredients.map(rowToDisplayString);

    if (isEditing) {
      const recipe = getRecipeById(effectiveEditId);
      const details = getDetailsById(effectiveEditId);

      if (recipe) {
        updateRecipe(effectiveEditId, {
          title: recipeName.trim(),
          category,
          timeMinutes,
          difficulty: difficultyLabel,
          isSaved: true,
        });
      }

      if (details) {
        updateDetails(effectiveEditId, {
          servings,
          ingredients: ingredientsAsStrings,
          steps: stepsList,
          tips: [],
        });
      }

      setSaved(true);
      return;
    }

    // Modo creación: si hay sesión, persistimos en backend.
    setSubmitError(null);

    if (!token) {
      // Sin sesión activa solo guardamos en memoria del provider.
      setSaved(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let imagenUrl: string | null = null;
      if (pickedImage) {
        imagenUrl = await recetasService.subirImagenReceta(
          pickedImage.uri,
          pickedImage.filename,
          pickedImage.mimeType,
        );
      }

      const payload = buildCreateRecetaRequest(imagenUrl);
      const created = await recetasService.crearReceta(payload);

      addRecipe(
        {
          id: String(created.id),
          title: created.nombre,
          category,
          rating: created.promedio_puntuacion ?? 0,
          timeMinutes:
            typeof timeMinutes === "number" ? timeMinutes : Number(timeMinutes),
          difficulty: created.dificultad ?? difficultyLabel,
          imageUrl:
            created.imagen ??
            "https://v0-animal-crossing-recipes-ui.vercel.app/cherry-pie.jpg",
          isFeatured: false,
          isSaved: true,
          isFavorite: false,
        },
        {
          id: String(created.id),
          servings,
          ingredients: ingredientsAsStrings,
          steps: stepsList,
          tips: [],
        },
      );

      setSaved(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la receta",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <AppHeader />

        <View className="px-4 pt-4">
          <Text className="text-xl text-center font-bold text-[#5c4a3d]">
            {isEditing ? "Editar" : "Crear"}
          </Text>
          <Text className="text-sm text-center text-[#8b7355]">
            Comparte tu receta con la comunidad
          </Text>
        </View>

        <View className="mx-4 mb-4 mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4 shadow-lg">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#7cb69d]">
                <MaterialCommunityIcons
                  name="chef-hat"
                  size={20}
                  color="#fff"
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-[#5c4a3d]">
                  {isEditing ? "Editar Receta" : "Crear Receta"}
                </Text>
                <Text className="text-xs text-[#8b7355]">
                  Paso {step + 1} de {steps.length}
                </Text>
              </View>
            </View>
            <View className="rounded-full bg-[#f5ebe0] px-3 py-1">
              <Text className="text-xs font-semibold text-[#8b7355]">
                {steps[step]}
              </Text>
            </View>
          </View>

          <View className="mb-6 flex-row gap-1">
            {steps.map((_, index) => (
              <View
                key={`step-${index}`}
                className={`h-1.5 flex-1 rounded-full ${
                  index <= step ? "bg-[#7cb69d]" : "bg-[#e8dfd4]"
                }`}
              />
            ))}
          </View>

          {saved ? (
            <View className="rounded-2xl border border-[#cfe4d9] bg-[#f0f7f3] p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#4e8b6b"
                />
                <Text className="text-sm font-bold text-[#4e8b6b]">
                  {isEditing ? "Receta actualizada" : "Receta guardada"}
                </Text>
              </View>
              <Text className="text-sm text-[#5c4a3d]">
                {isEditing
                  ? "Tus cambios se guardaron correctamente."
                  : "Tu receta se guardo correctamente. Puedes crear otra si lo deseas."}
              </Text>
              {isEditing ? (
                <Pressable
                  onPress={() => {
                    lastEditKeyRef.current =
                      typeof editKey === "string" ? editKey : undefined;
                    setIgnoreEditId(true);
                    resetForm();
                    router.push("/mis-recetas");
                  }}
                  className="mt-4 items-center rounded-xl bg-[#7cb69d] py-3"
                >
                  <Text className="font-bold text-white">Volver al menú</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleReset}
                  className="mt-4 items-center rounded-xl bg-[#7cb69d] py-3"
                >
                  <Text className="font-bold text-white">
                    Crear otra receta
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="gap-4">
              {step === 0 ? (
                <View className="gap-4">
                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Nombre de la receta
                    </Text>
                    <TextInput
                      value={recipeName}
                      onChangeText={setRecipeName}
                      placeholder="Ej: Tarta de Manzana"
                      placeholderTextColor={placeholderColor}
                      className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                    />
                    {showErrors && recipeName.trim().length === 0 ? (
                      <Text className="mt-2 text-xs text-[#d4684c]">
                        Ingresa un nombre para la receta
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Descripcion
                    </Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Describe tu receta..."
                      placeholderTextColor={placeholderColor}
                      multiline
                      numberOfLines={3}
                      className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                    />
                    {showErrors &&
                    !isEditing &&
                    description.trim().length === 0 ? (
                      <Text className="mt-2 text-xs text-[#d4684c]">
                        Agrega una breve descripcion
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Categoria
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {basketData.categories.map((item) => {
                        const isActive = item === category;
                        return (
                          <Pressable
                            key={item}
                            onPress={() => setCategory(item)}
                            className={`rounded-xl px-4 py-2 ${
                              isActive ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                isActive ? "text-white" : "text-[#5c4a3d]"
                              }`}
                            >
                              {item}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text className="mb-4 text-sm font-bold text-[#5c4a3d]">
                      Imagen
                    </Text>
                    {pickedImage ? (
                      <View className="rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3">
                        <View className="flex-row items-center gap-3">
                          <Image
                            source={{ uri: pickedImage.uri }}
                            className="h-16 w-16 rounded-xl"
                            resizeMode="cover"
                          />
                          <View className="flex-1">
                            <Text
                              className="text-sm font-semibold text-[#5c4a3d]"
                              numberOfLines={1}
                            >
                              {pickedImage.filename}
                            </Text>
                            <Text className="text-[11px] text-[#8b7355]">
                              Lista para subir al guardar
                            </Text>
                          </View>
                          <Pressable
                            onPress={handleClearImage}
                            className="h-9 w-9 items-center justify-center rounded-full bg-[#f5ebe0]"
                          >
                            <MaterialCommunityIcons
                              name="close"
                              size={14}
                              color={mutedTextColor}
                            />
                          </Pressable>
                        </View>
                        <Pressable
                          onPress={handlePickImage}
                          className="mt-3 items-center justify-center rounded-xl bg-[#f5ebe0] py-2"
                        >
                          <Text className="text-center text-sm font-semibold text-[#5c4a3d]">
                            Cambiar imagen
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={handlePickImage}
                        className="items-center justify-center rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] py-6"
                      >
                        <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#f5ebe0]">
                          <MaterialCommunityIcons
                            name="image-plus"
                            size={24}
                            color="#8b7355"
                          />
                        </View>
                        <Text className="mt-3 text-sm font-semibold text-[#5c4a3d]">
                          Elegir imagen
                        </Text>
                        <Text className="mt-1 text-xs text-[#8b7355]">
                          Toca para subir desde tu galería
                        </Text>
                      </Pressable>
                    )}
                    {imagePickerError ? (
                      <Text className="mt-2 text-xs text-[#d4684c]">
                        {imagePickerError}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {step === 1 ? (
                <View className="gap-4">
                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Tiempo estimado
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {basketData.times.map((item) => {
                        const isActive = item === timeMinutes;
                        return (
                          <Pressable
                            key={`time-${item}`}
                            onPress={() => setTimeMinutes(item)}
                            className={`rounded-xl px-4 py-2 ${
                              isActive ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                isActive ? "text-white" : "text-[#5c4a3d]"
                              }`}
                            >
                              {item} min
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Porciones
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {basketData.servings.map((item) => {
                        const isActive = item === servings;
                        return (
                          <Pressable
                            key={`serving-${item}`}
                            onPress={() => setServings(item)}
                            className={`rounded-xl px-4 py-2 ${
                              isActive ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                isActive ? "text-white" : "text-[#5c4a3d]"
                              }`}
                            >
                              {item}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Dificultad
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {basketData.difficulties.map((item) => {
                        const isActive = item.id === difficulty;
                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => setDifficulty(item.id)}
                            className={`rounded-xl px-4 py-2 ${
                              isActive ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                isActive ? "text-white" : "text-[#5c4a3d]"
                              }`}
                            >
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ) : null}

              {step === 2 ? (
                <View>
                  {ingredientesCatalog.length === 0 ? (
                    <Text className="text-xs text-[#8b7355]">
                      Cargando ingredientes...
                    </Text>
                  ) : (
                    <>
                      <View>
                        <Text className="mb-3 text-sm font-bold text-[#5c4a3d]">
                          Buscar ingrediente
                        </Text>
                        <View className="h-12 flex-row items-center rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-3">
                          <MaterialCommunityIcons
                            name="magnify"
                            size={18}
                            color={mutedTextColor}
                            style={{ marginRight: 8 }}
                          />
                          <TextInput
                            value={ingredientSearch}
                            onChangeText={setIngredientSearch}
                            placeholder="Ej: manzana, salmón, harina..."
                            placeholderTextColor={placeholderColor}
                            style={{ paddingVertical: 0 }}
                            className="flex-1 text-[#5c4a3d]"
                          />
                          {ingredientSearch.length > 0 ? (
                            <Pressable
                              onPress={() => setIngredientSearch("")}
                              className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-[#f5ebe0]"
                            >
                              <MaterialCommunityIcons
                                name="close"
                                size={12}
                                color={mutedTextColor}
                              />
                            </Pressable>
                          ) : null}
                        </View>
                      </View>

                      <View style={{ marginTop: 24 }}>
                        <Text className="mb-3 text-sm font-bold text-[#5c4a3d]">
                          Filtrar por tipo
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
                        >
                          <Pressable
                            onPress={() => setSelectedTipo(null)}
                            className={`rounded-xl px-3 py-2 ${
                              selectedTipo === null
                                ? "bg-[#7cb69d]"
                                : "bg-[#f5ebe0]"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                selectedTipo === null
                                  ? "text-white"
                                  : "text-[#5c4a3d]"
                              }`}
                            >
                              Todos
                            </Text>
                          </Pressable>
                          {tiposIngrediente.map((tipo) => {
                            const isActive = selectedTipo === tipo;
                            return (
                              <Pressable
                                key={`tipo-${tipo}`}
                                onPress={() =>
                                  setSelectedTipo(isActive ? null : tipo)
                                }
                                className={`rounded-xl px-3 py-2 ${
                                  isActive ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
                                }`}
                              >
                                <Text
                                  className={`text-xs font-semibold ${
                                    isActive ? "text-white" : "text-[#5c4a3d]"
                                  }`}
                                >
                                  {tipo}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>

                      <View
                        style={{ marginTop: 24 }}
                        className="rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-2"
                      >
                        {filteredIngredientes.length === 0 ? (
                          <Text className="px-2 py-4 text-center text-xs text-[#8b7355]">
                            No se encontraron ingredientes
                          </Text>
                        ) : (
                          <ScrollView
                            style={{ maxHeight: 220 }}
                            showsVerticalScrollIndicator
                            indicatorStyle="black"
                            nestedScrollEnabled
                          >
                            {filteredIngredientes.map((item) => {
                              const isActive =
                                item.id === selectedIngredienteId;
                              const alreadyAdded = ingredients.some(
                                (row) => row.id_ingrediente === item.id,
                              );
                              return (
                                <Pressable
                                  key={`row-${item.id}`}
                                  disabled={alreadyAdded}
                                  onPress={() =>
                                    setSelectedIngredienteId(
                                      isActive ? null : item.id,
                                    )
                                  }
                                  style={{ marginBottom: 10 }}
                                  className={`flex-row items-center justify-between rounded-xl px-3 py-3 ${
                                    isActive
                                      ? "bg-[#7cb69d]"
                                      : alreadyAdded
                                        ? "bg-[#efe6db]"
                                        : "bg-[#fff9f0]"
                                  }`}
                                >
                                  <View className="flex-1 pr-2">
                                    <Text
                                      className={`text-sm font-semibold ${
                                        isActive
                                          ? "text-white"
                                          : alreadyAdded
                                            ? "text-[#b8a899]"
                                            : "text-[#5c4a3d]"
                                      }`}
                                    >
                                      {item.nombre}
                                    </Text>
                                    {item.tipo_nombre ? (
                                      <Text
                                        className={`text-[11px] ${
                                          isActive
                                            ? "text-white/80"
                                            : "text-[#8b7355]"
                                        }`}
                                      >
                                        {item.tipo_nombre}
                                      </Text>
                                    ) : null}
                                  </View>
                                  {alreadyAdded ? (
                                    <MaterialCommunityIcons
                                      name="check-circle"
                                      size={18}
                                      color="#b8a899"
                                    />
                                  ) : isActive ? (
                                    <MaterialCommunityIcons
                                      name="check-circle"
                                      size={18}
                                      color="#fff"
                                    />
                                  ) : (
                                    <MaterialCommunityIcons
                                      name="plus-circle-outline"
                                      size={18}
                                      color={mutedTextColor}
                                    />
                                  )}
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        )}
                      </View>

                      {selectedIngrediente ? (
                        <View style={{ marginTop: 24 }}>
                          <Text className="mb-3 text-sm font-bold text-[#5c4a3d]">
                            Cantidad para "{selectedIngrediente.nombre}"
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <TextInput
                              value={cantidadInput}
                              onChangeText={setCantidadInput}
                              placeholder="Ej: 2 tazas (opcional)"
                              placeholderTextColor={placeholderColor}
                              className="flex-1 rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                            />
                            <Pressable
                              onPress={handleAddIngredient}
                              className="h-12 w-12 items-center justify-center rounded-xl bg-[#7cb69d]"
                            >
                              <MaterialCommunityIcons
                                name="plus"
                                size={18}
                                color="#fff"
                              />
                            </Pressable>
                          </View>
                        </View>
                      ) : null}

                      {showErrors && ingredients.length === 0 ? (
                        <Text
                          style={{ marginTop: 12 }}
                          className="text-xs text-[#d4684c]"
                        >
                          Agrega al menos un ingrediente
                        </Text>
                      ) : null}

                      {ingredients.length > 0 ? (
                        <View style={{ marginTop: 24 }}>
                          <Text className="mb-3 text-sm font-bold text-[#5c4a3d]">
                            Agregados ({ingredients.length})
                          </Text>
                          <View className="rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3">
                            <ScrollView
                              style={{ maxHeight: 140 }}
                              contentContainerStyle={{
                                gap: 10,
                                paddingRight: 6,
                              }}
                              showsVerticalScrollIndicator
                              indicatorStyle="black"
                              nestedScrollEnabled
                            >
                              {ingredients.map((row, index) => (
                                <View
                                  key={`ing-${row.id_ingrediente ?? "legacy"}-${index}`}
                                  className="flex-row items-center gap-3"
                                >
                                  <View className="h-2 w-2 rounded-full bg-[#7cb69d]" />
                                  <Text className="flex-1 text-sm text-[#5c4a3d]">
                                    {rowToDisplayString(row)}
                                  </Text>
                                  <Pressable
                                    onPress={() =>
                                      handleRemoveIngredient(row, index)
                                    }
                                    className="h-6 w-6 items-center justify-center rounded-full bg-[#f5ebe0]"
                                  >
                                    <MaterialCommunityIcons
                                      name="close"
                                      size={12}
                                      color={mutedTextColor}
                                    />
                                  </Pressable>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              ) : null}

              {step === 3 ? (
                <View className="gap-4">
                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Pasos de preparacion
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        value={stepInput}
                        onChangeText={setStepInput}
                        placeholder="Ej: Mezcla los ingredientes"
                        placeholderTextColor={placeholderColor}
                        className="flex-1 rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                      />
                      <Pressable
                        onPress={handleAddStep}
                        className="h-12 w-12 items-center justify-center rounded-xl bg-[#7cb69d]"
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={18}
                          color="#fff"
                        />
                      </Pressable>
                    </View>
                    {showErrors && stepsList.length === 0 ? (
                      <Text className="mt-2 text-xs text-[#d4684c]">
                        Explica como preparar la receta
                      </Text>
                    ) : null}
                    <View className="mt-3 rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3">
                      <ScrollView
                        style={{ maxHeight: 200 }}
                        contentContainerStyle={{ gap: 10, paddingRight: 6 }}
                        showsVerticalScrollIndicator
                        indicatorStyle="black"
                        nestedScrollEnabled
                      >
                        {stepsList.map((item, index) => (
                          <View
                            key={`${item}-${index}`}
                            className="flex-row items-center gap-3"
                          >
                            <View className="h-6 w-6 items-center justify-center">
                              <Text className="text-xs font-bold text-[#f4b8c5]">
                                {index + 1}
                              </Text>
                            </View>
                            <Text className="flex-1 text-sm text-[#5c4a3d]">
                              {item}
                            </Text>
                            <Pressable
                              onPress={() => handleRemoveStep(item)}
                              className="h-6 w-6 items-center justify-center rounded-full bg-[#f5ebe0]"
                            >
                              <MaterialCommunityIcons
                                name="close"
                                size={12}
                                color={mutedTextColor}
                              />
                            </Pressable>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              ) : null}

              {step === 4 ? (
                <View className="gap-4">
                  <View className="rounded-2xl border border-[#e8dfd4] bg-[#fdf8f3] p-3">
                    <Text className="text-xs font-semibold text-[#8b7355]">
                      Resumen
                    </Text>
                    <Text className="mt-1 text-sm font-bold text-[#5c4a3d]">
                      {recipeName || "Receta sin nombre"}
                    </Text>
                    <Text className="text-xs text-[#8b7355]">
                      {category} • {timeMinutes} min • {servings} porciones •{" "}
                      {difficultyLabel}
                    </Text>
                  </View>

                  <View className="rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] p-3">
                    <Text className="text-xs font-semibold text-[#8b7355]">
                      Ingredientes
                    </Text>
                    <Text className="mt-1 text-sm text-[#5c4a3d]">
                      {ingredients.length} item(s)
                    </Text>
                  </View>

                  <View className="rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] p-3">
                    <Text className="text-xs font-semibold text-[#8b7355]">
                      Pasos
                    </Text>
                    <Text className="mt-1 text-sm text-[#5c4a3d]">
                      {stepsList.length} paso(s)
                    </Text>
                  </View>
                </View>
              ) : null}

              {submitError ? (
                <Text className="mt-2 text-xs text-[#d4684c]">
                  {submitError}
                </Text>
              ) : null}

              <View className="mt-6 flex-row gap-3">
                {step > 0 ? (
                  <Pressable
                    onPress={handleBack}
                    disabled={isSubmitting}
                    className="flex-1 items-center rounded-xl border-2 border-[#e8dfd4] bg-white py-3"
                  >
                    <Text className="font-bold text-[#8b7355]">Atras</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={step === steps.length - 1 ? handleSave : handleNext}
                  disabled={isSubmitting}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    canAdvance ? "bg-[#7cb69d]" : "bg-[#e8dfd4]"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      canAdvance ? "text-white" : "text-[#8b7355]"
                    }`}
                  >
                    {step === steps.length - 1
                      ? isSubmitting
                        ? "Guardando..."
                        : "Guardar receta"
                      : "Siguiente"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

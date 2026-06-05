import { AppHeader } from "@/components/dashboard";
import basketData from "@/data/basket.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { authService } from "@/services";

const steps = [
  "Detalles",
  "Informacion",
  "Imagen",
  "Ingredientes",
  "Pasos",
  "Notas",
  "Resumen",
];

interface Ingredient {
  nombre: string;
  cantidad: string;
}

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
  const { getRecipeById, getDetailsById, updateRecipe, updateDetails } =
    useRecipes();

  const mutedTextColor = "#8b7355";
  const placeholderColor = "#8b7355";
  const [step, setStep] = useState(0);
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(basketData.categories[0]);
  const [timeMinutes, setTimeMinutes] = useState(basketData.times[0]);
  const [servings, setServings] = useState(basketData.servings[0]);
  const [difficulty, setDifficulty] = useState(basketData.difficulties[0].id);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [remoteImageUrl, setRemoteImageUrl] = useState("");

  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientQuantityInput, setIngredientQuantityInput] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [stepInput, setStepInput] = useState("");
  const [stepsList, setStepsList] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesList, setNotesList] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saved, setSaved] = useState(false);

  const resetForm = useCallback(() => {
    setRecipeName("");
    setDescription("");
    setCategory(basketData.categories[0]);
    setTimeMinutes(basketData.times[0]);
    setServings(basketData.servings[0]);
    setDifficulty(basketData.difficulties[0].id);
    setImageUri(null);
    setRemoteImageUrl("");
    setUploading(false);
    setIngredientInput("");
    setIngredientQuantityInput("");
    setIngredients([]);
    setStepInput("");
    setStepsList([]);
    setNoteInput("");
    setNotesList([]);
    setSaved(false);
    setShowErrors(false);
    setStep(0);
  }, []);

  useFocusEffect(
    ...[
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
            router.push("/mis-recetas");
          }
        };
      }, [editId, editKey, ignoreEditId, isEditing, resetForm]),
    ],
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

    if (recipe.imageUrl) {
      setRemoteImageUrl(recipe.imageUrl);
    }

    const ingredientesEstructurados = details.ingredients.map(
      (ingrediente: any) => {
        if (
          ingrediente &&
          typeof ingrediente === "object" &&
          "nombre" in ingrediente
        ) {
          return ingrediente as Ingredient;
        }
        return {
          nombre: ingrediente,
          cantidad: "1 ud.",
        };
      },
    );

    setIngredients(ingredientesEstructurados);

    setStepsList(details.steps);
    setNotesList(details.tips);
    setIngredientInput("");
    setIngredientQuantityInput("");
    setStepInput("");
    setNoteInput("");
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
      handleUploadImage(selectedUri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "imagen.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formattedUri =
        Platform.OS === "android" && !uri.startsWith("file://")
          ? `file://${uri}`
          : uri;

      formData.append("file", {
        uri: formattedUri,
        name: filename,
        type,
      } as any);

      const token = await authService.getToken();

      const response = await fetch("http://192.168.1.101:8080/recetas/imagen", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      if (data.secure_url) {
        setRemoteImageUrl(data.secure_url);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    } finally {
      setUploading(false);
    }
  };

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
      return remoteImageUrl.length > 0;
    }
    if (step === 3) {
      return ingredients.length > 0;
    }
    if (step === 4) {
      return stepsList.length > 0;
    }
    return true;
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
    remoteImageUrl,
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
    const nameTrimmed = ingredientInput.trim();
    const qtyTrimmed = ingredientQuantityInput.trim();

    if (!nameTrimmed || !qtyTrimmed) return;

    if (
      ingredients.some(
        (item) => item.nombre.toLowerCase() === nameTrimmed.toLowerCase(),
      )
    ) {
      setIngredientInput("");
      setIngredientQuantityInput("");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      { nombre: nameTrimmed, cantidad: qtyTrimmed },
    ]);
    setIngredientInput("");
    setIngredientQuantityInput("");
  };

  const handleRemoveIngredient = (nombre: string) => {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient.nombre !== nombre),
    );
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

  const handleAddNote = () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    setNotesList((prev) => [...prev, trimmed]);
    setNoteInput("");
  };

  const handleRemoveNote = (item: string) => {
    setNotesList((prev) => prev.filter((note) => note !== item));
  };

  const handleSave = () => {
    if (!canAdvance) {
      setShowErrors(true);
      return;
    }

    if (isEditing) {
      updateRecipe(effectiveEditId!, {
        title: recipeName.trim(),
        category,
        timeMinutes,
        difficulty: difficultyLabel,
        isSaved: true,
        imageUrl: remoteImageUrl,
      });

      updateDetails(effectiveEditId!, {
        servings,
        ingredients,
        steps: stepsList,
        tips: notesList,
      });
    }

    setSaved(true);
  };

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View className="px-4 pt-4">
          <Text className="text-xl text-center font-bold text-[#5c4a3d]">
            {isEditing ? "Editar" : "Crear"}
          </Text>
          <Text className="text-sm text-center text-[#8b7355] mt-1">
            Comparte tu receta con la comunidad
          </Text>
        </View>

        <View className="px-4 mt-5 w-full">
          <View className="w-full rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#7cb69d] flex-shrink-0">
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={20}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-bold text-[#5c4a3d]"
                    numberOfLines={1}
                  >
                    {isEditing ? `Editar: ${recipeName}` : "Crear Receta"}
                  </Text>
                  <Text className="text-xs text-[#8b7355]">
                    Paso {step + 1} de {steps.length}
                  </Text>
                </View>
              </View>
              <View className="rounded-full bg-[#f5ebe0] px-3 py-1 flex-shrink-0">
                <Text className="text-xs font-semibold text-[#8b7355]">
                  {steps[step]}
                </Text>
              </View>
            </View>

            <View className="mb-5 flex-row gap-1 w-full">
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
              <View className="w-full rounded-2xl border border-[#cfe4d9] bg-[#f0f7f3] p-4">
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
                    : "Tu receta se guardó correctamente."}
                </Text>
                <Pressable
                  onPress={() => {
                    if (isEditing) {
                      lastEditKeyRef.current =
                        typeof editKey === "string" ? editKey : undefined;
                      setIgnoreEditId(true);
                      resetForm();
                      router.push("/mis-recetas");
                    } else {
                      resetForm();
                    }
                  }}
                  className="mt-6 items-center rounded-xl bg-[#7cb69d] py-3 w-full"
                >
                  <Text className="font-bold text-white">
                    {isEditing ? "Volver al menú" : "Crear otra receta"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="w-full min-h-[340px] justify-between">
                {/* Bloque del contenido dinámico superior */}
                <View className="w-full flex-1">
                  {/* PASO 1: DETALLES */}
                  {step === 0 && (
                    <View className="w-full gap-4">
                      <View className="w-full">
                        <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                          Nombre
                        </Text>
                        <TextInput
                          value={recipeName}
                          onChangeText={setRecipeName}
                          placeholder="Ej: Tarta de Manzana"
                          placeholderTextColor={placeholderColor}
                          className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                        />
                      </View>
                      <View className="w-full">
                        <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                          Descripción
                        </Text>
                        <TextInput
                          value={description}
                          onChangeText={setDescription}
                          placeholder="Describe tu receta..."
                          placeholderTextColor={placeholderColor}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d] h-24"
                        />
                      </View>
                      <View className="w-full">
                        <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                          Categoría
                        </Text>
                        <View className="flex-row flex-wrap gap-2 w-full">
                          {basketData.categories.map((item) => (
                            <Pressable
                              key={item}
                              onPress={() => setCategory(item)}
                              className={`rounded-xl px-4 py-2 ${category === item ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"}`}
                            >
                              <Text
                                className={`text-sm font-semibold ${category === item ? "text-white" : "text-[#5c4a3d]"}`}
                              >
                                {item}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* PASO 2: INFORMACIÓN */}
                  {step === 1 && (
                    <View className="w-full gap-4">
                      <View className="w-full">
                        <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                          Tiempo estimado
                        </Text>
                        <View className="flex-row flex-wrap gap-2 w-full">
                          {basketData.times.map((item) => (
                            <Pressable
                              key={`time-${item}`}
                              onPress={() => setTimeMinutes(item)}
                              className={`rounded-xl px-4 py-2 ${timeMinutes === item ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"}`}
                            >
                              <Text
                                className={`text-sm font-semibold ${timeMinutes === item ? "text-white" : "text-[#5c4a3d]"}`}
                              >
                                {item} min
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                      <View className="w-full">
                        <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                          Dificultad
                        </Text>
                        <View className="flex-row flex-wrap gap-2 w-full">
                          {basketData.difficulties.map((item) => (
                            <Pressable
                              key={item.id}
                              onPress={() => setDifficulty(item.id)}
                              className={`rounded-xl px-4 py-2 ${difficulty === item.id ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"}`}
                            >
                              <Text
                                className={`text-sm font-semibold ${difficulty === item.id ? "text-white" : "text-[#5c4a3d]"}`}
                              >
                                {item.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* PASO 3: IMAGEN */}
                  {step === 2 && (
                    <View className="w-full gap-3">
                      <Text className="text-sm font-bold text-[#5c4a3d]">
                        Imagen de la receta
                      </Text>
                      <View className="w-full items-center justify-center">
                        <Pressable
                          onPress={pickImage}
                          disabled={uploading}
                          className="h-44 w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#e8dfd4] bg-[#fdf8f3] overflow-hidden"
                        >
                          {remoteImageUrl ? (
                            <Image
                              source={{ uri: remoteImageUrl }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : uploading ? (
                            <View className="items-center px-4">
                              <ActivityIndicator color="#7cb69d" size="large" />
                              <Text className="text-xs text-[#8b7355] mt-2 text-center">
                                Subiendo a Cloudinary...
                              </Text>
                            </View>
                          ) : (
                            <View className="items-center">
                              <MaterialCommunityIcons
                                name="camera-plus"
                                size={36}
                                color="#8b7355"
                              />
                              <Text className="text-xs text-[#8b7355] mt-2 font-semibold">
                                Toca para seleccionar foto
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      </View>

                      {remoteImageUrl && !uploading && (
                        <Pressable
                          onPress={() => {
                            setRemoteImageUrl("");
                            setImageUri(null);
                          }}
                        >
                          <Text className="text-center text-xs text-red-500 font-bold mt-1">
                            Eliminar y cambiar foto
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* PASO 4: INGREDIENTES */}
                  {step === 3 && (
                    <View className="w-full gap-3">
                      <Text className="text-sm font-bold text-[#5c4a3d]">
                        Agrega ingredientes
                      </Text>

                      <View className="flex-row w-full gap-2">
                        <View className="flex-1">
                          <TextInput
                            value={ingredientQuantityInput}
                            onChangeText={setIngredientQuantityInput}
                            placeholder="Cant. (200 g)"
                            placeholderTextColor={placeholderColor}
                            className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-3 py-2.5 text-[#5c4a3d]"
                          />
                        </View>
                        <View className="flex-[2]">
                          <TextInput
                            value={ingredientInput}
                            onChangeText={setIngredientInput}
                            placeholder="Ingrediente (Harina)"
                            placeholderTextColor={placeholderColor}
                            className="w-full rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-3 py-2.5 text-[#5c4a3d]"
                          />
                        </View>
                      </View>

                      <Pressable
                        onPress={handleAddIngredient}
                        className="h-11 w-full items-center justify-center rounded-xl bg-[#7cb69d]"
                      >
                        <Text className="font-bold text-white text-sm">
                          Añadir a la lista
                        </Text>
                      </Pressable>

                      {ingredients.length > 0 && (
                        <View className="w-full rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3 max-h-40 overflow-hidden mt-5">
                          <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={true}
                          >
                            {ingredients.map((item, index) => (
                              <View
                                key={`${item.nombre}-${index}`}
                                className="flex-row items-center justify-between py-2 border-b border-[#f5ebe0] last:border-0 pr-4"
                              >
                                <View className="flex-row items-center flex-1 pr-3">
                                  <View className="h-2 w-2 rounded-full bg-[#7cb69d] mr-2 flex-shrink-0" />
                                  <Text
                                    className="text-sm text-[#5c4a3d] flex-1"
                                    numberOfLines={1}
                                  >
                                    <Text className="font-bold">
                                      {item.cantidad}
                                    </Text>{" "}
                                    de {item.nombre}
                                  </Text>
                                </View>
                                <Pressable
                                  onPress={() =>
                                    handleRemoveIngredient(item.nombre)
                                  }
                                  className="h-7 w-7 items-center justify-center rounded-full bg-[#f5ebe0] flex-shrink-0"
                                >
                                  <MaterialCommunityIcons
                                    name="close"
                                    size={13}
                                    color={mutedTextColor}
                                  />
                                </Pressable>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}

                  {/* PASO 5: PASOS */}
                  {step === 4 && (
                    <View className="w-full gap-3">
                      <Text className="text-sm font-bold text-[#5c4a3d]">
                        Pasos de preparación
                      </Text>
                      <View className="flex-row gap-2 w-full items-center">
                        <TextInput
                          value={stepInput}
                          onChangeText={setStepInput}
                          placeholder="Ej: Mezcla todo..."
                          placeholderTextColor={placeholderColor}
                          className="flex-1 rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-2.5 text-[#5c4a3d]"
                        />
                        <Pressable
                          onPress={handleAddStep}
                          className="h-11 w-11 items-center justify-center rounded-xl bg-[#7cb69d]"
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={20}
                            color="#fff"
                          />
                        </Pressable>
                      </View>

                      {stepsList.length > 0 && (
                        <View className="w-full rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3 max-h-44 overflow-hidden mt-5">
                          <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={true}
                          >
                            {stepsList.map((item, index) => (
                              <View
                                key={index}
                                className="flex-row items-start justify-between py-2.5 border-b border-[#f5ebe0] last:border-0 pr-4"
                              >
                                <Text className="text-xs font-bold text-[#7cb69d] mt-0.5 mr-2 flex-shrink-0">
                                  {index + 1}
                                </Text>
                                <Text
                                  className="flex-1 text-sm text-[#5c4a3d] pr-3"
                                  numberOfLines={2}
                                >
                                  {item}
                                </Text>
                                <Pressable
                                  onPress={() => handleRemoveStep(item)}
                                  className="h-7 w-7 items-center justify-center rounded-full bg-[#f5ebe0] flex-shrink-0"
                                >
                                  <MaterialCommunityIcons
                                    name="close"
                                    size={13}
                                    color={mutedTextColor}
                                  />
                                </Pressable>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}

                  {/* PASO 6: NOTAS */}
                  {step === 5 && (
                    <View className="w-full gap-3">
                      <Text className="text-sm font-bold text-[#5c4a3d]">
                        Notas extra (opcional)
                      </Text>
                      <View className="flex-row gap-2 w-full items-center">
                        <TextInput
                          value={noteInput}
                          onChangeText={setNoteInput}
                          placeholder="Ej: Servir frío..."
                          placeholderTextColor={placeholderColor}
                          className="flex-1 rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-2.5 text-[#5c4a3d]"
                        />
                        <Pressable
                          onPress={handleAddNote}
                          className="h-11 w-11 items-center justify-center rounded-xl bg-[#7cb69d]"
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={20}
                            color="#fff"
                          />
                        </Pressable>
                      </View>

                      {notesList.length > 0 && (
                        <View className="w-full rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3 max-h-40 overflow-hidden mt-5">
                          <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={true}
                          >
                            {notesList.map((item, index) => (
                              <View
                                key={index}
                                className="flex-row items-center justify-between py-2 border-b border-[#f5ebe0] last:border-0 pr-4"
                              >
                                <View className="flex-row items-center flex-1 pr-3">
                                  <View className="h-2 w-2 rounded-full bg-[#f9d77e] mr-2 flex-shrink-0" />
                                  <Text
                                    className="text-sm text-[#5c4a3d] flex-1"
                                    numberOfLines={1}
                                  >
                                    {item}
                                  </Text>
                                </View>
                                <Pressable
                                  onPress={() => handleRemoveNote(item)}
                                  className="h-7 w-7 items-center justify-center rounded-full bg-[#f5ebe0] flex-shrink-0"
                                >
                                  <MaterialCommunityIcons
                                    name="close"
                                    size={13}
                                    color={mutedTextColor}
                                  />
                                </Pressable>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}

                  {/* PASO 7: RESUMEN */}
                  {step === 6 && (
                    <View className="w-full gap-3">
                      <View className="w-full rounded-2xl border border-[#e8dfd4] bg-[#fdf8f3] p-3 flex-row gap-3 items-center">
                        {remoteImageUrl ? (
                          <Image
                            source={{ uri: remoteImageUrl }}
                            className="w-14 h-14 rounded-xl flex-shrink-0"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-14 h-14 rounded-xl bg-[#e8dfd4] items-center justify-center flex-shrink-0">
                            <MaterialCommunityIcons
                              name="image-off"
                              size={20}
                              color="#8b7355"
                            />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#8b7355]">
                            Resumen Final
                          </Text>
                          <Text
                            className="text-base font-bold text-[#5c4a3d] mt-0.5"
                            numberOfLines={1}
                          >
                            {recipeName || "Sin nombre"}
                          </Text>
                          <Text
                            className="text-xs text-[#8b7355] mt-0.5"
                            numberOfLines={1}
                          >
                            {category} • {timeMinutes} min • {difficultyLabel}
                          </Text>
                        </View>
                      </View>

                      <View className="w-full rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] p-3 mt-1">
                        <Text className="text-xs font-semibold text-[#8b7355]">
                          Ingredientes
                        </Text>
                        <Text className="mt-1 text-sm font-bold text-[#5c4a3d]">
                          {ingredients.length}{" "}
                          {ingredients.length === 1
                            ? "ítem agregado"
                            : "ítems agregados"}
                        </Text>
                      </View>

                      <View className="w-full rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] p-3">
                        <Text className="text-xs font-semibold text-[#8b7355]">
                          Pasos
                        </Text>
                        <Text className="mt-1 text-sm font-bold text-[#5c4a3d]">
                          {stepsList.length}{" "}
                          {stepsList.length === 1
                            ? "paso detallado"
                            : "pasos detallados"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* CONTENEDOR DE BOTONES GLOBAL - Asegura un margen estricto e inamovible */}
                <View className="mt-8 pt-2 flex-row gap-3 w-full border-t border-transparent">
                  {step > 0 && (
                    <Pressable
                      onPress={handleBack}
                      className="flex-1 items-center justify-center rounded-xl border-2 border-[#e8dfd4] bg-white h-12"
                    >
                      <Text className="font-bold text-[#8b7355]">Atrás</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={
                      step === steps.length - 1 ? handleSave : handleNext
                    }
                    className={`flex-1 items-center justify-center rounded-xl h-12 ${
                      canAdvance ? "bg-[#7cb69d]" : "bg-[#e8dfd4]"
                    }`}
                  >
                    <Text
                      className={`font-bold ${canAdvance ? "text-white" : "text-[#8b7355]"}`}
                    >
                      {step === steps.length - 1
                        ? "Guardar receta"
                        : "Siguiente"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

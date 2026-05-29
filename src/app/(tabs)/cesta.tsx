import { AppHeader } from "@/components/dashboard";
import basketData from "@/data/basket.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const steps = [
  "Detalles",
  "Informacion",
  "Ingredientes",
  "Pasos",
  "Notas",
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
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
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
    setIngredientInput("");
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
    setIngredients(details.ingredients);
    setStepsList(details.steps);
    setNotesList(details.tips);
    setIngredientInput("");
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
    if (step === 5) {
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
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;
    if (
      ingredients.some((item) => item.toLowerCase() === trimmed.toLowerCase())
    ) {
      setIngredientInput("");
      return;
    }
    setIngredients((prev) => [...prev, trimmed]);
    setIngredientInput("");
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((ingredient) => ingredient !== item));
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
          ingredients,
          steps: stepsList,
          tips: notesList,
        });
      }
    }

    setSaved(true);
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
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
                <View className="gap-4">
                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Agrega ingredientes
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        value={ingredientInput}
                        onChangeText={setIngredientInput}
                        placeholder="Ej: 2 manzanas"
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

                  <View className="rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3">
                    <ScrollView
                      style={{ maxHeight: 140 }}
                      contentContainerStyle={{ gap: 10, paddingRight: 6 }}
                      showsVerticalScrollIndicator
                      indicatorStyle="black"
                      nestedScrollEnabled
                    >
                      {ingredients.map((item, index) => (
                        <View
                          key={`${item}-${index}`}
                          className="flex-row items-center gap-3"
                        >
                          <View className="h-2 w-2 rounded-full bg-[#7cb69d]" />
                          <Text className="flex-1 text-sm text-[#5c4a3d]">
                            {item}
                          </Text>
                          <Pressable
                            onPress={() => handleRemoveIngredient(item)}
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
                  <View>
                    <Text className="mb-2 text-sm font-bold text-[#5c4a3d]">
                      Notas extra (opcional)
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        value={noteInput}
                        onChangeText={setNoteInput}
                        placeholder="Ej: tips para servir"
                        placeholderTextColor={placeholderColor}
                        className="flex-1 rounded-xl border-2 border-[#e8dfd4] bg-[#fdf8f3] px-4 py-3 text-[#5c4a3d]"
                      />
                      <Pressable
                        onPress={handleAddNote}
                        className="h-12 w-12 items-center justify-center rounded-xl bg-[#7cb69d]"
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={18}
                          color="#fff"
                        />
                      </Pressable>
                    </View>
                    <View className="mt-3 rounded-2xl border-2 border-[#e8dfd4] bg-[#fdf8f3] p-3">
                      <ScrollView
                        style={{ maxHeight: 140 }}
                        contentContainerStyle={{ gap: 10, paddingRight: 6 }}
                        showsVerticalScrollIndicator
                        indicatorStyle="black"
                        nestedScrollEnabled
                      >
                        {notesList.map((item, index) => (
                          <View
                            key={`${item}-${index}`}
                            className="flex-row items-center gap-3"
                          >
                            <View className="h-2 w-2 rounded-full bg-[#f9d77e]" />
                            <Text className="flex-1 text-sm text-[#5c4a3d]">
                              {item}
                            </Text>
                            <Pressable
                              onPress={() => handleRemoveNote(item)}
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

              {step === 5 ? (
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

                  <View className="rounded-2xl border border-[#e8dfd4] bg-[#fff9f0] p-3">
                    <Text className="text-xs font-semibold text-[#8b7355]">
                      Notas extra
                    </Text>
                    <Text className="mt-1 text-sm text-[#5c4a3d]">
                      {notesList.length > 0
                        ? `${notesList.length} nota(s)`
                        : "Sin notas"}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View className="mt-6 flex-row gap-3">
                {step > 0 ? (
                  <Pressable
                    onPress={handleBack}
                    className="flex-1 items-center rounded-xl border-2 border-[#e8dfd4] bg-white py-3"
                  >
                    <Text className="font-bold text-[#8b7355]">Atras</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={step === steps.length - 1 ? handleSave : handleNext}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    canAdvance ? "bg-[#7cb69d]" : "bg-[#e8dfd4]"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      canAdvance ? "text-white" : "text-[#8b7355]"
                    }`}
                  >
                    {step === steps.length - 1 ? "Guardar receta" : "Siguiente"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

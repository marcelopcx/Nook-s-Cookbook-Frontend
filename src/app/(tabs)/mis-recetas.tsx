import {
  AppHeader,
  CategoryTab,
  RecipeCard,
  SearchBar,
  SectionTitle,
} from "@/components/dashboard";
import { KeyboardAwareModal, KeyboardAwareScrollView } from "@/components";
import categoriesData from "@/data/categories.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MisRecetasScreen() {
  const router = useRouter();
  const {
    recipes,
    groups,
    myRecipeIds,
    isLoading,
    createGroup,
  } = useRecipes();
  const [search, setSearch] = useState("");
  const [selectedTabId, setSelectedTabId] = useState(
    categoriesData.tabs.find((t) => t.id === "Todo")?.id ??
      categoriesData.tabs[0]?.id ??
      "Todo",
  );

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupSaving, setGroupSaving] = useState(false);

  const handleOpenRecipe = (id: string) => {
    router.push({
      pathname: "/receta/[id]",
      params: { id, source: "mis-recetas" },
    });
  };

  const handleOpenGroup = (id: string) => {
    router.push({ pathname: "/grupo/[id]", params: { id } } as unknown as Href);
  };

  const myRecipes = useMemo(() => {
    return recipes.filter((recipe) => myRecipeIds.has(recipe.id));
  }, [recipes, myRecipeIds]);

  const savedRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return myRecipes.filter((recipe) => {
      const matchesTab = (() => {
        if (selectedTabId === "Todo") return true;
        if (selectedTabId === "favoritos") return recipe.isFavorite;

        return recipe.category.toLowerCase() === selectedTabId.toLowerCase();
      })();

      if (!matchesTab) return false;
      if (query.length === 0) return true;

      return recipe.title.toLowerCase().includes(query);
    });
  }, [myRecipes, selectedTabId, search]);

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id],
    );
  };

  const resetGroupModal = () => {
    setNewGroupName("");
    setNewGroupDescription("");
    setSelectedRecipeIds([]);
    setGroupError(null);
    setShowGroupModal(false);
  };

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) {
      setGroupError("Escribe un nombre para el grupo.");
      return;
    }

    if (selectedRecipeIds.length === 0) {
      setGroupError("Selecciona al menos una receta.");
      return;
    }

    setGroupSaving(true);
    try {
      await createGroup(name, selectedRecipeIds, newGroupDescription.trim() || undefined);
      resetGroupModal();
    } catch (error) {
      setGroupError(
        error instanceof Error ? error.message : "No se pudo crear el grupo",
      );
    } finally {
      setGroupSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <View className="mb-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color="#7cb69d" />
          </View>
        ) : null}

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

        <View className="px-4">
          <View className="mb-3 flex-row items-baseline justify-between">
            <Text className="text-sm font-bold uppercase tracking-wider text-[#8b7355]">
              Grupos
            </Text>
            <Pressable
              onPress={() => {
                setGroupError(null);
                setShowGroupModal(true);
              }}
              className="flex-row items-center justify-center rounded-xl bg-[#7cb69d] px-2.5 py-1.5 active:bg-[#6aa48b]"
            >
              <MaterialCommunityIcons name="plus" size={16} color="#ffffff" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            className="mb-5"
          >
            {groups.length === 0 ? (
              <View className="w-auto rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] px-3 py-2">
                <Text className="text-[13px] font-semibold text-[#5c4a3d]">
                  Aún no tienes grupos
                </Text>
                <Text className="text-xs text-[#8b7355]">
                  Crea uno para organizar tus recetas.
                </Text>
              </View>
            ) : null}

            {groups.map((group) => (
              <Pressable
                key={group.id}
                onPress={() => handleOpenGroup(group.id)}
                className="mr-3 w-44 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] px-3 py-2"
              >
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-xl bg-[#f4efe6]">
                    <MaterialCommunityIcons
                      name="folder"
                      size={14}
                      color="#8b7355"
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-[13px] font-bold text-[#5c4a3d]"
                    >
                      {group.name}
                    </Text>
                    <Text className="text-[10px] text-[#8b7355]">
                      {group.numRecetas} recetas • {group.numSeguidores} seguidores
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
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

        {!isLoading && savedRecipes.length === 0 ? (
          <View className="mx-4 mt-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
            <Text className="text-sm font-semibold text-[#5c4a3d]">
              No tienes recetas creadas
            </Text>
            <Text className="mt-1 text-xs text-[#8b7355]">
              Usa la pestaña Cesta para crear tu primera receta.
            </Text>
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <KeyboardAwareModal
        visible={showGroupModal}
        onRequestClose={resetGroupModal}
      >
            <View className="mb-3">
              <Text className="text-base font-bold text-[#5c4a3d]">
                Crear grupo
              </Text>
              <Text className="text-xs text-[#8b7355]">
                Elige un nombre y selecciona tus recetas.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Nombre del grupo
              </Text>
              <TextInput
                value={newGroupName}
                onChangeText={(text) => {
                  setNewGroupName(text);
                  if (groupError) setGroupError(null);
                }}
                placeholder="Ej: Cenas rápidas"
                placeholderTextColor="#b8a899"
                className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Descripción (opcional)
              </Text>
              <TextInput
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                placeholder="Describe tu grupo..."
                placeholderTextColor="#b8a899"
                className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
              />
            </View>

            <View className="mb-2">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Recetas
              </Text>
              <View className="max-h-64 rounded-2xl border-2 border-[#e8dfd4] bg-white">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {myRecipes.length === 0 ? (
                    <View className="px-4 py-3">
                      <Text className="text-sm text-[#8b7355]">
                        No tienes recetas creadas.
                      </Text>
                    </View>
                  ) : null}

                  {myRecipes.map((recipe, index) => {
                    const selected = selectedRecipeIds.includes(recipe.id);
                    return (
                      <View key={recipe.id}>
                        <Pressable
                          onPress={() => {
                            if (groupError) setGroupError(null);
                            toggleRecipeSelection(recipe.id);
                          }}
                          className="flex-row items-center justify-between px-4 py-3"
                        >
                          <Text
                            numberOfLines={1}
                            className="flex-1 pr-3 text-sm font-semibold text-[#5c4a3d]"
                          >
                            {recipe.title}
                          </Text>
                          <MaterialCommunityIcons
                            name={
                              selected
                                ? "check-circle"
                                : "checkbox-blank-circle-outline"
                            }
                            size={18}
                            color={selected ? "#7ec8a3" : "#c9b9a6"}
                          />
                        </Pressable>
                        {index < myRecipes.length - 1 ? (
                          <View className="mx-4 h-[1px] bg-[#efe6db]" />
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {groupError ? (
              <Text className="mt-3 text-xs font-semibold text-[#c15757]">
                {groupError}
              </Text>
            ) : null}

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={resetGroupModal}
                className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2"
              >
                <Text className="text-sm font-bold text-[#8b7355]">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleCreateGroup()}
                disabled={groupSaving}
                className="flex-1 items-center rounded-2xl bg-[#7ec8a3] py-2"
              >
                <Text className="text-sm font-bold text-white">
                  {groupSaving ? "Creando..." : "Crear"}
                </Text>
              </Pressable>
            </View>
      </KeyboardAwareModal>
    </View>
  );
}

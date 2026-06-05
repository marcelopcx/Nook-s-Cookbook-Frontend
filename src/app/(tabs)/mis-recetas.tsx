import {
  AppHeader,
  CategoryTab,
  RecipeCard,
  SearchBar,
  SectionTitle,
} from "@/components/dashboard";
import categoriesData from "@/data/categories.json";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Recipe = {
  id: string;
  title: string;
  category: string;
  rating: number;
  timeMinutes: number;
  imageUrl: string;
  isSaved: boolean;
  isFavorite: boolean;
};

export default function MisRecetasScreen() {
  const router = useRouter();
  const { recipes, groups, createGroup } = useRecipes();
  const [search, setSearch] = useState("");
  const [selectedTabId, setSelectedTabId] = useState(
    categoriesData.tabs.find((t) => t.id === "Todo")?.id ??
      categoriesData.tabs[0]?.id ??
      "Todo",
  );

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);

  const handleOpenRecipe = (id: string) => {
    router.push({
      pathname: "/receta/[id]",
      params: { id, source: "mis-recetas" },
    });
  };

  const handleOpenGroup = (id: string) => {
    router.push({
      pathname: "/grupo/[id]",
      params: { id },
    });
  };

  const allSavedRecipes = useMemo(() => {
    return (recipes as Recipe[]).filter((recipe) => recipe.isSaved);
  }, [recipes]);

  const savedRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allSaved = allSavedRecipes;

    return allSaved.filter((recipe) => {
      const matchesTab = (() => {
        if (selectedTabId === "Todo") return true;
        if (selectedTabId === "favoritos") return recipe.isFavorite;

        return recipe.category.toLowerCase() === selectedTabId.toLowerCase();
      })();

      if (!matchesTab) return false;
      if (query.length === 0) return true;

      return recipe.title.toLowerCase().includes(query);
    });
  }, [allSavedRecipes, selectedTabId, search]);

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id],
    );
  };

  const resetGroupModal = () => {
    setNewGroupName("");
    setSelectedRecipeIds([]);
    setGroupError(null);
    setShowGroupModal(false);
  };

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) {
      setGroupError("Escribe un nombre para el grupo.");
      return;
    }

    if (selectedRecipeIds.length === 0) {
      setGroupError("Selecciona al menos una receta.");
      return;
    }

    createGroup(name, selectedRecipeIds);
    resetGroupModal();
  };

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
                className="mr-3 w-40 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] px-3 py-2"
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
                      {group.recipeIds.length} recetas
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
      </ScrollView>

      <Modal
        visible={showGroupModal}
        transparent
        animationType="fade"
        onRequestClose={resetGroupModal}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <Pressable className="absolute inset-0" onPress={resetGroupModal} />

          <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
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

            <View className="mb-2">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Recetas
              </Text>
              <View className="max-h-64 rounded-2xl border-2 border-[#e8dfd4] bg-white">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {allSavedRecipes.length === 0 ? (
                    <View className="px-4 py-3">
                      <Text className="text-sm text-[#8b7355]">
                        No tienes recetas guardadas.
                      </Text>
                    </View>
                  ) : null}

                  {allSavedRecipes.map((recipe, index) => {
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
                        {index < allSavedRecipes.length - 1 ? (
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
                onPress={handleCreateGroup}
                className="flex-1 items-center rounded-2xl bg-[#7ec8a3] py-2"
              >
                <Text className="text-sm font-bold text-white">Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

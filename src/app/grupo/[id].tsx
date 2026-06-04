import { RecipeCard, SectionTitle } from "@/components/dashboard";
import { useRecipes } from "@/providers/RecipesProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function GrupoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, groups, updateGroup, deleteGroup } = useRecipes();

  const group = useMemo(() => {
    if (!id) return undefined;
    return groups.find((g) => g.id === id);
  }, [groups, id]);

  const allSavedRecipes = useMemo(() => {
    return (recipes as Recipe[]).filter((recipe) => recipe.isSaved);
  }, [recipes]);

  const groupRecipes = useMemo(() => {
    if (!group) return [] as Recipe[];
    const byId = new Map((recipes as Recipe[]).map((r) => [r.id, r] as const));
    return group.recipeIds
      .map((rid) => byId.get(rid))
      .filter(Boolean) as Recipe[];
  }, [group, recipes]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editName, setEditName] = useState("");
  const [editRecipeIds, setEditRecipeIds] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = () => {
    if (!group) return;
    setEditName(group.name);
    setEditRecipeIds(group.recipeIds);
    setEditError(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError(null);
  };

  const toggleEditRecipe = (recipeId: string) => {
    setEditRecipeIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId],
    );
  };

  const handleSaveGroup = () => {
    if (!group) return;

    const name = editName.trim();
    if (!name) {
      setEditError("Escribe un nombre para el grupo.");
      return;
    }

    if (editRecipeIds.length === 0) {
      setEditError("Selecciona al menos una receta.");
      return;
    }

    updateGroup(group.id, { name, recipeIds: editRecipeIds });
    closeEditModal();
  };

  const handleOpenRecipe = (recipeId: string) => {
    router.push({
      pathname: "/receta/[id]",
      params: { id: recipeId, source: "mis-recetas" },
    });
  };

  if (!group) {
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
            Grupo no encontrado
          </Text>
          <Text className="mt-2 text-sm text-[#8b7355]">
            Regresa al listado de grupos.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-14">
          <View className="mb-4 flex-row items-center justify-between">
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

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={openEditModal}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#5c4a3d"
                />
              </Pressable>
              <Pressable
                onPress={() => setShowDeleteModal(true)}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={18}
                  color="#5c4a3d"
                />
              </Pressable>
            </View>
          </View>

          <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-xl font-extrabold text-[#5c4a3d]"
                >
                  {group.name}
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#8b7355]">
                  {group.recipeIds.length} recetas
                </Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#f4efe6]">
                <MaterialCommunityIcons
                  name="folder"
                  size={18}
                  color="#8b7355"
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <SectionTitle title="Recetas del grupo" />
          <View className="flex flex-row flex-wrap justify-between gap-y-4 px-4">
            {groupRecipes.map((recipe) => (
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

          {groupRecipes.length === 0 ? (
            <View className="px-4">
              <View className="mt-2 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
                <Text className="text-sm font-semibold text-[#5c4a3d]">
                  Este grupo está vacío
                </Text>
                <Text className="mt-1 text-xs text-[#8b7355]">
                  Edita el grupo para añadir recetas.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <Pressable className="absolute inset-0" onPress={closeEditModal} />
          <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
            <View className="mb-3">
              <Text className="text-base font-bold text-[#5c4a3d]">
                Editar grupo
              </Text>
              <Text className="text-xs text-[#8b7355]">
                Cambia el nombre y añade o quita recetas.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Nombre del grupo
              </Text>
              <TextInput
                value={editName}
                onChangeText={(text) => {
                  setEditName(text);
                  if (editError) setEditError(null);
                }}
                placeholder="Nombre del grupo"
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
                    const selected = editRecipeIds.includes(recipe.id);
                    return (
                      <View key={recipe.id}>
                        <Pressable
                          onPress={() => {
                            if (editError) setEditError(null);
                            toggleEditRecipe(recipe.id);
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

            {editError ? (
              <Text className="mt-3 text-xs font-semibold text-[#c15757]">
                {editError}
              </Text>
            ) : null}

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={closeEditModal}
                className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2"
              >
                <Text className="text-sm font-bold text-[#8b7355]">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveGroup}
                className="flex-1 items-center rounded-2xl bg-[#7ec8a3] py-2"
              >
                <Text className="text-sm font-bold text-white">Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
            <View className="mb-3">
              <Text className="text-base font-bold text-[#5c4a3d]">
                Eliminar grupo
              </Text>
              <Text className="text-xs text-[#8b7355]">
                Se eliminarán también todas las recetas dentro de este grupo.
              </Text>
            </View>

            <Text className="text-sm text-[#5c4a3d]">
              ¿Seguro que deseas eliminar el grupo “{group.name}”?
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
                  deleteGroup(group.id);
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

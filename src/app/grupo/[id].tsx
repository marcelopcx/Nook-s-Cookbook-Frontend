import { RecipeCard, SectionTitle } from "@/components/dashboard";
import { KeyboardAwareModal } from "@/components";
import { useAuth } from "@/providers/AuthProvider";
import { useRecipes } from "@/providers/RecipesProvider";
import * as groupsService from "@/services/groups";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function GrupoDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    recipes,
    myRecipeIds,
    fetchGroupDetail,
    fetchGroupRecipes,
    updateGroup,
    deleteGroup,
    followGroup,
    unfollowGroup,
  } = useRecipes();

  const [group, setGroup] = useState<ReturnType<typeof useRecipes>["groups"][0] | null>(null);
  const [groupRecipes, setGroupRecipes] = useState<typeof recipes>([]);
  const [followers, setFollowers] = useState<{ id: number; username: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRecipeIds, setEditRecipeIds] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const detail = await fetchGroupDetail(id);
      const recetas = await fetchGroupRecipes(id);
      const seguidores = await groupsService.listGroupFollowers(Number(id));
      setGroup(detail);
      setGroupRecipes(recetas);
      setFollowers(seguidores);
    } finally {
      setLoading(false);
    }
  }, [fetchGroupDetail, fetchGroupRecipes, id]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const myRecipes = useMemo(() => {
    return recipes.filter((recipe) => myRecipeIds.has(recipe.id));
  }, [recipes, myRecipeIds]);

  const isOwner = group && user?.id != null && group.creatorId === user.id;

  const openEditModal = () => {
    if (!group) return;
    setEditName(group.name);
    setEditDescription(group.description ?? "");
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
        ? prev.filter((rid) => rid !== recipeId)
        : [...prev, recipeId],
    );
  };

  const handleSaveGroup = async () => {
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

    setSaving(true);
    try {
      await updateGroup(group.id, {
        name,
        description: editDescription.trim() || null,
        recipeIds: editRecipeIds,
      });
      await loadGroup();
      closeEditModal();
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "No se pudo actualizar el grupo",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!group) return;
    if (group.sigue) {
      await unfollowGroup(group.id);
      setGroup({ ...group, sigue: false, numSeguidores: Math.max(0, group.numSeguidores - 1) });
    } else {
      await followGroup(group.id);
      setGroup({ ...group, sigue: true, numSeguidores: group.numSeguidores + 1 });
    }
  };

  const handleOpenRecipe = (recipeId: string) => {
    router.push({
      pathname: "/receta/[id]",
      params: { id: recipeId, source: "mis-recetas" },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fdf8f3]">
        <ActivityIndicator color="#7cb69d" size="large" />
      </View>
    );
  }

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
              {isOwner ? (
                <>
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
                </>
              ) : (
                <Pressable
                  onPress={() => void handleToggleFollow()}
                  className={`rounded-xl px-3 py-2 ${group.sigue ? "bg-[#f5ebe0]" : "bg-[#7cb69d]"}`}
                >
                  <Text
                    className={`text-xs font-bold ${group.sigue ? "text-[#8b7355]" : "text-white"}`}
                  >
                    {group.sigue ? "Siguiendo" : "Seguir"}
                  </Text>
                </Pressable>
              )}
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
                  por {group.creatorUsername}
                </Text>
                {group.description ? (
                  <Text className="mt-2 text-sm text-[#5c4a3d]">
                    {group.description}
                  </Text>
                ) : null}
                <Pressable onPress={() => setShowFollowersModal(true)}>
                  <Text className="mt-2 text-xs font-semibold text-[#7cb69d]">
                    {group.numSeguidores} seguidores • {group.numRecetas} recetas
                  </Text>
                </Pressable>
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
                  {isOwner
                    ? "Edita el grupo para añadir recetas."
                    : "Aún no hay recetas en este grupo."}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <KeyboardAwareModal
        visible={showFollowersModal}
        onRequestClose={() => setShowFollowersModal(false)}
      >
            <Text className="text-base font-bold text-[#5c4a3d] mb-3">
              Seguidores
            </Text>
            <ScrollView>
              {followers.length === 0 ? (
                <Text className="text-sm text-[#8b7355]">
                  Nadie sigue este grupo aún.
                </Text>
              ) : (
                followers.map((follower) => (
                  <Text
                    key={follower.id}
                    className="py-2 text-sm text-[#5c4a3d] border-b border-[#efe6db]"
                  >
                    {follower.username}
                  </Text>
                ))
              )}
            </ScrollView>
      </KeyboardAwareModal>

      <KeyboardAwareModal
        visible={showEditModal}
        onRequestClose={closeEditModal}
      >
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

            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                Descripción
              </Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Descripción del grupo"
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
                        {index < myRecipes.length - 1 ? (
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
                onPress={() => void handleSaveGroup()}
                disabled={saving}
                className="flex-1 items-center rounded-2xl bg-[#7ec8a3] py-2"
              >
                <Text className="text-sm font-bold text-white">
                  {saving ? "Guardando..." : "Guardar"}
                </Text>
              </Pressable>
            </View>
      </KeyboardAwareModal>

      <KeyboardAwareModal
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
            <View className="mb-3">
              <Text className="text-base font-bold text-[#5c4a3d]">
                Eliminar grupo
              </Text>
              <Text className="text-xs text-[#8b7355]">
                Se eliminará el grupo y sus asociaciones.
              </Text>
            </View>

            <Text className="text-sm text-[#5c4a3d]">
              ¿Seguro que deseas eliminar el grupo "{group.name}"?
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
                    await deleteGroup(group.id);
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

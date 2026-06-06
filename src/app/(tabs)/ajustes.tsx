import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppHeader, SectionTitle } from "@/components/dashboard";
import { KeyboardAwareModal } from "@/components";
import { useAchievements } from "@/providers/AchievementsProvider";
import { useAudioSettings } from "@/providers/AudioSettingsProvider";
import { useAuth } from "@/providers/AuthProvider";
import * as profileService from "@/services/profile";
import { scheduleCalabazaUnlock } from "@/services/pendingAchievementUnlock";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type SettingAction = {
  id: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
};

export default function AjustesScreen() {
  const router = useRouter();
  const { user, logout, loadProfile } = useAuth();
  const { musicEnabled, setMusicEnabled, sfxEnabled, setSfxEnabled } =
    useAudioSettings();
  const { tryClaimNinaTristeAchievement } = useAchievements();

  const [activeModal, setActiveModal] = useState<
    "profile" | "password" | "delete" | "logout" | null
  >(null);
  const [displayName, setDisplayName] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = user?.username ?? "";

  useEffect(() => {
    void (async () => {
      try {
        const perfil = await profileService.getMe();
        setDisplayName(
          [perfil.nombre, perfil.apellido].filter(Boolean).join(" "),
        );
        setCorreo(perfil.correo);
        setTelefono(perfil.telefono ?? "");
        setIsPublic(perfil.public);
      } catch {}
    })();
  }, [user?.username]);

  const isPasswordMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );
  const isDeleteEnabled = useMemo(
    () => deleteConfirm.trim().toLowerCase() === username.toLowerCase(),
    [deleteConfirm, username],
  );

  const accountActions: SettingAction[] = [
    {
      id: "profile",
      title: "Editar perfil",
      subtitle: "Nombre, correo y visibilidad",
      iconName: "account-edit-outline",
      onPress: () => setActiveModal("profile"),
    },
    {
      id: "password",
      title: "Cambiar contraseña",
      subtitle: "Actualiza tu clave",
      iconName: "lock-reset",
      onPress: () => setActiveModal("password"),
    },
    {
      id: "delete",
      title: "Eliminar cuenta",
      subtitle: "Acción irreversible",
      iconName: "trash-can-outline",
      onPress: () => setActiveModal("delete"),
    },
    {
      id: "logout",
      title: "Cerrar sesión",
      subtitle: "Salir de la cuenta",
      iconName: "logout",
      onPress: () => setActiveModal("logout"),
    },
  ];

  const handleCloseModal = () => {
    setActiveModal(null);
    setNewPassword("");
    setConfirmPassword("");
    setDeleteConfirm("");
    setError(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const parts = displayName.trim().split(/\s+/);
      const nombre = parts[0] ?? "";
      const apellido = parts.length > 1 ? parts.slice(1).join(" ") : null;

      await profileService.updateMe({
        nombre,
        apellido,
        correo,
        telefono: telefono.trim() || null,
        public: isPublic,
      });
      await loadProfile();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!isPasswordMatch) return;
    setSaving(true);
    setError(null);
    try {
      await profileService.updateMe({ password: newPassword });
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la clave");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleteEnabled) return;
    setSaving(true);
    setError(null);
    try {
      await profileService.deleteMe();
      await scheduleCalabazaUnlock();
      await logout();
      handleCloseModal();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    handleCloseModal();
    router.replace("/login");
  };

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    if (!enabled) {
      void tryClaimNinaTristeAchievement();
    }
  };

  const handleSfxToggle = (enabled: boolean) => {
    setSfxEnabled(enabled);
    if (!enabled) {
      void tryClaimNinaTristeAchievement();
    }
  };

  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <SectionTitle title="Sonido" />
        <View className="mx-4 mb-4 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0]">
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6]">
                <MaterialCommunityIcons
                  name="music"
                  size={18}
                  color="#8b7355"
                />
              </View>
              <View>
                <Text className="text-sm font-semibold text-[#5c4a3d]">
                  Música
                </Text>
                <Text className="text-[11px] text-[#9a8571]">
                  Activar o desactivar el soundtrack
                </Text>
              </View>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ false: "#e8dfd4", true: "#7cb69d" }}
              thumbColor={musicEnabled ? "#fff9f0" : "#fff9f0"}
            />
          </View>

          <View className="mx-4 h-[1px] bg-[#efe6db]" />

          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6]">
                <MaterialCommunityIcons
                  name="volume-high"
                  size={18}
                  color="#8b7355"
                />
              </View>
              <View>
                <Text className="text-sm font-semibold text-[#5c4a3d]">
                  Efectos de sonido
                </Text>
                <Text className="text-[11px] text-[#9a8571]">
                  Activar o desactivar los sonidos de UI
                </Text>
              </View>
            </View>
            <Switch
              value={sfxEnabled}
              onValueChange={handleSfxToggle}
              trackColor={{ false: "#e8dfd4", true: "#7cb69d" }}
              thumbColor={sfxEnabled ? "#fff9f0" : "#fff9f0"}
            />
          </View>
        </View>

        <SectionTitle title="Cuenta" />
        <View className="mx-4 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0]">
          {accountActions.map((action, index) => (
            <View key={action.id}>
              <Pressable
                onPress={action.onPress}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6]">
                    <MaterialCommunityIcons
                      name={action.iconName}
                      size={18}
                      color="#8b7355"
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-[#5c4a3d]">
                      {action.title}
                    </Text>
                    <Text className="text-[11px] text-[#9a8571]">
                      {action.subtitle}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color="#c9b9a6"
                />
              </Pressable>
              {index < accountActions.length - 1 ? (
                <View className="mx-4 h-[1px] bg-[#efe6db]" />
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <KeyboardAwareModal
        visible={activeModal !== null}
        onRequestClose={handleCloseModal}
      >
            {activeModal === "profile" ? (
              <View className="flex direction-column space-y-4 w-full py-2">
                <View className="w-full">
                  <Text className="w-full text-lg font-bold text-[#5c4a3d]">
                    Editar perfil
                  </Text>
                  <Text className="text-xs text-[#9a8571]">
                    Actualiza tu información personal.
                  </Text>
                </View>
                <View className="w-full">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Nombre completo
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Tu nombre"
                    placeholderTextColor="#b8a899"
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                <View className="w-full">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Correo
                  </Text>
                  <TextInput
                    value={correo}
                    onChangeText={setCorreo}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#b8a899"
                    autoCapitalize="none"
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                <View className="w-full">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Teléfono
                  </Text>
                  <TextInput
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="555-0000"
                    placeholderTextColor="#b8a899"
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#8b7355]">
                    Perfil público
                  </Text>
                  <Switch
                    value={isPublic}
                    onValueChange={setIsPublic}
                    trackColor={{ false: "#e8dfd4", true: "#7cb69d" }}
                  />
                </View>
                {error ? (
                  <Text className="text-xs text-[#c15757]">{error}</Text>
                ) : null}
                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    onPress={handleCloseModal}
                    className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2.5"
                  >
                    <Text className="text-sm font-bold text-[#8b7355]">
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleSaveProfile()}
                    disabled={saving}
                    className={`flex-1 items-center rounded-2xl py-2.5 ${
                      saving ? "bg-[#e8dfd4]" : "bg-[#7ec8a3]"
                    }`}
                  >
                    <Text className="text-sm font-bold text-white">
                      {saving ? "Guardando..." : "Guardar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {activeModal === "password" ? (
              <View className="gap-5">
                <View className="gap-1">
                  <Text className="text-lg font-bold text-[#5c4a3d]">
                    Cambiar contraseña
                  </Text>
                  <Text className="text-xs text-[#9a8571]">
                    Escribe una nueva contraseña y confirma.
                  </Text>
                </View>
                <View className="gap-2">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Nueva contraseña
                  </Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#b8a899"
                    secureTextEntry
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                <View className="gap-2">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Confirmar contraseña
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirma la contraseña"
                    placeholderTextColor="#b8a899"
                    secureTextEntry
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                  {!isPasswordMatch && confirmPassword.length > 0 ? (
                    <Text className="mt-2 text-[11px] text-[#c15757]">
                      Las contraseñas no coinciden.
                    </Text>
                  ) : null}
                </View>
                {error ? (
                  <Text className="text-xs text-[#c15757]">{error}</Text>
                ) : null}
                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    onPress={handleCloseModal}
                    className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2.5"
                  >
                    <Text className="text-sm font-bold text-[#8b7355]">
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleUpdatePassword()}
                    disabled={!isPasswordMatch || saving}
                    className={`flex-1 items-center rounded-2xl py-2.5 ${
                      !isPasswordMatch || saving ? "bg-[#e8dfd4]" : "bg-[#7ec8a3]"
                    }`}
                  >
                    <Text className="text-sm font-bold text-white">
                      {saving ? "Actualizando..." : "Actualizar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {activeModal === "delete" ? (
              <View className="gap-5">
                <View className="gap-1">
                  <Text className="text-lg font-bold text-[#c15757]">
                    Eliminar cuenta
                  </Text>
                  <Text className="text-xs text-[#9a8571]">
                    Escribe tu usuario para confirmar esta acción.
                  </Text>
                </View>
                <View className="gap-2">
                  <Text className="mb-2 text-xs font-semibold text-[#8b7355]">
                    Usuario ({username})
                  </Text>
                  <TextInput
                    value={deleteConfirm}
                    onChangeText={setDeleteConfirm}
                    placeholder={username}
                    placeholderTextColor="#b8a899"
                    autoCapitalize="none"
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                {error ? (
                  <Text className="text-xs text-[#c15757]">{error}</Text>
                ) : null}
                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    onPress={handleCloseModal}
                    className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2.5"
                  >
                    <Text className="text-sm font-bold text-[#8b7355]">
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleDeleteAccount()}
                    disabled={!isDeleteEnabled || saving}
                    className={`flex-1 items-center rounded-2xl py-2.5 ${
                      !isDeleteEnabled || saving ? "bg-[#e8dfd4]" : "bg-[#c15757]"
                    }`}
                  >
                    <Text className="text-sm font-bold text-white">
                      {saving ? "Eliminando..." : "Eliminar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {activeModal === "logout" ? (
              <View className="gap-5">
                <View className="gap-1">
                  <Text className="text-lg font-bold text-[#5c4a3d]">
                    Cerrar sesión
                  </Text>
                  <Text className="text-xs text-[#9a8571]">
                    ¿Estás seguro de que quieres salir?
                  </Text>
                </View>
                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    onPress={handleCloseModal}
                    className="flex-1 items-center rounded-2xl border-2 border-[#e8dfd4] bg-white py-2.5"
                  >
                    <Text className="text-sm font-bold text-[#8b7355]">
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleLogout()}
                    className="flex-1 items-center rounded-2xl bg-[#7ec8a3] py-2.5"
                  >
                    <Text className="text-sm font-bold text-white">
                      Cerrar sesión
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
      </KeyboardAwareModal>
    </View>
  );
}

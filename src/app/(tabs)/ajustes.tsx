import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppHeader, SectionTitle } from "@/components/dashboard";
import AppButton from "@/components/ui/AppButton";
import { useAudioSettings } from "@/providers/AudioSettingsProvider";
import { useMemo, useState } from "react";
import {
  Modal,
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
  const { musicEnabled, setMusicEnabled, sfxEnabled, setSfxEnabled } =
    useAudioSettings();

  const [activeModal, setActiveModal] = useState<
    "profile" | "password" | "delete" | "logout" | null
  >(null);
  const [displayName, setDisplayName] = useState("Nook User");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const username = "nookuser";

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
      subtitle: "Nombre e imagen",
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
              onValueChange={setMusicEnabled}
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
              onValueChange={setSfxEnabled}
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

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <Pressable className="absolute inset-0" onPress={handleCloseModal} />
          <View className="rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5">
            {activeModal === "profile" ? (
              <View className="flex direction-column space-y-4 w-full py-2">
                <View className="w-full">
                  <Text className="w-full text-lg font-bold text-[#5c4a3d]">
                    Editar perfil
                  </Text>
                  <Text className="text-xs text-[#9a8571]">
                    Actualiza tu nombre. La imagen se agregará después.
                  </Text>
                </View>
                <View className=" w-full">
                  <Text className="mb-4 text-xs font-semibold text-[#8b7355]">
                    Nombre
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Tu nombre"
                    placeholderTextColor="#b8a899"
                    className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 text-sm text-[#5c4a3d]"
                  />
                </View>
                <Text className=" text-xs font-semibold text-[#8b7355]">
                  Imagen
                </Text>
                <View className="rounded-xl border-2 border-[#e8dfd4] bg-white px-4 py-3 w-full">
                  <Text className="text-sm text-[#9a8571]">
                    Imagen de perfil
                  </Text>
                </View>
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Guardar cambios"
                    onPress={handleCloseModal}
                  />
                </View>
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Cancelar"
                    onPress={handleCloseModal}
                    variant="secondary"
                    className="mt-4"
                  />
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
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Actualizar contraseña"
                    onPress={handleCloseModal}
                    disabled={!isPasswordMatch}
                  />
                </View>
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Cancelar"
                    onPress={handleCloseModal}
                    variant="secondary"
                    className="mt-4"
                  />
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
                    Usuario ( {username} )
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
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Eliminar cuenta"
                    onPress={handleCloseModal}
                    disabled={!isDeleteEnabled}
                    className="bg-[#e46b6b]"
                  />
                </View>
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Cancelar"
                    onPress={handleCloseModal}
                    variant="secondary"
                    className="mt-4"
                  />
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
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Sí, cerrar sesión"
                    onPress={handleCloseModal}
                  />
                </View>
                <View className="mt-3 flex flex-column">
                  <AppButton
                    title="Cancelar"
                    onPress={handleCloseModal}
                    variant="secondary"
                    className="mt-4"
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

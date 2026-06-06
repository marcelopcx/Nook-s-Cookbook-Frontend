import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AchievementUnlockedModalProps = {
  visible: boolean;
  title: string;
  description: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onClose: () => void;
};

export default function AchievementUnlockedModal({
  visible,
  title,
  description,
  iconName = "trophy",
  onClose,
}: AchievementUnlockedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.scrim} />
        <Pressable style={styles.scrimPressable} onPress={onClose} />
        <View style={styles.content} pointerEvents="box-none">
          <View style={styles.card}>
            <View className="mb-4 items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-[#f9d77e]/25">
                <MaterialCommunityIcons
                  name={iconName}
                  size={32}
                  color="#d4a54a"
                />
              </View>
              <Text className="text-xs font-bold uppercase tracking-widest text-[#d4a54a]">
                Logro desbloqueado
              </Text>
              <Text className="mt-2 text-center text-xl font-extrabold text-[#5c4a3d]">
                {title}
              </Text>
              {description ? (
                <Text className="mt-2 text-center text-sm leading-5 text-[#8b7355]">
                  {description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              className="items-center rounded-2xl bg-[#7cb69d] py-3"
            >
              <Text className="text-sm font-bold text-white">¡Genial!</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  scrimPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 384,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#f9d77e",
    backgroundColor: "#fff9f0",
    padding: 24,
  },
});

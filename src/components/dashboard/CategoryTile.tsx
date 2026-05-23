import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type CategoryTileProps = {
  label: string;
  iconName: string;
  onPress?: () => void;
};

export default function CategoryTile({
  label,
  iconName,
  onPress,
}: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4"
    >
      <View className="mb-2">
        <MaterialCommunityIcons
          name={
            iconName as React.ComponentProps<
              typeof MaterialCommunityIcons
            >["name"]
          }
          size={30}
          color="#7cb69d"
        />
      </View>
      <Text className="text-xs font-bold uppercase tracking-wide text-[#5c4a3d]">
        {label}
      </Text>
    </Pressable>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type CategoryTabProps = {
  label: string;
  iconName: string;
  active?: boolean;
  onPress?: () => void;
};

export default function CategoryTab({
  label,
  iconName,
  active = false,
  onPress,
}: CategoryTabProps) {
  const inactiveIconColor = "#8b7355";
  return (
    <Pressable
      onPress={onPress}
      className={`h-[56px] w-full items-center justify-center rounded-2xl border-2 p-2 ${
        active
          ? "border-[#7cb69d] bg-[#7cb69d]/10 shadow-md"
          : "border-[#e8dfd4] bg-[#fff9f0]"
      }`}
    >
      <View className="mb-1">
        <MaterialCommunityIcons
          name={
            iconName as React.ComponentProps<
              typeof MaterialCommunityIcons
            >["name"]
          }
          size={16}
          color={active ? "#7cb69d" : inactiveIconColor}
        />
      </View>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className={`text-center text-[9px] font-bold ${
          active ? "text-[#5c4a3d]" : "text-[#8b7355]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

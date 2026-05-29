import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar",
}: SearchBarProps) {
  const iconColor = "#8b7355";
  const avatarColor = "#d4a574";
  return (
    <View className="relative px-4">
      <View className="relative flex-row items-center">
        <View className="absolute left-4">
          <MaterialCommunityIcons name="magnify" size={26} color={iconColor} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8b7355"
          className="w-full rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] py-3 pl-4 pr-12 text-[#5c4a3d]"
        />
        <View className="absolute right-4">
          <MaterialCommunityIcons
            name="account-circle"
            size={26}
            color={avatarColor}
          />
        </View>
      </View>
    </View>
  );
}

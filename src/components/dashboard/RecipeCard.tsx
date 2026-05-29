import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import RatingStars from "./RatingStars";

type RecipeCardProps = {
  title: string;
  imageUrl: string;
  rating: number;
  timeMinutes: number;
  onPress?: () => void;
};

export default function RecipeCard({
  title,
  imageUrl,
  rating,
  timeMinutes,
  onPress,
}: RecipeCardProps) {
  const mutedIconColor = "#8b7355";
  return (
    <Pressable
      onPress={onPress}
      className="w-full overflow-hidden rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0]"
    >
      <View className="w-full aspect-[4/3] overflow-hidden bg-[#f5ebe0]">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <View className="p-3">
        <Text
          className="mb-1 min-h-[16px] text-sm font-bold text-[#5c4a3d]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <View className="flex-row items-center justify-between">
          <RatingStars rating={rating} size={12} />
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="clock"
              size={12}
              color={mutedIconColor}
            />
            <Text className="text-xs font-semibold text-[#8b7355]">
              {timeMinutes}m
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

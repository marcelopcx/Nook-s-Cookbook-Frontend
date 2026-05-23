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
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl w-[100%] border-2 border-[#e8dfd4] bg-[#fff9f0] p-3"
    >
      <View className="mb-2 aspect-square overflow-hidden rounded-xl bg-[#f5ebe0]">
        <Image source={{ uri: imageUrl }} className="h-full w-full" />
      </View>
      <Text className="mb-1 text-sm font-bold text-[#5c4a3d]" numberOfLines={2}>
        {title}
      </Text>
      <View className="flex-row items-center justify-between">
        <RatingStars rating={rating} size={12} />
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="clock" size={12} color="#8b7355" />
          <Text className="text-xs font-semibold text-[#8b7355]">
            {timeMinutes}m
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

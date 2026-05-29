import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import RatingStars from "./RatingStars";

type FeaturedRecipeCardProps = {
  title: string;
  imageUrl: string;
  rating: number;
  timeMinutes: number;
  difficulty: string;
  onPress?: () => void;
};

export default function FeaturedRecipeCard({
  title,
  imageUrl,
  rating,
  timeMinutes,
  difficulty,
  onPress,
}: FeaturedRecipeCardProps) {
  const mutedTextColor = "#8b7355";
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-4 shadow-lg"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <MaterialCommunityIcons name="flower" size={12} color="#f4b8c5" />
        <MaterialCommunityIcons name="flower" size={12} color="#7cb69d" />
      </View>
      <View className="flex-row gap-4">
        <View className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-[#e8dfd4] bg-[#f5ebe0]">
          <Image source={{ uri: imageUrl }} className="h-full w-full" />
          <View className="absolute -right-2 -top-2">
            <MaterialCommunityIcons
              name="fruit-cherries"
              size={20}
              color="#e57373"
            />
          </View>
        </View>
        <View className="flex-1">
          <Text
            className="mb-1 text-lg font-extrabold text-[#5c4a3d]"
            numberOfLines={2}
          >
            {title}
          </Text>
          <RatingStars rating={rating} size={16} />
          <View className="mt-2 flex-row flex-wrap gap-3">
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="chart-bar"
                size={14}
                color="#7cb69d"
              />
              <Text className="text-xs font-semibold text-[#8b7355]">
                Dificultad
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="star" size={12} color="#f9d77e" />
              <Text className="text-xs font-semibold text-[#8b7355]">
                {difficulty}
              </Text>
            </View>
          </View>
          <View className="mt-2 flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="clock"
              size={14}
              color={mutedTextColor}
            />
            <Text className="text-xs font-semibold text-[#8b7355]">
              Pronto: {timeMinutes} min
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-3 flex-row justify-center gap-2">
        <MaterialCommunityIcons name="flower" size={10} color="#f9d77e" />
        <MaterialCommunityIcons name="flower" size={10} color="#ffd9b3" />
        <MaterialCommunityIcons name="flower" size={10} color="#f4b8c5" />
      </View>
    </Pressable>
  );
}

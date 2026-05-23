import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

type RatingStarsProps = {
  rating: number;
  size?: number;
};

export default function RatingStars({ rating, size = 14 }: RatingStarsProps) {
  const fullStars = Math.floor(rating);

  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, index) => (
        <MaterialCommunityIcons
          key={`star-${index}`}
          name="star"
          size={size}
          color="#f9d77e"
        />
      ))}
    </View>
  );
}

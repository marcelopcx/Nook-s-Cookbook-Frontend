import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#7ec8a3]",
  secondary: "bg-[#f4d9d9]",
  ghost: "bg-transparent",
};

const textClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-[#5a4a42]",
  ghost: "text-[#5a4a42]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-3",
  lg: "px-6 py-4",
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  iconName,
  loading = false,
  disabled = false,
  className = "",
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full items-center justify-center rounded-md ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? "#ffffff" : "#5a4a42"}
          />
        ) : null}
        {!loading && iconName ? (
          <MaterialCommunityIcons
            name={iconName}
            size={18}
            color={variant === "primary" ? "#ffffff" : "#5a4a42"}
          />
        ) : null}
        <Text className={`text-base font-semibold ${textClasses[variant]}`}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

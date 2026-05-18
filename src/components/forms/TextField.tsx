import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  rightIconName?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  onRightIconPress?: () => void;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  helperText?: string;
  errorText?: string;
  maxLength?: number;
};

export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  rightIconName,
  onRightIconPress,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  helperText,
  errorText,
  maxLength,
}: TextFieldProps) {
  const hasError = Boolean(errorText);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold tracking-wide text-[#5a4a42]">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8b7b74"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          className={`w-full rounded-md border-2 ${hasError ? "border-[#ff6b6b]" : "border-[#e8d5d0]"} bg-white px-4 py-3 text-[#5a4a42] ${rightIconName ? "pr-12" : ""}`}
        />
        {rightIconName ? (
          <Pressable
            onPress={onRightIconPress}
            className="absolute right-4 top-1/2 -mt-2"
          >
            <MaterialCommunityIcons
              name={rightIconName}
              size={18}
              color="#8b7b74"
            />
          </Pressable>
        ) : null}
      </View>
      {errorText ? (
        <Text className="mt-2 text-xs text-[#ff6b6b]">{errorText}</Text>
      ) : null}
      {helperText ? (
        <Text className="mt-2 text-xs text-[#8b7b74]">{helperText}</Text>
      ) : null}
    </View>
  );
}

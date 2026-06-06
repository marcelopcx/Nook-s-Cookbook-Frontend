import { useKeyboardHeight } from "@/components/hooks/useKeyboardHeight";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  const keyboardHeight = useKeyboardHeight();
  const keyboardVisible = keyboardHeight > 0;

  return (
    <View className="flex-1 bg-[#f5f0ea]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: keyboardVisible ? "flex-start" : "center",
              paddingTop: keyboardVisible ? 12 : 40,
              paddingBottom: keyboardVisible ? keyboardHeight + 24 : 40,
            }}
            style={{ paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View className="w-full max-w-md self-center">
              <View className="mb-8 items-center">
                <MaterialCommunityIcons
                  name="sprout"
                  size={36}
                  color="#7ec8a3"
                />
                <Text className="mt-4 text-[28px] font-semibold tracking-tight text-[#5a4a42]">
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="mt-2 text-[13px] leading-5 text-[#8b7b74]">
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <View className="mb-8 rounded-3xl border border-[#e8d5d0] bg-[#fefdfb] p-6 shadow-lg">
                {children}
              </View>

              <View className="flex-row justify-center gap-2">
                <MaterialCommunityIcons
                  name="flower"
                  size={18}
                  color="#cbbab4"
                />
                <MaterialCommunityIcons
                  name="flower-tulip"
                  size={18}
                  color="#cbbab4"
                />
                <MaterialCommunityIcons
                  name="sprout"
                  size={18}
                  color="#cbbab4"
                />
                <MaterialCommunityIcons
                  name="heart"
                  size={18}
                  color="#cbbab4"
                />
                <MaterialCommunityIcons name="leaf" size={18} color="#cbbab4" />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

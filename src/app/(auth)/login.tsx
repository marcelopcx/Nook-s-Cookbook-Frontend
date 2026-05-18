import { AppButton, AuthLayout, TextField } from "@/components";
import { getFieldErrors, loginSchema } from "@/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const goToRegister = () => {
    router.push("../register");
  };

  const goToForgotPassword = () => {
    router.push("../forgot-password");
  };

  const handleSubmit = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(getFieldErrors<"email" | "password">(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <AuthLayout title="Nook's Cookbook" subtitle="Inicia sesión para continuar">
      <View>
        <TextField
          label="Correo electrónico"
          placeholder="john.doe@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          maxLength={30}
          errorText={errors.email}
        />

        <TextField
          label="Contraseña"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          rightIconName={showPassword ? "eye-off-outline" : "eye-outline"}
          onRightIconPress={() => setShowPassword((prev) => !prev)}
          secureTextEntry={!showPassword}
          maxLength={20}
          errorText={errors.password}
        />

        <View className="mb-6 flex-row items-center justify-between pl-1">
          <Pressable
            onPress={() => setRememberMe((prev) => !prev)}
            className="flex-row items-center gap-2"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded border-2 border-[#e8d5d0] ${rememberMe ? "bg-[#7ec8a3]" : "bg-white"}`}
            >
              {rememberMe ? (
                <MaterialCommunityIcons name="check" size={14} color="#fff" />
              ) : null}
            </View>
            <Text className="text-[13px] text-[#8b7b74]">Recuérdame</Text>
          </Pressable>

          <Pressable onPress={goToForgotPassword}>
            <Text className="text-[13px] font-semibold text-[#7ec8a3]">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        <AppButton
          title={isLoading ? "Iniciando..." : "Iniciar sesión"}
          size="md"
          onPress={handleSubmit}
          loading={isLoading}
        />

        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-[#e8d5d0]" />
          <Text className="px-3 text-[13px] text-[#8b7b74]">o</Text>
          <View className="h-px flex-1 bg-[#e8d5d0]" />
        </View>

        <View className="items-center">
          <Text className="mb-2 text-[13px] text-[#8b7b74]">
            ¿No tienes una cuenta?
          </Text>
          <Pressable
            onPress={goToRegister}
            className="flex-row items-center gap-1"
          >
            <MaterialCommunityIcons name="plus" size={15} color="#7ec8a3" />
            <Text className="text-[13px] font-semibold text-[#7ec8a3]">
              Registrarse
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
}

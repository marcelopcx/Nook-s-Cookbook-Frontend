import { AppButton, AuthLayout, TextField } from "@/components";
import { authService } from "@/services";
import { getFieldErrors, registerSchema } from "@/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const goToLogin = () => {
    router.push("../login");
  };

  const handleSubmit = async () => {
    const result = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      setErrors(
        getFieldErrors<"fullName" | "email" | "password" | "confirmPassword">(
          result.error,
        ),
      );
      return;
    }
    if (!agreedTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "Debes aceptar los terminos",
      }));
      return;
    }
    setErrors({});
    setApiError(null);
    setIsLoading(true);
    try {
      await authService.register({ fullName, email, password });
      router.replace("../login");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Error al registrar",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Nook's Cookbook" subtitle="Únete a nuestra comunidad">
      <View>
        <TextField
          label="Nombre completo"
          placeholder="Jhon Doe"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          maxLength={40}
          errorText={errors.fullName}
        />

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

        <TextField
          label="Confirmar contraseña"
          placeholder="********"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          rightIconName={
            showConfirmPassword ? "eye-off-outline" : "eye-outline"
          }
          onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
          secureTextEntry={!showConfirmPassword}
          maxLength={20}
          errorText={errors.confirmPassword}
        />

        <Pressable
          onPress={() => setAgreedTerms((prev) => !prev)}
          className="mb-6 flex-row items-start gap-3"
        >
          <View
            className={`mt-1 h-5 w-5 items-center justify-center rounded border-2 border-[#e8d5d0] ${agreedTerms ? "bg-[#7ec8a3]" : "bg-white"}`}
          >
            {agreedTerms ? (
              <MaterialCommunityIcons name="check" size={14} color="#fff" />
            ) : null}
          </View>
          <Text className="text-[13px] text-[#8b7b74]">
            Acepto los términos y condiciones y la política de privacidad
          </Text>
        </Pressable>
        {errors.terms ? (
          <Text className="-mt-4 mb-6 text-xs text-[#ff6b6b]">
            {errors.terms}
          </Text>
        ) : null}

        {apiError ? (
          <Text className="-mt-2 mb-4 text-xs text-[#ff6b6b]">{apiError}</Text>
        ) : null}

        <AppButton
          title={isLoading ? "Creando..." : "Crear cuenta"}
          iconName="plus"
          size="md"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!agreedTerms}
        />

        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-[#e8d5d0]" />
          <Text className="px-3 text-[13px] text-[#8b7b74]">o</Text>
          <View className="h-px flex-1 bg-[#e8d5d0]" />
        </View>

        <View className="items-center">
          <Text className="mb-4 text-[13px] text-[#8b7b74]">
            ¿Ya tienes cuenta?
          </Text>
          <Pressable
            onPress={goToLogin}
            className="flex-row items-center gap-1"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={14}
              color="#7ec8a3"
            />
            <Text className="text-[13px] font-semibold text-[#7ec8a3]">
              Volver al login
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
}

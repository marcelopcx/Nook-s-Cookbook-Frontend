import { AppButton, AuthLayout, TextField } from "@/components";
import {
  forgotCodeSchema,
  forgotEmailSchema,
  getFieldErrors,
  resetPasswordSchema,
} from "@/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const goToLogin = () => {
    router.push("../login");
  };

  const handleEmailSubmit = () => {
    const result = forgotEmailSchema.safeParse({ email });
    if (!result.success) {
      setErrors(getFieldErrors<"email">(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
    }, 800);
  };

  const handleCodeSubmit = () => {
    const result = forgotCodeSchema.safeParse({ code });
    if (!result.success) {
      setErrors(getFieldErrors<"code">(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("password");
    }, 800);
  };

  const handlePasswordSubmit = () => {
    const result = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      setErrors(
        getFieldErrors<"newPassword" | "confirmPassword">(result.error),
      );
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 800);
  };

  return (
    <AuthLayout
      title={step === "success" ? "Listo" : "Recuperar contraseña"}
      subtitle={
        step === "success"
          ? "Tu contraseña fue restablecida"
          : "Te ayudaremos a recuperar tu cuenta"
      }
    >
      {step === "email" ? (
        <View>
          <Text className="mb-6 text-sm text-[#8b7b74]">
            Ingresa el correo asociado a tu cuenta y enviaremos un código.
          </Text>
          <TextField
            label="Correo electrónico"
            placeholder="john.doe@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            maxLength={30}
            errorText={errors.email}
          />
          <AppButton
            title={isLoading ? "Enviando..." : "Enviar código"}
            iconName="email-outline"
            size="md"
            onPress={handleEmailSubmit}
            loading={isLoading}
          />
          <View className="mt-4">
            <AppButton
              title="Volver al login"
              iconName="arrow-left"
              variant="ghost"
              size="md"
              onPress={goToLogin}
            />
          </View>
        </View>
      ) : null}

      {step === "code" ? (
        <View>
          <Text className="mb-6 text-sm text-[#8b7b74]">
            Enviamos un código a {email}. Ingresa los 6 dígitos.
          </Text>
          <TextField
            label="Código de verificación"
            placeholder="000000"
            value={code}
            onChangeText={(value) =>
              setCode(value.replace(/\D/g, "").slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
            helperText="Ingresa los 6 dígitos del código"
            errorText={errors.code}
          />
          <AppButton
            title={isLoading ? "Verificando..." : "Verificar código"}
            iconName="check"
            size="lg"
            onPress={handleCodeSubmit}
            loading={isLoading}
            disabled={code.length !== 6}
          />
          <View className="mt-4">
            <AppButton
              title="Usar otro correo"
              variant="ghost"
              size="md"
              onPress={() => setStep("email")}
            />
          </View>
        </View>
      ) : null}

      {step === "password" ? (
        <View>
          <Text className="mb-6 text-sm text-[#8b7b74]">
            Crea una nueva contraseña segura para tu cuenta.
          </Text>
          <TextField
            label="Nueva contraseña"
            placeholder="********"
            value={newPassword}
            onChangeText={setNewPassword}
            rightIconName={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword((prev) => !prev)}
            secureTextEntry={!showPassword}
            maxLength={20}
            errorText={errors.newPassword}
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
          <AppButton
            title={isLoading ? "Actualizando..." : "Actualizar contraseña"}
            iconName="lock-open-outline"
            size="lg"
            onPress={handlePasswordSubmit}
            loading={isLoading}
          />
        </View>
      ) : null}

      {step === "success" ? (
        <View className="items-center">
          <MaterialCommunityIcons
            name="check-circle"
            size={56}
            color="#7ec8a3"
          />
          <Text className="mt-4 text-center text-base font-semibold text-[#5a4a42]">
            Tu contraseña fue actualizada con éxito
          </Text>
          <Text className="mt-2 text-center text-[13px] text-[#8b7b74]">
            Ahora puedes iniciar sesión con tu nueva contraseña.
          </Text>
          <View className="mt-6 w-full">
            <AppButton
              title="Ir a login"
              iconName="arrow-right"
              size="lg"
              onPress={goToLogin}
            />
          </View>
        </View>
      ) : null}
    </AuthLayout>
  );
}

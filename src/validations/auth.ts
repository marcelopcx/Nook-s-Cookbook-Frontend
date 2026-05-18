import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu correo")
  .email("Correo inválido")
  .max(30, "El correo no puede superar 30 caracteres");

const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(20, "La contraseña no puede superar 20 caracteres");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre")
      .max(40, "El nombre no puede superar 40 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(20, "La contraseña no puede superar 20 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const forgotEmailSchema = z.object({
  email: emailSchema,
});

export const forgotCodeSchema = z.object({
  code: z.string().length(6, "Ingresa los 6 dígitos"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(20, "La contraseña no puede superar 20 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

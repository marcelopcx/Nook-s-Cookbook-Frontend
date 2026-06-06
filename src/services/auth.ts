import type { PerfilResponse, Usuario } from "@/types/api";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./http";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: Usuario;
};

type RegisterResponse = {
  user: Usuario;
};

function splitFullName(fullName: string): {
  nombre: string;
  apellido: string | null;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const nombre = parts[0] || "";
  const apellido = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { nombre, apellido };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    auth: false,
    method: "POST",
    body: JSON.stringify({
      username: request.email,
      password: request.password,
    }),
  });

  if (data.token) {
    await SecureStore.setItemAsync("user_token", data.token);
  }

  return data;
}

export async function register(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const { nombre, apellido } = splitFullName(request.fullName);

  return apiFetch<RegisterResponse>("/auth/register", {
    auth: false,
    method: "POST",
    body: JSON.stringify({
      username: request.email,
      password: request.password,
      nombre,
      apellido,
      correo: request.email,
      telefono: null,
    }),
  });
}

export async function getMe(): Promise<PerfilResponse> {
  return apiFetch<PerfilResponse>("/auth/me");
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("user_token");
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync("user_token");
}

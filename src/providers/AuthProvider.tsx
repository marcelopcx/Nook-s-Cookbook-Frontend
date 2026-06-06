import { authService } from "@/services";
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type UsuarioSesion = {
  id: number | null;
  username: string;
  nombre: string;
  correo: string;
};

type AuthContextType = {
  user: UsuarioSesion | null;
  saveSession: (
    username: string,
    nombre: string,
    id?: number,
    correo?: string,
  ) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveSession = async (
    username: string,
    nombre: string,
    id?: number,
    correo?: string,
  ) => {
    await SecureStore.setItemAsync("user_username", username);
    await SecureStore.setItemAsync("user_nombre", nombre);
    if (id != null) {
      await SecureStore.setItemAsync("user_id", String(id));
    }
    if (correo) {
      await SecureStore.setItemAsync("user_correo", correo);
    }
    setUser({
      id: id ?? null,
      username,
      nombre,
      correo: correo ?? username,
    });
  };

  const loadProfile = async () => {
    const token = await authService.getToken();
    if (!token) return;

    try {
      const perfil = await authService.getMe();
      await saveSession(
        perfil.username,
        [perfil.nombre, perfil.apellido].filter(Boolean).join(" "),
        perfil.id,
        perfil.correo,
      );
    } catch {
      await logout();
    }
  };

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const token = await authService.getToken();
        const storedUsername = await SecureStore.getItemAsync("user_username");
        const storedNombre = await SecureStore.getItemAsync("user_nombre");
        const storedId = await SecureStore.getItemAsync("user_id");
        const storedCorreo = await SecureStore.getItemAsync("user_correo");

        if (token) {
          try {
            const perfil = await authService.getMe();
            setUser({
              id: perfil.id,
              username: perfil.username,
              nombre: [perfil.nombre, perfil.apellido]
                .filter(Boolean)
                .join(" "),
              correo: perfil.correo,
            });
          } catch {
            if (storedUsername && storedNombre) {
              setUser({
                id: storedId ? Number(storedId) : null,
                username: storedUsername,
                nombre: storedNombre,
                correo: storedCorreo ?? storedUsername,
              });
            }
          }
        } else if (storedUsername && storedNombre) {
          setUser({
            id: storedId ? Number(storedId) : null,
            username: storedUsername,
            nombre: storedNombre,
            correo: storedCorreo ?? storedUsername,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  const logout = async () => {
    await authService.removeToken();
    await SecureStore.deleteItemAsync("user_username");
    await SecureStore.deleteItemAsync("user_nombre");
    await SecureStore.deleteItemAsync("user_id");
    await SecureStore.deleteItemAsync("user_correo");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, saveSession, loadProfile, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

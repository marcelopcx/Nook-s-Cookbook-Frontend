import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type UsuarioSesion = {
  username: string;
  nombre: string;
};

type AuthContextType = {
  user: UsuarioSesion | null;
  saveSession: (username: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUsername = await SecureStore.getItemAsync("user_username");
        const storedNombre = await SecureStore.getItemAsync("user_nombre");

        if (storedUsername && storedNombre) {
          setUser({
            username: storedUsername,
            nombre: storedNombre,
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

  const saveSession = async (username: string, nombre: string) => {
    await SecureStore.setItemAsync("user_username", username);
    await SecureStore.setItemAsync("user_nombre", nombre);
    setUser({ username, nombre });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_username");
    await SecureStore.deleteItemAsync("user_nombre");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveSession, logout, isLoading }}>
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

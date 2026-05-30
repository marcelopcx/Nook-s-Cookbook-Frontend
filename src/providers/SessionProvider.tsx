import {
  clearSession,
  getToken,
  getUser,
  saveSession,
  SessionUser,
} from "@services/session";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SessionContextValue = {
  token: string | null;
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (token: string, user: SessionUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getUser(),
        ]);
        if (cancelled) return;
        setToken(storedToken);
        setUser(storedUser);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      user,
      isLoading,
      signIn: async (newToken, newUser) => {
        await saveSession(newToken, newUser);
        setToken(newToken);
        setUser(newUser);
      },
      signOut: async () => {
        await clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return ctx;
}

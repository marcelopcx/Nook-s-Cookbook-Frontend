import AchievementUnlockedModal from "@/components/dashboard/AchievementUnlockedModal";
import {
  LOGRO_CALABAZA,
  LOGRO_CALABAZA_DESCRIPCION,
  LOGRO_NINA_TRISTE,
} from "@/constants/achievements";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/services/http";
import * as profileService from "@/services/profile";
import { playAchievementUnlockSfx } from "@/services/soundtrack";
import { consumePendingCalabazaUnlock } from "@/services/pendingAchievementUnlock";
import type { LogroResponse, UsuarioLogroResponse } from "@/types/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InteractionManager } from "react-native";

const ACHIEVEMENT_ICONS = [
  "star",
  "medal",
  "trophy",
  "chef-hat",
  "heart",
  "basket",
  "music-off",
  "delete-outline",
] as const;

type PendingUnlock = {
  id: number;
  nombre: string;
  descripcion: string | null;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type AchievementsContextValue = {
  allAchievements: LogroResponse[];
  myAchievements: UsuarioLogroResponse[];
  myAchievementIds: Set<number>;
  isLoading: boolean;
  refreshAchievements: () => Promise<void>;
  checkForNewAchievements: () => Promise<void>;
  tryClaimNinaTristeAchievement: () => Promise<void>;
  triggerCalabazaUnlock: () => void;
};

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

function iconForAchievement(
  achievementId: number,
  allAchievements: LogroResponse[],
): React.ComponentProps<typeof MaterialCommunityIcons>["name"] {
  const index = allAchievements.findIndex((item) => item.id === achievementId);
  if (index < 0) return "trophy";
  return ACHIEVEMENT_ICONS[index % ACHIEVEMENT_ICONS.length];
}

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const knownIdsRef = useRef<Set<number> | null>(null);
  const claimingNinaTristeRef = useRef(false);
  const [allAchievements, setAllAchievements] = useState<LogroResponse[]>([]);
  const [myAchievements, setMyAchievements] = useState<UsuarioLogroResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unlockQueue, setUnlockQueue] = useState<PendingUnlock[]>([]);
  const currentUnlock = unlockQueue[0] ?? null;

  const myAchievementIds = useMemo(
    () => new Set(myAchievements.map((item) => item.id_logro)),
    [myAchievements],
  );

  const applyAchievementData = useCallback(
    (all: LogroResponse[], mine: UsuarioLogroResponse[]) => {
      setAllAchievements(all);
      setMyAchievements(mine);
      return mine;
    },
    [],
  );

  const enqueueUnlocks = useCallback(
    (newOnes: UsuarioLogroResponse[], all: LogroResponse[]) => {
      if (newOnes.length === 0) return;

      const pending = newOnes.map((item) => ({
        id: item.id_logro,
        nombre: item.nombre,
        descripcion: item.descripcion,
        iconName: iconForAchievement(item.id_logro, all),
      }));

      setUnlockQueue((prev) => [...prev, ...pending]);
    },
    [],
  );

  const triggerCalabazaUnlock = useCallback(() => {
    setUnlockQueue((prev) => {
      if (prev.some((item) => item.nombre === LOGRO_CALABAZA)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: -1,
          nombre: LOGRO_CALABAZA,
          descripcion: LOGRO_CALABAZA_DESCRIPCION,
          iconName: "halloween" as const,
        },
      ];
    });
  }, []);

  const refreshAchievements = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [all, mine] = await Promise.all([
        profileService.listAchievements(),
        profileService.listMyAchievements(),
      ]);
      applyAchievementData(all, mine);
      knownIdsRef.current = new Set(mine.map((item) => item.id_logro));
    } finally {
      setIsLoading(false);
    }
  }, [applyAchievementData, user]);

  const checkForNewAchievements = useCallback(async () => {
    if (!user) return;

    const [all, mine] = await Promise.all([
      profileService.listAchievements(),
      profileService.listMyAchievements(),
    ]);

    applyAchievementData(all, mine);

    const previous = knownIdsRef.current;
    if (previous === null) {
      knownIdsRef.current = new Set(mine.map((item) => item.id_logro));
      return;
    }

    const newOnes = mine.filter((item) => !previous.has(item.id_logro));
    knownIdsRef.current = new Set(mine.map((item) => item.id_logro));
    enqueueUnlocks(newOnes, all);
  }, [applyAchievementData, enqueueUnlocks, user]);

  const tryClaimNinaTristeAchievement = useCallback(async () => {
    if (!user || claimingNinaTristeRef.current) return;

    const alreadyHas = myAchievements.some(
      (item) => item.nombre === LOGRO_NINA_TRISTE,
    );
    if (alreadyHas) return;

    claimingNinaTristeRef.current = true;
    try {
      const claimed = await profileService.claimAchievement(LOGRO_NINA_TRISTE);

      setMyAchievements((prev) => {
        if (prev.some((item) => item.id_logro === claimed.id_logro)) {
          return prev;
        }
        return [...prev, claimed];
      });

      const nextKnown = new Set(knownIdsRef.current ?? []);
      const isNew = !nextKnown.has(claimed.id_logro);
      nextKnown.add(claimed.id_logro);
      knownIdsRef.current = nextKnown;

      if (isNew) {
        enqueueUnlocks([claimed], allAchievements);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        console.warn("No se pudo reclamar logro", err.message);
      }
    } finally {
      claimingNinaTristeRef.current = false;
    }
  }, [allAchievements, enqueueUnlocks, myAchievements, user]);

  useEffect(() => {
    if (!user) {
      knownIdsRef.current = null;
      setAllAchievements([]);
      setMyAchievements([]);
      return;
    }

    void refreshAchievements();
  }, [refreshAchievements, user]);

  useEffect(() => {
    if (pathname !== "/login") return;

    const task = InteractionManager.runAfterInteractions(() => {
      void (async () => {
        const pending = await consumePendingCalabazaUnlock();
        if (pending) {
          triggerCalabazaUnlock();
        }
      })();
    });

    return () => task.cancel();
  }, [pathname, triggerCalabazaUnlock]);

  const dismissCurrentUnlock = useCallback(() => {
    setUnlockQueue((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    if (!currentUnlock) return;

    void playAchievementUnlockSfx(currentUnlock.nombre);
  }, [currentUnlock?.id, currentUnlock?.nombre]);

  const value = useMemo<AchievementsContextValue>(
    () => ({
      allAchievements,
      myAchievements,
      myAchievementIds,
      isLoading,
      refreshAchievements,
      checkForNewAchievements,
      tryClaimNinaTristeAchievement,
      triggerCalabazaUnlock,
    }),
    [
      allAchievements,
      myAchievements,
      myAchievementIds,
      isLoading,
      refreshAchievements,
      checkForNewAchievements,
      tryClaimNinaTristeAchievement,
      triggerCalabazaUnlock,
    ],
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AchievementUnlockedModal
        visible={currentUnlock !== null}
        title={currentUnlock?.nombre ?? ""}
        description={currentUnlock?.descripcion ?? ""}
        iconName={currentUnlock?.iconName}
        onClose={dismissCurrentUnlock}
      />
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error(
      "useAchievements debe usarse dentro de AchievementsProvider",
    );
  }
  return ctx;
}

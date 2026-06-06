import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_CALABAZA_KEY = "pending_calabaza_unlock";

export async function scheduleCalabazaUnlock() {
  await AsyncStorage.setItem(PENDING_CALABAZA_KEY, "1");
}

export async function consumePendingCalabazaUnlock(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PENDING_CALABAZA_KEY);
  if (!value) return false;

  await AsyncStorage.removeItem(PENDING_CALABAZA_KEY);
  return true;
}

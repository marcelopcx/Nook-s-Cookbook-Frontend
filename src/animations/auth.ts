import {
  Easing,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type FloatConfig = {
  delay?: number;
  duration?: number;
  driftX: number;
  driftY: number;
};

export function createFloatAnimation({
  delay = 0,
  duration = 5000,
  driftX,
  driftY,
}: FloatConfig) {
  return {
    progress: withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    ),
    driftX,
    driftY,
  };
}

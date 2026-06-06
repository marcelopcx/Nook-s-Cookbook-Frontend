import { useKeyboardHeight } from "@/components/hooks/useKeyboardHeight";
import { useCallback } from "react";
import {
  Platform,
  type ScrollView,
  useWindowDimensions,
  type View,
} from "react-native";
import type { RefObject } from "react";

type ScrollIntoViewOptions = {
  extraOffset?: number;
  headerOffset?: number;
};

export function useScrollIntoViewOnFocus(
  scrollRef: RefObject<ScrollView | null>,
  contentRef: RefObject<View | null>,
) {
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();

  const scrollIntoView = useCallback(
    (
      targetRef: RefObject<View | null>,
      options: ScrollIntoViewOptions = {},
    ) => {
      const { extraOffset = 40, headerOffset = 100 } = options;

      const run = () => {
        const content = contentRef.current;
        const target = targetRef.current;
        if (!scrollRef.current || !content || !target) return;

        target.measureLayout(
          content,
          (_x, y, _w, h) => {
            const visibleHeight = windowHeight - keyboardHeight - headerOffset;
            const scrollY = y + h - visibleHeight + extraOffset;
            scrollRef.current?.scrollTo({
              y: Math.max(0, scrollY),
              animated: true,
            });
          },
          () => {
            scrollRef.current?.scrollToEnd({ animated: true });
          },
        );
      };

      setTimeout(run, Platform.OS === "ios" ? 320 : 120);
    },
    [contentRef, keyboardHeight, scrollRef, windowHeight],
  );

  return scrollIntoView;
}

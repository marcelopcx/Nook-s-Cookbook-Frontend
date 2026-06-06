import { useKeyboardHeight } from "@/components/hooks/useKeyboardHeight";
import { forwardRef, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  children: ReactNode;
  dismissOnPressOutside?: boolean;
  keyboardVerticalOffset?: number;
  keyboardExtraPadding?: number;
};

function getPaddingBottom(style: StyleProp<ViewStyle>): number {
  if (!style || typeof style !== "object" || Array.isArray(style)) return 0;
  return typeof style.paddingBottom === "number" ? style.paddingBottom : 0;
}

const KeyboardAwareScrollView = forwardRef<
  ScrollView,
  KeyboardAwareScrollViewProps
>(function KeyboardAwareScrollView(
  {
    children,
    contentContainerStyle,
    dismissOnPressOutside = false,
    keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0,
    keyboardExtraPadding = 16,
    keyboardShouldPersistTaps = "handled",
    keyboardDismissMode = "on-drag",
    ...rest
  },
  ref,
) {
  const keyboardHeight = useKeyboardHeight();
  const basePadding = getPaddingBottom(contentContainerStyle);
  const extraKeyboardPadding =
    keyboardHeight > 0 ? keyboardHeight + 24 - basePadding : 0;

  const scrollView = (
    <ScrollView
      ref={ref}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      contentContainerStyle={[
        contentContainerStyle,
        extraKeyboardPadding > 0
          ? {
              paddingBottom: basePadding + extraKeyboardPadding + keyboardExtraPadding,
            }
          : null,
      ]}
      automaticallyAdjustKeyboardInsets
      {...rest}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {dismissOnPressOutside ? (
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          {scrollView}
        </TouchableWithoutFeedback>
      ) : (
        scrollView
      )}
    </KeyboardAvoidingView>
  );
});

export default KeyboardAwareScrollView;

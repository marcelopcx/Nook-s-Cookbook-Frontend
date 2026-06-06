import { useKeyboardHeight } from "@/components/hooks/useKeyboardHeight";
import type { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  type ModalProps,
} from "react-native";

type KeyboardAwareModalProps = Pick<
  ModalProps,
  "visible" | "onRequestClose" | "animationType"
> & {
  children: ReactNode;
  contentClassName?: string;
};

export default function KeyboardAwareModal({
  visible,
  onRequestClose,
  animationType = "fade",
  children,
  contentClassName = "rounded-3xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5",
}: KeyboardAwareModalProps) {
  const keyboardHeight = useKeyboardHeight();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 bg-black/40">
            <Pressable className="absolute inset-0" onPress={onRequestClose} />
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: keyboardHeight > 0 ? "flex-start" : "center",
                paddingHorizontal: 20,
                paddingTop: keyboardHeight > 0 ? 24 : 0,
                paddingBottom: Math.max(24, keyboardHeight + 24),
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              <View className={contentClassName}>{children}</View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

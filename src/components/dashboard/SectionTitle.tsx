import { Text, View } from "react-native";

type SectionTitleProps = {
  title: string;
};

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <View className="px-4">
      <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-[#8b7355]">
        {title}
      </Text>
    </View>
  );
}

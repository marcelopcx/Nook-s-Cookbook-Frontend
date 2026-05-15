import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text className="text-4xl font-extrabold text-orange-500 bg-slate-100 p-4 rounded-xl shadow-lg">
        ¡Nook&apos;s Cookbook!
      </Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text className="text-center text-base text-neutral-600 dark:text-neutral-400 px-6">
        Crea , explora y guarda tus recetas favoritas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

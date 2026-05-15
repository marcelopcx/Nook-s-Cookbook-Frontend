import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text className="mt-2 text-center text-base text-neutral-600 dark:text-neutral-400">
        Aquí irá la cuenta y preferencias de Nook&apos;s Cookbook.
      </Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: '80%',
  },
});

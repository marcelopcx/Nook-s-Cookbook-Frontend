import * as ImagePicker from "expo-image-picker";

export type PickedImage = {
  uri: string;
  filename: string;
  mimeType: string;
};

/**
 * Abre la galería del dispositivo y devuelve la imagen elegida con el shape
 * que necesita `subirImagenReceta`. Devuelve `null` si el usuario cancela o
 * niega permisos.
 */
export async function pickReceiptImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    filename: asset.fileName ?? `receta-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? "image/jpeg",
  };
}

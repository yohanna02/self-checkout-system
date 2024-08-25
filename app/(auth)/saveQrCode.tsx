import { View, Text, useWindowDimensions, Button, Alert } from "react-native";
import { useEffect, useRef } from "react";
import QRCode from "react-native-qrcode-svg";
import { Stack, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function saveQrCode() {
  const viewShotRef = useRef<ViewShot>(null);
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const { width } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Media library permissions are required to save the image to the gallery."
        );
      }
    })();
  }, []);

  async function saveQrCode() {
    try {
      if (viewShotRef.current === null) {
        throw new Error();
      }

      if (viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        const filePath = `${FileSystem.cacheDirectory}${params.name}.jpg`;

        await FileSystem.moveAsync({
          from: uri,
          to: filePath,
        });

        const asset = await MediaLibrary.createAssetAsync(filePath);
        await MediaLibrary.createAlbumAsync("QRCode", asset, false);
        Alert.alert("Success", "QR Code saved!");
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Error", "Could not save QR Code");
    }
  }

  return (
    <ViewShot
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
      ref={viewShotRef}
      options={{ format: "jpg", quality: 0.9 }}
    >
      <Stack.Screen
        options={{
          title: "Save QR Code",
          headerRight: () => (
            <Button title="Save" color={Colors.primary} onPress={saveQrCode} />
          ),
        }}
      />
      <QRCode value={params.id} size={width - width * 0.3} />
      <Text style={{ fontSize: 32 }}>{params.name}</Text>
    </ViewShot>
  );
}

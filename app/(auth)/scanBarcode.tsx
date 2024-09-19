import { View, Text, StyleSheet, Button, StatusBar } from "react-native";
import { useState } from "react";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";

export default function scanBarcode() {
  const [permission, requestPermission] = useCameraPermissions();

  const router = useRouter();
  const [scanned, setScanned] = useState<boolean>(false);

  function barCodeScanned(scanningResult: BarcodeScanningResult) {
    setScanned(true);
    if (router.canGoBack()) {
      router.back();
      router.setParams({ code: scanningResult.data });
    }
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button
          color={Colors.primary}
          onPress={requestPermission}
          title="grant permission"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "upc_e", "upc_a"] }}
        onBarcodeScanned={scanned ? undefined : barCodeScanned}
      >
        <View style={styles.scanContainer}>
          <Image
            source={require("@/assets/images/scanner.svg")}
            contentFit="cover"
            style={{ width: 400, height: 400 }}
          />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  scanContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

import Colors from "@/constants/Colors";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Button, StyleSheet, Text, View, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  const router = useRouter();
  const [scanned, setScanned] = useState<boolean>(false);

  function barCodeScanned(scanningResult: BarcodeScanningResult) {
    setScanned(true);
    router.push({
      pathname: "/(modal)/addToCart",
      params: { data: scanningResult.data }
    });
  }

  useFocusEffect(function() {
    setScanned(false);
  });

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
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : barCodeScanned}
      >
        <View style={styles.scanContainer}>
          <Image
            source={require("../../assets/images/scanner.svg")}
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

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { store } from "@/lib/firebase";
import Colors from "@/constants/Colors";

export default function manageProduct() {
  const [image, setImage] = useState<string | null>(null);
  const params = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();

  const productQuery = useQuery({
    queryKey: ["products", params.id],
    queryFn: async function () {
      if (params.id === "new") return null;

      const productRef = doc(store, "products", params.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) return null;

      const product = productSnap.data();

      setImage(product.image_url);
      return product;
    },
  });

  async function pickImage() {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (result.assets[0].type !== "image") {
        alert("Please select an image");
        return;
      }
      setImage(result.assets[0].uri);
    }
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={{ flex: 1 }}
      >
        <Stack.Screen
          options={{
            title: params.id === "new" ? "Add new product" : "Manage product",
            headerRight: () =>
              params.id !== "new" ? (
                <AntDesign name="delete" size={24} color="red" />
              ) : null,
          }}
        />
        {productQuery.isLoading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{
                    width,
                    height: Keyboard.isVisible() ? height * 0.2 : height * 0.4,
                  }}
                  contentFit="contain"
                />
              ) : (
                <>
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={Colors.primary}
                  />
                  <Text style={{ color: Colors.primary }}>Select an image</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Name</Text>
              <TextInput style={styles.textInput} />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Price</Text>
              <TextInput style={styles.textInput} keyboardType="number-pad" />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Quantity</Text>
              <TextInput style={styles.textInput} keyboardType="number-pad" />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Description</Text>
              <TextInput style={styles.textInput} multiline />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 10,
                margin: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    width: "100%",
    height: Dimensions.get("window").height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
  },
  textInput: {
    width: "auto",
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
});

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
  StatusBar,
  Alert,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { storage, store } from "@/lib/firebase";
import Colors from "@/constants/Colors";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import generateId from "@/util/generateId";

export default function manageProduct() {
  const [image, setImage] = useState<string | null>(null);
  const params = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productDescription, setProductDescription] = useState("");

  const productQuery = useQuery({
    queryKey: ["products", params.id],
    queryFn: async function () {
      if (params.id === "new") return null;

      const productRef = doc(store, "products", params.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) return null;

      const product = productSnap.data();

      setImage(product.image_url);
      setProductName(product.name);
      setProductQuantity(product.quantity.toString());
      setProductPrice(product.price.toString());
      setProductDescription(product.description);
      return product;
    },
  });

  async function uploadImageAsync(uri: string) {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const file = params.id === "new" ? generateId(10) : params.id;
    const fileRef = ref(storage, file);
    await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return { url: await getDownloadURL(fileRef), file };
  }

  const saveProduct = useMutation({
    mutationFn: async function () {
      if (!image) throw new Error("No Image selected");
      if (
        !productName ||
        !productPrice ||
        !productQuantity ||
        !productDescription
      )
        throw new Error("Field Empty");

      const uploadResult = await uploadImageAsync(image);

      await setDoc(doc(store, "products", uploadResult.file), {
        name: productName,
        price: parseFloat(productPrice),
        quantity: parseInt(productQuantity),
        description: productDescription,
        image_url: uploadResult.url,
      });

      return uploadResult.file;
    },
    onSuccess: function (ref) {
      router.replace({
        pathname: "/(auth)/manageProduct",
        params: { id: ref },
      });
    },
    onError: function (e) {
      alert(e.message);
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

  async function deleteProduct() {
    // Delete product
    try {
      Alert.alert(
        "Delete Product",
        "Are you sure you want to delete this product?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(store, "products", params.id));
              const imageRef = ref(storage, params.id);
              await deleteObject(imageRef);
              Alert.alert("Success", "Product deleted successfully");
              router.replace("/(auth)/manageStore");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete product");
    }
  }

  function goToSaveQrCode() {
    router.push({
      pathname: "/(auth)/saveQrCode",
      params: { id: params.id, name: productName },
    });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Stack.Screen
          options={{
            title: params.id === "new" ? "Add new product" : "Manage product",
            headerRight: () =>
              params.id !== "new" ? (
                <TouchableOpacity onPress={deleteProduct}>
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
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
              <TextInput
                style={styles.textInput}
                value={productName}
                onChangeText={setProductName}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Price</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={productPrice}
                onChangeText={setProductPrice}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Quantity</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={productQuantity}
                onChangeText={setProductQuantity}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <Text>Description</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { height: "auto", textAlignVertical: "top" },
                ]}
                multiline={true}
                numberOfLines={8}
                value={productDescription}
                onChangeText={setProductDescription}
              />
            </View>

            {params.id !== "new" && (
              <View
                style={{
                  marginVertical: 20,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderColor: Colors.primary,
                    borderWidth: 1,
                    padding: 10,
                    margin: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    width: "95%",
                  }}
                  onPress={goToSaveQrCode}
                >
                  <Text>Save QR Code</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 10,
                margin: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={() => saveProduct.mutate()}
            >
              <Text style={{ color: "white" }}>
                {saveProduct.isPending ? "Saving..." : "Save"}
              </Text>
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

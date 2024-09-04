import {
  ScrollView,
  View,
  Text,
  StatusBar,
  Keyboard,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useContext } from "react";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, store } from "@/lib/firebase";
import { Image } from "expo-image";
import Colors from "@/constants/Colors";
import generateId from "@/util/generateId";
import { cartContext } from "@/context/cartContext";

export default function addToCart() {
  const { refetch } = useContext(cartContext);
  const queryClient = useQueryClient();
  const { width, height } = useWindowDimensions();
  const { data } = useLocalSearchParams<{ data: string }>();
  const productQuery = useQuery({
    queryKey: ["product", data],
    queryFn: async function () {
      const productRef = doc(store, "products", decodeURI(data));
      const productSnap = await getDoc(productRef);
      const ref = query(
        collection(store, "carts"),
        and(
          where("productId", "==", data),
          where("userId", "==", auth.currentUser?.uid)
        )
      );
      const cartSnap = await getDocs(ref);

      let inCart = false;
      if (cartSnap.docs.length > 0) {
        inCart = true;
      }

      if (!productSnap.exists()) throw new Error("Product not found");

      const product = productSnap.data();

      return {
        imageUrl: product.image_url as string,
        productName: product.name as string,
        quantity: product.quantity as number,
        price: product.price as number,
        description: product.description as string,
        inCart,
      };
    },
  });

  const addToCart = useMutation({
    mutationFn: async function () {
      if (!productQuery.data) throw new Error("Product not found");

      if (productQuery.data.quantity === 0) {
        throw new Error("Product out of stock");
      }

      if (productQuery.data.inCart) {
        const ref = query(
          collection(store, "carts"),
          and(
            where("productId", "==", data),
            where("userId", "==", auth.currentUser?.uid)
          )
        );
        const productSnap = await getDocs(ref);
        await deleteDoc(productSnap.docs[0].ref);
        return;
      }

      await setDoc(doc(store, "carts", generateId(10)), {
        productId: data,
        userId: auth.currentUser?.uid,
        quantity: 1,
      });
    },
    onSuccess: function () {
      queryClient.setQueryData(["product", data], function (prev: any) {
        return {
          ...prev,
          inCart: !prev.inCart,
        };
      });
      refetch();
    },
    onError: function (error) {
      alert("Failed to add or remove item from cart");
    },
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {productQuery.isLoading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      {productQuery.error && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>{productQuery.error.message}</Text>
        </View>
      )}
      {productQuery.isSuccess && (
        <View>
          <Image
            source={{ uri: productQuery.data.imageUrl }}
            style={{
              width,
              height: Keyboard.isVisible() ? height * 0.2 : height * 0.4,
            }}
            contentFit="contain"
          />

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginHorizontal: 20,
              marginTop: 10,
            }}
          >
            {productQuery.data.productName}
          </Text>

          <Text
            style={{
              fontSize: 18,
              marginHorizontal: 20,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            Price: ₦{productQuery.data.price}
          </Text>

          <Text
            style={{
              fontSize: 18,
              marginHorizontal: 20,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            Quantity: {productQuery.data.quantity} left
          </Text>

          <Text
            style={{
              fontSize: 18,
              marginHorizontal: 20,
              marginTop: 10,
            }}
          >
            {productQuery.data.description}
          </Text>

          <TouchableOpacity onPress={() => addToCart.mutate()}>
            <Text
              style={{
                fontSize: 18,
                marginHorizontal: 20,
                marginTop: 10,
                color: "white",
                backgroundColor: productQuery.data.inCart
                  ? "red"
                  : Colors.primary,
                padding: 10,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {addToCart.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : productQuery.data.inCart ? (
                "Remove from cart"
              ) : (
                "Add to cart"
              )}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

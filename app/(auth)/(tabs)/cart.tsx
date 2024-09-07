import {
  View,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useContext, useState } from "react";
import { cartContext } from "@/context/cartContext";
import CartItem from "@/components/CartItem";
import Colors from "@/constants/Colors";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, store } from "@/lib/firebase";
import { useMutation } from "@tanstack/react-query";
import generateId from "@/util/generateId";

export default function cart() {
  const { cartData, refetch, status } = useContext(cartContext);
  const [loading, setLoading] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async function () {
      const products = cartData.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      }));

      await setDoc(doc(store, "orders", generateId(10)), {
        userId: auth.currentUser?.uid,
        products,
      });

      await Promise.all(
        cartData.map((item) => deleteDoc(doc(store, "carts", item.id)))
      );
      const productData = await Promise.all(
        cartData.map((item) => getDoc(doc(store, "products", item.product_id)))
      );
      productData.forEach(async (product, index) => {
        const productData = product.data();
        if (productData) {
          await updateDoc(doc(store, "products", product.id), {
            quantity: productData.quantity - cartData[index].quantity,
          });
        }
      });

      refetch();
    },
    onError: function () {
      Alert.alert("Error", "Failed to checkout");
    },
  });

  function checkout() {
    if (cartData.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }
    Alert.alert("Checkout", "Do you want to checkout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Checkout",
        onPress: async function () {
          checkoutMutation.mutate();
        },
      },
    ]);
  }

  async function onDecrease(index: number) {
    setLoading(true);

    try {
      const cartProduct = cartData[index];
      if (cartProduct.quantity - 1 === 0) {
        await deleteItem(index);
        setLoading(false);
        return;
      }

      await updateDoc(doc(store, "carts", cartProduct.id), {
        productId: cartProduct.product_id,
        quantity: cartProduct.quantity - 1,
        userId: auth.currentUser?.uid,
      });
      refetch();
      setLoading(false);
    } catch (err) {
      Alert.alert("Error", "Failed to decrease quantity");
      setLoading(false);
    }
  }

  async function onIncrease(index: number) {
    setLoading(true);

    try {
      const cartProduct = cartData[index];
      const product = (
        await getDoc(doc(store, "products", cartProduct.product_id))
      ).data();

      if (!product) {
        Alert.alert("Error", "Product not found");
        setLoading(false);
        return;
      }

      if (cartProduct.quantity + 1 > product.quantity) {
        Alert.alert("Error", "Product quantity is not enough");
        setLoading(false);
        return;
      }

      await updateDoc(doc(store, "carts", cartProduct.id), {
        productId: cartProduct.product_id,
        quantity: cartProduct.quantity + 1,
        userId: auth.currentUser?.uid,
      });
      refetch();
      setLoading(false);
    } catch (err) {
      Alert.alert("Error", "Failed to increase quantity");
      setLoading(false);
    }
  }

  async function deleteItem(index: number) {
    setLoading(true);

    try {
      const cartProduct = cartData[index];

      Alert.alert(
        "Remove",
        "Are you sure you want to remove this from your cart?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setLoading(false),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(store, "carts", cartProduct.id));
              refetch();
              setLoading(false);
              Alert.alert("Success", "Product removed from cart successfully");
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to remove product from cart");
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 10 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {(loading || status === "loading") && (
        <View style={style.loadingStyle}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}

      <FlatList
        data={cartData}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={status === "loading"}
            onRefresh={() => refetch()}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item, index }) => (
          <CartItem
            item={item}
            index={index}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            deleteItem={deleteItem}
          />
        )}
        keyExtractor={(item) => item.id}
      />

      {cartData?.length === 0 && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Your cart is empty</Text>
        </View>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: Colors.primary,
          padding: 16,
          borderRadius: 8,
          marginBottom: 10,
        }}
        onPress={checkout}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {checkoutMutation.isPending ? <ActivityIndicator size="small" color={"white"} /> : "Checkout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  loadingStyle: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: "#00000055",
    zIndex: 50,
  },
});

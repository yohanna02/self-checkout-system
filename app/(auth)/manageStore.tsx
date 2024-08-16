import {
  Text,
  TouchableOpacity,
  Dimensions,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { store } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "expo-router";

interface Product {
  name: string;
  price: number;
  image_url: string;
  description: string;
  quantity: number;
}

export default function manageStore() {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async function () {
      const products = (await getDocs(collection(store, "products"))).docs;
      return products;
    },
  });

  return (
    <View style={{ flex: 1 }}>
      {productsQuery.isLoading && (
        <ActivityIndicator
          color={Colors.primary}
          size="large"
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        />
      )}
      <FlatList
        data={productsQuery.data}
        keyExtractor={({ id }) => id}
        renderItem={function ({ item }) {
          const product = item.data() as Product;
          return (
            <Link
              href={`/(auth)/manageProduct?id=${item.id}`}
              asChild
            >
              <TouchableOpacity style={styles.productListItem}>
                <Image
                  source={{ uri: product.image_url }}
                  style={{ width: 100, height: 100, borderRadius: 100 }}
                />
                <View
                  style={{ flex: 1, justifyContent: "center", paddingLeft: 10 }}
                >
                  <Text style={{fontSize: 28}}>{product.name}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
      <Link href="/(auth)/manageProduct?id=new" asChild>
        <TouchableOpacity style={styles.selectBtn}>
          <AntDesign name="plus" size={28} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  productListItem: {
    width: "100%",
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignItems: "center",
  },
  selectBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    position: "absolute",
    bottom: 20,
    right: Dimensions.get("window").width / 2 - 35,
    height: 70,
    backgroundColor: Colors.primary,
    borderRadius: 100,
  },
});

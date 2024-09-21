import CartItem from "@/components/CartItem";
import Colors from "@/constants/Colors";
import { CartItemType } from "@/context/cartContext";
import { store } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";

export default function OrderList() {
  const data = useLocalSearchParams<{ id: string }>();
  const [total, setTotal] = useState(0);
  const [totalItem, setTotalItem] = useState(0);

  const orderQuery = useQuery({
    queryKey: ["order", data.id],
    queryFn: async function () {
      const ref = await getDoc(doc(store, "orders", data.id));

      const orders = ref.data()?.products as {
        productId: string;
        quantity: number;
      }[];

      const orderPromises = orders.map(async (order: any) => {
        const productRef = doc(store, "products", order.productId);
        const productSnap = await getDoc(productRef);
        const data = productSnap.data();
        return {
          id: productSnap.id,
          quantity: order.quantity as number,
          imageUrl: data?.image_url as string,
          name: data?.name as string,
          price: data?.price as number,
        };
      });

      const order = await Promise.all(orderPromises);

      let tempTotal = 0;
      let tempTotalItem = 0;
      order.forEach(function(o) {
        tempTotalItem += o.quantity;
        tempTotal += (o.price * o.quantity);
      });
      setTotal(tempTotal);
      setTotalItem(tempTotalItem);

      return order;
    },
  });

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {orderQuery.status === "pending" ? (
        <ActivityIndicator color={Colors.primary} size="large" />
      ) : orderQuery.status === "error" ? (
        <Text style={{ fontSize: 24, textAlign: "center", color: "red" }}>
          Error
        </Text>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={orderQuery.isFetching}
              onRefresh={() => orderQuery.refetch()}
              colors={[Colors.primary]}
            />
          }
          data={orderQuery.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item: order }) => (
            <CartItem item={order as CartItemType} />
          )}
        />

      )}
      <View>
        <Text style={{fontSize: 32, fontWeight: "bold"}}>Total: ₦{total}</Text>
        <Text style={{fontSize: 32, fontWeight: "bold"}}>Total Quantity: {totalItem}</Text>
      </View>
    </View>
  );
}

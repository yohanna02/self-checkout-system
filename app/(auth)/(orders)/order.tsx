import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, Query, query, where } from "firebase/firestore";
import { auth, store } from "@/lib/firebase";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";

export default function orders() {
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async function () {
      let ref: Query = query(
        collection(store, "orders"),
        where("userId", "==", auth.currentUser?.uid)
      );

      if (auth.currentUser?.email === "admin@checkout.com") {
        ref = query(collection(store, "orders"));
      }

      const snap = await getDocs(ref);

      const order = snap.docs.map(function (orderItem) {
        const data = orderItem.data();
        return {
          id: orderItem.id as string,
          numberOfItems: data.products.length as number,
          date: `${new Date(data.date).toLocaleTimeString()} - ${new Date(data.date).toLocaleDateString()}` as string,
          email: data.email as string,
        };
      });

      return order;
    },
  });

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {ordersQuery.status === "pending" ? (
        <ActivityIndicator color={Colors.primary} size="large" />
      ) : ordersQuery.status === "error" ? (
        <Text style={{ fontSize: 24, textAlign: "center", color: "red" }}>Error</Text>
      ) : ordersQuery.data?.length === 0 ? (
        <Text style={{ fontSize: 24, textAlign: "center" }}>No orders</Text>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isFetching}
              onRefresh={() => ordersQuery.refetch()}
              colors={[Colors.primary]}
            />
          }
          data={ordersQuery.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item: order }) => (
            <Link href={`/(auth)/(orders)/${order.id}`} key={order.id} asChild>
              <TouchableOpacity
                style={{
                  marginBottom: 16,
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text>{order.email}</Text>
                <View style={{justifyContent: "space-between", flexDirection: "row"}}>
                  <Text>{order.date}</Text>
                  <Text style={{ fontWeight: "bold" }}>
                    Items - {order.numberOfItems}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </View>
  );
}

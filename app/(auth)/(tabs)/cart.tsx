import {
  View,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useContext, useState } from "react";
import { cartContext } from "@/context/cartContext";
import CartItem from "@/components/CartItem";
import Colors from "@/constants/Colors";

export default function cart() {
  const { cartData } = useContext(cartContext);
  const [loading, setLoading] = useState(false);

  async function onDecrease(id: string, index: number) {
    // setLoading(true);

    // try {

    // }
  }

  async function onIncrease(id: string, index: number) {}

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 10 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {loading && (
        <View style={style.loadingStyle}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}

      <FlatList
        data={cartData}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <CartItem
            item={item}
            index={index}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
          />
        )}
        keyExtractor={(item) => item.id}
      />
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

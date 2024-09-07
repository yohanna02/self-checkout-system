import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { Link, useRouter } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

export default function profile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          queryClient.clear();
          await auth.signOut();
          router.replace("/");
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ marginHorizontal: 20 }}>
        <Text style={{ color: "#404040", fontSize: 20 }}>
          {auth.currentUser?.email}
        </Text>

        <View style={{ marginTop: 10 }}>
          <Link href="/(auth)/(orders)/order" asChild>
            <TouchableOpacity style={styles.btn}>
              <Feather name="shopping-cart" size={28} color="black" />
              <View>
                <Text style={styles.btnTextBig}>Orders</Text>
                {auth.currentUser?.email === "admin@checkout.com" ? (
                  <Text style={styles.btnTextSmall}>
                    See your customers Orders
                  </Text>
                ) : (
                  <Text>See all your order</Text>
                )}
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={20}
                color="black"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </Link>
          {auth.currentUser?.email === "admin@checkout.com" && (
            <Link href="/(auth)/manageStore" asChild>
              <TouchableOpacity style={styles.btn}>
                <Ionicons name="storefront-outline" size={28} color="black" />
                <View>
                  <Text style={styles.btnTextBig}>Manage Store</Text>
                  <Text style={styles.btnTextSmall}>
                    Add, edit and delete products
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="black"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            </Link>
          )}
          <TouchableOpacity style={styles.btn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={28} color="black" />
            <View>
              <Text style={styles.btnTextBig}>Logout</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={20}
              color="black"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  btn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  btnTextBig: {
    fontSize: 18,
    fontWeight: "bold",
  },
  btnTextSmall: {
    fontSize: 14,
    color: "#404040",
  },
});

import React from "react";
import { Tabs } from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function TabLayout() {

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary
    }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, focused, size }) => {
            if (!focused) {
              return <Ionicons name="home-outline" size={size} color={color} />;
            }

            return <Ionicons name="home" size={size} color={color} />
          },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          headerShown: true,
          title: "Cart",
          tabBarIcon: ({ color, focused, size }) => {
            if (!focused) {
              return <Ionicons name="cart-outline" size={size} color={color} />;
            }

            return <Ionicons name="cart" size={size} color={color} />
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "Profile",
          tabBarIcon: ({ color, focused, size }) => {
            if (!focused) {
              return <Ionicons name="person-outline" size={size} color={color} />;
            }

            return <Ionicons name="person" size={size} color={color} />
          },
        }}
      />
    </Tabs>
  );
}

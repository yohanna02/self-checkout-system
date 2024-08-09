import { View, Text, StatusBar } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function addToCart() {
  const { data } = useLocalSearchParams<{ data: string }>();
  return (
    <View>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Text>{data}</Text>
    </View>
  );
}

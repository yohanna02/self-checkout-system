import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function manageStore() {
  const { height, width } = useWindowDimensions();
  return (
    // <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, height: height }}>
        <Text>hhhh</Text>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 70,
            position: "absolute",
            top: height - height * 0.9,
            right: width / 2 - 35,
            height: 70,
            backgroundColor: Colors.primary,
            borderRadius: 100,
          }}
        >
          <AntDesign name="plus" size={28} color="white" />
        </TouchableOpacity>
      </ScrollView>
    // {/* </View> */}
  );
}

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import "react-native-reanimated";
import { auth } from "@/lib/firebase";
import { ActivityIndicator } from "react-native";
import Colors from "@/constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  function onAuthStateChanged(user: User | null) {
    setIsReady(true);
    setUser(user);

    if (user) {
      if (user.email === "admin@checkout.com") {
        router.push("/(auth)/profile");
        return;
      }
      router.push("/(auth)/(tabs)");
    }
  }

  useEffect(function () {
    const authSubscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return authSubscriber;
  }, []);

  if (!loaded) {
    return null;
  }

  if (!isReady) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        size={"large"}
        color={Colors.primary}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav user={user} />
    </QueryClientProvider>
  );
}

function RootLayoutNav({ user }: { user: User | null }) {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)/(tabs)"
        options={{ headerShown: false }}
        redirect={user === null}
      />
      <Stack.Screen
        name="(auth)/(modal)/addToCart"
        options={{
          headerShown: true,
          presentation: "modal",
          title: "Add to Cart",
        }}
        redirect={user === null}
      />
      <Stack.Screen
        name="(auth)/manageStore"
        options={{ title: "Manage Store" }}
        redirect={user === null}
      />
      <Stack.Screen
        name="(auth)/manageProduct"
        redirect={user === null}
      />
      <Stack.Screen
        name="(auth)/saveQrCode"
        redirect={user === null}
      />
      <Stack.Screen
        name="(public)/login"
        options={{ title: "Login/Register" }}
      />
    </Stack>
  );
}

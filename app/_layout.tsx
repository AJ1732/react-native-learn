import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { OfflineBanner } from "@/components/atoms/offline-banner";
import { initTokenStore } from "@/lib/axios/token-store";
import { darkTheme, lightTheme } from "@/lib/theme";
import { asyncStoragePersister } from "@/lib/query/persister";
import { queryClient } from "@/lib/query/query-client";
import { useOfflineQueue } from "@/lib/stores/offline-queue.store";
import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { StatusBar } from "expo-status-bar";

import "./global.css";

SplashScreen.preventAutoHideAsync();

// Refetch queries when app comes back to foreground
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

// Pause/resume queries based on network connectivity, flush offline queue on reconnect
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const online = !!state.isConnected;
    setOnline(online);
    if (online) {
      useOfflineQueue.getState().flush();
    }
  });
});

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const canvasColor = colorScheme === "dark" ? "#0a0a0a" : "#ffffff";

  const [fontsLoaded] = useFonts({
    "Brockmann-Medium": require("../assets/fonts/Brockmann-Medium.otf"),
    "integralcf-bold": require("../assets/fonts/integralcf-bold.otf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    initTokenStore().then(() => SplashScreen.hideAsync());
  }, [fontsLoaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24h
      }}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={[{ flex: 1 }, theme]}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: { backgroundColor: canvasColor },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal/index"
              options={{
                presentation: "formSheet",
                animation: "default",
                sheetAllowedDetents: [0.5, 1.0],
                sheetInitialDetentIndex: 0,
                sheetGrabberVisible: true,
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

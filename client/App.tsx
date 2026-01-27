import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Asset } from "expo-asset";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  VarelaRound_400Regular,
} from "@expo-google-fonts/varela-round";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CelebrationProvider } from "@/contexts/CelebrationContext";

import "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

function NavigationRoot() {
  const { isGuest, isAuthenticated } = useAuth();
  const navKey = isGuest ? 'guest' : isAuthenticated ? 'auth' : 'unauth';
  
  return (
    <NavigationContainer key={navKey}>
      <RootStackNavigator />
    </NavigationContainer>
  );
}

// Simulation Images
const simulationImages = [
  require("../assets/images/simulations/senior_woman_smiling_on_video_call.png"),
  require("../assets/images/simulations/fresh_colorful_vegetables_in_a_basket.png"),
  require("../assets/images/simulations/modern_tablet_with_email_inbox_ui.png"),
  require("../assets/images/simulations/close-up_of_hands_typing_message_on_smartphone.png"),
  require("../assets/images/simulations/modern_credit_card_on_a_clean_surface.png"),
  require("../assets/images/simulations/friendly_doctor_in_consultation_room.png"),
  require("../assets/images/simulations/modern_white_taxi_driving_on_city_street.png"),
  require("../assets/images/simulations/digital_calendar_on_a_smartphone_screen.png"),
];

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    VarelaRound_400Regular,
    ...Ionicons.font,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load images
        const cacheImages = simulationImages.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });
        await Promise.all(cacheImages);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, appIsReady]);

  if ((!fontsLoaded && !fontError) || !appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <ThemeProvider>
                <CelebrationProvider>
                  <AuthProvider>
                    <NavigationRoot />
                  </AuthProvider>
                </CelebrationProvider>
                <StatusBar style="dark" />
              </ThemeProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, View, ActivityIndicator, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "@/contexts/AuthContext";
import DashboardScreen from "@/screens/DashboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import GrandchildModeScreen from "@/screens/GrandchildModeScreen";
import LetterHelperScreen from "@/screens/LetterHelperScreen";
import MirrorWorldScreen from "@/screens/MirrorWorldScreen";
import WhatsAppGuidesScreen from "@/screens/WhatsAppGuidesScreen";
import GmailGuidesScreen from "@/screens/GmailGuidesScreen";
import GrandchildrenGuidesScreen from "@/screens/GrandchildrenGuidesScreen";
import WebsiteHelperScreen from "@/screens/WebsiteHelperScreen";
import PremiumScreen from "@/screens/PremiumScreen";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
  GrandchildMode: undefined;
  LetterHelper: undefined;
  MirrorWorld: undefined;
  WhatsAppGuides: undefined;
  GmailGuides: undefined;
  GrandchildrenGuides: undefined;
  WebsiteHelper: undefined;
  Premium: undefined;
};

export type RootStackParamList = AuthStackParamList & OnboardingStackParamList & MainStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle title="Dori AI" />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              hitSlop={8}
              testID="settings-button"
            >
              <Feather name="settings" size={24} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="GrandchildMode"
        component={GrandchildModeScreen}
        options={{
          headerTitle: "Grandchild Mode",
        }}
      />
      <Stack.Screen
        name="LetterHelper"
        component={LetterHelperScreen}
        options={{
          headerTitle: "Letter Helper",
        }}
      />
      <Stack.Screen
        name="MirrorWorld"
        component={MirrorWorldScreen}
        options={{
          headerTitle: "Practice Zone",
        }}
      />
      <Stack.Screen
        name="WhatsAppGuides"
        component={WhatsAppGuidesScreen}
        options={{
          headerTitle: "WhatsApp Guides",
        }}
      />
      <Stack.Screen
        name="GmailGuides"
        component={GmailGuidesScreen}
        options={{
          headerTitle: "Gmail Guides",
        }}
      />
      <Stack.Screen
        name="GrandchildrenGuides"
        component={GrandchildrenGuidesScreen}
        options={{
          headerTitle: "Grandchildren Guides",
        }}
      />
      <Stack.Screen
        name="WebsiteHelper"
        component={WebsiteHelperScreen}
        options={{
          headerTitle: "Website Helper",
        }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          headerTitle: "Premium",
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootStackNavigator() {
  const { isAuthenticated, isLoading, user, isGuest } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (isGuest) {
    return <MainStack />;
  }

  if (!user?.onboardingCompleted) {
    return <OnboardingStack />;
  }

  return <MainStack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

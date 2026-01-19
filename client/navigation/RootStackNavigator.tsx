import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DashboardScreen from "@/screens/DashboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import GrandchildModeScreen from "@/screens/GrandchildModeScreen";
import LetterHelperScreen from "@/screens/LetterHelperScreen";
import MirrorWorldScreen from "@/screens/MirrorWorldScreen";
import WhatsAppGuidesScreen from "@/screens/WhatsAppGuidesScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
  GrandchildMode: undefined;
  LetterHelper: undefined;
  MirrorWorld: undefined;
  WhatsAppGuides: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle title={t("appName")} />,
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
          headerTitle: t("settings.title"),
        }}
      />
      <Stack.Screen
        name="GrandchildMode"
        component={GrandchildModeScreen}
        options={{
          headerTitle: t("grandchildMode.title"),
        }}
      />
      <Stack.Screen
        name="LetterHelper"
        component={LetterHelperScreen}
        options={{
          headerTitle: t("letterHelper.title"),
        }}
      />
      <Stack.Screen
        name="MirrorWorld"
        component={MirrorWorldScreen}
        options={{
          headerTitle: t("mirrorWorld.title"),
        }}
      />
      <Stack.Screen
        name="WhatsAppGuides"
        component={WhatsAppGuidesScreen}
        options={{
          headerTitle: t("tools.whatsapp.title"),
        }}
      />
    </Stack.Navigator>
  );
}

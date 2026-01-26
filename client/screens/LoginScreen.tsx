import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/RootStackNavigator";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme, isDark } = useTheme();
  const { login, continueAsGuest } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing["4xl"], paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
              <Feather name="heart" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>שלום!</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              התחבר כדי להמשיך ללמוד
            </Text>
          </View>

          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? "dark" : "light"}
            style={[styles.formCard, { borderColor: theme.glassBorder }]}
          >
            <View style={styles.formContent}>
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: Colors.light.danger + "15" }]}>
                  <Feather name="alert-circle" size={20} color={Colors.light.danger} />
                  <Text style={[styles.errorText, { color: Colors.light.danger }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>אימייל</Text>
                <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="mail" size={22} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="input-email"
                    nativeID="input-email"
                    accessibilityLabel="Email Address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>סיסמה</Text>
                <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="lock" size={22} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    testID="input-password"
                    nativeID="input-password"
                    accessibilityLabel="Password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: theme.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                testID="button-login"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>כניסה</Text>
                )}
              </Pressable>
            </View>
          </BlurView>

          <Pressable
            style={({ pressed }) => [
              styles.guestButton, 
              { backgroundColor: pressed ? '#3DA015' : Colors.light.success }
            ]}
            onPress={continueAsGuest}
            testID="button-guest"
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
            <Text style={styles.guestButtonText}>המשך ללא הרשמה</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              עוד לא נרשמת?
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              testID="button-go-to-register"
            >
              <Text style={[styles.linkText, { color: theme.primary }]}>צור חשבון</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    ...Shadows.floating,
  },
  title: {
    ...Typography.h1,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    ...Shadows.glass,
  },
  formContent: {
    padding: Spacing.xl,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.small,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 64,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body,
    height: "100%",
  },
  button: {
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    ...Shadows.floating,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  guestButton: {
    height: 72,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
    gap: Spacing.md,
    ...Shadows.floating,
  },
  guestButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing["3xl"],
    gap: Spacing.sm,
  },
  footerText: {
    ...Typography.body,
  },
  linkText: {
    ...Typography.body,
    fontWeight: "600",
  },
});

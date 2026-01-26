import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import * as ExpoLinking from "expo-linking";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const PENDING_ORDER_KEY = "dori_pending_paypal_order";

const PREMIUM_GOLD = "#FFD700";
const PREMIUM_PURPLE = "#8B5CF6";

export default function PremiumScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const { data: subscriptionData, isLoading: subLoading, refetch: refetchSubscription } = useQuery<{
    isPremium?: boolean;
    plan?: string;
    status?: string;
    devMode?: boolean;
  }>({
    queryKey: ["/api/payments/subscription", user?.id],
    enabled: !!user?.id,
  });

  const { data: devModeData } = useQuery<{ devMode?: boolean }>({
    queryKey: ["/api/payments/dev-mode"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  const isPremium = subscriptionData?.isPremium || devModeData?.devMode;
  const isDevMode = devModeData?.devMode;
  const appState = useRef(AppState.currentState);
  const hasCheckedOnFocus = useRef(false);

  const loadPendingOrder = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PENDING_ORDER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.orderId && data.userId === user?.id) {
          setLastOrderId(data.orderId);
          return data.orderId;
        }
      }
    } catch (e) {
      console.error("Failed to load pending order:", e);
    }
    return null;
  }, [user?.id]);

  const savePendingOrder = useCallback(async (orderId: string) => {
    try {
      await AsyncStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({
        orderId,
        userId: user?.id,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.error("Failed to save pending order:", e);
    }
  }, [user?.id]);

  const clearPendingOrder = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PENDING_ORDER_KEY);
      setLastOrderId(null);
    } catch (e) {
      console.error("Failed to clear pending order:", e);
    }
  }, []);

  const autoCheckPayment = useCallback(async (orderId: string) => {
    if (!orderId || !user?.id || isChecking) return;
    
    setIsChecking(true);
    try {
      const response = await apiRequest("POST", "/api/payments/check-and-capture", {
        orderId,
        userId: user.id,
      });

      const data = await response.json();

      if (data.success && data.status === "COMPLETED") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "מזל טוב!",
          data.alreadyPremium 
            ? "יש לך כבר מנוי פרימיום פעיל!"
            : "התשלום הושלם בהצלחה. נהנה מכל פיצ'רי הפרימיום!",
          [{ text: "מעולה" }]
        );
        await clearPendingOrder();
        refetchSubscription();
      }
    } catch (error) {
      console.error("Auto check payment error:", error);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, isChecking, clearPendingOrder, refetchSubscription]);

  useEffect(() => {
    loadPendingOrder();
  }, [loadPendingOrder]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        const orderId = await loadPendingOrder();
        if (orderId) {
          autoCheckPayment(orderId);
        }
        refetchSubscription();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [loadPendingOrder, autoCheckPayment, refetchSubscription]);

  useFocusEffect(
    useCallback(() => {
      refetchSubscription();
      if (!hasCheckedOnFocus.current && lastOrderId) {
        hasCheckedOnFocus.current = true;
        autoCheckPayment(lastOrderId);
      }
    }, [refetchSubscription, lastOrderId, autoCheckPayment])
  );

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("Deep link received:", url);
      
      if (url.includes("payment-success")) {
        const parsed = ExpoLinking.parse(url);
        if (parsed.queryParams?.status === "completed") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "מזל טוב!",
            "התשלום הושלם בהצלחה. נהנה מכל פיצ'רי הפרימיום!",
            [{ text: "מעולה" }]
          );
          clearPendingOrder();
          refetchSubscription();
        }
      }
    };

    const subscription = ExpoLinking.addEventListener("url", handleDeepLink);

    ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refetchSubscription, clearPendingOrder]);

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!lastOrderId || !user?.id) return;
    
    setIsChecking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await apiRequest("POST", "/api/payments/check-and-capture", {
        orderId: lastOrderId,
        userId: user.id,
      });

      const data = await response.json();

      if (data.success && data.status === "COMPLETED") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "מזל טוב!",
          data.alreadyPremium 
            ? "יש לך כבר מנוי פרימיום פעיל!"
            : "התשלום הושלם בהצלחה. נהנה מכל פיצ'רי הפרימיום!",
          [{ text: "מעולה", onPress: () => refetchSubscription() }]
        );
        await clearPendingOrder();
      } else if (data.status === "APPROVED") {
        Alert.alert(
          "ממתינים לאישור",
          "התשלום אושר אבל עדיין לא הושלם. נסה שוב בעוד רגע"
        );
      } else {
        Alert.alert(
          "התשלום עדיין לא הושלם",
          `סטטוס נוכחי: ${data.status || "לא ידוע"}. נסה לחזור ל-PayPal ולאשר את התשלום, או נסה שוב מאוחר יותר`
        );
      }
    } catch (error) {
      console.error("Check payment error:", error);
      Alert.alert("שגיאה", "לא הצלחנו לבדוק את סטטוס התשלום");
    } finally {
      setIsChecking(false);
    }
  }, [lastOrderId, user?.id, refetchSubscription, clearPendingOrder]);

  const handleUpgrade = useCallback(async () => {
    if (!user?.id) {
      navigation.navigate("Login");
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await apiRequest("POST", "/api/payments/create-order", {
        amount: "49.90",
        currency: "ILS",
        userId: user.id,
      });

      const data = await response.json();

      if (data.orderId) {
        setLastOrderId(data.orderId);
        await savePendingOrder(data.orderId);
      }

      if (data.approvalUrl) {
        if (Platform.OS === "web") {
          window.open(data.approvalUrl, "_blank");
          Alert.alert(
            "תשלום ב-PayPal",
            "לאחר השלמת התשלום ב-PayPal, חזור לכאן ולחץ על 'שילמתי, בדוק סטטוס'",
            [{ text: "הבנתי" }]
          );
        } else {
          const result = await WebBrowser.openAuthSessionAsync(
            data.approvalUrl,
            ExpoLinking.createURL("payment-success")
          );
          
          if (result.type === "success" || result.type === "cancel" || result.type === "dismiss") {
            setTimeout(async () => {
              try {
                const captureResponse = await apiRequest("POST", "/api/payments/check-and-capture", {
                  orderId: data.orderId,
                  userId: user.id,
                });
                const captureData = await captureResponse.json();
                if (captureData.success && captureData.status === "COMPLETED") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert(
                    "מזל טוב!",
                    "התשלום הושלם בהצלחה. נהנה מכל פיצ'רי הפרימיום!",
                    [{ text: "מעולה", onPress: () => {
                      clearPendingOrder();
                      refetchSubscription();
                    }}]
                  );
                } else {
                  console.log("Payment not yet completed, status:", captureData.status);
                }
              } catch (captureError) {
                console.error("Capture error:", captureError);
              }
              refetchSubscription();
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, navigation, refetchSubscription, savePendingOrder, clearPendingOrder]);

  const features = [
    {
      icon: "message-circle",
      title: t("premium.features.unlimitedAI", "שיחות ללא הגבלה עם דורי"),
      description: t("premium.features.unlimitedAIDesc", "שאל כמה שאלות שתרצה"),
    },
    {
      icon: "file-text",
      title: t("premium.features.letterHelper", "עזרה בפענוח מכתבים"),
      description: t("premium.features.letterHelperDesc", "הסבר פשוט למכתבים רשמיים"),
    },
    {
      icon: "globe",
      title: t("premium.features.websiteHelper", "עזרה בהבנת אתרים"),
      description: t("premium.features.websiteHelperDesc", "ניווט קל באתרי אינטרנט"),
    },
    {
      icon: "heart",
      title: t("premium.features.support", "תמיכה אישית"),
      description: t("premium.features.supportDesc", "עזרה מהירה כשצריך"),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={[styles.crownContainer, { backgroundColor: PREMIUM_GOLD + "20" }]}>
            <Feather name="award" size={48} color={PREMIUM_GOLD} />
          </View>
          <ThemedText type="h1" style={styles.title}>
            {t("premium.title", "דורי פרימיום")}
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t("premium.subtitle", "כל הכלים שצריך במקום אחד")}
          </ThemedText>
        </Animated.View>

        {isPremium ? (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard style={StyleSheet.flatten([styles.statusCard, { borderColor: PREMIUM_GOLD }])}>
              <View style={styles.statusContent}>
                <Feather name="check-circle" size={32} color={PREMIUM_GOLD} />
                <View style={styles.statusText}>
                  <ThemedText type="h3" style={{ color: PREMIUM_GOLD }}>
                    {isDevMode 
                      ? t("premium.devMode", "מצב פיתוח") 
                      : t("premium.active", "מנוי פעיל")}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {isDevMode
                      ? t("premium.devModeDesc", "כל הפיצ'רים זמינים")
                      : t("premium.activeDesc", "כל הפיצ'רים פתוחים עבורך")}
                  </ThemedText>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        ) : null}

        <View style={styles.featuresSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            {t("premium.whatsIncluded", "מה כלול?")}
          </ThemedText>
          
          {features.map((feature, index) => (
            <Animated.View
              key={feature.icon}
              entering={FadeInDown.duration(400).delay(150 + index * 50)}
            >
              <View style={[styles.featureRow, { borderBottomColor: theme.glassBorder }]}>
                <View style={[styles.featureIcon, { backgroundColor: PREMIUM_PURPLE + "20" }]}>
                  <Feather name={feature.icon as any} size={24} color={PREMIUM_PURPLE} />
                </View>
                <View style={styles.featureText}>
                  <ThemedText type="body" style={styles.featureTitle}>
                    {feature.title}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {feature.description}
                  </ThemedText>
                </View>
                <Feather name="check" size={20} color={PREMIUM_GOLD} />
              </View>
            </Animated.View>
          ))}
        </View>

        {!isPremium ? (
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <ThemedText type="h1" style={[styles.price, { color: PREMIUM_PURPLE }]}>
                49.90
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {t("premium.perYear", "שקלים לשנה")}
              </ThemedText>
            </View>
            
            <GlassButton
              onPress={handleUpgrade}
              disabled={isProcessing || subLoading}
              style={StyleSheet.flatten([styles.upgradeButton, { backgroundColor: PREMIUM_PURPLE }])}
              testID="upgrade-button"
            >
              <ThemedText style={styles.upgradeButtonText}>
                {isProcessing 
                  ? t("premium.processing", "מעבד...") 
                  : t("premium.upgrade", "שדרג עכשיו")}
              </ThemedText>
            </GlassButton>

            {lastOrderId ? (
              <GlassButton
                onPress={handleCheckPaymentStatus}
                disabled={isChecking}
                style={StyleSheet.flatten([styles.checkButton, { borderColor: PREMIUM_PURPLE }])}
                testID="check-payment-button"
              >
                <Feather name="refresh-cw" size={18} color={PREMIUM_PURPLE} />
                <ThemedText style={[styles.checkButtonText, { color: PREMIUM_PURPLE }]}>
                  {isChecking ? "בודק..." : "שילמתי, בדוק סטטוס"}
                </ThemedText>
              </GlassButton>
            ) : null}

            <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
              {t("premium.disclaimer", "תשלום מאובטח דרך PayPal")}
            </ThemedText>
          </Animated.View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  statusCard: {
    marginBottom: Spacing.xl,
    borderWidth: 2,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusText: {
    flex: 1,
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
  },
  priceSection: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: 48,
    fontWeight: "700",
  },
  upgradeButton: {
    width: "100%",
    paddingVertical: Spacing.lg,
  },
  upgradeButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checkButton: {
    width: "100%",
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: "transparent",
    borderWidth: 2,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});

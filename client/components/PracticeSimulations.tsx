import React, { useState } from "react";
import { StyleSheet, View, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { 
  FadeIn, 
  FadeInUp, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SimulationProps {
  onComplete: () => void;
  stepIndex: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AppIcon({ 
  name, 
  icon, 
  color, 
  onPress 
}: { 
  name: string; 
  icon: keyof typeof Feather.glyphMap; 
  color: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable 
      style={[styles.appIcon, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.appIconBg, { backgroundColor: color }]}>
        <Feather name={icon} size={32} color="#FFFFFF" />
      </View>
      <ThemedText type="small" style={styles.appIconLabel}>{name}</ThemedText>
    </AnimatedPressable>
  );
}

function ContactCard({ 
  name, 
  avatar, 
  onVideoCall 
}: { 
  name: string; 
  avatar: string; 
  onVideoCall: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Animated.View 
      entering={FadeInUp.duration(300)}
      style={[styles.contactCard, { backgroundColor: theme.card }]}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primary + "30" }]}>
        <ThemedText type="h3" style={{ color: theme.primary }}>{avatar}</ThemedText>
      </View>
      <View style={styles.contactInfo}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>{name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "זמין" : "Available"}</ThemedText>
      </View>
      <Pressable 
        style={[styles.videoCallBtn, { backgroundColor: theme.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onVideoCall();
        }}
      >
        <Feather name="video" size={20} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

export function VideoCallSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoOpen")}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon 
            name={t("mirrorWorld.tasks.appVideoCall")} 
            icon="video" 
            color="#5B9BD5" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appMessages")} icon="message-circle" color="#F4B942" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoSelect")}
        </ThemedText>
        <View style={styles.contactsList}>
          <Pressable 
            style={[styles.contactRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: "#5B9BD5" + "30" }]}>
              <ThemedText style={{ color: "#5B9BD5" }}>S</ThemedText>
            </View>
            <ThemedText type="body">{t("mirrorWorld.tasks.contactSarah")}</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.contactRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: "#52C41A" + "30" }]}>
              <ThemedText style={{ color: "#52C41A" }}>M</ThemedText>
            </View>
            <ThemedText type="body">{t("mirrorWorld.tasks.contactMichael")}</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.contactRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: "#F4B942" + "30" }]}>
              <ThemedText style={{ color: "#F4B942" }}>E</ThemedText>
            </View>
            <ThemedText type="body">{t("mirrorWorld.tasks.contactEmma")}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoStart")}
        </ThemedText>
        <ContactCard name={t("mirrorWorld.tasks.contactSarah")} avatar="S" onVideoCall={onComplete} />
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoWait")}
        </ThemedText>
        <Pressable 
          style={styles.callingScreen}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
          }}
        >
          <Animated.View entering={ZoomIn.duration(500)} style={[styles.callingAvatar, { backgroundColor: "#5B9BD5" + "30" }]}>
            <ThemedText type="h1" style={{ color: "#5B9BD5" }}>S</ThemedText>
          </Animated.View>
          <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>{t("mirrorWorld.tasks.statusCalling", { name: t("mirrorWorld.tasks.contactSarah").split(" ")[0] })}</ThemedText>
          <Animated.View 
            entering={FadeIn.delay(500).duration(500)}
            style={styles.callingDots}
          >
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.7 }]} />
            <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.4 }]} />
          </Animated.View>
        </Pressable>
      </View>
    );
  }

  if (stepIndex === 4) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoEnd")}
        </ThemedText>
        <View style={styles.videoCallScreen}>
          <View style={[styles.videoFeed, { backgroundColor: "#5B9BD5" + "20" }]}>
            <ThemedText type="h1" style={{ color: "#5B9BD5" }}>S</ThemedText>
            <ThemedText type="body" style={{ marginTop: Spacing.sm }}>{t("mirrorWorld.tasks.contactSarah").split(" ")[0]}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("mirrorWorld.tasks.statusConnected", { time: "0:42" })}</ThemedText>
          </View>
          <View style={styles.callControls}>
            <View style={[styles.controlBtn, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="mic" size={24} color={theme.text} />
            </View>
            <Pressable 
              style={[styles.controlBtn, styles.endCallBtn]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onComplete();
              }}
            >
              <Feather name="phone-off" size={24} color="#FFFFFF" />
            </Pressable>
            <View style={[styles.controlBtn, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="video" size={24} color={theme.text} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

export function GrocerySimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoOpen").replace(t("mirrorWorld.tasks.appVideoCall"), t("mirrorWorld.tasks.appGroceries"))}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon name={t("mirrorWorld.tasks.appMessages")} icon="message-circle" color="#5B9BD5" onPress={() => {}} />
          <AppIcon 
            name={t("mirrorWorld.tasks.appGroceries")} 
            icon="shopping-cart" 
            color="#52C41A" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#F4B942" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקלד משהו בתיבת החיפוש, ואז הקש על חיפוש" : "Type something in the search box, then tap Search"}
        </ThemedText>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
              placeholder={t("mirrorWorld.tasks.placeholderSearch")}
              placeholderTextColor={theme.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <Pressable 
            style={[styles.searchBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <ThemedText style={{ color: "#FFFFFF" }}>{t("mirrorWorld.tasks.btnSearch")}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על 'הוסף' ליד כל פריט כדי להוסיף אותו לעגלה" : 'Tap "Add" on any item to add it to your cart'}
        </ThemedText>
        <View style={styles.productList}>
          {[
            { name: t("mirrorWorld.tasks.productMilk"), price: "₪18.00" },
            { name: t("mirrorWorld.tasks.productBread"), price: "₪12.00" },
            { name: t("mirrorWorld.tasks.productEggs"), price: "₪22.00" },
          ].map((item, index) => (
            <Animated.View 
              key={item.name}
              entering={FadeInUp.delay(index * 100).duration(300)}
              style={[styles.productCard, { backgroundColor: theme.card }]}
            >
              <View style={[styles.productImage, { backgroundColor: "#52C41A" + "20" }]}>
                <Feather name="package" size={24} color="#52C41A" />
              </View>
              <View style={styles.productInfo}>
                <ThemedText type="body">{item.name}</ThemedText>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>{item.price}</ThemedText>
              </View>
              <Pressable 
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onComplete();
                }}
              >
                <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>{t("mirrorWorld.tasks.btnAdd")}</ThemedText>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "בדוק את העגלה והקש על 'תשלום'" : 'Review your cart and tap "Checkout"'}
        </ThemedText>
        <View style={styles.cartContainer}>
          <View style={[styles.cartItem, { borderBottomColor: theme.border }]}>
            <ThemedText type="body">{t("mirrorWorld.tasks.productMilk")}</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>₪18.00</ThemedText>
          </View>
          <View style={[styles.cartItem, { borderBottomColor: theme.border }]}>
            <ThemedText type="body">{t("mirrorWorld.tasks.productBread")}</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>₪12.00</ThemedText>
          </View>
          <View style={[styles.cartTotal, { borderTopColor: theme.border }]}>
            <ThemedText type="h4">{t("common.loading") === "טוען..." ? "סה\"כ" : "Total"}</ThemedText>
            <ThemedText type="h4" style={{ color: theme.primary }}>₪30.00</ThemedText>
          </View>
          <Pressable 
            style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete();
            }}
          >
            <Feather name="shopping-bag" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
              {t("mirrorWorld.tasks.btnCheckout")}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 4) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "אשר את אמצעי התשלום והקש על 'בצע הזמנה'" : 'Confirm your payment method and tap "Place Order"'}
        </ThemedText>
        <View style={styles.checkoutScreen}>
          <View style={[styles.paymentCard, { backgroundColor: theme.card }]}>
            <Feather name="credit-card" size={24} color={theme.primary} />
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <ThemedText type="body">{t("mirrorWorld.tasks.paymentVisa")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("mirrorWorld.tasks.paymentDefault")}</ThemedText>
            </View>
            <Feather name="check-circle" size={24} color={theme.success} />
          </View>
          <View style={[styles.orderSummary, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.summaryRow}>
              <ThemedText type="body">{t("mirrorWorld.tasks.summarySubtotal")}</ThemedText>
              <ThemedText type="body">₪30.00</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="body">{t("mirrorWorld.tasks.summaryDelivery")}</ThemedText>
              <ThemedText type="body" style={{ color: theme.success }}>{t("mirrorWorld.tasks.summaryFree")}</ThemedText>
            </View>
            <View style={[styles.summaryRow, { marginTop: Spacing.sm }]}>
              <ThemedText type="h4">{t("common.loading") === "טוען..." ? "סה\"כ" : "Total"}</ThemedText>
              <ThemedText type="h4" style={{ color: theme.primary }}>₪30.00</ThemedText>
            </View>
          </View>
          <Pressable 
            style={[styles.placeOrderBtn, { backgroundColor: theme.success }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            }}
          >
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 18 }}>
              {t("mirrorWorld.tasks.btnPlaceOrder")}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

export function EmailSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [emailTo, setEmailTo] = useState("");
  const [emailBody, setEmailBody] = useState("");

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("mirrorWorld.tasks.hintVideoOpen").replace(t("mirrorWorld.tasks.appVideoCall"), t("mirrorWorld.tasks.appEmail"))}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon 
            name={t("mirrorWorld.tasks.appEmail")} 
            icon="mail" 
            color="#F4B942" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appMessages")} icon="message-circle" color="#5B9BD5" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על כפתור החיבור כדי לכתוב אימייל חדש" : "Tap the compose button to write a new email"}
        </ThemedText>
        <View style={styles.inboxScreen}>
          <View style={[styles.inboxHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="h4">{t("mirrorWorld.tasks.labelInbox")}</ThemedText>
            <Pressable 
              style={[styles.composeBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onComplete();
              }}
            >
              <Feather name="plus" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={[styles.emailRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.emailDot, { backgroundColor: theme.primary }]} />
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Amazon</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("mirrorWorld.tasks.statusOrderShipped")}</ThemedText>
            </View>
          </View>
          <View style={[styles.emailRow, { borderBottomColor: theme.border }]}>
            <View style={styles.emailDot} />
            <View style={{ flex: 1 }}>
              <ThemedText type="body">Newsletter</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("mirrorWorld.tasks.labelNewsletter")}</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקלד את כתובת האימייל של הנמען" : "Type the recipient's email address"}
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>{t("mirrorWorld.tasks.labelTo")}</ThemedText>
            <TextInput
              style={[styles.emailInput, { color: theme.text, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
              placeholder={t("mirrorWorld.tasks.placeholderEmail")}
              placeholderTextColor={theme.textSecondary}
              value={emailTo}
              onChangeText={setEmailTo}
              keyboardType="email-address"
            />
          </View>
          <Pressable 
            style={[styles.continueBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <ThemedText style={{ color: "#FFFFFF" }}>{t("mirrorWorld.tasks.btnContinue")}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "כתוב את ההודעה שלך בתיבה" : "Type your message in the box"}
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>{t("mirrorWorld.tasks.labelTo")}</ThemedText>
            <ThemedText type="body">{t("mirrorWorld.tasks.emailSarah")}</ThemedText>
          </View>
          <TextInput
            style={[styles.messageInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
            placeholder={t("mirrorWorld.tasks.placeholderMessage")}
            placeholderTextColor={theme.textSecondary}
            value={emailBody}
            onChangeText={setEmailBody}
            multiline
            numberOfLines={4}
          />
          <Pressable 
            style={[styles.continueBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <ThemedText style={{ color: "#FFFFFF" }}>{t("mirrorWorld.tasks.btnContinue")}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 4) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על כפתור השליחה כדי לשלוח את האימייל" : "Tap the Send button to send your email"}
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>{t("mirrorWorld.tasks.labelTo")}</ThemedText>
            <ThemedText type="body">{t("mirrorWorld.tasks.emailSarah")}</ThemedText>
          </View>
          <View style={[styles.messagePreview, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="body" style={{ textAlign: t("common.loading") === "טוען..." ? "right" : "left" }}>{t("mirrorWorld.tasks.emailPreview")}</ThemedText>
          </View>
          <Pressable 
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            }}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
              {t("mirrorWorld.tasks.btnSendEmail")}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  simulationContainer: {
    flex: 1,
    width: "100%",
  },
  hint: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    fontStyle: "italic",
  },
  homeScreen: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xl,
    padding: Spacing.lg,
  },
  appIcon: {
    alignItems: "center",
    width: 80,
  },
  appIconBg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  appIconLabel: {
    textAlign: "center",
  },
  contactsList: {
    flex: 1,
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  contactCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  videoCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  callingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  callingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  callingDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  videoCallScreen: {
    flex: 1,
    width: "100%",
  },
  videoFeed: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  endCallBtn: {
    backgroundColor: "#FF3B30",
  },
  searchContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  searchBtn: {
    height: 50,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
  },
  productList: {
    gap: Spacing.md,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  cartContainer: {
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 2,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  checkoutScreen: {
    gap: Spacing.lg,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  orderSummary: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  placeOrderBtn: {
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  inboxScreen: {
    flex: 1,
  },
  inboxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  composeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  emailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  composeScreen: {
    gap: Spacing.lg,
  },
  emailField: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  messageInput: {
    height: 150,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    textAlignVertical: "top",
  },
  messagePreview: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 120,
  },
  continueBtn: {
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
  },
});

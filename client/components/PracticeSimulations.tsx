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

export function WhatsAppSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על וואטסאפ כדי לפתוח אותו" : "Tap WhatsApp to open it"}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon 
            name={t("mirrorWorld.tasks.appWhatsApp")} 
            icon="message-circle" 
            color="#25D366" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appEmail")} icon="mail" color="#F4B942" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על איש קשר כדי לפתוח שיחה" : "Tap a contact to open a chat"}
        </ThemedText>
        <View style={styles.contactsList}>
          <Pressable 
            style={[styles.contactRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: "#25D366" + "30" }]}>
              <ThemedText style={{ color: "#25D366" }}>S</ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="body">{t("mirrorWorld.tasks.contactSarah")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "לחץ לכתיבת הודעה" : "Tap to write a message"}</ThemedText>
            </View>
          </Pressable>
          <Pressable 
            style={[styles.contactRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: "#5B9BD5" + "30" }]}>
              <ThemedText style={{ color: "#5B9BD5" }}>M</ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="body">{t("mirrorWorld.tasks.contactMichael")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "לחץ לכתיבת הודעה" : "Tap to write a message"}</ThemedText>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "כתוב הודעה בתיבה למטה" : "Type a message in the box below"}
        </ThemedText>
        <View style={styles.chatScreen}>
          <View style={[styles.chatBubble, { backgroundColor: theme.backgroundSecondary, alignSelf: "flex-start" }]}>
            <ThemedText>{t("common.loading") === "טוען..." ? "היי! מה שלומך?" : "Hi! How are you?"}</ThemedText>
          </View>
          <View style={styles.chatInputArea}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
              placeholder={t("common.loading") === "טוען..." ? "כתוב הודעה..." : "Type a message..."}
              placeholderTextColor={theme.textSecondary}
              value={message}
              onChangeText={setMessage}
            />
            <Pressable 
              style={[styles.chatSendBtn, { backgroundColor: "#25D366" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onComplete();
              }}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "מעולה! הודעה נשלחה בהצלחה!" : "Great! Message sent successfully!"}
        </ThemedText>
        <View style={styles.chatScreen}>
          <View style={[styles.chatBubble, { backgroundColor: theme.backgroundSecondary, alignSelf: "flex-start" }]}>
            <ThemedText>{t("common.loading") === "טוען..." ? "היי! מה שלומך?" : "Hi! How are you?"}</ThemedText>
          </View>
          <View style={[styles.chatBubble, { backgroundColor: "#25D366", alignSelf: "flex-end" }]}>
            <ThemedText style={{ color: "#FFFFFF" }}>{t("common.loading") === "טוען..." ? "הכל טוב, תודה!" : "All good, thanks!"}</ThemedText>
          </View>
          <Animated.View entering={ZoomIn.duration(300)}>
            <Pressable 
              style={[styles.successBtn, { backgroundColor: theme.success }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onComplete();
              }}
            >
              <Feather name="check-circle" size={20} color="#FFFFFF" />
              <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
                {t("common.loading") === "טוען..." ? "סיום" : "Complete"}
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return null;
}

export function BankSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על אפליקציית הבנק כדי לפתוח אותה" : "Tap the Bank app to open it"}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon name={t("mirrorWorld.tasks.appWhatsApp")} icon="message-circle" color="#25D366" onPress={() => {}} />
          <AppIcon 
            name={t("mirrorWorld.tasks.appBank")} 
            icon="credit-card" 
            color="#1E88E5" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הזן את הקוד שלך (4 ספרות)" : "Enter your PIN (4 digits)"}
        </ThemedText>
        <View style={styles.pinScreen}>
          <View style={[styles.bankLogo, { backgroundColor: "#1E88E5" + "20" }]}>
            <Feather name="credit-card" size={40} color="#1E88E5" />
          </View>
          <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>{t("common.loading") === "טוען..." ? "כניסה לחשבון" : "Account Login"}</ThemedText>
          <TextInput
            style={[styles.pinInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            placeholder="••••"
            placeholderTextColor={theme.textSecondary}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          <Pressable 
            style={[styles.bankBtn, { backgroundColor: "#1E88E5" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete();
            }}
          >
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>{t("common.loading") === "טוען..." ? "כניסה" : "Log In"}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הנה היתרה שלך. הקש להמשך" : "Here's your balance. Tap to continue"}
        </ThemedText>
        <Pressable style={styles.balanceScreen} onPress={onComplete}>
          <View style={[styles.balanceCard, { backgroundColor: "#1E88E5" }]}>
            <ThemedText style={{ color: "#FFFFFF", opacity: 0.8 }}>{t("common.loading") === "טוען..." ? "חשבון עובר ושב" : "Checking Account"}</ThemedText>
            <ThemedText type="h1" style={{ color: "#FFFFFF", marginVertical: Spacing.md }}>₪12,450.00</ThemedText>
            <ThemedText style={{ color: "#FFFFFF", opacity: 0.8 }}>{t("common.loading") === "טוען..." ? "לחץ לפרטים נוספים" : "Tap for details"}</ThemedText>
          </View>
        </Pressable>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הנה הפעולות האחרונות. הקש על כפתור הסיום" : "Here are recent transactions. Tap Complete"}
        </ThemedText>
        <View style={styles.transactionsList}>
          <View style={[styles.transactionRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.transactionIcon, { backgroundColor: "#52C41A" + "20" }]}>
              <Feather name="arrow-down-left" size={18} color="#52C41A" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText>{t("common.loading") === "טוען..." ? "הפקדה" : "Deposit"}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>15/01</ThemedText>
            </View>
            <ThemedText style={{ color: "#52C41A", fontWeight: "600" }}>+₪5,000</ThemedText>
          </View>
          <View style={[styles.transactionRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.transactionIcon, { backgroundColor: "#FF6B6B" + "20" }]}>
              <Feather name="arrow-up-right" size={18} color="#FF6B6B" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText>{t("common.loading") === "טוען..." ? "סופרמרקט" : "Supermarket"}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>14/01</ThemedText>
            </View>
            <ThemedText style={{ color: "#FF6B6B", fontWeight: "600" }}>-₪320</ThemedText>
          </View>
          <Pressable 
            style={[styles.successBtn, { backgroundColor: theme.success }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            }}
          >
            <Feather name="check-circle" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
              {t("common.loading") === "טוען..." ? "סיום" : "Complete"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

export function DoctorSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על אפליקציית הבריאות כדי לפתוח אותה" : "Tap the Health app to open it"}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon name={t("mirrorWorld.tasks.appBank")} icon="credit-card" color="#1E88E5" onPress={() => {}} />
          <AppIcon 
            name={t("mirrorWorld.tasks.appHealth")} 
            icon="heart" 
            color="#E91E63" 
            onPress={onComplete}
          />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appSettings")} icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "בחר את הרופא שלך" : "Choose your doctor"}
        </ThemedText>
        <View style={styles.doctorList}>
          <Pressable 
            style={[styles.doctorCard, { backgroundColor: theme.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.doctorAvatar, { backgroundColor: "#E91E63" + "20" }]}>
              <Feather name="user" size={24} color="#E91E63" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>{t("common.loading") === "טוען..." ? "ד\"ר כהן" : "Dr. Cohen"}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "רופא משפחה" : "Family Doctor"}</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <Pressable 
            style={[styles.doctorCard, { backgroundColor: theme.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.doctorAvatar, { backgroundColor: "#5B9BD5" + "20" }]}>
              <Feather name="user" size={24} color="#5B9BD5" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>{t("common.loading") === "טוען..." ? "ד\"ר לוי" : "Dr. Levi"}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "קרדיולוג" : "Cardiologist"}</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "בחר תאריך לתור" : "Pick a date for your appointment"}
        </ThemedText>
        <View style={styles.dateGrid}>
          {["20", "21", "22", "23"].map((day, idx) => (
            <Pressable 
              key={day}
              style={[styles.dateBtn, idx === 1 ? { backgroundColor: "#E91E63" } : { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onComplete();
              }}
            >
              <ThemedText style={{ color: idx === 1 ? "#FFFFFF" : theme.text, fontWeight: "600" }}>{day}</ThemedText>
              <ThemedText type="small" style={{ color: idx === 1 ? "#FFFFFF" : theme.textSecondary }}>
                {t("common.loading") === "טוען..." ? "ינו׳" : "Jan"}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <ThemedText type="small" style={{ textAlign: "center", marginTop: Spacing.md, color: theme.textSecondary }}>
          {t("common.loading") === "טוען..." ? "הקש על תאריך כדי להמשיך" : "Tap a date to continue"}
        </ThemedText>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "אשר את התור שלך" : "Confirm your appointment"}
        </ThemedText>
        <View style={[styles.appointmentCard, { backgroundColor: theme.card }]}>
          <View style={styles.appointmentHeader}>
            <Feather name="calendar" size={24} color="#E91E63" />
            <ThemedText type="h4" style={{ marginLeft: Spacing.md }}>
              {t("common.loading") === "טוען..." ? "אישור תור" : "Appointment Confirmation"}
            </ThemedText>
          </View>
          <View style={styles.appointmentDetail}>
            <ThemedText style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "רופא:" : "Doctor:"}</ThemedText>
            <ThemedText style={{ fontWeight: "600" }}>{t("common.loading") === "טוען..." ? "ד\"ר כהן" : "Dr. Cohen"}</ThemedText>
          </View>
          <View style={styles.appointmentDetail}>
            <ThemedText style={{ color: theme.textSecondary }}>{t("common.loading") === "טוען..." ? "תאריך:" : "Date:"}</ThemedText>
            <ThemedText style={{ fontWeight: "600" }}>21/01/2026, 10:00</ThemedText>
          </View>
          <Pressable 
            style={[styles.confirmBtn, { backgroundColor: "#E91E63" }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            }}
          >
            <Feather name="check" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
              {t("common.loading") === "טוען..." ? "אשר תור" : "Confirm Appointment"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

export function SettingsSimulation({ onComplete, stepIndex }: SimulationProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(2);

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על הגדרות כדי לפתוח אותן" : "Tap Settings to open it"}
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon name={t("mirrorWorld.tasks.appWhatsApp")} icon="message-circle" color="#25D366" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appPhotos")} icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name={t("mirrorWorld.tasks.appEmail")} icon="mail" color="#F4B942" onPress={() => {}} />
          <AppIcon 
            name={t("mirrorWorld.tasks.appSettings")} 
            icon="settings" 
            color="#9B59B6" 
            onPress={onComplete}
          />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "הקש על 'תצוגה' כדי לשנות הגדרות" : "Tap 'Display' to change settings"}
        </ThemedText>
        <View style={styles.settingsList}>
          <Pressable 
            style={[styles.settingsRow, { borderBottomColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <View style={[styles.settingsIcon, { backgroundColor: "#9B59B6" + "20" }]}>
              <Feather name="sun" size={20} color="#9B59B6" />
            </View>
            <ThemedText style={{ flex: 1 }}>{t("common.loading") === "טוען..." ? "תצוגה" : "Display"}</ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.settingsRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: "#5B9BD5" + "20" }]}>
              <Feather name="wifi" size={20} color="#5B9BD5" />
            </View>
            <ThemedText style={{ flex: 1 }}>{t("common.loading") === "טוען..." ? "אינטרנט" : "Wi-Fi"}</ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
          <View style={[styles.settingsRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: "#52C41A" + "20" }]}>
              <Feather name="volume-2" size={20} color="#52C41A" />
            </View>
            <ThemedText style={{ flex: 1 }}>{t("common.loading") === "טוען..." ? "צלילים" : "Sounds"}</ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "גרור את המחוון כדי להגדיל את הטקסט" : "Drag the slider to make text bigger"}
        </ThemedText>
        <View style={styles.displaySettings}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
            {t("common.loading") === "טוען..." ? "גודל טקסט" : "Text Size"}
          </ThemedText>
          <View style={styles.fontSizeDemo}>
            <ThemedText type="small" style={{ fontSize: 12 + fontSize * 2 }}>Aa</ThemedText>
            <ThemedText type="body" style={{ fontSize: 16 + fontSize * 2, marginHorizontal: Spacing.lg }}>Aa</ThemedText>
            <ThemedText type="h3" style={{ fontSize: 20 + fontSize * 2 }}>Aa</ThemedText>
          </View>
          <View style={styles.sliderContainer}>
            <ThemedText>A</ThemedText>
            <View style={[styles.slider, { backgroundColor: theme.backgroundSecondary }]}>
              {[0, 1, 2, 3, 4].map((level) => (
                <Pressable 
                  key={level}
                  style={[
                    styles.sliderDot, 
                    { backgroundColor: level <= fontSize ? "#9B59B6" : theme.textSecondary }
                  ]}
                  onPress={() => {
                    setFontSize(level);
                    if (level >= 3) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onComplete();
                    }
                  }}
                />
              ))}
            </View>
            <ThemedText type="h4">A</ThemedText>
          </View>
          <ThemedText type="small" style={{ textAlign: "center", color: theme.textSecondary, marginTop: Spacing.md }}>
            {t("common.loading") === "טוען..." ? "הקש על הנקודות כדי להגדיל" : "Tap the dots to increase size"}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          {t("common.loading") === "טוען..." ? "מעולה! ההגדרות נשמרו" : "Great! Settings saved"}
        </ThemedText>
        <View style={styles.successScreen}>
          <Animated.View entering={ZoomIn.duration(300)} style={[styles.successIcon, { backgroundColor: "#9B59B6" + "20" }]}>
            <Feather name="check-circle" size={48} color="#9B59B6" />
          </Animated.View>
          <ThemedText type="h3" style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
            {t("common.loading") === "טוען..." ? "הגדרות נשמרו!" : "Settings Saved!"}
          </ThemedText>
          <ThemedText style={{ color: theme.textSecondary, textAlign: "center" }}>
            {t("common.loading") === "טוען..." ? "הטקסט יהיה גדול יותר בכל האפליקציות" : "Text will be larger in all apps"}
          </ThemedText>
          <Pressable 
            style={[styles.successBtn, { backgroundColor: theme.success, marginTop: Spacing.xl }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            }}
          >
            <Feather name="check-circle" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
              {t("common.loading") === "טוען..." ? "סיום" : "Complete"}
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
  chatScreen: {
    flex: 1,
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  chatBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    maxWidth: "80%",
  },
  chatInputArea: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  pinScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bankLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  pinInput: {
    width: 200,
    height: 56,
    borderRadius: BorderRadius.md,
    fontSize: 24,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  bankBtn: {
    width: 200,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceScreen: {
    flex: 1,
    justifyContent: "center",
  },
  balanceCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  transactionsList: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  doctorList: {
    gap: Spacing.md,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  dateGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  dateBtn: {
    width: 60,
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appointmentDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  settingsList: {
    gap: Spacing.sm,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  displaySettings: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fontSizeDemo: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: Spacing.xl,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
  },
  slider: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  sliderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

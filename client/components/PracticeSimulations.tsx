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
        <ThemedText type="small" style={{ color: theme.textSecondary }}>Available</ThemedText>
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
  const [showContacts, setShowContacts] = useState(false);
  const [calling, setCalling] = useState(false);
  const [connected, setConnected] = useState(false);

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the video app to open it
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon 
            name="Video Call" 
            icon="video" 
            color="#5B9BD5" 
            onPress={onComplete}
          />
          <AppIcon name="Photos" icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name="Messages" icon="message-circle" color="#F4B942" onPress={() => {}} />
          <AppIcon name="Settings" icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap on a contact to select them
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
            <ThemedText type="body">Sarah (Daughter)</ThemedText>
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
            <ThemedText type="body">Michael (Son)</ThemedText>
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
            <ThemedText type="body">Emma (Granddaughter)</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the video button to start the call
        </ThemedText>
        <ContactCard name="Sarah (Daughter)" avatar="S" onVideoCall={onComplete} />
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Wait for them to answer... (Tap to simulate)
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
          <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>Calling Sarah...</ThemedText>
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
          Tap the red button to end the call
        </ThemedText>
        <View style={styles.videoCallScreen}>
          <View style={[styles.videoFeed, { backgroundColor: "#5B9BD5" + "20" }]}>
            <ThemedText type="h1" style={{ color: "#5B9BD5" }}>S</ThemedText>
            <ThemedText type="body" style={{ marginTop: Spacing.sm }}>Sarah</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Connected - 0:42</ThemedText>
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
  const [searchText, setSearchText] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the grocery app to open it
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon name="Messages" icon="message-circle" color="#5B9BD5" onPress={() => {}} />
          <AppIcon 
            name="Groceries" 
            icon="shopping-cart" 
            color="#52C41A" 
            onPress={onComplete}
          />
          <AppIcon name="Photos" icon="image" color="#F4B942" onPress={() => {}} />
          <AppIcon name="Settings" icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Type something in the search box, then tap Search
        </ThemedText>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search for groceries..."
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
            <ThemedText style={{ color: "#FFFFFF" }}>Search</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 2) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap "Add" on any item to add it to your cart
        </ThemedText>
        <View style={styles.productList}>
          {[
            { name: "Fresh Milk", price: "$4.99" },
            { name: "Bread", price: "$3.49" },
            { name: "Eggs (12)", price: "$5.99" },
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
                <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Add</ThemedText>
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
          Review your cart and tap "Checkout"
        </ThemedText>
        <View style={styles.cartContainer}>
          <View style={[styles.cartItem, { borderBottomColor: theme.border }]}>
            <ThemedText type="body">Fresh Milk</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>$4.99</ThemedText>
          </View>
          <View style={[styles.cartItem, { borderBottomColor: theme.border }]}>
            <ThemedText type="body">Bread</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>$3.49</ThemedText>
          </View>
          <View style={[styles.cartTotal, { borderTopColor: theme.border }]}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="h4" style={{ color: theme.primary }}>$8.48</ThemedText>
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
              Checkout
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
          Confirm your payment method and tap "Place Order"
        </ThemedText>
        <View style={styles.checkoutScreen}>
          <View style={[styles.paymentCard, { backgroundColor: theme.card }]}>
            <Feather name="credit-card" size={24} color={theme.primary} />
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <ThemedText type="body">Visa ending in 4242</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Default payment</ThemedText>
            </View>
            <Feather name="check-circle" size={24} color={theme.success} />
          </View>
          <View style={[styles.orderSummary, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.summaryRow}>
              <ThemedText type="body">Subtotal</ThemedText>
              <ThemedText type="body">$8.48</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="body">Delivery</ThemedText>
              <ThemedText type="body" style={{ color: theme.success }}>Free</ThemedText>
            </View>
            <View style={[styles.summaryRow, { marginTop: Spacing.sm }]}>
              <ThemedText type="h4">Total</ThemedText>
              <ThemedText type="h4" style={{ color: theme.primary }}>$8.48</ThemedText>
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
              Place Order
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
  const [emailTo, setEmailTo] = useState("");
  const [emailBody, setEmailBody] = useState("");

  if (stepIndex === 0) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the email app to open it
        </ThemedText>
        <View style={styles.homeScreen}>
          <AppIcon 
            name="Email" 
            icon="mail" 
            color="#F4B942" 
            onPress={onComplete}
          />
          <AppIcon name="Photos" icon="image" color="#52C41A" onPress={() => {}} />
          <AppIcon name="Messages" icon="message-circle" color="#5B9BD5" onPress={() => {}} />
          <AppIcon name="Settings" icon="settings" color="#9B59B6" onPress={() => {}} />
        </View>
      </View>
    );
  }

  if (stepIndex === 1) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the compose button to write a new email
        </ThemedText>
        <View style={styles.inboxScreen}>
          <View style={[styles.inboxHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="h4">Inbox</ThemedText>
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
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Your order has shipped...</ThemedText>
            </View>
          </View>
          <View style={[styles.emailRow, { borderBottomColor: theme.border }]}>
            <View style={styles.emailDot} />
            <View style={{ flex: 1 }}>
              <ThemedText type="body">Newsletter</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Weekly updates...</ThemedText>
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
          Type the recipient's email address
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>To:</ThemedText>
            <TextInput
              style={[styles.emailInput, { color: theme.text }]}
              placeholder="Enter email address"
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
            <ThemedText style={{ color: "#FFFFFF" }}>Continue</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 3) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Type your message in the box
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>To:</ThemedText>
            <ThemedText type="body">sarah@email.com</ThemedText>
          </View>
          <TextInput
            style={[styles.messageInput, { color: theme.text, backgroundColor: theme.backgroundSecondary }]}
            placeholder="Write your message here..."
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
            <ThemedText style={{ color: "#FFFFFF" }}>Continue</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (stepIndex === 4) {
    return (
      <View style={styles.simulationContainer}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the Send button to send your email
        </ThemedText>
        <View style={styles.composeScreen}>
          <View style={[styles.emailField, { borderBottomColor: theme.border }]}>
            <ThemedText type="body" style={{ width: 50, color: theme.textSecondary }}>To:</ThemedText>
            <ThemedText type="body">sarah@email.com</ThemedText>
          </View>
          <View style={[styles.messagePreview, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="body">Hi Sarah,{"\n\n"}Hope you're doing well! Just wanted to say hello.{"\n\n"}Love,{"\n"}Mom/Dad</ThemedText>
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
              Send Email
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
    width: 72,
  },
  appIconBg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  appIconLabel: {
    textAlign: "center",
    fontSize: 12,
  },
  contactsList: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  videoCallBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  callingScreen: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  callingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  callingDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  videoCallScreen: {
    flex: 1,
    width: "100%",
  },
  videoFeed: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  endCallBtn: {
    backgroundColor: "#E74C3C",
  },
  searchContainer: {
    width: "100%",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  productList: {
    width: "100%",
    gap: Spacing.md,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
  },
  addBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  cartContainer: {
    width: "100%",
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
    paddingTop: Spacing.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 2,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  checkoutScreen: {
    width: "100%",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  orderSummary: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  placeOrderBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  inboxScreen: {
    width: "100%",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  emailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  composeScreen: {
    width: "100%",
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
  },
  messageInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  messagePreview: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    minHeight: 100,
  },
  continueBtn: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
});

import React from "react";
import { StyleSheet, View, Pressable, Linking, Platform, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AuraColors } from "@/constants/theme";

export interface CircleContact {
  id: string;
  name: string;
  phone: string;
  relationship: "daughter" | "son" | "doctor" | "spouse" | "caregiver" | "friend";
  avatarInitials?: string;
  isPrimary?: boolean;
}

interface AuraCircleContactsProps {
  contacts: CircleContact[];
  onContactPress?: (contact: CircleContact) => void;
}

const getRelationshipColor = (relationship: CircleContact["relationship"]): string => {
  switch (relationship) {
    case "daughter":
      return "#FF69B4";
    case "son":
      return "#4169E1";
    case "doctor":
      return "#32CD32";
    case "spouse":
      return "#FFD700";
    case "caregiver":
      return "#9370DB";
    default:
      return "#87CEEB";
  }
};

const getRelationshipIcon = (relationship: CircleContact["relationship"]): keyof typeof Feather.glyphMap => {
  switch (relationship) {
    case "doctor":
      return "plus-circle";
    default:
      return "user";
  }
};

function ContactAvatar({ contact, onPress }: { contact: CircleContact; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const color = getRelationshipColor(contact.relationship);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const initials = contact.avatarInitials || contact.name.charAt(0).toUpperCase();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.avatarContainer, contact.isPrimary && styles.primaryBorder]}
        testID={`contact-${contact.id}`}
      >
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </View>
        <View style={[styles.callBadge, { backgroundColor: theme.primary }]}>
          <Feather name="phone" size={12} color="#FFFFFF" />
        </View>
      </Pressable>
      <ThemedText style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
        {contact.name}
      </ThemedText>
    </Animated.View>
  );
}

export function AuraCircleContacts({ contacts, onContactPress }: AuraCircleContactsProps) {
  const { theme } = useTheme();
  const displayContacts = contacts.slice(0, 3);

  const handleContactCall = async (contact: CircleContact) => {
    if (onContactPress) {
      onContactPress(contact);
      return;
    }

    const phoneNumber = contact.phone.replace(/[^0-9+]/g, "");
    const url = Platform.OS === "ios" ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open phone", error);
    }
  };

  if (displayContacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={24} color={theme.textSecondary} />
        <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
          No contacts added
        </ThemedText>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        My Circle
      </ThemedText>
      <View style={styles.contactsRow}>
        {displayContacts.map((contact) => (
          <ContactAvatar
            key={contact.id}
            contact={contact}
            onPress={() => handleContactCall(contact)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  avatarContainer: {
    alignItems: "center",
    position: "relative",
  },
  primaryBorder: {
    borderWidth: 3,
    borderColor: "#FFD700",
    borderRadius: 38,
    padding: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  callBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contactName: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
    maxWidth: 70,
  },
  emptyContainer: {
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: 14,
  },
});

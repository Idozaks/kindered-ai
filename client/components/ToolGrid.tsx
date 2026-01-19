import React from "react";
import { StyleSheet, View, Image, ImageSourcePropType } from "react-native";
import { Feather } from "@expo/vector-icons";

import { GlassCard } from "@/components/GlassCard";
import { Spacing } from "@/constants/theme";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon?: keyof typeof Feather.glyphMap;
  image?: ImageSourcePropType;
  color: string;
}

interface ToolGridProps {
  tools: Tool[];
  onToolPress: (toolId: string) => void;
}

export function ToolGrid({ tools, onToolPress }: ToolGridProps) {
  return (
    <View style={styles.grid}>
      {tools.map((tool) => (
        <View key={tool.id} style={styles.gridItem}>
          <GlassCard
            title={tool.title}
            description={tool.description}
            onPress={() => onToolPress(tool.id)}
            icon={
              tool.image ? (
                <Image source={tool.image} style={styles.toolImage} />
              ) : (
                <View style={[styles.iconBg, { backgroundColor: tool.color + "20" }]}>
                  <Feather name={tool.icon as any} size={28} color={tool.color} />
                </View>
              )
            }
            testID={`tool-grid-${tool.id}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  gridItem: {
    width: "48%",
    flexGrow: 1,
    minWidth: 150,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  toolImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
});

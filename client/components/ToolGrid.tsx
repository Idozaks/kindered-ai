import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { GlassCard } from "@/components/GlassCard";
import { Spacing } from "@/constants/theme";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
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
              <View style={[styles.iconBg, { backgroundColor: tool.color + "15" }]}>
                <Feather name={tool.icon} size={24} color={tool.color} />
              </View>
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
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    height: 140,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

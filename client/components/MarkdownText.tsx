import React from "react";
import { Text, TextStyle, StyleProp } from "react-native";

interface MarkdownTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  type?: "body" | "small" | "h1" | "h2" | "h3" | "h4";
}

export function MarkdownText({ children, style, type = "body" }: MarkdownTextProps) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2);
          return (
            <Text key={index} style={{ fontWeight: "bold" }}>
              {boldText}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

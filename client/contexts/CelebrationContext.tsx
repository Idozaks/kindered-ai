import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Celebration } from "@/components/Celebration";

interface CelebrationOptions {
  message?: string;
  subMessage?: string;
  type?: "confetti" | "starburst" | "both";
}

interface CelebrationContextType {
  celebrate: (options?: CelebrationOptions) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<CelebrationOptions>({});

  const celebrate = useCallback((opts?: CelebrationOptions) => {
    setOptions(opts || {});
    setVisible(true);
  }, []);

  const handleComplete = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <Celebration
        visible={visible}
        onComplete={handleComplete}
        message={options.message}
        subMessage={options.subMessage}
        type={options.type}
      />
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}

import React, { createContext, use, useCallback, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { cn } from "@/lib/utils";

// Constants (tweak to taste)
// damping: 28 > critical threshold (25.3) → no overshoot/bounce on a large element
const SPRING = { damping: 28, stiffness: 200, mass: 0.8 };
const SIDEBAR_WIDTH_RATIO = 0.72; // sidebar takes 72% of screen width
const SCENE_SCALE = 0.84; // scene shrinks to 84% when drawer is open
const SCENE_BORDER_RADIUS = 24; // rounded corners on scene when open

type DrawerContextValue = {
  isOpen: boolean;
  progress: SharedValue<number>;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const ctx = use(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within <Drawer>");
  return ctx;
}

export function useDrawer() {
  const { open, close, toggle, isOpen } = useDrawerContext();
  return { open, close, toggle, isOpen };
}

type RootProps = { children: React.ReactNode; className?: string };

function DrawerRoot({ children, className }: RootProps) {
  const progress = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    progress.value = withSpring(1, SPRING);
  }, [progress]);

  const close = useCallback(() => {
    setIsOpen(false);
    progress.value = withSpring(0, SPRING);
  }, [progress]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  return (
    <DrawerContext.Provider value={{ isOpen, progress, open, close, toggle }}>
      <View className={cn("flex-1 bg-surface", className)}>{children}</View>
    </DrawerContext.Provider>
  );
}

type SlotProps = { children?: React.ReactNode; className?: string };

function Sidebar({ children, className }: SlotProps) {
  const { width } = useWindowDimensions();
  const sidebarWidth = width * SIDEBAR_WIDTH_RATIO;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: sidebarWidth,
      }}
      className={cn("bg-surface", className)}
    >
      {children}
    </View>
  );
}

function Scene({ children, className }: SlotProps) {
  const { progress, close, isOpen } = useDrawerContext();
  const { width } = useWindowDimensions();

  // translateX positions the scene's left edge at ~sidebarWidth when fully open
  const targetTranslateX =
    width * SIDEBAR_WIDTH_RATIO + width * ((SCENE_SCALE - 1) / 2);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, SCENE_SCALE]) },
      {
        translateX: interpolate(progress.value, [0, 1], [0, targetTranslateX]),
      },
    ],
    borderRadius: interpolate(progress.value, [0, 1], [0, SCENE_BORDER_RADIUS]),
  }));

  return (
    <Animated.View
      style={[{ flex: 1, overflow: "hidden" }, animatedStyle]}
      className={cn("bg-canvas", className)}
    >
      {children}
      {isOpen && (
        <Pressable style={{ position: "absolute", inset: 0 }} onPress={close} />
      )}
    </Animated.View>
  );
}

// Compound export
export const Drawer = Object.assign(DrawerRoot, { Sidebar, Scene });

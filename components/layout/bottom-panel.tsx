import React, {
  ReactNode,
  createContext,
  use,
  useCallback,
  useState,
} from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

// ─── Constants ────────────────────────────────────────────────────────────────
const SPRING = { damping: 28, stiffness: 200, mass: 0.8 };
const DEFAULT_DETENTS = [0.65];
const PANEL_BORDER_RADIUS = 24;
const SCENE_DIM_OPACITY = 0.4;

// ─── Context ──────────────────────────────────────────────────────────────────
type OpenOptions = {
  // Fractions of screen height to snap to, sorted ascending. e.g. [0.5, 1.0]
  detents?: number[];
};

type BottomPanelContextValue = {
  isOpen: boolean;
  content: ReactNode;
  translateY: SharedValue<number>;
  containerHeight: SharedValue<number>;
  snapPoints: SharedValue<number[]>;
  open: (content: ReactNode, options?: OpenOptions) => void;
  close: () => void;
};

const BottomPanelContext = createContext<BottomPanelContextValue | null>(null);

function useBottomPanelContext() {
  const ctx = use(BottomPanelContext);
  if (!ctx) throw new Error("useBottomPanel must be used within <BottomPanel>");
  return ctx;
}

export function useBottomPanel() {
  const { open, close, isOpen } = useBottomPanelContext();
  return { open, close, isOpen };
}

// ─── Snap target resolution ───────────────────────────────────────────────────
// Pure worklet so it can be called from gesture callbacks on the UI thread.
function findSnapTarget(
  currentY: number,
  velocityY: number,
  snaps: number[],
  maxY: number,
): number {
  "worklet";
  if (velocityY > 500) {
    let best = maxY;
    for (let i = 0; i < snaps.length; i++) {
      if (snaps[i] > currentY && snaps[i] < best) best = snaps[i];
    }
    return best;
  }
  if (velocityY < -500) {
    let best = -1;
    for (let i = 0; i < snaps.length; i++) {
      if (snaps[i] < currentY && (best === -1 || snaps[i] > best))
        best = snaps[i];
    }
    return best === -1 ? currentY : best;
  }
  // No strong velocity → nearest snap including close
  let target = maxY;
  let nearestDist = Math.abs(currentY - maxY);
  for (let i = 0; i < snaps.length; i++) {
    const dist = Math.abs(currentY - snaps[i]);
    if (dist < nearestDist) {
      target = snaps[i];
      nearestDist = dist;
    }
  }
  return target;
}

// ─── Panel overlay ────────────────────────────────────────────────────────────
function PanelOverlay() {
  const { isOpen, content, translateY, containerHeight, snapPoints, close } =
    useBottomPanelContext();

  const startY = useSharedValue<number>(0);

  const panelStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
    transform: [{ translateY: translateY.value }],
  }));

  const swipeGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(
        0,
        Math.min(containerHeight.value, startY.value + e.translationY),
      );
    })
    .onEnd((e) => {
      const target = findSnapTarget(
        translateY.value,
        e.velocityY,
        snapPoints.value,
        containerHeight.value,
      );
      if (target >= containerHeight.value) {
        scheduleOnRN(close);
      } else {
        translateY.value = withSpring(target, SPRING);
      }
    });

  if (!isOpen) return null;

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.panel, panelStyle]} className="bg-surface">
        <View className="items-center pb-2 pt-3">
          <View className="h-1 w-10 rounded-full bg-outline" />
        </View>
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type RootProps = { children: ReactNode };

function BottomPanelRoot({ children }: RootProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();
  // Panel height is capped so it never overlaps the safe area at the top
  const availableHeight = screenHeight - topInset;

  const translateY = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const snapPoints = useSharedValue<number[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const setClosedState = useCallback(() => setIsOpen(false), []);

  const close = useCallback(() => {
    translateY.value = withSpring(containerHeight.value, SPRING, (finished) => {
      "worklet";
      if (finished) scheduleOnRN(setClosedState);
    });
  }, [translateY, containerHeight, setClosedState]);

  const open = useCallback(
    (newContent: ReactNode, options: OpenOptions = {}) => {
      const detents = [...(options.detents ?? DEFAULT_DETENTS)].sort(
        (a, b) => a - b,
      );
      const maxDetent = detents[detents.length - 1];
      const containerH = maxDetent * availableHeight;
      const snaps = detents.map((d) => containerH - d * availableHeight);

      containerHeight.value = containerH;
      snapPoints.value = snaps;
      translateY.value = containerH;

      setContent(newContent);
      setIsOpen(true);

      translateY.value = withSpring(snaps[0], SPRING);
    },
    [availableHeight, translateY, containerHeight, snapPoints],
  );

  const dimProgress = useDerivedValue(() => {
    if (containerHeight.value === 0) return 0;
    return interpolate(
      translateY.value,
      [containerHeight.value, 0],
      [0, 1],
      Extrapolation.CLAMP,
    );
  });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dimProgress.value, [0, 1], [0, SCENE_DIM_OPACITY]),
  }));

  return (
    <BottomPanelContext.Provider
      value={{
        isOpen,
        content,
        translateY,
        containerHeight,
        snapPoints,
        open,
        close,
      }}
    >
      <View className="flex-1">
        <View className="flex-1 overflow-hidden">{children}</View>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.dim, dimStyle]}
        />

        <PanelOverlay />
      </View>
    </BottomPanelContext.Provider>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: "#000",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderTopLeftRadius: PANEL_BORDER_RADIUS,
    borderTopRightRadius: PANEL_BORDER_RADIUS,
    overflow: "hidden",
  },
});

// ─── Compound export ──────────────────────────────────────────────────────────
export const BottomPanel = BottomPanelRoot;

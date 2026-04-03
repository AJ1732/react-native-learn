import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { useBottomPanel } from "@/components/layout/bottom-panel";
import { ChevronIcon } from "@/components/svgs/chevron-icon";
import { QueryErrorBoundary } from "@/components/ui/query-error-boundary";
import { useOpportunity } from "@/hooks/api/use-opportunities";
import { haptics } from "@/lib/haptics";
import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

const HEADER_HEIGHT = 320;
const MIN_HEADER_HEIGHT = 100;
const BACK_ICON_TRANSFORM = [
  { translateX: -1 as const },
  { rotate: "90deg" as const },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const BackButton = ({ isLoading = false }: { isLoading?: boolean }) => {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.back()}
      onPressIn={() => haptics.light()}
      style={{ elevation: 1 }}
      className={cn(
        "absolute left-4 top-16 z-10 rounded-full px-4 py-3",
        isLoading ? "bg-outline" : "bg-outline dark:bg-surface",
      )}
    >
      <View style={{ transform: BACK_ICON_TRANSFORM }}>
        <ChevronIcon
          size={20}
          color={isLoading ? colors.iconMuted : colors.chevron}
        />
      </View>
    </Pressable>
  );
};

function Panel() {
  return (
    <View className="flex-1 px-6 pb-6 pt-4">
      <Text variant="display">Panel</Text>
    </View>
  );
}

function DetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-canvas p-8">
      <Text variant="muted">Could not load opportunity.</Text>
      <Pressable
        onPress={onRetry}
        className="rounded-full bg-subtle px-6 py-3"
      >
        <Text>Retry</Text>
      </Pressable>
    </View>
  );
}

function DetailsLoading() {
  return (
    <View className="flex-1 bg-canvas">
      <View className="h-80 bg-subtle">
        <Skeleton className="h-80 w-full" />
        <BackButton isLoading />
      </View>
      <View className="gap-2 p-6">
        <Skeleton className="h-9 w-full bg-subtle" style={{ maxWidth: 200 }} />
        <Skeleton className="h-9 w-full bg-subtle" style={{ maxWidth: 320 }} />
        <Skeleton className="h-9 w-full bg-subtle" style={{ maxWidth: 100 }} />
      </View>
    </View>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function DetailsContent() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: opportunity, isLoading, isError, refetch } = useOpportunity(id ?? "");
  const { open } = useBottomPanel();
  const colors = useThemeColors();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerStyle = useAnimatedStyle(() => ({
    height: Math.max(MIN_HEADER_HEIGHT, HEADER_HEIGHT - scrollOffset.value),
  }));

  if (!id) return null;
  if (isError) return <DetailsError onRetry={refetch} />;
  if (isLoading) return <DetailsLoading />;

  return (
    <View className="flex-1">
      <Animated.View style={[styles.header, headerStyle]}>
        <Image
          source={{
            uri: "https://siwi.org/wp-content/uploads/2021/09/colorful-water-drop-splash-e1635164525186.jpg",
          }}
          contentFit="cover"
          style={[styles.image, { backgroundColor: colors.subtle }]}
        />
        <BackButton />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        className="bg-canvas"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingHorizontal: 24,
          paddingBottom: 24,
          gap: 16,
          marginTop: 24,
        }}
      >
        <Text variant="heading" className="text-4xl font-semibold">
          {opportunity?.opportunity_title}
        </Text>

        <Pressable
          onPress={() => open(<Panel />, { detents: [0.7, 1.0] })}
          className="self-start rounded-full bg-subtle px-6 py-3"
        >
          <Text>Open Panel</Text>
        </Pressable>

        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem
          repellat illo minima, odio doloremque quis consequuntur labore
          veritatis, commodi voluptatibus inventore aliquam enim at fugiat
          beatae harum expedita fuga ipsam impedit incidunt necessitatibus
          aliquid, porro excepturi obcaecati. Velit delectus fugiat incidunt ad
          molestias esse. Placeat ad fugit quasi harum sequi dolor, quam
          possimus, ducimus aliquid molestiae laborum laboriosam iusto, repellat
          velit ipsa vel eum? Veritatis ullam impedit perferendis porro sint
          iusto dolorem, accusantium, doloribus distinctio nemo eos est nulla
          aliquid voluptatibus blanditiis totam sunt nobis.
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

export default function Details() {
  return (
    <QueryErrorBoundary>
      <DetailsContent />
    </QueryErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: "hidden",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { ChevronIcon } from "@/components/svgs/chevron-icon";
import { QueryErrorBoundary } from "@/components/ui/query-error-boundary";
import { useOpportunity } from "@/hooks/api/use-opportunities";
import { haptics } from "@/lib/haptics";
import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

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
        isLoading
          ? "bg-outline"
          : "bg-brand-purple-100 dark:bg-brand-purple-900",
      )}
    >
      <View style={{ transform: [{ translateX: -1 }, { rotate: "90deg" }] }}>
        <ChevronIcon
          size={20}
          color={isLoading ? colors.iconMuted : colors.brandChevron}
        />
      </View>
    </Pressable>
  );
};

function DetailsContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: opportunity, isLoading, isError, refetch } = useOpportunity(id);

  if (isError) {
    return (
      <View className="bg-canvas flex-1 items-center justify-center gap-4 p-8">
        <Text variant="muted">Could not load opportunity.</Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-subtle rounded-full px-6 py-3"
        >
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="bg-canvas flex-1">
        <View className="bg-subtle h-80">
          <Skeleton className="h-80 w-full" />
          <BackButton isLoading />
        </View>

        <View className="gap-2 p-6">
          <Skeleton
            className="bg-subtle h-9 w-full"
            style={{ maxWidth: 200 }}
          />
          <Skeleton
            className="bg-subtle h-9 w-full"
            style={{ maxWidth: 320 }}
          />
          <Skeleton
            className="bg-subtle h-9 w-full"
            style={{ maxWidth: 100 }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="bg-canvas">
      <View className="bg-subtle h-80">
        <CardBgPurple width="100%" height="100%" />
        <BackButton />
      </View>

      <View className="p-6">
        <Text variant="heading" className="text-4xl font-semibold">
          {opportunity?.opportunity_title}
        </Text>
      </View>
    </ScrollView>
  );
}

export default function Details() {
  return (
    <QueryErrorBoundary>
      <DetailsContent />
    </QueryErrorBoundary>
  );
}

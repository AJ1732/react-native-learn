import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
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
        isLoading ? "bg-outline" : "bg-outline dark:bg-surface",
      )}
    >
      <View style={{ transform: [{ translateX: -1 }, { rotate: "90deg" }] }}>
        <ChevronIcon
          size={20}
          color={isLoading ? colors.iconMuted : colors.chevron}
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
      <View className="flex-1 items-center justify-center gap-4 bg-canvas p-8">
        <Text variant="muted">Could not load opportunity.</Text>
        <Pressable
          onPress={() => refetch()}
          className="rounded-full bg-subtle px-6 py-3"
        >
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="h-80 bg-subtle">
          <Skeleton className="h-80 w-full" />
          <BackButton isLoading />
        </View>

        <View className="gap-2 p-6">
          <Skeleton
            className="h-9 w-full bg-subtle"
            style={{ maxWidth: 200 }}
          />
          <Skeleton
            className="h-9 w-full bg-subtle"
            style={{ maxWidth: 320 }}
          />
          <Skeleton
            className="h-9 w-full bg-subtle"
            style={{ maxWidth: 100 }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="bg-canvas">
      <View className="h-80 bg-subtle">
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

import { clsx } from "clsx";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Link } from "@/components/atoms/link";
import { QueryErrorBoundary } from "@/components/atoms/query-error-boundary";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { ChevronDownIcon } from "@/components/svgs/chevron-down-icon";
import { useOpportunity } from "@/hooks/api/use-opportunities";

const BackButton = ({ isLoading = false }: { isLoading?: boolean }) => {
  return (
    <Link
      href={"/opportunities"}
      style={{ elevation: 1 }}
      className={clsx(
        "absolute left-4 top-16 z-10 rounded-full  px-4 py-3 ",
        isLoading
          ? "bg-neutral-200 text-neutral-500"
          : "bg-brand-purple-100 text-brand-purple-800",
      )}
    >
      <View style={{ transform: [{ translateX: -1 }, { rotate: "90deg" }] }}>
        <ChevronDownIcon size={20} color={"#260033"} />
      </View>
    </Link>
  );
};

function DetailsContent() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    data: opportunity,
    isLoading,
    isError,
    refetch,
  } = useOpportunity(params.id);

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white p-8">
        <Text variant="muted">Could not load opportunity.</Text>
        <Pressable
          onPress={() => refetch()}
          className="rounded-full bg-neutral-100 px-6 py-3"
        >
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="h-80 bg-neutral-100">
          <Skeleton className="h-80 w-full" />
          <BackButton isLoading />
        </View>

        <View className="gap-2 p-6">
          <Skeleton
            className="h-9 w-full bg-neutral-100"
            style={{ maxWidth: 200 }}
          />
          <Skeleton
            className="h-9 w-full bg-neutral-100"
            style={{ maxWidth: 320 }}
          />
          <Skeleton
            className="h-9 w-full bg-neutral-100"
            style={{ maxWidth: 100 }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white">
      <View className="h-80 bg-neutral-100">
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

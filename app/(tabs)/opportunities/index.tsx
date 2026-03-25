import { Link } from "@/components/atoms/link";
import { QueryErrorBoundary } from "@/components/atoms/query-error-boundary";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { useOpportunities } from "@/hooks/api/use-opportunities";
import { Opportunity } from "@/types/domain/opportunity.types";
import { FlashList } from "@shopify/flash-list";
import { memo, useMemo } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OpportunityCardProps = {
  id: string;
  title: string;
};

const OpportunityCard = memo(function OpportunityCard({
  id,
  title,
}: OpportunityCardProps) {
  const href = useMemo(
    () => ({
      pathname: "/opportunities/detail" as const,
      params: { id },
    }),
    [id],
  );

  return (
    <Link href={href} className="border border-neutral-200">
      <View className="h-32 w-full overflow-hidden">
        <CardBgPurple width="100%" height={128} />
      </View>
      <View className="p-4">
        <Text>{title}</Text>
      </View>
    </Link>
  );
});

const SKELETON_ITEMS = Array.from({ length: 4 });

const LoadingSkeleton = () => (
  <SafeAreaView className="flex-1 gap-4 bg-white p-4" edges={["top"]}>
    {SKELETON_ITEMS.map((_, index) => (
      <View key={index} className="w-full border border-neutral-100">
        <Skeleton className="h-32 w-full overflow-hidden" />
        <View className="gap-1 p-4">
          <Skeleton className="h-4" style={{ maxWidth: 280 }} />
          <Skeleton className="h-4" style={{ maxWidth: 100 }} />
        </View>
      </View>
    ))}
  </SafeAreaView>
);

const renderItem = ({ item }: { item: Opportunity }) => (
  <OpportunityCard id={item.id} title={item.opportunity_title} />
);

const keyExtractor = (item: Opportunity) => String(item.id);

const ItemSeparator = () => <View style={{ height: 16 }} />;

const OpportunitiesList = () => {
  const {
    data: opportunities,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useOpportunities();

  if (isError) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-white p-8"
        edges={["top"]}
      >
        <Text variant="muted">Could not load opportunities.</Text>
        <Pressable
          onPress={async () => await refetch()}
          className="rounded-full bg-neutral-100 px-6 py-3"
        >
          <Text>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <FlashList
        data={opportunities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={() => { refetch(); }}
        refreshing={isRefetching}
      />
    </SafeAreaView>
  );
};

const Opportunities = () => (
  <QueryErrorBoundary>
    <OpportunitiesList />
  </QueryErrorBoundary>
);

export default Opportunities;

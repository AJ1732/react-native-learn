import { FlashList } from "@shopify/flash-list";

import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { QueryErrorBoundary } from "@/components/ui/query-error-boundary";
import { OpportunityCard } from "@/features/opportunities/components/oppportunity-card";
import { useOpportunities } from "@/hooks/api/use-opportunities";
import { Opportunity } from "@/types/domain/opportunity.types";

const SKELETON_ITEMS = Array.from({ length: 4 });

const LoadingSkeleton = () => (
  <SafeAreaView className="flex-1 gap-4 bg-canvas p-4" edges={["top"]}>
    {SKELETON_ITEMS.map((_, index) => (
      <View key={index} className="w-full border border-outline-subtle">
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
        className="flex-1 items-center justify-center gap-4 bg-canvas p-8"
        edges={["top"]}
      >
        <Text variant="muted">Could not load opportunities.</Text>
        <Pressable
          onPress={async () => await refetch()}
          className="rounded-full bg-subtle px-6 py-3"
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
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <FlashList
        data={opportunities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={() => {
          refetch();
        }}
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

import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Skeleton } from "@/components/atoms/skeleton";
import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { useOpportunities } from "@/hooks/api/use-opportunities";

const Opportunities = () => {
  const { data: opportunities, isLoading } = useOpportunities();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 gap-4 bg-white p-4" edges={["top"]}>
        {Array.from({ length: 3 }).map((item, index) => (
          <View key={index} className="w-full border border-neutral-100">
            <Skeleton className="h-32 w-full overflow-hidden" />
            <View className="gap-1 p-4">
              <Skeleton className="h-4" style={{ maxWidth: 280 }}></Skeleton>
              <Skeleton className="h-4" style={{ maxWidth: 100 }}></Skeleton>
            </View>
          </View>
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        {opportunities?.map((opportunity) => (
          <Link
            key={opportunity.id}
            href={{
              pathname: "/opportunities/detail",
              params: { id: opportunity.id },
            }}
            className="border border-neutral-200"
          >
            <View className="h-32 w-full overflow-hidden">
              <CardBgPurple width="100%" height={128} />
            </View>
            <View className="p-4">
              <Text>{opportunity.opportunity_title}</Text>
            </View>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Opportunities;

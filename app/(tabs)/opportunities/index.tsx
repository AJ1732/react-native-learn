import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { useOpportunities } from "@/hooks/api/use-opportunities";

const Opportunities = () => {
  const { data: opportunities, isLoading } = useOpportunities();

  if (isLoading) {
    return (
      <View className="flex-1 items-center bg-white justify-center">
        <Text>Loading Opportunities</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="p-4">
        <Text variant="display" size="3xl">
          Opportunities
        </Text>
      </View>
      <ScrollView contentContainerClassName="gap-4 p-4 pt-0">
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

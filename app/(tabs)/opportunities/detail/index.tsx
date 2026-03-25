import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { Link } from "@/components/atoms/link";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CardBgPurple } from "@/components/svgs/card-bg-purple";
import { ChevronDownIcon } from "@/components/svgs/chevron-down-icon";
import { useOpportunity } from "@/hooks/api/use-opportunities";

export default function Details() {
  const params = useLocalSearchParams<{ id: string }>();
  const { data: opportunity, isLoading } = useOpportunity(params.id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Skeleton className="h-80 w-full bg-neutral-100" />

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
      <View className="h-80 overflow-hidden bg-neutral-100">
        <Link
          href={"/opportunities"}
          className="absolute left-4 top-16 z-10 rounded-full bg-brand-purple-100 px-4 py-3 text-brand-purple-800"
        >
          <ChevronDownIcon
            size={20}
            color={"#260033"}
            style={{ transform: [{ translateX: -1 }, { rotate: "90deg" }] }}
          />
        </Link>
        <CardBgPurple width="100%" height="100%" />
      </View>

      <View className="p-6">
        <Text variant="heading" className="text-4xl font-semibold">
          {opportunity?.opportunity_title}
        </Text>
      </View>
    </ScrollView>
  );
}

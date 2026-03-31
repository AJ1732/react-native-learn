import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { memo, useMemo } from "react";
import { View } from "react-native";

type OpportunityCardProps = {
  id: string;
  title: string;
};

export const OpportunityCard = memo(function OpportunityCard({
  id,
  title,
}: OpportunityCardProps) {
  const href = useMemo(
    () => ({
      pathname: "/opportunities/[id]" as const,
      params: { id },
    }),
    [id],
  );

  return (
    <Link href={href} className="border border-outline">
      <View className="h-32 w-full overflow-hidden bg-subtle"></View>
      <View className="p-4">
        <Text>{title}</Text>
      </View>
    </Link>
  );
});

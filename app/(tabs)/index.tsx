import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link } from "@/components/atoms/link";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-4 pb-4 px-4">
        <View className="gap-6 py-8">
          <Link href={{ pathname: "/modal", params: { component: "modal-1" } }}>
            Modal 1
          </Link>
          <Link href={{ pathname: "/modal", params: { component: "modal-2" } }}>
            Modal 2
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { Header } from "@/components/layout/header";
import { MenuIcon } from "@/components/svgs/menu-icon";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Header>
        <Header.Left>
          <MenuIcon />
        </Header.Left>
        <Header.Center>
          <Text variant="display" className="uppercase">
            Learn
          </Text>
        </Header.Center>
        <Header.Right></Header.Right>
      </Header>
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

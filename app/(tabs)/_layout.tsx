import { Redirect, Tabs, usePathname } from "expo-router";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/atoms/text";
import { Drawer } from "@/components/layout/drawer";
import { HomeIcon } from "@/components/svgs/home-icon";
import { ProfileIcon } from "@/components/svgs/profile-icon";
import { StarIcon } from "@/components/svgs/star-icon";
import { brandColor } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
  { label: "Help & Support", href: "/support" },
];

const TabsLayout = () => {
  const pathname = usePathname();
  const hideTabBar = pathname.includes("/opportunities/detail");
  const isAuth = useAuthStore((state) => state.isAuth);
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";
  const tabBarBackground = isDark ? "#0a0a0a" : "#ffffff";
  const tabBarBorder = isDark ? "#262626" : "#e5e5e5";

  if (!isAuth) return <Redirect href="/(auth)/login" />;

  return (
    <Drawer>
      <Drawer.Sidebar>
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <View className="flex-1 px-6 py-4 gap-1">
            <Text variant="display" className="mb-6">Menu</Text>
            {SIDEBAR_ITEMS.map((item) => (
              <View key={item.label} className="h-12 justify-center">
                <Text variant="muted">{item.label}</Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Drawer.Sidebar>

      <Drawer.Scene>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: brandColor,
            tabBarInactiveTintColor: isDark ? "#525252" : "#a3a3a3",
            tabBarStyle: hideTabBar
              ? { display: "none" }
              : { backgroundColor: tabBarBackground, borderTopColor: tabBarBorder },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <HomeIcon color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="opportunities"
            options={{
              title: "Opportunities",
              tabBarIcon: ({ color, size }) => (
                <StarIcon color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <ProfileIcon color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </Drawer.Scene>
    </Drawer>
  );
};

export default TabsLayout;

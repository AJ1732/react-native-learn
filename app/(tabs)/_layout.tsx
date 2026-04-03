import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/atoms/text";
import { BottomPanel } from "@/components/layout/bottom-panel";
import { CustomTabBar } from "@/components/layout/custom-tab-bar";
import { Drawer } from "@/components/layout/drawer";
import { HomeIcon } from "@/components/svgs/home-icon";
import { ProfileIcon } from "@/components/svgs/profile-icon";
import { useAuthStore } from "@/lib/stores/auth-store";

const SIDEBAR_ITEMS = [{ label: "Opportunities", href: "/opportunities" }];

const TabsLayout = () => {
  const isAuth = useAuthStore((state) => state.isAuth);
  if (!isAuth) return <Redirect href="/(auth)/login" />;

  return (
    <BottomPanel>
      <Drawer>
        <Drawer.Sidebar>
          <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
            <View className="flex-1 gap-1 px-6 py-4">
              <Text variant="display" className="mb-6">
                Menu
              </Text>
              {SIDEBAR_ITEMS.map((item) => (
                <Drawer.Item
                  key={item.href}
                  label={item.label}
                  href={item.href}
                />
              ))}
            </View>
          </SafeAreaView>
        </Drawer.Sidebar>

        <Drawer.Scene>
          <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
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
            <Tabs.Screen name="opportunities" options={{ href: null }} />
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
    </BottomPanel>
  );
};

export default TabsLayout;

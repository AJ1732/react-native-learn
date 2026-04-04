import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/atoms/text";
import { BottomPanel } from "@/components/layout/bottom-panel";
import { CustomTabBar } from "@/components/layout/custom-tab-bar";
import { Drawer } from "@/components/layout/drawer";
import { HomeIcon } from "@/components/svgs/home-icon";
// import { ProfileIcon } from "@/components/svgs/profile-icon";
import { Avatar } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/api/use-user";
import { useAuthStore } from "@/lib/stores/auth-store";

const SIDEBAR_ITEMS = [{ label: "Opportunities", href: "/opportunities" }];

const TabsLayout = () => {
  const isAuth = useAuthStore((state) => state.isAuth);
  const user = useAuthStore((state) => state.user);
  useProfile();
  console.log(user);
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
                tabBarShowLabel: false,
                tabBarIcon: ({ color, size }) => (
                  <Avatar uri={user?.profile_image_url} size={32} />
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

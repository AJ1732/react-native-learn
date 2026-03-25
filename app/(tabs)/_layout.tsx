import { Redirect, Tabs, usePathname } from "expo-router";

import { HomeIcon } from "@/components/svgs/home-icon";
import { ProfileIcon } from "@/components/svgs/profile-icon";
import { StarIcon } from "@/components/svgs/star-icon";
import { useAuthStore } from "@/lib/stores/auth-store";

const TabsLayout = () => {
  const pathname = usePathname();
  const hideTabBar = pathname.includes("/opportunities/detail");
  const isAuth = useAuthStore((state) => state.isAuth);

  if (!isAuth) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#bf00ff",
        tabBarInactiveTintColor: "#a3a3a3",
        tabBarStyle: hideTabBar ? { display: "none" } : undefined,
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
  );
};

export default TabsLayout;

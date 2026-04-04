import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDrawer } from "@/components/layout/drawer";
import { MenuIcon } from "@/components/svgs/menu-icon";
import { brandColor, useThemeColors } from "@/lib/theme";

const TAB_H = 52;

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colors = useThemeColors();
  const { bottom } = useSafeAreaInsets();
  const { toggle } = useDrawer();

  const renderTab = (route: (typeof state.routes)[number]) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.indexOf(route);
    const label = (options.title ?? route.name) as string;
    const color = isFocused ? brandColor : colors.tint;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        className="flex-1 items-center justify-center gap-1.5"
      >
        {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
        {options.tabBarShowLabel ? (
          <Text
            style={{
              color,
              fontSize: 10,
              fontWeight: isFocused ? "600" : "400",
            }}
          >
            {label}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const visibleRoutes = state.routes.filter(
    (route) => descriptors[route.key].options.tabBarButton == null,
  );
  const mid = Math.ceil(visibleRoutes.length / 2);
  const leftRoutes = visibleRoutes.slice(0, mid);
  const rightRoutes = visibleRoutes.slice(mid);

  return (
    <View
      className="flex-row border-t border-outline bg-canvas"
      style={{ height: TAB_H + bottom, paddingBottom: bottom / 2 }}
    >
      {/* Left tabs */}
      <View className="flex-1 flex-row">{leftRoutes.map(renderTab)}</View>

      {/* Center menu button */}
      <View className="flex-1 items-center justify-center">
        <Pressable
          onPress={toggle}
          className="items-center justify-center"
          style={{ elevation: 10 }}
        >
          <MenuIcon size={20} color={colors.icon} />
        </Pressable>
      </View>

      {/* Right tabs */}
      <View className="flex-1 flex-row">{rightRoutes.map(renderTab)}</View>
    </View>
  );
}

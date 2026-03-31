import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/button";
import { Link } from "@/components/atoms/link";
import { Skeleton } from "@/components/atoms/skeleton";
import { Switch } from "@/components/atoms/switch";
import { Text } from "@/components/atoms/text";
import { ArrowIcon } from "@/components/svgs/arrow";
import { Edit2Icon } from "@/components/svgs/edit-2-icon";
import { QueryErrorBoundary } from "@/components/ui/query-error-boundary";
import { ProfileAccordion } from "@/features/profile/components/accordion";
import { useLogout } from "@/hooks/api/use-auth";
import { useProfile } from "@/hooks/api/use-user";
import { formatDate } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { useThemeColors } from "@/lib/theme";

const ProfileContent = () => {
  const {
    data: profile,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useProfile();
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { mutateAsync: logout, isPending } = useLogout();
  const handleLogout = async () => await logout();

  if (isError) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-canvas p-8"
        edges={["top"]}
      >
        <Text variant="muted">Could not load profile.</Text>
        <Pressable onPress={() => refetch()} className="bg-subtle px-6 py-3">
          <Text>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
        <ScrollView contentContainerClassName="px-4">
          <View className="gap-8 py-8">
            <Skeleton className="size-11 self-end" />

            <View className="flex-row items-end gap-4">
              <Skeleton
                className="rounded-full"
                style={{ width: 99, height: 99 }}
              />
              <View className="flex-1 gap-2.5 pb-4" style={{ maxWidth: 200 }}>
                <Skeleton className="h-6" style={{ maxWidth: 140 }} />
                <Skeleton className="h-4" />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-4 flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        <View className="flex-1 gap-6 py-8">
          <View className="flex-row items-center justify-end">
            {/* Edit profile */}
            <Link
              href="/profile/update"
              variant="accent"
              className="bg-surface"
              onPressIn={() => haptics.light()}
            >
              <View className="size-11 items-center justify-center">
                <Edit2Icon color={colors.icon} />
              </View>
            </Link>
          </View>

          {/* Profile */}
          <View className="flex-row items-end gap-4">
            {!!profile?.profile_image_url && (
              <View
                className="items-center justify-center self-start rounded-full border border-dashed border-outline-subtle bg-subtle"
                style={{ width: 99, height: 99, overflow: "hidden" }}
              >
                <Image
                  source={{
                    uri: `${profile.profile_image_url}?t=${profile.updated_at}`,
                  }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}

            <View className="pb-4">
              <View className="flex-row items-center gap-1 uppercase">
                <Text size="lg">{profile?.first_name}</Text>
                <Text size="lg">{profile?.last_name}</Text>
              </View>
              <Text variant="muted">{profile?.email}</Text>
            </View>
          </View>

          <ProfileAccordion title="Settings" defaultOpen>
            <View className="h-12 flex-row items-center justify-between gap-4 px-4">
              <Text>Account Type</Text>
              <Text variant="muted" className="capitalize">
                {profile?.role}
              </Text>
            </View>
            <View className="h-12 flex-row items-center justify-between gap-4 px-4">
              <Text>Theme</Text>
              <View className="flex-row items-center gap-3">
                <Text variant="muted" size="sm" className="capitalize">
                  {colorScheme ?? "light"}
                </Text>
                <Switch
                  value={colorScheme === "dark"}
                  onValueChange={(val) =>
                    setColorScheme(val ? "dark" : "light")
                  }
                />
              </View>
            </View>
            <View className="h-12 flex-row items-center justify-between gap-4 px-4">
              <Text>Subscription</Text>
              <Link href="https://ejemeniboi.com">
                <View className="flex-row items-center gap-0.5">
                  <Text variant="muted">Free</Text>
                  <ArrowIcon
                    size={20}
                    color={colors.iconMuted}
                    style={{ marginTop: 2, transform: [{ rotate: "-45deg" }] }}
                  />
                </View>
              </Link>
            </View>
          </ProfileAccordion>

          <Button
            variant="destructive"
            label="Click to logout"
            loading={isPending}
            onPress={handleLogout}
          />

          <View className="mt-auto">
            <Text variant="muted" size="sm" className="text-center">
              Member since{" "}
              {profile?.created_at ? formatDate(profile.created_at) : ""}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Profile = () => (
  <QueryErrorBoundary>
    <ProfileContent />
  </QueryErrorBoundary>
);

export default Profile;

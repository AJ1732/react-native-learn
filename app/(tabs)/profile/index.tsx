import { Image } from "expo-image";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/button";
import { Link } from "@/components/atoms/link";
import { QueryErrorBoundary } from "@/components/atoms/query-error-boundary";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Edit2Icon } from "@/components/svgs/edit-2-icon";
import { useLogout } from "@/hooks/api/use-auth";
import { useProfile } from "@/hooks/api/use-user";

const ProfileContent = () => {
  const { data: profile, isLoading, isError, isRefetching, refetch } = useProfile();

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white p-8" edges={["top"]}>
        <Text variant="muted">Could not load profile.</Text>
        <Pressable onPress={() => refetch()} className="rounded-full bg-neutral-100 px-6 py-3">
          <Text>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  const { mutateAsync: logout, isPending } = useLogout();
  const handleLogout = async () => await logout();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); }}
            tintColor="#bf00ff"
            colors={["#bf00ff"]}
          />
        }
      >
        <View className="gap-8 py-8">
          <View className="flex-row items-center justify-end">
            {/* Edit profile */}
            <Link
              href="/profile/update"
              variant="accent"
              className="size-11 bg-neutral-50"
            >
              <View className="size-11 items-center justify-center">
                <Edit2Icon />
              </View>
            </Link>
          </View>

          <View className="flex-row items-end gap-4">
            {!!profile?.profile_image_url && (
              <View
                className="items-center justify-center self-start rounded-full border border-dashed border-neutral-100 bg-neutral-100"
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

          <Button
            variant="destructive"
            label="Click to logout"
            loading={isPending}
            onPress={handleLogout}
          />
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

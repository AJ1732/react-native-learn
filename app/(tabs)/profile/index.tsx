import { Image } from "expo-image";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/button";
import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { Edit2Icon } from "@/components/svgs/edit-2-icon";
import { useLogout } from "@/hooks/api/use-auth";
import { useProfile } from "@/hooks/api/use-user";

const ProfileLoadingSkeleton = () => {
  return (
    <>
      <View>
        <Text>Loading...</Text>
      </View>
    </>
  );
};

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: logout, isPending } = useLogout();
  const handleLogout = async () => await logout();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4">
        <View className="gap-8 py-8">
          <View className="flex-row items-center justify-between">
            <Text variant="display" size="3xl">
              Profile
            </Text>

            {isLoading ? (
              <View className="size-11 bg-neutral-50" />
            ) : (
              <Link
                href="/profile/update"
                variant="accent"
                className="size-11 bg-neutral-50"
              >
                <View className="size-11 items-center justify-center">
                  <Edit2Icon />
                </View>
              </Link>
            )}
          </View>
          {isLoading ? (
            <ProfileLoadingSkeleton />
          ) : (
            <>
              <View className="flex-row items-end gap-4">
                {!!profile?.profile_image_path && (
                  <View
                    className="items-center justify-center self-start rounded-full border border-dashed border-neutral-100 bg-neutral-100"
                    style={{ width: 99, height: 99, overflow: "hidden" }}
                  >
                    <Image
                      source={{
                        uri: `${profile.profile_image_path}?t=${profile.updated_at}`,
                      }}
                      style={{ width: 96, height: 96, borderRadius: 48 }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                )}

                <View className="pb-4">
                  <View className="flex-row items-center gap-1 uppercase">
                    {[profile?.first_name, profile?.last_name].map((name) => (
                      <Text key={name} size="lg" className="">
                        {name}
                      </Text>
                    ))}
                  </View>
                  <Text variant={"muted"}>{profile?.email}</Text>
                </View>
              </View>

              <Button
                variant={"destructive"}
                label="Click to logout"
                loading={isPending}
                onPress={handleLogout}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

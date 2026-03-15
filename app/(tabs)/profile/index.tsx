import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { useLogout } from "@/hooks/api/use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  const { mutateAsync: logout, isPending } = useLogout();
  const handleLogout = async () => await logout();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4">
        <View className="gap-8 py-8">
          <Text variant="display" size="3xl">
            Profile
          </Text>

          <View>
            <Text>{user?.email}</Text>
          </View>

          <Button
            variant={"destructive"}
            label="Click to logout"
            loading={isPending}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

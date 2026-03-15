import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/lib/stores/auth-store";

const AuthLayout = () => {
  const isAuth = useAuthStore((state) => state.isAuth);

  if (isAuth) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login/index" />
      <Stack.Screen name="signup/index" />
    </Stack>
  );
};

export default AuthLayout;

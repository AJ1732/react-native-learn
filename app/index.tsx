import { Redirect } from "expo-router";

import { useAuthStore } from "@/lib/stores/auth-store";

export default function Index() {
  const isAuth = useAuthStore((state) => state.isAuth);
  return <Redirect href={isAuth ? "/(tabs)" : "/(auth)/login"} />;
}

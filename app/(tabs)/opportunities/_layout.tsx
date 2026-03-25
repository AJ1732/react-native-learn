import { Stack } from "expo-router";

const OpportunityLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="detail/index" options={{ animation: "default" }} />
    </Stack>
  );
};

export default OpportunityLayout;

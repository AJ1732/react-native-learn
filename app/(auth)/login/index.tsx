import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/atoms/button";
import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/ui/form-field";
import { useLogin } from "@/hooks/api/use-auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (dto: LoginFormValues) => {
    login(dto, {
      onError: (error: any) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 401) {
          setError("root", { message: "Invalid email or password." });
        } else {
          setError("root", {
            message: message ?? "Something went wrong. Please try again.",
          });
        }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center gap-6 px-4">
            <View className="gap-1.5">
              <Text variant="display" size="3xl">
                Login
              </Text>
              <Text variant="muted">Enter your details to login</Text>
            </View>

            <View className="h-60 w-full bg-neutral-100" />

            <View className="w-full gap-3">
              <FormField
                control={control}
                name="email"
                placeholder="Enter email"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
              />
              <FormField
                control={control}
                name="password"
                placeholder="Enter password"
                autoCapitalize="none"
                secureTextEntry
              />

              {errors.root && (
                <Text size="sm" className="text-center text-red-500">
                  {errors.root.message}
                </Text>
              )}

              <Button
                label="Login"
                onPress={handleSubmit(onSubmit)}
                loading={isPending}
                fullWidth
              />
            </View>

            <Text className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" variant="accent">
                Signup
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

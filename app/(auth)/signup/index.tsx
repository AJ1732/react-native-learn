import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/atoms/button";
import { Link } from "@/components/atoms/link";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/ui/form-field";
import { useSignup } from "@/hooks/api/use-auth";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = ({ confirmPassword, ...dto }: SignupFormValues) => {
    signup(dto, {
      onSuccess: () => {
        router.push("/(tabs)");
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message;
        if (message?.toLowerCase().includes("email")) {
          setError("email", { message });
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
          contentContainerClassName="grow justify-center gap-6 px-4 pt-8 pb-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1.5">
            <Text variant="display" size="3xl">
              Signup
            </Text>
            <Text variant="muted">Enter your details to create an account</Text>
          </View>

          <View className="h-60 w-full bg-neutral-100" />

          <View className="w-full gap-3">
            <FormField
              control={control}
              name="firstName"
              placeholder="Enter first name"
            />
            <FormField
              control={control}
              name="lastName"
              placeholder="Enter last name"
            />
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
            <FormField
              control={control}
              name="confirmPassword"
              placeholder="Confirm password"
              autoCapitalize="none"
              secureTextEntry
            />

            {errors.root && (
              <Text size="sm" className="text-center text-red-500">
                {errors.root.message}
              </Text>
            )}

            <Button
              label="Create account"
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
              fullWidth
            />
          </View>

          <Text className="text-center">
            Already have an account?{" "}
            <Link href="/login" variant="accent">
              Login
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

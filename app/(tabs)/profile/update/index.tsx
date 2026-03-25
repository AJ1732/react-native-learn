import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { z } from "zod";

import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/ui/form-field";
import { FormImagePicker } from "@/components/ui/form-image-picker";
import { useProfile, useUpdateProfile } from "@/hooks/api/use-user";
import type { ImageAsset } from "@/types/common/api";

const mimeTypeFromUrl = (url: string): string | null => {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return ext ? (map[ext] ?? null) : null;
};

const urlToImageAsset = (url: string, updatedAt?: string): ImageAsset => ({
  uri: updatedAt ? `${url}?t=${new Date(updatedAt).getTime()}` : url,
  fileName: url.split("?")[0].split("/").pop() ?? null,
  mimeType: mimeTypeFromUrl(url),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email"),
  profileImage: z
    .object({
      uri: z.string().min(1),
      mimeType: z.string().nullable(),
      fileName: z.string().nullable(),
    })
    .nullable()
    .refine((v) => v !== null, { message: "Profile photo is required" }),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

const UpdateProfile = () => {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const { control, handleSubmit, formState } = useForm<UpdateProfileFormValues>(
    {
      resolver: zodResolver(updateProfileSchema),
      defaultValues: {
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        email: profile?.email,
        profileImage: profile?.profile_image_path
          ? urlToImageAsset(profile.profile_image_path, profile.updated_at)
          : null,
      },
    },
  );

  const onSubmit = (dto: UpdateProfileFormValues) => {
    updateProfile(
      {
        ...dto,
        profileImage: dto.profileImage ?? undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  return (
    <ScrollView className="bg-white">
      <View className="flex-1 grow flex-col justify-center gap-6 px-6">
        <View className="mt-8 gap-1.5">
          <Text variant="display" size="3xl">
            Update profile
          </Text>
          <Text variant="muted">What do you wanna change?</Text>
        </View>

        <View style={{ minHeight: 540 }} className="gap-2 pt-4">
          {/* Profile Image */}
          <View className="gap-2 pb-4">
            <View className="flex-row items-end gap-8">
              <FormImagePicker
                control={control}
                name="profileImage"
                showError={false}
              />
              <View className="mb-4 gap-1">
                <Text variant="muted">Max Size: 5MB</Text>
                <Text variant="muted">JPEG/PNG/WebP only</Text>
              </View>
            </View>
            {formState.errors.profileImage && (
              <Text size="sm" className="text-red-500">
                {formState.errors.profileImage.message}
              </Text>
            )}
          </View>

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
            editable={false}
          />
        </View>

        <View className="mt-auto gap-2">
          <Button
            label="Cancel"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
          />
          <Button
            label="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={!formState.isDirty}
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default UpdateProfile;

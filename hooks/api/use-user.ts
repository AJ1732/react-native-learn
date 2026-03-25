import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ENDPOINTS } from "@/constants/endpoints";
import { tokenStore } from "@/lib/axios/token-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { queryKeys } from "@/lib/query/query-keys";
import { UserService } from "@/services/user.service";
import type { ApiResponse } from "@/types/common/api";
import type { UpdateProfileDTO, User } from "@/types/domain/auth.types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const response = await UserService.getProfile({});
      return (response.data as ApiResponse<User>).data;
    },
    staleTime: Infinity,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (dto: UpdateProfileDTO) => {
      const formData = new FormData();

      if (dto.firstName) formData.append("firstName", dto.firstName);
      if (dto.lastName) formData.append("lastName", dto.lastName);
      if (dto.email) formData.append("email", dto.email);
      if (dto.profileImage) {
        const mimeType = dto.profileImage.mimeType ?? "image/jpeg";
        const fileExtension = mimeType.split("/")[1] ?? "jpg";
        const fileName = userId
          ? `${userId}/profile.${fileExtension}`
          : `profile.${fileExtension}`;

        formData.append("profileImage", {
          uri: dto.profileImage.uri,
          type: mimeType,
          name: fileName,
        } as any);
      }

      // Axios is unreliable for FormData on Android — use fetch directly.
      // Do NOT set Content-Type; the native layer adds the multipart boundary.
      const token = tokenStore.get();
      const response = await fetch(`${BASE_URL}${ENDPOINTS.user.profile}`, {
        method: "PATCH",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
};

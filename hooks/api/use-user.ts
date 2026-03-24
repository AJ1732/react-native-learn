import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UserService } from "@/services/user.service";
import type { ApiResponse } from "@/types/common/api";
import type { UpdateProfileDTO, User } from "@/types/domain/auth.types";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await UserService.getProfile({});
      return (response.data as ApiResponse<User>).data;
    },
    staleTime: Infinity,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDTO) => {
      const formData = new FormData();

      if (dto.firstName) formData.append("firstName", dto.firstName);
      if (dto.lastName) formData.append("lastName", dto.lastName);
      if (dto.email) formData.append("email", dto.email);
      if (dto.profileImage) {
        formData.append("profileImage", {
          uri: dto.profileImage.uri,
          type: dto.profileImage.mimeType ?? "image/jpeg",
          name:
            dto.profileImage.fileName ??
            `avatar.${(dto.profileImage.mimeType ?? "image/jpeg").split("/")[1]}`,
        } as any);
      }

      return UserService.updateProfile({ data: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

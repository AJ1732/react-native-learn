import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/lib/stores/auth-store";
import { AuthService } from "@/services/auth.service";
import type {
  LoginDTO,
  LoginResponse,
  SignupDTO,
  SignupResponse,
} from "@/types/domain/auth.types";

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (dto: LoginDTO) => AuthService.login({ data: dto }),
    onSuccess: (response) => {
      const { access_token, refresh_token, expires_at, user } = (
        response.data as LoginResponse
      ).data;
      login(access_token, refresh_token, user, expires_at);
    },
  });
};

export const useSignup = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (dto: SignupDTO) => {
      const formData = new FormData();
      (Object.keys(dto) as (keyof SignupDTO)[]).forEach((key) => {
        formData.append(key, dto[key] as string);
      });
      return AuthService.signup({ data: formData });
    },
    onSuccess: (response) => {
      const { data } = response.data as SignupResponse;
      const { access_token, refresh_token, expires_at } = data.session;
      login(access_token, refresh_token, data.user, expires_at);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSettled: () => logout(),
    // Always clear locally — even if server rejects (expired token, 403, network error)
    onError: () => {},
  });
};

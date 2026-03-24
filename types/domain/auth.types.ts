import type { Tables } from "@/types";
import type { ApiResponse } from "@/types/common/api";

export type User = Tables<"profiles">;

export type LoginDTO = {
  email: string;
  password: string;
};

export type SignupDTO = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type LoginData = {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type SignupData = {
  user: User;
  session: Session;
};

export type UpdateProfileDTO = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: import("@/types/common/api").ImageAsset;
};

export type LoginResponse = ApiResponse<LoginData>;
export type SignupResponse = ApiResponse<SignupData>;

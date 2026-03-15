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

export type AuthUser = {
  id: string;
  email: string;
};

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type LoginData = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type SignupData = {
  user: AuthUser;
  session: Session;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: LoginData;
};

export type SignupResponse = {
  success: boolean;
  message: string;
  data: SignupData;
};

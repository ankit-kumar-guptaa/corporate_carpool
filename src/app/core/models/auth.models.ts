export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  domain: string;
  password: string;
  mobileNo: string;
  employeeCode: string;
  gender: string;
  orgId: number;
}

export interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  orgId: number;
  isResetPassword: boolean;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export type LoginResponse = ApiResponse<AuthUser>;
export type ResetPasswordResponse = ApiResponse<unknown>;
export type ChangePasswordResponse = ApiResponse<unknown>;
export type CreateUserResponse = ApiResponse<unknown>;

export const AUTH_STORAGE_KEYS = {
  token: 'token',
  userId: 'userId',
  name: 'name',
  email: 'email',
  orgId: 'orgId'
} as const;

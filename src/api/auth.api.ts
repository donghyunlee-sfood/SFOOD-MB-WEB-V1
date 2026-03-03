import { apiClient, unwrap } from './client';
import type { LoginRequest, User } from '../types/domain';

export const login = async (request: LoginRequest): Promise<User> => {
  const res = await apiClient.post('/auth/login', request);
  return unwrap<User>(res);
};

export const me = async (): Promise<User> => {
  const res = await apiClient.get('/auth/me');
  return unwrap<User>(res);
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

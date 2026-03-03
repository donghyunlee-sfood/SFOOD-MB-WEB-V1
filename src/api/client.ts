import axios from 'axios';
import type { ApiError, ApiResponse } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data as Partial<ApiResponse<unknown>> | undefined;
    const apiError: ApiError = {
      status: error?.response?.status ?? 0,
      message: payload?.message ?? error?.message ?? 'Unknown error',
      errorCode: payload?.errorCode,
    };
    return Promise.reject(apiError);
  },
);

export const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

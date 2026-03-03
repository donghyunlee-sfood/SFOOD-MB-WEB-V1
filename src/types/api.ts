export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
};

export type ApiError = {
  status: number;
  message: string;
  errorCode?: string | null;
};

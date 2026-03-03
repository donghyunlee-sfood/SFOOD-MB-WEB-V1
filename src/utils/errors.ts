import type { ApiError } from '../types/api';

const ERROR_TEXT: Record<string, string> = {
  VALIDATION_ERROR: '입력값을 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_FOUND: '대상을 찾을 수 없습니다.',
  CONFLICT: '충돌이 발생했습니다. 잠시 후 다시 시도해 주세요.',
  INTERNAL_ERROR: '서버 처리 중 오류가 발생했습니다.',
};

export const toUserMessage = (error: unknown): string => {
  const apiError = error as ApiError;
  if (apiError?.errorCode && ERROR_TEXT[apiError.errorCode]) {
    return ERROR_TEXT[apiError.errorCode];
  }
  if (apiError?.status === 401) return '로그인 시간이 만료되었습니다.';
  return apiError?.message ?? '처리 중 오류가 발생했습니다.';
};

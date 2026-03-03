import { apiClient, unwrap } from './client';
import type { MemoType } from '../types/domain';

export const listMemoTypes = async (): Promise<MemoType[]> => {
  const res = await apiClient.get('/memo-types');
  return unwrap<MemoType[]>(res);
};

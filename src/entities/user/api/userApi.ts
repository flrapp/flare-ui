import { apiClient } from '@/shared/api/client';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/shared/types/dtos';

const BASE_PATH = '/v1/users';

export async function getUsers(): Promise<UserResponseDto[]> {
  const response = await apiClient.get<UserResponseDto[]>(BASE_PATH);
  return response.data;
}

export async function createUser(data: CreateUserDto): Promise<UserResponseDto> {
  const response = await apiClient.post<UserResponseDto>(BASE_PATH, data);
  return response.data;
}

export async function updateUser(userId: string, data: UpdateUserDto): Promise<UserResponseDto> {
  const response = await apiClient.put<UserResponseDto>(`${BASE_PATH}/${userId}`, data);
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${userId}`);
}

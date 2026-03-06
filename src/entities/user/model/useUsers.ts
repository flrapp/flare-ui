import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ResetUserPasswordRequest,
} from '@/shared/types/dtos';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: { isActive?: boolean }) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
};

// Query hooks
export function useUsers(isActive?: boolean) {
  return useQuery({
    queryKey: userKeys.list({ isActive }),
    queryFn: () => userApi.getUsers(isActive),
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      userApi.updateUser(userId, data),
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) });
      const previousUser = queryClient.getQueryData<UserResponseDto>(userKeys.detail(userId));

      if (previousUser) {
        queryClient.setQueryData<UserResponseDto>(userKeys.detail(userId), {
          ...previousUser,
          ...data,
        });
      }

      return { previousUser };
    },
    onError: (_err, { userId }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(userId), context.previousUser);
      }
    },
    onSettled: (_data, _error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ResetUserPasswordRequest }) =>
      userApi.resetUserPassword(userId, data),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

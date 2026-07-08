import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/api/profile';
import type { Profile, ProfileUpdateInput } from '@/types';

const PROFILE_KEY = ['profile'] as const;

export function useProfile() {
  return useQuery<Profile>({
    queryKey: PROFILE_KEY,
    queryFn: () => profileApi.getProfile(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<Profile, Error, ProfileUpdateInput>({
    mutationFn: (input) => profileApi.updateProfile(input),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_KEY, data);
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (input) => profileApi.changePassword(input),
  });
}

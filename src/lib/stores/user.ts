import { UserProfile } from '@/lib/types/profile'
import { create } from 'zustand'

export const useUserStore = create<{
  profile: UserProfile | undefined
  token: string | undefined
  refreshToken: string | undefined
  login: (res: any) => void
  logout: () => void
  tokenRefresh: (token: string, refreshToken: string) => void
}>((set) => ({
  profile: {} as UserProfile | undefined,
  token: '' as string | undefined,
  refreshToken: '' as string | undefined,
  login: ({ profile, token, refreshToken }: { profile: UserProfile; token: string; refreshToken: string }) => {
    set({
      profile,
      token,
      refreshToken
    })
  },
  logout: () => {
    set({
      profile: undefined,
      token: undefined,
      refreshToken: undefined
    })
  },
  tokenRefresh: (token: string, refreshToken: string) => {
    set({
      token: token,
      refreshToken: refreshToken
    })
  }
}))

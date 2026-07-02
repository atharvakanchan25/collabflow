import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  updateUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken })
  },
  updateUser: user => set({ user }),
  logout: () => {
    localStorage.clear()
    set({ user: null, accessToken: null })
  },
}))

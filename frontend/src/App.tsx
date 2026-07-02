import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { usersApi } from './api'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MainLayout } from './pages/MainLayout'
import { NotFoundPage } from './pages/NotFoundPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  if (accessToken) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { accessToken, updateUser, logout } = useAuthStore()

  // Rehydrate user on refresh
  useEffect(() => {
    if (!accessToken) return
    usersApi.me().then(updateUser).catch(() => logout())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
        <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

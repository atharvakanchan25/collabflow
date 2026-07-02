import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  register: (d: { username: string; email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', d).then(r => r.data),
  login: (d: { email: string; password: string }) =>
    api.post('/auth/login', d).then(r => r.data),
}

// Users
export const usersApi = {
  me: () => api.get('/users/me').then(r => r.data),
  get: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  updateProfile: (d: { displayName?: string; avatarUrl?: string }) =>
    api.patch('/users/me', d).then(r => r.data),
}

// Workspaces
export const workspacesApi = {
  list: () => api.get('/workspaces').then(r => r.data),
  create: (d: { name: string; slug: string }) => api.post('/workspaces', d).then(r => r.data),
  getBySlug: (slug: string) => api.get(`/workspaces/${slug}`).then(r => r.data),
  getMembers: (id: string) => api.get(`/workspaces/${id}/members`).then(r => r.data),
  addMember: (workspaceId: string, targetUserId: string) =>
    api.post(`/workspaces/${workspaceId}/members/${targetUserId}`).then(r => r.data),
}

// Channels
export const channelsApi = {
  list: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/channels`).then(r => r.data),
  create: (workspaceId: string, d: { name: string; description?: string; isPrivate: boolean }) =>
    api.post(`/workspaces/${workspaceId}/channels`, d).then(r => r.data),
  join: (channelId: string) => api.post(`/workspaces/_/channels/${channelId}/join`).then(r => r.data),
  leave: (channelId: string) => api.delete(`/workspaces/_/channels/${channelId}/leave`),
  getMembers: (channelId: string) =>
    api.get(`/workspaces/_/channels/${channelId}/members`).then(r => r.data),
}

// Messages
export const messagesApi = {
  getChannel: (channelId: string, page = 0) =>
    api.get(`/channels/${channelId}/messages`, { params: { page, size: 50 } }).then(r => r.data),
  sendChannel: (channelId: string, content: string, parentId?: string) =>
    api.post(`/channels/${channelId}/messages`, { content, parentId }).then(r => r.data),
  getConversation: (convId: string, page = 0) =>
    api.get(`/conversations/${convId}/messages`, { params: { page, size: 50 } }).then(r => r.data),
  sendConversation: (convId: string, content: string) =>
    api.post(`/conversations/${convId}/messages`, { content }).then(r => r.data),
  edit: (messageId: string, content: string) =>
    api.patch(`/messages/${messageId}`, { content }).then(r => r.data),
  delete: (messageId: string) => api.delete(`/messages/${messageId}`),
  react: (messageId: string, emoji: string) =>
    api.post(`/messages/${messageId}/reactions/${emoji}`).then(r => r.data),
  getReplies: (messageId: string) =>
    api.get(`/messages/${messageId}/replies`).then(r => r.data),
}

// Conversations (DMs)
export const conversationsApi = {
  list: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/conversations`).then(r => r.data),
  open: (workspaceId: string, targetUserId: string) =>
    api.post(`/workspaces/${workspaceId}/conversations`, { targetUserId }).then(r => r.data),
}

// Files
export const filesApi = {
  upload: (messageId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/files/messages/${messageId}`, form).then(r => r.data)
  },
}

// Notifications
export const notificationsApi = {
  list: (page = 0) => api.get('/notifications', { params: { page, size: 20 } }).then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markAllRead: () => api.post('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
}

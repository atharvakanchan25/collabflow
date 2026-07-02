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

// Mock Data
const mockUser = {
  id: 'mock-user-id',
  username: 'john_doe',
  email: 'john@example.com',
  displayName: 'John Doe',
  avatarUrl: null,
  status: 'ONLINE'
}

const mockWorkspaces = [
  { id: 'ws-1', name: 'General Workspace', slug: 'general', ownerId: 'mock-user-id', createdAt: new Date().toISOString() }
]

const mockChannels = [
  { id: 'ch-1', workspaceId: 'ws-1', name: 'general', description: 'Company-wide announcements and work-based matters', isPrivate: false, createdAt: new Date().toISOString() },
  { id: 'ch-2', workspaceId: 'ws-1', name: 'random', description: 'Non-work banter and watercooler chat', isPrivate: false, createdAt: new Date().toISOString() }
]

const mockConversations = [
  {
    id: 'conv-1',
    workspaceId: 'ws-1',
    participants: [
      mockUser,
      { id: 'user-2', username: 'jane_smith', email: 'jane@example.com', displayName: 'Jane Smith', avatarUrl: null, status: 'ONLINE' }
    ],
    createdAt: new Date().toISOString()
  }
]

let mockMessages: Record<string, any[]> = {
  'ch-1': [
    {
      id: 'msg-1',
      channelId: 'ch-1',
      sender: { id: 'user-2', username: 'jane_smith', email: '', displayName: 'Jane Smith', avatarUrl: null, status: 'ONLINE' },
      content: 'Hey everyone! Welcome to CollabHub.',
      messageType: 'TEXT',
      parentId: null,
      attachments: [],
      reactions: [],
      editedAt: null,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'msg-2',
      channelId: 'ch-1',
      sender: mockUser,
      content: 'Hi Jane, glad to be here!',
      messageType: 'TEXT',
      parentId: null,
      attachments: [],
      reactions: [],
      editedAt: null,
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ]
}

// Auth
export const authApi = {
  register: async (d: any) => ({ user: mockUser, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' }),
  login: async (d: any) => ({ user: mockUser, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' }),
}

// Users
export const usersApi = {
  me: async () => mockUser,
  get: async (id: string) => id === 'mock-user-id' ? mockUser : { id, username: 'jane_smith', email: 'jane@example.com', displayName: 'Jane Smith', avatarUrl: null, status: 'ONLINE' },
  updateProfile: async (d: any) => ({ ...mockUser, ...d }),
}

// Workspaces
export const workspacesApi = {
  list: async () => mockWorkspaces,
  create: async (d: any) => {
    const ws = { id: `ws-${Date.now()}`, name: d.name, slug: d.slug, ownerId: 'mock-user-id', createdAt: new Date().toISOString() }
    mockWorkspaces.push(ws)
    return ws
  },
  getBySlug: async (slug: string) => mockWorkspaces.find(w => w.slug === slug) ?? mockWorkspaces[0],
  getMembers: async (id: string) => [
    mockUser,
    { id: 'user-2', username: 'jane_smith', email: 'jane@example.com', displayName: 'Jane Smith', avatarUrl: null, status: 'ONLINE' }
  ],
  addMember: async (workspaceId: string, targetUserId: string) => ({ success: true }),
}

// Channels
export const channelsApi = {
  list: async (workspaceId: string) => mockChannels,
  create: async (workspaceId: string, d: any) => {
    const ch = { id: `ch-${Date.now()}`, workspaceId, name: d.name, description: d.description, isPrivate: d.isPrivate, createdAt: new Date().toISOString() }
    mockChannels.push(ch)
    return ch
  },
  join: async (channelId: string) => ({ success: true }),
  leave: async (channelId: string) => ({ success: true }),
  getMembers: async (channelId: string) => [
    mockUser,
    { id: 'user-2', username: 'jane_smith', email: 'jane@example.com', displayName: 'Jane Smith', avatarUrl: null, status: 'ONLINE' }
  ],
}

// Messages
export const messagesApi = {
  getChannel: async (channelId: string, page = 0) => ({ content: mockMessages[channelId] ?? [] }),
  sendChannel: async (channelId: string, content: string, parentId?: string) => {
    const msg = {
      id: `msg-${Date.now()}`,
      channelId,
      sender: mockUser,
      content,
      messageType: 'TEXT',
      parentId: parentId ?? null,
      attachments: [],
      reactions: [],
      editedAt: null,
      createdAt: new Date().toISOString()
    }
    if (!mockMessages[channelId]) mockMessages[channelId] = []
    mockMessages[channelId].push(msg)
    return msg
  },
  getConversation: async (convId: string, page = 0) => ({ content: mockMessages[convId] ?? [] }),
  sendConversation: async (convId: string, content: string) => {
    const msg = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      sender: mockUser,
      content,
      messageType: 'TEXT',
      parentId: null,
      attachments: [],
      reactions: [],
      editedAt: null,
      createdAt: new Date().toISOString()
    }
    if (!mockMessages[convId]) mockMessages[convId] = []
    mockMessages[convId].push(msg)
    return msg
  },
  edit: async (messageId: string, content: string) => {
    for (const key in mockMessages) {
      const idx = mockMessages[key].findIndex(m => m.id === messageId)
      if (idx !== -1) {
        mockMessages[key][idx] = {
          ...mockMessages[key][idx],
          content,
          editedAt: new Date().toISOString()
        }
        return mockMessages[key][idx]
      }
    }
    return {
      id: messageId,
      channelId: null,
      conversationId: null,
      sender: mockUser,
      content,
      messageType: 'TEXT',
      parentId: null,
      attachments: [],
      reactions: [],
      editedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  },
  delete: async (messageId: string) => ({ success: true }),
  react: async (messageId: string, emoji: string) => ({ success: true }),
  getReplies: async (messageId: string) => [],
}

// Conversations (DMs)
export const conversationsApi = {
  list: async (workspaceId: string) => mockConversations,
  open: async (workspaceId: string, targetUserId: string) => {
    const conv = {
      id: `conv-${Date.now()}`,
      workspaceId,
      participants: [
        mockUser,
        { id: targetUserId, username: 'user_target', email: '', displayName: 'Target User', avatarUrl: null, status: 'ONLINE' }
      ],
      createdAt: new Date().toISOString()
    }
    mockConversations.push(conv)
    return conv
  },
}

// Files
export const filesApi = {
  upload: async (messageId: string, file: File) => ({ id: 'file-1', url: 'https://via.placeholder.com/150', name: file.name }),
}

// Notifications
export const notificationsApi = {
  list: async (page = 0) => ({ content: [] }),
  unreadCount: async () => ({ count: 0 }),
  markAllRead: async () => ({ success: true }),
  markRead: async (id: string) => ({ success: true }),
}


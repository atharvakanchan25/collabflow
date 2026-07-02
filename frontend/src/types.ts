export type UserStatus = 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE'

export interface User {
  id: string
  username: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  status: UserStatus
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Workspace {
  id: string
  name: string
  slug: string
  owner: User
  iconUrl: string | null
  createdAt: string
}

export interface Channel {
  id: string
  workspaceId: string
  name: string
  description: string | null
  isPrivate: boolean
  createdAt: string
}

export interface Attachment {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  downloadUrl: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface Message {
  id: string
  channelId: string | null
  conversationId: string | null
  sender: User
  content: string
  messageType: string
  parentId: string | null
  attachments: Attachment[]
  reactions: ReactionSummary[]
  editedAt: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  workspaceId: string
  participants: User[]
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  payload: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  hasMore: boolean
}

// WebSocket event shapes
export interface WsMessageEvent {
  eventType: 'CREATED' | 'EDITED' | 'DELETED'
  messageId: string
  channelId: string | null
  conversationId: string | null
  senderId: string
  senderUsername: string
  content: string
  messageType: string
  parentId: string | null
  createdAt: string
}

export interface WsTypingEvent {
  channelId: string | null
  conversationId: string | null
  userId: string
  username: string
  isTyping: boolean
  timestamp: string
}

export interface WsPresenceEvent {
  userId: string
  username: string
  status: UserStatus
  timestamp: string
}

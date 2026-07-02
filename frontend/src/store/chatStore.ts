import { create } from 'zustand'
import type { Workspace, Channel, Conversation, Message, WsTypingEvent, WsPresenceEvent } from '../types'

interface ChatState {
  // workspace
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setWorkspaces: (ws: Workspace[]) => void
  setActiveWorkspace: (ws: Workspace) => void

  // channels
  channels: Channel[]
  activeChannel: Channel | null
  setChannels: (ch: Channel[]) => void
  setActiveChannel: (ch: Channel | null) => void

  // conversations (DMs)
  conversations: Conversation[]
  activeConversation: Conversation | null
  setConversations: (c: Conversation[]) => void
  setActiveConversation: (c: Conversation | null) => void

  // messages keyed by channelId or conversationId
  messages: Record<string, Message[]>
  appendMessage: (roomId: string, msg: Message) => void
  prependMessages: (roomId: string, msgs: Message[]) => void
  updateMessage: (roomId: string, msg: Message) => void
  deleteMessage: (roomId: string, messageId: string) => void

  // typing
  typing: Record<string, WsTypingEvent[]>
  setTyping: (roomId: string, event: WsTypingEvent) => void

  // presence
  presence: Record<string, WsPresenceEvent>
  setPresence: (event: WsPresenceEvent) => void

  // thread
  threadParentId: string | null
  setThreadParentId: (id: string | null) => void
}

export const useChatStore = create<ChatState>(set => ({
  workspaces: [],
  activeWorkspace: null,
  setWorkspaces: workspaces => set({ workspaces }),
  setActiveWorkspace: activeWorkspace => set({ activeWorkspace }),

  channels: [],
  activeChannel: null,
  setChannels: channels => set({ channels }),
  setActiveChannel: activeChannel => set({ activeChannel, activeConversation: null, threadParentId: null }),

  conversations: [],
  activeConversation: null,
  setConversations: conversations => set({ conversations }),
  setActiveConversation: activeConversation => set({ activeConversation, activeChannel: null, threadParentId: null }),

  messages: {},
  appendMessage: (roomId, msg) => set(s => ({
    messages: { ...s.messages, [roomId]: [...(s.messages[roomId] ?? []), msg] }
  })),
  prependMessages: (roomId, msgs) => set(s => ({
    messages: { ...s.messages, [roomId]: [...msgs, ...(s.messages[roomId] ?? [])] }
  })),
  updateMessage: (roomId, msg) => set(s => ({
    messages: {
      ...s.messages,
      [roomId]: (s.messages[roomId] ?? []).map(m => m.id === msg.id ? msg : m)
    }
  })),
  deleteMessage: (roomId, messageId) => set(s => ({
    messages: {
      ...s.messages,
      [roomId]: (s.messages[roomId] ?? []).filter(m => m.id !== messageId)
    }
  })),

  typing: {},
  setTyping: (roomId, event) => set(s => {
    const current = (s.typing[roomId] ?? []).filter(t => t.userId !== event.userId)
    return {
      typing: {
        ...s.typing,
        [roomId]: event.isTyping ? [...current, event] : current
      }
    }
  }),

  presence: {},
  setPresence: event => set(s => ({
    presence: { ...s.presence, [event.userId]: event }
  })),

  threadParentId: null,
  setThreadParentId: threadParentId => set({ threadParentId }),
}))

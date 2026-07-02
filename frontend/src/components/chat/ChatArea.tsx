import { useEffect, useRef, useState } from 'react'
import { Hash, Lock, MessageSquare } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { messagesApi } from '../../api'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ThreadPanel } from './ThreadPanel'
import type { Message } from '../../types'

export function ChatArea() {
  const { activeChannel, activeConversation, messages, appendMessage, updateMessage, deleteMessage, prependMessages } = useChatStore()
  const { user } = useAuthStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [threadMsg, setThreadMsg] = useState<Message | null>(null)

  const roomId = activeChannel?.id ?? activeConversation?.id ?? ''
  const roomMessages = messages[roomId] ?? []

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    const fetch = activeChannel
      ? messagesApi.getChannel(roomId)
      : messagesApi.getConversation(roomId)
    fetch
      .then(page => prependMessages(roomId, [...page.content].reverse()))
      .finally(() => setLoading(false))
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomMessages.length])

  const handleSend = async (content: string) => {
    if (!user) return
    const msg = activeChannel
      ? await messagesApi.sendChannel(roomId, content, threadMsg?.id)
      : await messagesApi.sendConversation(roomId, content)
    appendMessage(roomId, msg)
  }

  if (!activeChannel && !activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Select a channel or conversation</p>
          <p className="text-sm mt-1">Pick something from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  const title = activeChannel
    ? `${activeChannel.isPrivate ? '🔒' : '#'} ${activeChannel.name}`
    : (() => {
        const partner = activeConversation?.participants.find(p => p.id !== user?.id)
        return partner?.displayName ?? partner?.username ?? 'DM'
      })()

  return (
    <div className="flex-1 flex min-w-0">
    <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
        {activeChannel ? (
          activeChannel.isPrivate ? <Lock size={18} className="text-gray-400" /> : <Hash size={18} className="text-gray-400" />
        ) : (
          <MessageSquare size={18} className="text-gray-400" />
        )}
        <h2 className="text-white font-semibold text-base">{title}</h2>
        {activeChannel?.description && (
          <span className="text-gray-500 text-sm border-l border-gray-700 pl-3 ml-1 truncate">{activeChannel.description}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && roomMessages.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {roomMessages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            roomId={roomId}
            onReply={setThreadMsg}
            onUpdated={updated => updateMessage(roomId, updated)}
            onDeleted={id => deleteMessage(roomId, id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        placeholder={`Message ${title}`}
        onSend={handleSend}
        channelId={activeChannel?.id}
        conversationId={activeConversation?.id}
      />
    </div>
    {threadMsg && (
      <ThreadPanel
        parentMessage={threadMsg}
        roomId={roomId}
        onClose={() => setThreadMsg(null)}
      />
    )}
    </div>
  )
}

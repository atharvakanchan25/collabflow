import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useChatStore } from '../../store/chatStore'

interface Props {
  placeholder: string
  onSend: (content: string) => Promise<void>
  channelId?: string | null
  conversationId?: string | null
}

export function MessageInput({ placeholder, onSend, channelId, conversationId }: Props) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()
  const { sendTyping } = useWebSocket()
  const { typing } = useChatStore()

  const roomId = channelId ?? conversationId ?? ''
  const typingUsers = (typing[roomId] ?? []).filter(t => t.userId !== user?.id)

  const handleChange = (val: string) => {
    setContent(val)
    if (!user) return
    sendTyping(channelId ?? null, conversationId ?? null, user.username, true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      sendTyping(channelId ?? null, conversationId ?? null, user.username, false)
    }, 2000)
  }

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    setContent('')
    try { await onSend(trimmed) } finally { setSending(false) }
  }

  return (
    <div className="px-4 pb-4">
      {typingUsers.length > 0 && (
        <p className="text-gray-500 text-xs mb-1 px-1">
          {typingUsers.map(t => t.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
        </p>
      )}
      <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
        <textarea
          value={content}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none max-h-40 overflow-y-auto"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

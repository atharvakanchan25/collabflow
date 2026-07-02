import { useEffect, useState } from 'react'
import { X, Send } from 'lucide-react'
import { messagesApi } from '../../api'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../ui/Avatar'
import type { Message } from '../../types'

interface Props {
  parentMessage: Message
  roomId: string
  onClose: () => void
}

export function ThreadPanel({ parentMessage, roomId, onClose }: Props) {
  const [replies, setReplies] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    messagesApi.getReplies(parentMessage.id).then(setReplies)
  }, [parentMessage.id])

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    setContent('')
    try {
      const msg = await messagesApi.sendChannel(
        parentMessage.channelId!,
        trimmed,
        parentMessage.id
      )
      setReplies(r => [...r, msg])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-semibold text-sm">Thread</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Parent message */}
        <div className="px-4 pb-3 border-b border-gray-800 mb-2">
          <div className="flex items-start gap-2">
            <Avatar
              name={parentMessage.sender.displayName ?? parentMessage.sender.username}
              avatarUrl={parentMessage.sender.avatarUrl}
              size="sm"
            />
            <div>
              <span className="text-white text-xs font-semibold">
                {parentMessage.sender.displayName ?? parentMessage.sender.username}
              </span>
              <p className="text-gray-300 text-sm mt-0.5 whitespace-pre-wrap break-words">
                {parentMessage.content}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-4">No replies yet</p>
        )}
        {replies.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            roomId={roomId}
            onUpdated={updated => setReplies(r => r.map(m => m.id === updated.id ? updated : m))}
            onDeleted={id => setReplies(r => r.filter(m => m.id !== id))}
          />
        ))}
      </div>

      {/* Reply input */}
      <div className="px-3 pb-3">
        <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Reply in thread…"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none max-h-32 overflow-y-auto"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

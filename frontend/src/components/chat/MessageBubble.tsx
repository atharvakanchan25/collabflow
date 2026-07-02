import { useState } from 'react'
import { Pencil, Trash2, SmilePlus, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar } from '../ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { messagesApi } from '../../api'
import type { Message } from '../../types'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👀']

interface Props {
  message: Message
  roomId: string
  onReply?: (msg: Message) => void
  onUpdated?: (msg: Message) => void
  onDeleted?: (id: string) => void
}

export function MessageBubble({ message, onReply, onUpdated, onDeleted }: Props) {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const isOwn = message.sender.id === user?.id

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) { setEditing(false); return }
    const updated = await messagesApi.edit(message.id, editContent)
    onUpdated?.(updated)
    setEditing(false)
  }

  const handleDelete = async () => {
    await messagesApi.delete(message.id)
    onDeleted?.(message.id)
  }

  const handleReact = async (emoji: string) => {
    await messagesApi.react(message.id, emoji)
    setShowEmoji(false)
  }

  return (
    <div
      className="group flex items-start gap-3 px-4 py-1.5 hover:bg-gray-800/50 rounded-lg transition-colors relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false) }}
    >
      <Avatar
        name={message.sender.displayName ?? message.sender.username}
        avatarUrl={message.sender.avatarUrl}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-sm font-semibold">
            {message.sender.displayName ?? message.sender.username}
          </span>
          <span className="text-gray-500 text-xs">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {message.editedAt && <span className="text-gray-600 text-xs">(edited)</span>}
        </div>

        {editing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() } if (e.key === 'Escape') setEditing(false) }}
              className="w-full bg-gray-700 text-white text-sm rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              autoFocus
            />
            <p className="text-gray-500 text-xs mt-1">Enter to save · Esc to cancel</p>
          </div>
        ) : (
          <p className="text-gray-200 text-sm mt-0.5 whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map(a => (
              <a key={a.id} href={a.downloadUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 rounded-md px-3 py-1.5 text-xs text-gray-300 transition-colors">
                📎 {a.fileName}
              </a>
            ))}
          </div>
        )}

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => handleReact(r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
                  ${r.reactedByMe
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                {r.emoji} <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action toolbar */}
      {showActions && !editing && (
        <div className="absolute right-4 top-1 flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg px-1 py-0.5 shadow-lg">
          <div className="relative">
            <button onClick={() => setShowEmoji(e => !e)} className="p-1.5 text-gray-400 hover:text-white rounded transition-colors" title="React">
              <SmilePlus size={15} />
            </button>
            {showEmoji && (
              <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg p-2 flex gap-1 z-10 shadow-xl">
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => handleReact(e)} className="text-lg hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}
          </div>
          {onReply && (
            <button onClick={() => onReply(message)} className="p-1.5 text-gray-400 hover:text-white rounded transition-colors" title="Reply in thread">
              <MessageSquare size={15} />
            </button>
          )}
          {isOwn && (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-white rounded transition-colors" title="Edit">
                <Pencil size={15} />
              </button>
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors" title="Delete">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

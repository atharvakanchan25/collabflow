import { useEffect, useState } from 'react'
import { conversationsApi, workspacesApi } from '../../api'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import type { User } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  workspaceId: string
}

export function OpenDmModal({ open, onClose, workspaceId }: Props) {
  const { user } = useAuthStore()
  const { conversations, setConversations, setActiveConversation } = useChatStore()
  const [members, setMembers] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    workspacesApi.getMembers(workspaceId).then((ms: User[]) =>
      setMembers(ms.filter(m => m.id !== user?.id))
    )
  }, [open, workspaceId])

  const filtered = members.filter(m =>
    (m.displayName ?? m.username).toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = async (target: User) => {
    setLoading(true)
    try {
      const conv = await conversationsApi.open(workspaceId, target.id)
      const exists = conversations.find(c => c.id === conv.id)
      if (!exists) setConversations([...conversations, conv])
      setActiveConversation(conv)
      onClose()
      setQuery('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Open Direct Message">
      <Input
        placeholder="Search members…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />
      <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No members found</p>
        )}
        {filtered.map(m => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            <Avatar name={m.displayName ?? m.username} avatarUrl={m.avatarUrl} status={m.status} size="sm" />
            <div>
              <p className="text-white text-sm font-medium">{m.displayName ?? m.username}</p>
              <p className="text-gray-500 text-xs">@{m.username}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}

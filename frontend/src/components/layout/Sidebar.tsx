import { useState } from 'react'
import { Hash, Lock, Plus, ChevronDown, ChevronRight, LogOut, Settings } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { NotificationsPanel } from '../ui/NotificationsPanel'
import { UserProfileModal } from '../ui/UserProfileModal'
import type { Channel, Conversation } from '../../types'

interface Props {
  onCreateChannel: () => void
  onOpenDm: () => void
}

export function Sidebar({ onCreateChannel, onOpenDm }: Props) {
  const { activeWorkspace, channels, conversations, activeChannel, activeConversation, setActiveChannel, setActiveConversation, presence } = useChatStore()
  const { user, logout } = useAuthStore()
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen] = useState(true)
  const [showProfile, setShowProfile] = useState(false)

  const getDmPartner = (conv: Conversation) =>
    conv.participants.find(p => p.id !== user?.id) ?? conv.participants[0]

  return (
    <div className="w-60 bg-gray-900 flex flex-col border-r border-gray-800 shrink-0">
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-white font-bold text-base truncate">{activeWorkspace?.name ?? 'CollabHub'}</h1>
          <p className="text-gray-500 text-xs truncate">{activeWorkspace?.slug}</p>
        </div>
        <NotificationsPanel />
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {/* Channels */}
        <div>
          <button
            onClick={() => setChannelsOpen(o => !o)}
            className="w-full flex items-center gap-1 px-3 py-1 text-gray-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            {channelsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Channels
            <button
              onClick={e => { e.stopPropagation(); onCreateChannel() }}
              className="ml-auto hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </button>

          {channelsOpen && channels.map((ch: Channel) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md mx-1 text-sm transition-colors
                ${activeChannel?.id === ch.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              {ch.isPrivate ? <Lock size={14} className="shrink-0" /> : <Hash size={14} className="shrink-0" />}
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Direct Messages */}
        <div>
          <button
            onClick={() => setDmsOpen(o => !o)}
            className="w-full flex items-center gap-1 px-3 py-1 text-gray-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            {dmsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Direct Messages
            <button
              onClick={e => { e.stopPropagation(); onOpenDm() }}
              className="ml-auto hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </button>

          {dmsOpen && conversations.map((conv: Conversation) => {
            const partner = getDmPartner(conv)
            const partnerPresence = presence[partner.id]
            const status = partnerPresence?.status ?? partner.status
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md mx-1 text-sm transition-colors
                  ${activeConversation?.id === conv.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Avatar name={partner.displayName ?? partner.username} avatarUrl={partner.avatarUrl} status={status} size="sm" />
                <span className="truncate">{partner.displayName ?? partner.username}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-gray-800 px-3 py-2 flex items-center gap-2">
        <Avatar name={user?.displayName ?? user?.username ?? '?'} avatarUrl={user?.avatarUrl} status={user?.status} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{user?.displayName ?? user?.username}</p>
          <p className="text-gray-500 text-xs truncate">{user?.status?.toLowerCase()}</p>
        </div>
        <button onClick={() => setShowProfile(true)} title="Edit profile" className="text-gray-500 hover:text-white transition-colors">
          <Settings size={15} />
        </button>
        <button onClick={logout} title="Sign out" className="text-gray-500 hover:text-red-400 transition-colors">
          <LogOut size={15} />
        </button>
      </div>

      <UserProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

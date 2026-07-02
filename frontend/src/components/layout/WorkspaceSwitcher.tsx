import { Plus, UserPlus } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import type { Workspace } from '../../types'

interface Props {
  onCreateWorkspace: () => void
  onInviteMember: () => void
}

export function WorkspaceSwitcher({ onCreateWorkspace, onInviteMember }: Props) {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useChatStore()

  return (
    <div className="w-16 bg-gray-950 flex flex-col items-center py-3 gap-2 border-r border-gray-800 shrink-0">
      {workspaces.map((ws: Workspace) => (
        <button
          key={ws.id}
          onClick={() => setActiveWorkspace(ws)}
          title={ws.name}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all
            ${activeWorkspace?.id === ws.id
              ? 'bg-indigo-600 text-white rounded-2xl'
              : 'bg-gray-700 text-gray-300 hover:bg-indigo-500 hover:text-white hover:rounded-2xl'
            }`}
        >
          {ws.name.slice(0, 2).toUpperCase()}
        </button>
      ))}
      <button
        onClick={onCreateWorkspace}
        title="Create workspace"
        className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:bg-green-600 hover:text-white hover:rounded-2xl transition-all flex items-center justify-center mt-1"
      >
        <Plus size={20} />
      </button>
      <button
        onClick={onInviteMember}
        title="Invite member to workspace"
        className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white hover:rounded-2xl transition-all flex items-center justify-center"
      >
        <UserPlus size={18} />
      </button>
    </div>
  )
}

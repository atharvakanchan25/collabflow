import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { workspacesApi, channelsApi, conversationsApi } from '../api'
import { useChatStore } from '../store/chatStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { WorkspaceSwitcher } from '../components/layout/WorkspaceSwitcher'
import { Sidebar } from '../components/layout/Sidebar'
import { ChatArea } from '../components/chat/ChatArea'
import { CreateWorkspaceModal } from '../components/modals/CreateWorkspaceModal'
import { CreateChannelModal } from '../components/modals/CreateChannelModal'
import { OpenDmModal } from '../components/modals/OpenDmModal'
import { InviteMemberModal } from '../components/ui/InviteMemberModal'
import type { Workspace } from '../types'

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {children}
    </div>
  )
}

function LoadingScreen() {
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your workspace…</p>
        </div>
      </div>
    </AppShell>
  )
}

function NoWorkspaceScreen({ onCreate }: { onCreate: () => void }) {
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-600/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No workspaces yet</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Create your first workspace to start collaborating with your team in real time.
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Create workspace
          </button>
        </div>
      </div>
    </AppShell>
  )
}

export function MainLayout() {
  useWebSocket()

  const {
    workspaces, activeWorkspace,
    setWorkspaces, setActiveWorkspace,
    setChannels, setConversations,
  } = useChatStore()

  const [booting, setBooting] = useState(true)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showOpenDm, setShowOpenDm] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  // Load workspaces on mount
  useEffect(() => {
    workspacesApi.list()
      .then((ws: Workspace[]) => {
        setWorkspaces(ws)
        if (ws.length > 0) setActiveWorkspace(ws[0])
      })
      .finally(() => setBooting(false))
  }, [])

  // Load channels + conversations when workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    channelsApi.list(activeWorkspace.id).then(setChannels)
    conversationsApi.list(activeWorkspace.id).then(setConversations)
  }, [activeWorkspace?.id])

  const handleWorkspaceCreated = (ws: Workspace) => {
    setWorkspaces([...workspaces, ws])
    setActiveWorkspace(ws)
    setShowCreateWorkspace(false)
  }

  if (booting) return <LoadingScreen />

  if (!activeWorkspace) {
    return (
      <>
        <NoWorkspaceScreen onCreate={() => setShowCreateWorkspace(true)} />
        <CreateWorkspaceModal
          open={showCreateWorkspace}
          onClose={() => setShowCreateWorkspace(false)}
          onCreated={handleWorkspaceCreated}
        />
      </>
    )
  }

  return (
    <AppShell>
      <WorkspaceSwitcher
        onCreateWorkspace={() => setShowCreateWorkspace(true)}
        onInviteMember={() => setShowInvite(true)}
      />
      <Sidebar
        onCreateChannel={() => setShowCreateChannel(true)}
        onOpenDm={() => setShowOpenDm(true)}
      />
      <ChatArea />

      <CreateWorkspaceModal
        open={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
        onCreated={handleWorkspaceCreated}
      />
      <CreateChannelModal
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        workspaceId={activeWorkspace.id}
      />
      <OpenDmModal
        open={showOpenDm}
        onClose={() => setShowOpenDm(false)}
        workspaceId={activeWorkspace.id}
      />
      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        workspaceId={activeWorkspace.id}
      />
    </AppShell>
  )
}

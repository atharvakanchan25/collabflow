import { useState } from 'react'
import { usersApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { Avatar } from './Avatar'
import type { UserStatus } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
}

const STATUSES: UserStatus[] = ['ONLINE', 'AWAY', 'DND', 'OFFLINE']
const statusLabel: Record<UserStatus, string> = {
  ONLINE: '🟢 Online',
  AWAY: '🟡 Away',
  DND: '🔴 Do Not Disturb',
  OFFLINE: '⚫ Offline',
}

export function UserProfileModal({ open, onClose }: Props) {
  const { user, updateUser } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [status, setStatus] = useState<UserStatus>(user?.status ?? 'ONLINE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const updated = await usersApi.updateProfile({
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
      })
      updateUser({ ...updated, status })
      onClose()
    } catch {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <Avatar
            name={displayName || user?.username || '?'}
            avatarUrl={avatarUrl || null}
            size="lg"
          />
        </div>
        <Input
          label="Display name"
          placeholder={user?.username}
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
        <Input
          label="Avatar URL"
          placeholder="https://…"
          value={avatarUrl}
          onChange={e => setAvatarUrl(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-md text-sm text-left transition-colors ${
                  status === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  )
}

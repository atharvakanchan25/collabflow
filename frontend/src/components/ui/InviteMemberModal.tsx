import { useState } from 'react'
import { workspacesApi } from '../../api'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  workspaceId: string
}

export function InviteMemberModal({ open, onClose, workspaceId }: Props) {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await workspacesApi.addMember(workspaceId, userId.trim())
      setSuccess(true)
      setUserId('')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="User ID"
          placeholder="Enter user ID to invite"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">Member added successfully!</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
          <Button type="submit" loading={loading}>Invite</Button>
        </div>
      </form>
    </Modal>
  )
}

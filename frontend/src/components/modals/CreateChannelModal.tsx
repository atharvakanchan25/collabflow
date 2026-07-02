import { useState } from 'react'
import { channelsApi } from '../../api'
import { useChatStore } from '../../store/chatStore'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  workspaceId: string
}

export function CreateChannelModal({ open, onClose, workspaceId }: Props) {
  const { channels, setChannels, setActiveChannel } = useChatStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ch = await channelsApi.create(workspaceId, { name, description, isPrivate })
      setChannels([...channels, ch])
      setActiveChannel(ch)
      onClose()
      setName(''); setDescription(''); setIsPrivate(false)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Channel name"
          placeholder="general"
          value={name}
          onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          required
        />
        <Input
          label="Description (optional)"
          placeholder="What's this channel about?"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={e => setIsPrivate(e.target.checked)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm text-gray-300">Private channel</span>
        </label>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import { workspacesApi } from '../../api'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Workspace } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (ws: Workspace) => void
}

export function CreateWorkspaceModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ws = await workspacesApi.create({ name, slug })
      onCreated(ws)
      onClose()
      setName(''); setSlug('')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="My Team"
          value={name}
          onChange={e => {
            setName(e.target.value)
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
          }}
          required
        />
        <Input
          label="Slug"
          placeholder="my-team"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  )
}

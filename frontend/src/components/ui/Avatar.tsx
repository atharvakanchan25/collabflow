import type { UserStatus } from '../../types'

const statusColor: Record<UserStatus, string> = {
  ONLINE: 'bg-green-500',
  AWAY: 'bg-yellow-400',
  DND: 'bg-red-500',
  OFFLINE: 'bg-gray-400',
}

interface Props {
  name: string
  avatarUrl?: string | null
  status?: UserStatus
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }

export function Avatar({ name, avatarUrl, status, size = 'md' }: Props) {
  const initials = (name ?? '?').slice(0, 2).toUpperCase()
  return (
    <div className="relative inline-flex shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold`}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-gray-900 ${statusColor[status]}`} />
      )}
    </div>
  )
}

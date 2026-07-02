import { useEffect, useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { notificationsApi } from '../../api'
import { formatDistanceToNow } from 'date-fns'
import type { Notification as AppNotification } from '../../types'

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationsApi.unreadCount().then((d: { count: number }) => setUnread(d.count)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    notificationsApi.list().then((page: { content: AppNotification[] }) => {
      setNotifications(page.content)
    }).catch(() => {})
  }, [open])

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    setUnread(0)
    setNotifications(n => n.map(x => ({ ...x, isRead: true })))
  }

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id)
    setUnread(u => Math.max(0, u - 1))
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 text-gray-400 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                    <Check size={12} /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No notifications</p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${!n.isRead ? 'bg-indigo-950/30' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
                    <div className={!n.isRead ? '' : 'ml-4'}>
                      <p className="text-gray-200 text-sm">{n.type.replace(/_/g, ' ')}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

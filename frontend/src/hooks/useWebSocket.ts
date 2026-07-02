import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import type { WsMessageEvent, WsTypingEvent, WsPresenceEvent, Message } from '../types'

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null)
  const { accessToken } = useAuthStore()
  const { activeChannel, activeConversation, appendMessage, updateMessage, deleteMessage, setTyping, setPresence } = useChatStore()

  useEffect(() => {
    if (!accessToken) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3000,
      onConnect: () => {
        // presence
        client.subscribe('/topic/presence', msg => {
          const event: WsPresenceEvent = JSON.parse(msg.body)
          setPresence(event)
        })
        // user notifications
        client.subscribe('/user/queue/notifications', () => {})
      },
    })

    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [accessToken])

  // subscribe to active room
  useEffect(() => {
    const client = clientRef.current
    if (!client?.connected) return

    const roomId = activeChannel?.id ?? activeConversation?.id
    if (!roomId) return

    const topic = activeChannel
      ? `/topic/channels/${roomId}`
      : `/topic/conversations/${roomId}`

    const typingTopic = `${topic}/typing`

    const msgSub = client.subscribe(topic, msg => {
      const event: WsMessageEvent = JSON.parse(msg.body)
      const message: Message = {
        id: event.messageId,
        channelId: event.channelId,
        conversationId: event.conversationId,
        sender: { id: event.senderId, username: event.senderUsername, email: '', displayName: event.senderUsername, avatarUrl: null, status: 'ONLINE' },
        content: event.content,
        messageType: event.messageType,
        parentId: event.parentId,
        attachments: [],
        reactions: [],
        editedAt: null,
        createdAt: event.createdAt,
      }
      if (event.eventType === 'CREATED') appendMessage(roomId, message)
      else if (event.eventType === 'EDITED') updateMessage(roomId, message)
      else if (event.eventType === 'DELETED') deleteMessage(roomId, event.messageId)
    })

    const typingSub = client.subscribe(typingTopic, msg => {
      const event: WsTypingEvent = JSON.parse(msg.body)
      setTyping(roomId, event)
    })

    return () => { msgSub.unsubscribe(); typingSub.unsubscribe() }
  }, [activeChannel?.id, activeConversation?.id, clientRef.current?.connected])

  const sendTyping = (channelId: string | null, conversationId: string | null, username: string, isTyping: boolean) => {
    clientRef.current?.publish({
      destination: '/app/typing',
      body: JSON.stringify({ channelId, conversationId, username, isTyping }),
    })
  }

  const sendPresence = (status: string) => {
    clientRef.current?.publish({
      destination: '/app/presence',
      body: JSON.stringify({ status }),
    })
  }

  return { sendTyping, sendPresence }
}

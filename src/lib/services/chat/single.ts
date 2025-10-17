import { ConversationTarget } from '@/lib/types/conversations'
import { alovaInstance } from '@/lib/services/request'
import { MessageQuery, Message } from '@/lib/types/messages'

const prefix = '/chat/single'

export const createSingleConversation = (user_id: string) => {
  return alovaInstance.Post<ConversationTarget>(`${prefix}/create/${user_id}`, undefined, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const getSingleConversationInfo = (conversationId: string) => {
  return alovaInstance.Get(`${prefix}/${conversationId}`, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const deleteSingleConversation = (conversationId: string) => {
  return alovaInstance.Delete(`${prefix}/${conversationId}`, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const getSingleMessagesQuery = (conv_id: string, query: MessageQuery) => {
  return alovaInstance.Get<Message[]>(`${prefix}/${conv_id}/messages`, {
    params: query,
    meta: {
      authRole: 'auth'
    }
  })
}

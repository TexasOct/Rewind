import { NotificationType } from '@/lib/types/conversations'
import { alovaInstance } from '@/lib/services/request'

export const UpdateConversationNotification = (data: { conv_id: string; notification_type: NotificationType }) => {
  return alovaInstance.Post('/user/conversation/notification', data, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const getConversationList = () => {
  return alovaInstance.Get('/user/conversation/list', {
    meta: {
      authRole: 'auth'
    }
  })
}

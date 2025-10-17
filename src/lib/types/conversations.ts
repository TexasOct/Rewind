export type ConversationTarget = {
  conv_id: string
  notification_type?: NotificationType
} & ConversationDetail

type ConversationDetail =
  | {
      type: 'Single'
      user_id: string
    }
  | {
      type: 'Group'
    }
  | {
      type: 'Server'
      server_id: string
    }

export enum NotificationType {
  Push = 0,
  Silent,
  NotReceive
}

export type NotificationDetail = (
  | {
      type: 'Single'
      user_id: string
    }
  | {
      type: 'Group'
      group_id: string
    }
  | {
      type: 'Server'
      server_id: string
      channel_id: string
    }
) & {
  notification_type: NotificationType
}

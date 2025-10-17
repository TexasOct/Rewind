import { ConversationTarget, NotificationType } from './conversations'
import { UserRelation } from './relations'

export interface UserProfile {
  _id: string
  name: string
  avatar?: string
  email?: string
  gender?: string
  phone?: string
  address?: string
  region?: string
  birthday?: number
  bio?: string
  conversations?: ConversationTarget[]
  relations?: UserRelation[]
  notifications?: NotificationType[]
  create_time?: number
  update_time?: number
}

export type UserConvProfile = UserProfile & { user_id: string; conv_id: string; notification_type?: NotificationType }

export type ConvProfile = UserProfile

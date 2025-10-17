import { ConversationTarget } from './conversations'

export type Message = {
  _id: string
  author_id: string
  seq?: number
  local_seq?: string
  send_time?: number
  edited_time?: number
  status: MessageStatus
  // system_content 和 message_content 只会出现一个，客户端根据存在的 key 值来判断显示哪个
  system_content?: SystemContent
  message_content?: MessageContent
  user_modify_info?: UserModifyInfo
  pinned?: boolean
  related_msg_id?: string
  read_user_ids?: string[]
} & ConversationTarget

export enum MessageStatus {
  Sending = 'Sending',
  Sent = 'Sent',
  Failed = 'Failed',
  Mentioned = 'Mentioned',
  AllMentioned = 'AllMentioned',
  UnRead = 'UnRead',
  Readed = 'Readed',
  Played = 'Played'
}

interface UserModifyInfo {
  id: string
  name?: string
  avatar?: string
}

type SystemContent = {
  type: SystemContentType
  id: string
  by?: string
  content?: string
}

type SystemContentType =
  | 'text'
  | 'user_added'
  | 'user_remove'
  | 'user_joined'
  | 'user_left'
  | 'user_kicked'
  | 'user_banned'
  | 'message_pinned'
  | 'message_unpinned'

// Assuming these types exist elsewhere
interface File {
  file_url: string
  file_name: string
  file_size: number
}

interface Image {
  image_url: string
  preview_url: string
  width: number
  height: number
}

interface Video {
  video_url: string
  preview_url: string
  video_size: number
}

interface Gif {
  gif_url: string
  gif_collection_id: string
  gif_name: string
  gif_size: number
}

interface Audio {
  audio_url: string
  audio_name: string
  audio_size: number
}

export type MessageContent =
  | { type: 'text'; content: string } // Text message
  | { type: 'media'; medias: Media[]; caption?: string } // Media message
  | { type: 'file'; files: File[]; caption?: string } // File message
  | { type: 'gif'; gif: Gif } // GIF message

type Media = ({ type: 'Image' } & Image) | ({ type: 'Video' } & Video) | ({ type: 'Audio' } & Audio)

export type MessageQuery = {
  limit?: number
  // 消息发送者
  author_id?: string
  // 搜索关键字
  query?: string
  // 信息置顶搜索
  pinned?: boolean
  // 信息排列
  sort?: MessageSort
} & MessageQuerySort

export type MessageQuerySort =
  // 以某个时间为query
  | {
      nearby?: string
    }
  // 以时间范围为query
  | {
      before?: string
      after?: string
    }

// 使用字符串字面量类型来确保序列化和反序列化时始终使用小写
type MessageSort = 'relevance' | 'latest' | 'oldest'

// 为了保持类型安全和枚举的便利性，同时提供一个常量对象
export const MessageSortEnum = {
  Relevance: 'relevance' as MessageSort,
  Latest: 'latest' as MessageSort,
  Oldest: 'oldest' as MessageSort
} as const

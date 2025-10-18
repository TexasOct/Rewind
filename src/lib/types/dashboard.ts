// 统计面板相关类型定义

export interface TokenUsageData {
  timestamp: number
  tokens: number
  model?: string
}

export interface AgentTaskData {
  timestamp: number
  completed: number
  failed: number
  total: number
}

export interface DashboardMetrics {
  tokenUsage: TokenUsageData[]
  agentTasks: AgentTaskData[]
  period: 'day' | 'week' | 'month'
}

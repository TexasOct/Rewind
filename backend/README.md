# Rewind Backend 设计文档

## 项目概述

Rewind Backend 是一个智能用户行为监控和分析系统，通过实时捕获用户的键盘、鼠标操作和屏幕截图，使用 LLM 进行智能分析和总结，并基于用户行为提供智能助手建议。

## 系统架构

### 整体架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Perception    │───▶│   Processing    │───▶│   Consumption   │
│                 │    │                 │    │                 │
│ • 键盘监控       │    │ • 事件筛选        │    │ • 智能分析       │
│ • 鼠标监控       │    │ • LLM 总结       │    │ • 任务推荐       │
│ • 屏幕截图       │    │ • 活动合并        │    │ • Agent 执行    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 核心组件

1. **Perception Layer（感知层）** - 原始数据捕获
2. **Processing Layer（处理层）** - 数据筛选和智能分析
3. **Consumption Layer（消费层）** - 智能建议和任务执行
4. **Agent System（代理系统）** - 可扩展的任务执行框架


用 cli 来启动后端服务，用yaml来配置config


## 详细设计

### 1. Perception Layer（感知层）

#### 1.1 数据捕获流程

```
实时监控 → raw_records → 滑动窗口存储
```

- **监控频率**: 每 0.2 秒获取一次屏幕截图
- **数据内容**: 键盘事件 + 鼠标事件 + 屏幕截图
- **存储方式**: 20 秒临时滑动窗口，超时自动删除

#### 1.2 基础抽象类

```python
class BaseCapture:
    def capture(self) -> RawRecord:
        """捕获原始数据"""
        pass
    
    def output(self) -> None:
        """输出处理后的数据"""
        pass
```

#### 1.3 具体实现类

- `KeyboardCapture` - 键盘事件捕获
- `MouseCapture` - 鼠标事件捕获  
- `ScreenshotCapture` - 屏幕截图捕获

### 2. Processing Layer（处理层）

#### 2.1 数据流转

```
raw_records → events(带有events_summary字段) → activity
```

#### 2.2 事件筛选规则

1. **键盘事件筛选**
   - 仅保留特殊键盘事件（组合键、回车等）
   - 过滤普通字符输入

2. **鼠标事件筛选**
   - 连续的 scroll 事件合并为一个 scroll
   - 保留点击和拖拽事件

3. **屏幕截图处理**
   - 每个键盘、鼠标事件前的最近一张屏幕截图
   - 智能插帧：如果存在一秒内无截图，自动插帧
   - 压缩和 phash 算法去重

#### 2.3 处理流程

1. **每 10 秒**进行一次 `raw_records → events` 转换
2. **LLM 总结**：`events → events_summary`
3. **活动合并**：使用 LLM 判断新 events_summary 是否与上一个 activity 相关
   - 相关：合并到现有 activity
   - 不相关：创建新 activity
4. 以上raw_records, events, activity全部持久化存储到SQLite中（存储的时候要记录下来这个层级关系）

#### 2.4 数据模型

```python
class RawRecord:
    timestamp: datetime
    type: EventType(enum in [KeyboardEvent, MouseEvent, Screenshot])
    data: json


class Event:
    id: str
    start_time: datetime
    end_time: datetime
    type: EventType
    summary: str
    source_data: List[RawRecord]


class Activity:
    id: str
    description: str
    start_time: datetime
    end_time: datetime
    source_events: List[Event]
```

### 3. Consumption Layer（消费层）

#### 3.1 智能分析流程

```
Activity → LLM 分析 → 需求识别 → Agent 匹配 → 任务规划 → TODO 生成
```

#### 3.2 任务状态管理

- **todo**: 等待用户确认
- **doing**: 正在执行（可并行）
- **done**: 执行完成
- **cancelled**: 已取消

#### 3.3 任务操作

- 修改任务内容
- 删除任务
- 执行任务
- 强制停止执行

### 4. Agent System（代理系统）

#### 4.1 架构设计

```python
class AgentFactory:
    """Agent 工厂类"""
    def register_agent(self, agent_type: str, agent_class: type):
        pass
    
    def create_agent(self, agent_type: str) -> BaseAgent:
        pass

class BaseAgent:
    """Agent 基类"""
    def execute(self, task: Task) -> TaskResult:
        pass
    
    def can_handle(self, task: Task) -> bool:
        pass
```

#### 4.2 可扩展性

- 支持动态注册新的 Agent
- 每个 Agent 可以声明自己能够处理的任务类型
- 支持并行执行多个 Agent 任务

## 技术栈

### 后端技术

- **语言**: Python 3.13
- **框架**: FastAPI (REST API + WebSocket)
- **数据库**: SQLite
- **LLM 集成**: OpenAI API / 其他 LLM 服务
- **图像处理**: OpenCV, PIL
- **系统监控**: pynput (键盘鼠标), mss (屏幕截图)


## 配置管理

### 环境变量

```bash
# 数据库配置
DATABASE_URL=sqlite:///./rewind.db

# LLM 配置
OPENAI_API_KEY=your_api_key
LLM_MODEL=gpt-4

# 监控配置
CAPTURE_INTERVAL=0.2
WINDOW_SIZE=20
PROCESSING_INTERVAL=10

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

## 前后端交互方案（待定）

1. REST API
2. https://pytauri.github.io/pytauri/latest/


## 性能优化

1. **异步处理**: 使用 asyncio 进行异步数据捕获和处理
2. **内存管理**: 滑动窗口机制避免内存泄漏
3. **图像压缩**: 智能压缩和去重减少存储空间
4. **批量处理**: 批量处理事件提高效率

## 扩展计划

1. **多平台支持**: 支持 Windows、macOS、Linux
2. **更多 Agent**: 集成更多类型的智能助手
3. **机器学习**: 基于用户行为模式进行个性化推荐
4. **云端同步**: 可选的云端数据同步功能

## 目录初步设计 

```
rewind_backend/
├── main.py                        # CLI入口
├── cli.py                         # Typer 命令行接口
│
├── config/
│   ├── config.yaml                # 默认配置文件模板
│   ├── loader.py                  # 解析 & 环境变量合并
│   └── __init__.py
│
├── core/
│   ├── db.py                      # sqlite3 封装（connect/query/insert/update）
│   ├── models.py                  # 数据模型（RawRecord, Event, Activity, Task）
│   ├── utils.py                   # 工具函数（时间、UUID、图像压缩、phash）
│   ├── logger.py                  # 日志系统（按 config.logs_dir 输出）
│   └── __init__.py
│
├── perception/
│   ├── __init__.py
│   ├── base.py                    # BaseCapture 抽象类
│   ├── keyboard_capture.py
│   ├── mouse_capture.py
│   ├── screenshot_capture.py
│   ├── manager.py                 # 异步任务管理（定时采集）
│   └── storage.py                 # 滑动窗口缓存
│
├── processing/
│   ├── __init__.py
│   ├── filter_rules.py            # 键鼠事件筛选逻辑
│   ├── summarizer.py              # 调用 LLM 生成 events_summary
│   ├── merger.py                  # LLM 判断 activity 合并逻辑
│   ├── pipeline.py                # 定时 raw_records→events→activity
│   └── persistence.py             # 手写SQL持久化接口
│
├── consumption/
│   ├── __init__.py
│   ├── analyzer.py                # 从 activity 提取任务意图 (LLM)
│   ├── planner.py                 # 匹配合适 agent，生成 Task
│   ├── task_manager.py            # Task 状态管理
│   ├── notifier.py                # WebSocket 推送封装
│   └── runner.py                  # 异步任务执行调度
│
├── agents/
│   ├── __init__.py
│   ├── base.py                    # BaseAgent + 注册机制
│   ├── registry.py
│   ├── builtin/
│   │   ├── browser_agent.py
│   │   ├── file_agent.py
│   │   └── shell_agent.py
│   └── executor.py                # asyncio并行执行封装
│
├── llm/
│   ├── __init__.py
│   ├── client.py                  # 通用 LLM 客户端，支持多配置
│   ├── prompt_templates.py        # summary / merge / analyze 提示词模板
│   └── router.py                  # 根据调用层选择对应 LLM 配置
│
├── api/
│   ├── __init__.py
│   ├── routes/
│   │   ├── perception.py
│   │   ├── events.py
│   │   ├── activities.py
│   │   ├── tasks.py
│   │   ├── agents.py
│   │   └── system.py
│   ├── websocket.py               # WebSocket 实时推送（广播）
│   └── server.py                  # FastAPI 实例
│
├── tests/
│   ├── test_processing.py
│   ├── test_agents.py
│   ├── test_pipeline.py
│   └── test_api.py
│
├── scripts/
│   ├── init_db.py
│   ├── demo_run.py
│   └── export_data.py
│
├── requirements.txt
├── pyproject.toml
└── README.md

```


| 目标            | 实现策略                                               |
| ------------- | -------------------------------------------------- |
| 统一 LLM Client | 所有层共用 `llm/client.py`，支持多配置（不同 model/base_url/key） |
| 轻量数据库         | 使用 `sqlite3` + SQL 模块化封装，保证透明控制                    |
| 异步 Agent      | 使用 `asyncio.gather` + `ThreadPoolExecutor` 实现并行执行  |
| 实时推送          | 基于 `FastAPI` WebSocket 通道广播 activity/task 更新       |
| 配置灵活          | YAML + 环境变量合并加载；支持多 LLM、路径、interval 配置             |


## Quick Start

```bash
# 查看帮助
uv run python main.py --help

# 启动服务
uv run python main.py start

# 启动服务（调试模式）
uv run python main.py start --debug

# 使用自定义端口
uv run python main.py start --port 8001

# 其他命令
uv run python main.py init-db
uv run python main.py test
```
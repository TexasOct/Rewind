#!/usr/bin/env python3
"""
Rewind Backend 主入口文件
支持通过 python main.py start 启动服务
"""

import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    from cli import main
    main()

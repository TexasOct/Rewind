"""
屏幕截图捕获
使用 mss 库进行高效的屏幕截图
"""

import time
import hashlib
import base64
import os
from datetime import datetime
from typing import Optional, Callable, Tuple
import mss
from PIL import Image
import io
from core.models import RawRecord, RecordType
from core.logger import get_logger
from .base import BaseCapture

logger = get_logger(__name__)


class ScreenshotCapture(BaseCapture):
    """屏幕截图捕获器"""
    
    def __init__(self, on_event: Optional[Callable[[RawRecord], None]] = None):
        super().__init__()
        self.on_event = on_event
        self.mss_instance: Optional[mss.mss] = None
        self._last_screenshot_time = 0
        self._last_hash = None
        self._screenshot_count = 0
        self._compression_quality = 85
        self._max_width = 1920
        self._max_height = 1080
        self._enable_phash = True
        
        # 创建 tmp 文件夹用于存储截图
        self.tmp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tmp", "screenshots")
        self._ensure_tmp_dir()
        
    def capture(self) -> RawRecord:
        """捕获屏幕截图"""
        try:
            if not self.mss_instance:
                self.mss_instance = mss.mss()
            
            # 获取主显示器
            monitor = self.mss_instance.monitors[1]  # 0 是所有显示器，1 是主显示器
            
            # 截取屏幕
            screenshot = self.mss_instance.grab(monitor)
            
            # 转换为 PIL Image
            img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
            
            # 压缩和调整大小
            img = self._process_image(img)
            
            # 计算哈希值（用于去重）
            img_hash = self._calculate_hash(img)
            
            # 检查是否与上一张截图相同
            if self._last_hash == img_hash:
                logger.debug("跳过重复的屏幕截图")
                return None
            
            self._last_hash = img_hash
            self._screenshot_count += 1
            
            # 转换为字节数据
            img_bytes = self._image_to_bytes(img)
            
            # 保存截图到文件
            screenshot_path = self._save_screenshot_to_file(img_bytes, img_hash)
            
            screenshot_data = {
                "action": "capture",
                "width": img.width,
                "height": img.height,
                "format": "JPEG",
                "img_data": base64.b64encode(img_bytes).decode('utf-8'),
                "hash": img_hash,
                "monitor": monitor,
                "timestamp": datetime.now().isoformat()
            }
            
            record = RawRecord(
                timestamp=datetime.now(),
                type=RecordType.SCREENSHOT_RECORD,
                data=screenshot_data,
                screenshot_path=screenshot_path
            )
            
            # 存储图像数据（在实际实现中，这里应该存储到文件或数据库）
            record.image_data = img_bytes
            
            if self.on_event:
                self.on_event(record)
            
            return record
            
        except Exception as e:
            logger.error(f"屏幕截图捕获失败: {e}")
            return None
    
    def output(self) -> None:
        """输出处理后的数据（屏幕截图不需要缓冲）"""
        pass
    
    def start(self):
        """开始屏幕截图捕获"""
        if self.is_running:
            logger.warning("屏幕截图捕获已在运行中")
            return
        
        self.is_running = True
        try:
            self.mss_instance = mss.mss()
            logger.info("屏幕截图捕获已启动")
        except Exception as e:
            logger.error(f"启动屏幕截图捕获失败: {e}")
            self.is_running = False
    
    def stop(self):
        """停止屏幕截图捕获"""
        if not self.is_running:
            return
        
        self.is_running = False
        if self.mss_instance:
            self.mss_instance.close()
            self.mss_instance = None
        logger.info("屏幕截图捕获已停止")
    
    def _process_image(self, img: Image.Image) -> Image.Image:
        """处理图像：调整大小和压缩"""
        try:
            # 调整大小（保持宽高比）
            if img.width > self._max_width or img.height > self._max_height:
                img.thumbnail((self._max_width, self._max_height), Image.Resampling.LANCZOS)
            
            # 转换为 RGB（如果需要）
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            return img
            
        except Exception as e:
            logger.error(f"图像处理失败: {e}")
            return img
    
    def _calculate_hash(self, img: Image.Image) -> str:
        """计算图像哈希值"""
        try:
            if self._enable_phash:
                # 使用感知哈希（pHash）
                return self._calculate_phash(img)
            else:
                # 使用 MD5 哈希
                img_bytes = self._image_to_bytes(img)
                return hashlib.md5(img_bytes).hexdigest()
        except Exception as e:
            logger.error(f"计算图像哈希失败: {e}")
            return ""
    
    def _calculate_phash(self, img: Image.Image) -> str:
        """计算感知哈希（简化版）"""
        try:
            # 简化的感知哈希实现
            # 将图像缩放到 8x8
            img_small = img.resize((8, 8), Image.Resampling.LANCZOS)
            img_gray = img_small.convert('L')
            
            # 计算平均像素值
            pixels = list(img_gray.getdata())
            avg = sum(pixels) / len(pixels)
            
            # 生成哈希
            hash_bits = []
            for pixel in pixels:
                hash_bits.append('1' if pixel > avg else '0')
            
            # 转换为十六进制
            hash_str = ''.join(hash_bits)
            return hex(int(hash_str, 2))[2:].zfill(16)
            
        except Exception as e:
            logger.error(f"计算感知哈希失败: {e}")
            return ""
    
    def _image_to_bytes(self, img: Image.Image) -> bytes:
        """将图像转换为字节数据"""
        try:
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG', quality=self._compression_quality)
            return img_bytes.getvalue()
        except Exception as e:
            logger.error(f"图像转字节失败: {e}")
            return b""
    
    def capture_with_interval(self, interval: float = 0.2):
        """按指定间隔捕获屏幕截图"""
        if not self.is_running:
            logger.warning("屏幕截图捕获未启动")
            return
        
        current_time = time.time()
        if current_time - self._last_screenshot_time >= interval:
            self.capture()
            self._last_screenshot_time = current_time
    
    def get_monitor_info(self) -> dict:
        """获取显示器信息"""
        try:
            if not self.mss_instance:
                self.mss_instance = mss.mss()
            
            monitors = self.mss_instance.monitors
            return {
                "monitor_count": len(monitors) - 1,  # 减去 "All in One" 显示器
                "monitors": monitors[1:],  # 排除 "All in One"
                "primary_monitor": monitors[1] if len(monitors) > 1 else None
            }
        except Exception as e:
            logger.error(f"获取显示器信息失败: {e}")
            return {"monitor_count": 0, "monitors": [], "primary_monitor": None}
    
    def set_compression_settings(self, quality: int = 85, max_width: int = 1920, max_height: int = 1080):
        """设置压缩参数"""
        self._compression_quality = max(1, min(100, quality))
        self._max_width = max(100, max_width)
        self._max_height = max(100, max_height)
        logger.info(f"压缩设置已更新: quality={self._compression_quality}, max_size=({self._max_width}, {self._max_height})")
    
    def get_stats(self) -> dict:
        """获取捕获统计信息"""
        return {
            "is_running": self.is_running,
            "screenshot_count": self._screenshot_count,
            "last_screenshot_time": self._last_screenshot_time,
            "last_hash": self._last_hash,
            "compression_quality": self._compression_quality,
            "max_size": (self._max_width, self._max_height),
            "enable_phash": self._enable_phash,
            "tmp_dir": self.tmp_dir
        }
    
    def _ensure_tmp_dir(self) -> None:
        """确保 tmp 目录存在"""
        try:
            os.makedirs(self.tmp_dir, exist_ok=True)
            logger.debug(f"截图临时目录已创建: {self.tmp_dir}")
        except Exception as e:
            logger.error(f"创建截图临时目录失败: {e}")
    
    def _save_screenshot_to_file(self, img_bytes: bytes, img_hash: str) -> str:
        """保存截图到文件并返回文件路径"""
        try:
            # 生成文件名：时间戳_哈希值.jpg
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # 精确到毫秒
            filename = f"screenshot_{timestamp}_{img_hash[:8]}.jpg"
            file_path = os.path.join(self.tmp_dir, filename)
            
            # 保存文件
            with open(file_path, 'wb') as f:
                f.write(img_bytes)
            
            logger.debug(f"截图已保存到: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"保存截图文件失败: {e}")
            return ""
    
    def cleanup_old_screenshots(self, max_age_hours: int = 24) -> int:
        """清理旧的截图文件"""
        try:
            import time
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            cleaned_count = 0
            
            for filename in os.listdir(self.tmp_dir):
                if filename.startswith("screenshot_") and filename.endswith(".jpg"):
                    file_path = os.path.join(self.tmp_dir, filename)
                    file_age = current_time - os.path.getmtime(file_path)
                    
                    if file_age > max_age_seconds:
                        os.remove(file_path)
                        cleaned_count += 1
                        logger.debug(f"已删除旧截图: {filename}")
            
            if cleaned_count > 0:
                logger.info(f"清理了 {cleaned_count} 个旧截图文件")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"清理旧截图失败: {e}")
            return 0

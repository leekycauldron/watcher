"""System metrics collection via psutil and GPUtil."""

import psutil

from backend.models import SystemHealth


def get_system_health() -> SystemHealth:
    """Collect current CPU, RAM, GPU, and disk metrics."""
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    gpu_name = None
    gpu_percent = None
    gpu_memory_percent = None
    gpu_temp_c = None

    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus:
            gpu = gpus[0]
            gpu_name = gpu.name
            gpu_percent = gpu.load * 100
            gpu_memory_percent = gpu.memoryUtil * 100
            gpu_temp_c = gpu.temperature
    except Exception:
        pass

    return SystemHealth(
        cpu_percent=psutil.cpu_percent(interval=None),
        ram_percent=ram.percent,
        ram_used_gb=round(ram.used / (1024**3), 1),
        ram_total_gb=round(ram.total / (1024**3), 1),
        gpu_name=gpu_name,
        gpu_percent=gpu_percent,
        gpu_memory_percent=gpu_memory_percent,
        gpu_temp_c=gpu_temp_c,
        disk_percent=disk.percent,
        disk_used_gb=round(disk.used / (1024**3), 1),
        disk_total_gb=round(disk.total / (1024**3), 1),
    )

#!/usr/bin/env python3
"""
GPU Test Agent - Runs ResNet50 benchmark on GPU and reports results to backend
This script should be run on the GPU instance after SSH connection
"""

import subprocess
import sys
import json
import time
import os
import requests
import platform
import shutil
import psutil
from datetime import datetime
from typing import Dict, Any, Optional

try:
    import torch
    import torchvision
    from torchvision import models, transforms
    import torch.nn as nn
except ImportError:
    print("PyTorch not installed. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "--index-url", "https://download.pytorch.org/whl/cu118"])
    import torch
    import torchvision
    from torchvision import models, transforms
    import torch.nn as nn

try:
    import pynvml
    HAS_NVML = True
except ImportError:
    print("pynvml not available (for GPU metrics). Installing...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pynvml"])
        import pynvml
        HAS_NVML = True
    except:
        HAS_NVML = False
        print("Warning: pynvml not available. GPU metrics will be limited.")

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    print("psutil not available. Installing...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil"])
        import psutil
        HAS_PSUTIL = True
    except:
        HAS_PSUTIL = False
        print("Warning: psutil not available. System telemetry will be limited.")

class GPUPerformanceMonitor:
    """Monitor GPU performance metrics during testing"""
    
    def __init__(self):
        self.has_nvml = HAS_NVML
        if self.has_nvml:
            try:
                pynvml.nvmlInit()
                self.handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            except:
                self.has_nvml = False
    
    def get_system_telemetry(self) -> Dict[str, Any]:
        """Get system telemetry (CPU, RAM, disk)"""
        telemetry = {}
        
        if HAS_PSUTIL:
            try:
                # RAM
                ram = psutil.virtual_memory()
                telemetry['ram_gb'] = ram.total / (1024**3)
                
                # CPU
                telemetry['cpu_count'] = psutil.cpu_count(logical=True)
                
                # Disk space
                disk = shutil.disk_usage('/')
                telemetry['disk_space_gb'] = disk.total / (1024**3)
            except Exception as e:
                print(f"Warning: Could not get system telemetry: {e}")
        
        # Fallback methods if psutil not available
        if 'ram_gb' not in telemetry:
            try:
                # Try to get RAM via /proc/meminfo (Linux)
                if platform.system() == 'Linux':
                    with open('/proc/meminfo', 'r') as f:
                        for line in f:
                            if line.startswith('MemTotal:'):
                                ram_kb = int(line.split()[1])
                                telemetry['ram_gb'] = ram_kb / (1024**2)
                                break
            except:
                pass
        
        if 'cpu_count' not in telemetry:
            telemetry['cpu_count'] = os.cpu_count() or platform.processor().count(',') + 1 if platform.processor() else 1
        
        return telemetry
    
    def get_gpu_info(self) -> Dict[str, Any]:
        """Get GPU information"""
        info = {}
        
        if torch.cuda.is_available():
            info['cuda_available'] = True
            info['gpu_name'] = torch.cuda.get_device_name(0)
            info['gpu_count'] = torch.cuda.device_count()
            info['cuda_version'] = torch.version.cuda
            
            if self.has_nvml:
                try:
                    memory_info = pynvml.nvmlDeviceGetMemoryInfo(self.handle)
                    info['memory_total_gb'] = memory_info.total / (1024**3)
                    
                    # Get power draw
                    try:
                        power = pynvml.nvmlDeviceGetPowerUsage(self.handle) / 1000.0  # Convert mW to W
                        info['power_draw_watts'] = power
                    except:
                        pass
                    
                    # Get temperature
                    try:
                        temp = pynvml.nvmlDeviceGetTemperature(self.handle, pynvml.NVML_TEMPERATURE_GPU)
                        info['temperature_celsius'] = temp
                    except:
                        pass
                except:
                    pass
        else:
            info['cuda_available'] = False
            
        return info
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current GPU metrics"""
        metrics = {}
        
        if torch.cuda.is_available():
            # Memory usage
            metrics['memory_used_gb'] = torch.cuda.memory_allocated(0) / (1024**3)
            metrics['memory_total_gb'] = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            
            # Utilization (from nvml if available)
            if self.has_nvml:
                try:
                    util = pynvml.nvmlDeviceGetUtilizationRates(self.handle)
                    metrics['gpu_utilization_percent'] = util.gpu
                except:
                    pass
            
            # Power and temperature
            if self.has_nvml:
                try:
                    power = pynvml.nvmlDeviceGetPowerUsage(self.handle) / 1000.0
                    metrics['power_draw_watts'] = power
                except:
                    pass
                
                try:
                    temp = pynvml.nvmlDeviceGetTemperature(self.handle, pynvml.NVML_TEMPERATURE_GPU)
                    metrics['temperature_celsius'] = temp
                except:
                    pass
        
        return metrics


def run_resnet50_benchmark(
    batch_size: int = 32,
    num_epochs: int = 1,
    image_size: int = 224,
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
) -> Dict[str, Any]:
    """
    Run ResNet50 training benchmark
    
    Args:
        batch_size: Batch size for training
        num_epochs: Number of epochs to run
        image_size: Image size (224 for ImageNet)
        device: Device to run on (cuda/cpu)
    
    Returns:
        Dictionary with performance metrics
    """
    print(f"Running ResNet50 benchmark on {device}...")
    print(f"Batch size: {batch_size}, Epochs: {num_epochs}, Image size: {image_size}")
    
    monitor = GPUPerformanceMonitor()
    
    # Get system telemetry
    system_telemetry = monitor.get_system_telemetry()
    print(f"System: {system_telemetry.get('cpu_count', 'Unknown')} CPUs, {system_telemetry.get('ram_gb', 0):.1f} GB RAM")
    
    # Get initial GPU info
    gpu_info = monitor.get_gpu_info()
    print(f"GPU: {gpu_info.get('gpu_name', 'Unknown')}")
    
    # Move to device
    device_obj = torch.device(device)
    
    # Load ResNet50 model
    print("Loading ResNet50 model...")
    model = models.resnet50(weights='IMAGENET1K_V2')
    model = model.to(device_obj)
    model.train()
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
    
    # Create dummy dataset (ImageNet-like)
    print("Creating dummy dataset...")
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Create dummy data loader
    dummy_dataset = torch.utils.data.TensorDataset(
        torch.randn(1000, 3, image_size, image_size),
        torch.randint(0, 1000, (1000,))
    )
    data_loader = torch.utils.data.DataLoader(dummy_dataset, batch_size=batch_size, shuffle=True)
    
    # Warmup
    print("Warming up...")
    for _ in range(5):
        for images, labels in data_loader:
            images = images.to(device_obj)
            labels = labels.to(device_obj)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            break
    
    torch.cuda.synchronize() if device == "cuda" else None
    
    # Benchmark
    print("Running benchmark...")
    start_time = time.time()
    total_samples = 0
    total_loss = 0.0
    num_batches = 0
    
    for epoch in range(num_epochs):
        epoch_start = time.time()
        for batch_idx, (images, labels) in enumerate(data_loader):
            images = images.to(device_obj)
            labels = labels.to(device_obj)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            total_samples += images.size(0)
            total_loss += loss.item()
            num_batches += 1
            
            if batch_idx % 10 == 0:
                print(f"Epoch {epoch+1}/{num_epochs}, Batch {batch_idx}, Loss: {loss.item():.4f}")
        
        torch.cuda.synchronize() if device == "cuda" else None
        epoch_time = time.time() - epoch_start
        print(f"Epoch {epoch+1} completed in {epoch_time:.2f}s")
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Get final metrics
    final_metrics = monitor.get_current_metrics()
    
    # Calculate throughput
    throughput_samples_per_sec = total_samples / total_time
    throughput_images_per_sec = throughput_samples_per_sec
    
    # Calculate latency
    avg_latency_ms = (total_time / num_batches) * 1000 if num_batches > 0 else 0
    
    # Average loss
    avg_loss = total_loss / num_batches if num_batches > 0 else 0
    
    results = {
        'throughput_samples_per_sec': throughput_samples_per_sec,
        'throughput_images_per_sec': throughput_images_per_sec,
        'latency_ms': avg_latency_ms,
        'loss': avg_loss,
        'test_duration_seconds': int(total_time),
        'total_samples': total_samples,
        'num_batches': num_batches,
        **final_metrics,
        'gpu_info': gpu_info,
        'system_telemetry': system_telemetry,  # Include system specs
    }
    
    print("\n=== Benchmark Results ===")
    print(f"Throughput: {throughput_samples_per_sec:.2f} samples/sec")
    print(f"Latency: {avg_latency_ms:.2f} ms/batch")
    print(f"Average Loss: {avg_loss:.4f}")
    print(f"Total Time: {total_time:.2f}s")
    
    return results


def submit_results(
    api_url: str,
    gpu_instance_id: str,
    api_key: str,
    test_results: Dict[str, Any],
    test_type: str = "resnet50"
) -> bool:
    """
    Submit test results to backend and update instance telemetry
    
    Args:
        api_url: Backend API URL
        gpu_instance_id: GPU instance ID
        api_key: API key for authentication
        test_results: Test results dictionary
        test_type: Type of test
    
    Returns:
        True if successful, False otherwise
    """
    # Extract system telemetry if available
    system_telemetry = test_results.get('system_telemetry', {})
    gpu_info = test_results.get('gpu_info', {})
    
    payload = {
        'gpu_instance_id': gpu_instance_id,
        'api_key': api_key,
        'test_type': test_type,
        'batch_size': test_results.get('batch_size', 32),
        'num_epochs': test_results.get('num_epochs', 1),
        'image_size': test_results.get('image_size', 224),
        'throughput_images_per_sec': test_results.get('throughput_images_per_sec'),
        'throughput_samples_per_sec': test_results.get('throughput_samples_per_sec'),
        'latency_ms': test_results.get('latency_ms'),
        'gpu_utilization_percent': test_results.get('gpu_utilization_percent'),
        'memory_used_gb': test_results.get('memory_used_gb'),
        'memory_total_gb': test_results.get('memory_total_gb'),
        'power_draw_watts': test_results.get('power_draw_watts'),
        'temperature_celsius': test_results.get('temperature_celsius'),
        'loss': test_results.get('loss'),
        'test_duration_seconds': test_results.get('test_duration_seconds'),
        # Include telemetry data to update instance specs
        'system_telemetry': {
            'ram_gb': system_telemetry.get('ram_gb'),
            'cpu_count': system_telemetry.get('cpu_count'),
            'disk_space_gb': system_telemetry.get('disk_space_gb'),
            'gpu_name': gpu_info.get('gpu_name'),
            'gpu_count': gpu_info.get('gpu_count'),
            'cuda_version': gpu_info.get('cuda_version'),
        },
        'raw_results': test_results,
    }
    
    try:
        print(f"Submitting results to {api_url}...")
        response = requests.post(
            api_url,
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'x-api-key': api_key,
            },
            timeout=30
        )
        
        if response.status_code == 200:
            print("Results submitted successfully!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error submitting results: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Exception submitting results: {str(e)}")
        return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='GPU Test Agent - Run ResNet50 benchmark')
    parser.add_argument('--gpu-instance-id', required=True, help='GPU instance ID')
    parser.add_argument('--api-url', required=True, help='Backend API URL for submitting results')
    parser.add_argument('--api-key', required=True, help='API key for authentication')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--num-epochs', type=int, default=1, help='Number of epochs')
    parser.add_argument('--image-size', type=int, default=224, help='Image size')
    parser.add_argument('--device', default='cuda', help='Device to use (cuda/cpu)')
    
    args = parser.parse_args()
    
    try:
        # Run benchmark
        results = run_resnet50_benchmark(
            batch_size=args.batch_size,
            num_epochs=args.num_epochs,
            image_size=args.image_size,
            device=args.device if torch.cuda.is_available() else 'cpu'
        )
        
        # Add config to results
        results['batch_size'] = args.batch_size
        results['num_epochs'] = args.num_epochs
        results['image_size'] = args.image_size
        
        # Submit results
        success = submit_results(
            api_url=args.api_url,
            gpu_instance_id=args.gpu_instance_id,
            api_key=args.api_key,
            test_results=results,
        )
        
        if success:
            print("\n✅ Test completed and submitted successfully!")
            sys.exit(0)
        else:
            print("\n❌ Test completed but submission failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Error running test: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Try to submit error
        try:
            submit_results(
                api_url=args.api_url,
                gpu_instance_id=args.gpu_instance_id,
                api_key=args.api_key,
                test_results={'error': str(e)},
            )
        except:
            pass
        
        sys.exit(1)


if __name__ == "__main__":
    main()


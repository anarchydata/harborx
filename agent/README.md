# GPU Test Agent

This agent runs ResNet50 benchmarks on GPU instances and submits results to the backend.

## Setup

1. **SSH into your GPU instance**:
   ```bash
   ssh -p <port> root@<host>
   ```

2. **Upload the agent script**:
   ```bash
   scp -P <port> gpu_test_agent.py root@<host>:/root/
   ```

3. **Make it executable**:
   ```bash
   chmod +x gpu_test_agent.py
   ```

## Usage

### Direct Python execution:
```bash
python3 gpu_test_agent.py \
    --gpu-instance-id <your-instance-id> \
    --api-url https://<your-project>.supabase.co/functions/v1/submit-test-results \
    --api-key <your-api-key> \
    --batch-size 32 \
    --num-epochs 1 \
    --image-size 224
```

### Using shell script:
```bash
chmod +x run_test.sh
./run_test.sh <gpu-instance-id> <api-url> <api-key> [batch-size] [num-epochs]
```

## Parameters

- `--gpu-instance-id`: The GPU instance ID from your database
- `--api-url`: Supabase Edge Function URL for submitting results
- `--api-key`: API key for authentication (get from your dashboard)
- `--batch-size`: Batch size for training (default: 32)
- `--num-epochs`: Number of epochs (default: 1)
- `--image-size`: Image size for ResNet50 (default: 224)
- `--device`: Device to use (cuda/cpu, default: cuda)

## What it does

1. **Installs dependencies** (PyTorch, torchvision, pynvml)
2. **Loads ResNet50 model** (pre-trained ImageNet weights)
3. **Runs benchmark** with dummy ImageNet-like data
4. **Collects metrics**:
   - Throughput (samples/sec, images/sec)
   - Latency (ms/batch)
   - GPU utilization
   - Memory usage
   - Power draw (if available)
   - Temperature (if available)
   - Loss and accuracy metrics
5. **Submits results** to your backend

## Output

The agent prints real-time progress and submits results to your Supabase backend, which:
- Stores test results in `gpu_test_results` table
- Updates `gpu_instances` status to "active" if test passes
- Updates `gpu_inventory` status to "active"

## Troubleshooting

- **CUDA not available**: Check if GPU is accessible with `nvidia-smi`
- **Permission errors**: Run with appropriate permissions
- **Network errors**: Ensure API URL and key are correct
- **Import errors**: Agent will auto-install PyTorch, but may need manual intervention


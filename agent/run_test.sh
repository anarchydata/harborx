#!/bin/bash
# Shell script to run the GPU test agent
# Usage: ./run_test.sh <gpu_instance_id> <api_url> <api_key> [batch_size] [num_epochs]

set -e

GPU_INSTANCE_ID=$1
API_URL=$2
API_KEY=$3
BATCH_SIZE=${4:-32}
NUM_EPOCHS=${5:-1}

if [ -z "$GPU_INSTANCE_ID" ] || [ -z "$API_URL" ] || [ -z "$API_KEY" ]; then
    echo "Usage: $0 <gpu_instance_id> <api_url> <api_key> [batch_size] [num_epochs]"
    exit 1
fi

echo "Starting GPU test agent..."
echo "GPU Instance ID: $GPU_INSTANCE_ID"
echo "API URL: $API_URL"

# Install Python if not available
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Run the agent
python3 gpu_test_agent.py \
    --gpu-instance-id "$GPU_INSTANCE_ID" \
    --api-url "$API_URL" \
    --api-key "$API_KEY" \
    --batch-size "$BATCH_SIZE" \
    --num-epochs "$NUM_EPOCHS"

exit $?


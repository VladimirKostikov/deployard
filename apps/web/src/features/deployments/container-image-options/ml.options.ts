import { ContainerImageOption } from './types';

export const mlImageOptions: ContainerImageOption[] = [
  { name: 'ComfyUI', image: 'yanwk/comfyui-boot:cu124-slim', category: 'ML / AI', icon: 'pytorch', defaultPort: 8188 },
  { name: 'Hugging Face TGI', image: 'ghcr.io/huggingface/text-generation-inference:2.3.1', category: 'ML / AI', icon: 'huggingface', defaultPort: 8080 },
  { name: 'JupyterLab', image: 'jupyter/scipy-notebook:2024-11-04', category: 'ML / AI', icon: 'jupyter', defaultPort: 8888 },
  { name: 'Langfuse', image: 'langfuse/langfuse:2.93.0', category: 'ML / AI', icon: 'langchain', defaultPort: 3000 },
  { name: 'LocalAI', image: 'localai/localai:v2.25.0-aio-cpu', category: 'ML / AI', icon: 'openai', defaultPort: 8080 },
  { name: 'Ollama', image: 'ollama/ollama:0.5.4', category: 'ML / AI', icon: 'ollama', defaultPort: 11434 },
  { name: 'Open WebUI', image: 'ghcr.io/open-webui/open-webui:v0.4.7', category: 'ML / AI', icon: 'openai', defaultPort: 8080 },
  { name: 'PyTorch', image: 'pytorch/pytorch:2.5.1-cpu', category: 'ML / AI', icon: 'pytorch', defaultPort: 8080 },
  { name: 'TensorFlow Serving', image: 'tensorflow/serving:2.17.0', category: 'ML / AI', icon: 'tensorflow', defaultPort: 8501 },
  { name: 'vLLM', image: 'vllm/vllm-openai:v0.6.4', category: 'ML / AI', icon: 'openai', defaultPort: 8000 },
  { name: 'Whisper ASR', image: 'onerahmet/openai-whisper-asr-webservice:latest', category: 'ML / AI', icon: 'openai', defaultPort: 9000 },
];

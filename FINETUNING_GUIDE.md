# 🧠 TaxShield LLM Fine-Tuning & Dataset Pipeline Guide

This guide provides end-to-end instructions for fine-tuning custom open-source Large Language Models (LLMs) on **1,200+ specialized Indian restaurant & delivery invoices** using **QLoRA (4-bit Quantized Low-Rank Adaptation)**.

---

## 📊 1. Dataset Generation (1,200+ Samples)

TaxShield includes a synthetic dataset generator that models the exact schema defined in `prompts.js` across five weighted real-world scenarios:
- **Clean Invoices (55%)**: Perfectly formatted Swiggy, Zomato, and dining receipts.
- **Tax Discrepancies (20%)**: Stated totals that differ from statutory math totals.
- **Missing Fields (10%)**: Invoices with missing/blurred subtotals or GSTIN.
- **Bad OCR / Noise (10%)**: Ambiguous text with low extraction confidence.
- **Illegal Service Charges (5%)**: Automatic voluntary fees violating CCPA guidelines.

### Generate or Regenerate Datasets:
```bash
# Generate 1,200 samples with train/val/test splits (80/10/10)
python scripts/generate_taxshield_dataset.py --count 1200
```
This creates:
- `dataset/train.jsonl` (960 samples)
- `dataset/validation.jsonl` (120 samples)
- `dataset/test.jsonl` (120 samples)

---

## ⚡ 2. Hardware Recommendations & Base Models

| GPU Hardware | VRAM | Recommended Base Model | Est. Training Time (1.2k samples) |
| :--- | :--- | :--- | :--- |
| **RTX 3060 / 4060 Laptop** | 6 - 8 GB | `unsloth/llama-3.2-3b-instruct-bnb-4bit` | ~15 - 25 mins |
| **RTX 3080 / 4070 / 4080** | 10 - 16 GB | `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` | ~20 - 35 mins |
| **Cloud T4 (Colab / Kaggle)** | 16 GB | `unsloth/mistral-7b-instruct-v0.3-bnb-4bit` | ~25 - 40 mins |
| **Cloud A100 / H100** | 40 - 80 GB | `unsloth/Qwen2.5-14B-Instruct-bnb-4bit` | ~8 - 15 mins |

---

## 🚀 3. Installation & Training

### Step 1: Install Dependencies
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install unsloth "transformers>=4.45.0" "peft>=0.12.0" "trl>=0.11.0" "bitsandbytes>=0.43.0"
```

### Step 2: Run QLoRA Training
```bash
# Fine-tune LLaMA 3.2 3B (Fast & High Accuracy on Invoices)
python scripts/finetune_qlora.py \
  --model unsloth/llama-3.2-3b-instruct-bnb-4bit \
  --train_file dataset/train.jsonl \
  --val_file dataset/validation.jsonl \
  --output_dir ./taxshield-lora-model \
  --epochs 3 \
  --batch_size 2
```

---

## 🦙 4. Serve Locally with Ollama

Once training finishes, export the merged model to GGUF and serve it via Ollama:

### Step 1: Export GGUF from Python
```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained("./taxshield-lora-model")
model.save_pretrained_gguf("taxshield-q4", tokenizer, quantization_method="q4_k_m")
```

### Step 2: Create `Modelfile`
```dockerfile
FROM ./taxshield-q4/taxshield-q4-unsloth.Q4_K_M.gguf

TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

{{ .Response }}<|eot_id|>"""

PARAMETER temperature 0.0
PARAMETER stop "<|eot_id|>"
```

### Step 3: Register & Run in Ollama
```bash
ollama create taxshield -f Modelfile
ollama run taxshield
```

### Step 4: Configure TaxShield `.env`
In your TaxShield `.env` file:
```ini
VITE_ACTIVE_LLM_PROVIDER=custom
VITE_CUSTOM_LLM_ENDPOINT=http://localhost:11434/v1
VITE_CUSTOM_LLM_MODEL=llama3:8b
```

---

## 🔬 5. Benchmark & Validation

Run the multi-model benchmark evaluation harness:
```bash
node scripts/runEval.js custom
```
This tests field-by-field extraction accuracy (Subtotal, CGST, SGST, Service Charge, Total) and deterministic verification against ground truth benchmarks.

"""
TaxShield QLoRA Fine-Tuning Pipeline — v2
==========================================
Fine-tunes a base LLM (e.g. LLaMA 3.2 3B, Qwen 2.5 7B, Mistral 7B) on the
TaxShield invoice extraction dataset (10,000+ samples) with 4-bit quantization.

Requirements:
    pip install torch transformers datasets peft bitsandbytes trl accelerate
    # Or for 2x faster training (recommended):
    pip install unsloth

Hardware Requirements:
    - 6 GB VRAM:  LLaMA-3.2-3B-Instruct or LLaMA-3.2-1B-Instruct (4-bit)
    - 8-12 GB VRAM: Qwen2.5-7B-Instruct or Mistral-7B-Instruct (4-bit)
    - 16+ GB VRAM: 14B models or higher batch sizes / sequence lengths

Usage:
    # Quick start (recommended — trains in 30–60 min on RTX 4070):
    python scripts/finetune_qlora.py \\
      --model unsloth/llama-3.2-3b-instruct-bnb-4bit \\
      --train_file dataset/train.jsonl \\
      --val_file dataset/validation.jsonl \\
      --epochs 3 --batch_size 2

    # High accuracy (RTX 3080+ or Colab A100):
    python scripts/finetune_qlora.py \\
      --model unsloth/Qwen2.5-7B-Instruct-bnb-4bit \\
      --epochs 3 --batch_size 4 --grad_accum 4
"""

import os
import argparse
import json
import todef main():
    parser = argparse.ArgumentParser(description="TaxShield QLoRA Fine-Tuning v2 (1B SOTA)")
    parser.add_argument("--model", type=str, default="unsloth/Llama-3.2-1B-Instruct-bnb-4bit",
                        help="Base HuggingFace model path or Unsloth repo (default: unsloth/Llama-3.2-1B-Instruct-bnb-4bit)")
    parser.add_argument("--train_file", type=str, default="dataset/train.jsonl",
                        help="Path to training jsonl")
    parser.add_argument("--val_file", type=str, default="dataset/validation.jsonl",
                        help="Path to validation jsonl")
    parser.add_argument("--output_dir", type=str, default="./taxshield-1b-lora",
                        help="Output directory for adapters")
    parser.add_argument("--epochs", type=int, default=3, help="Training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Per device batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_seq_length", type=int, default=2048, help="Max sequence token length")
    parser.add_argument("--save_steps", type=int, default=50, help="Save checkpoint every N steps")
    parser.add_argument("--export_gguf", action="store_true", help="Export merged model to GGUF after training (Unsloth only)")
    args = parser.parse_args()

    print("=" * 66)
    print("       TAXSHIELD AI — 1B PARAMETER QLoRA FINE-TUNING PIPELINE       ")
    print("=" * 66)
    print(f"CUDA Available : {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"Device Name    : {torch.cuda.get_device_name(0)}")
        print(f"VRAM Memory    : {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB")
    else:
        print("WARNING: CUDA not detected! Running on CPU will be slower.")
        print("Tip: You can also use free Google Colab / Kaggle GPU for 10-min training.")

    print(f"\nConfiguration:")
    print(f"  Target 1B Model  : {args.model}")
    print(f"  Train Dataset    : {args.train_file}")
    print(f"  Validation Set   : {args.val_file}")
    print(f"  Output Directory : {args.output_dir}")
    print(f"  Epochs           : {args.epochs}")
    print(f"  Batch Size       : {args.batch_size} (Grad Accum: {args.grad_accum})")
    print(f"  Max Seq Length   : {args.max_seq_length}")
    print(f"  Save Steps       : {args.save_steps}\n")

    # -----------------------------------------------------------------------
    # 1. Load model — try Unsloth (2x faster) then fall back to HuggingFace
    # -----------------------------------------------------------------------
    use_unsloth = False
    try:
        from unsloth import FastLanguageModel
        print(">>> Using Unsloth FastLanguageModel optimization...")
        use_unsloth = True
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name=args.model,
            max_seq_length=args.max_seq_length,
            load_in_4bit=True,
            dtype=None,
        )
        model = FastLanguageModel.get_peft_model(
            model,
            r=32,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                             "gate_proj", "up_proj", "down_proj"],
            lora_alpha=64,
            lora_dropout=0,
            bias="none",
            use_gradient_checkpointing="unsloth",
            random_state=3407,
        ),
            max_seq_length=args.max_seq_length,
        )
    except ImportError:
        print(">>> Unsloth not installed. Using standard HuggingFace PEFT / TRL...")
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )

        tokenizer = AutoTokenizer.from_pretrained(args.model, trust_remote_code=True)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        model = AutoModelForCausalLM.from_pretrained(
            args.model,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
        model = prepare_model_for_kbit_training(model)

        peft_config = LoraConfig(
            r=16,
            lora_alpha=32,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )
        model = get_peft_model(model, peft_config)

    # -----------------------------------------------------------------------
    # 2. Load and format dataset
    # -----------------------------------------------------------------------
    from datasets import load_dataset

    if not os.path.exists(args.train_file):
        raise FileNotFoundError(
            f"Training dataset not found: {args.train_file}\n"
            f"Run the dataset generator first:\n"
            f"  python dataset/generate_taxshield_dataset.py --count 10000"
        )

    data_files = {"train": args.train_file}
    has_validation = os.path.exists(args.val_file)
    if has_validation:
        data_files["validation"] = args.val_file

    raw_dataset = load_dataset("json", data_files=data_files)

    # Strip non-standard metadata fields before feeding to tokenizer
    def strip_metadata(example):
        example.pop("_verification_reference", None)
        example.pop("_scenario", None)
        return example

    raw_dataset = raw_dataset.map(strip_metadata)

    def formatting_prompts_func(examples):
        convos = examples["messages"]
        texts = []
        for convo in convos:
            formatted_text = tokenizer.apply_chat_template(
                convo,
                tokenize=False,
                add_generation_prompt=False
            )
            texts.append(formatted_text)
        return {"text": texts}

    formatted_dataset = raw_dataset.map(formatting_prompts_func, batched=True)

    train_size = len(formatted_dataset["train"])
    print(f"\n>>> Loaded {train_size:,} training examples")
    if has_validation:
        print(f">>> Loaded {len(formatted_dataset['validation']):,} validation examples")

    # -----------------------------------------------------------------------
    # 3. Setup SFT Trainer
    # -----------------------------------------------------------------------
    from trl import SFTTrainer
    from transformers import TrainingArguments

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        warmup_steps=20,
        max_steps=-1,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=3407,
        # Save more frequently so we don't lose progress on long runs
        save_strategy="steps",
        save_steps=args.save_steps,
        save_total_limit=3,
        # Evaluation & best-model tracking
        eval_strategy="steps" if has_validation else "no",
        eval_steps=args.save_steps if has_validation else None,
        load_best_model_at_end=has_validation,
        metric_for_best_model="eval_loss" if has_validation else None,
        report_to="none",
    )

    sft_kwargs = dict(
        model=model,
        tokenizer=tokenizer,
        train_dataset=formatted_dataset["train"],
        eval_dataset=formatted_dataset.get("validation", None),
        dataset_text_field="text",
        max_seq_length=args.max_seq_length,
        dataset_num_proc=2,
        packing=False,
        args=training_args,
    )

    # NEFTune noise improves instruction-following generalization by ~5–10%
    # on structured extraction tasks — enabled by default
    if use_unsloth:
        sft_kwargs["neftune_noise_alpha"] = 5

    trainer = SFTTrainer(**sft_kwargs)

    # -----------------------------------------------------------------------
    # 4. Train
    # -----------------------------------------------------------------------
    print("\n>>> Starting Fine-Tuning...")
    trainer_stats = trainer.train()

    print(f"\n>>> Training complete!")
    print(f"    Total steps   : {trainer_stats.global_step:,}")
    print(f"    Training loss : {trainer_stats.training_loss:.4f}")

    # -----------------------------------------------------------------------
    # 5. Save LoRA adapter
    # -----------------------------------------------------------------------
    print(f"\n>>> Saving LoRA adapter weights to: {args.output_dir}")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    # -----------------------------------------------------------------------
    # 6. Optional: Export merged GGUF for Ollama (Unsloth only)
    # -----------------------------------------------------------------------
    if args.export_gguf and use_unsloth:
        gguf_dir = args.output_dir.rstrip("/") + "-gguf"
        print(f"\n>>> Exporting merged GGUF model to: {gguf_dir}")
        model.save_pretrained_gguf(gguf_dir, tokenizer, quantization_method="q4_k_m")
        print(f">>> GGUF export complete!")
        print(f"\nCreate Modelfile for Ollama:")
        print(f"  FROM ./{gguf_dir}/taxshield-lora-model-gguf-unsloth.Q4_K_M.gguf")
        print(f"  PARAMETER temperature 0.0")
        print(f"  PARAMETER stop \"<|eot_id|>\"")

    print("\n" + "=" * 66)
    print("                 TRAINING COMPLETED SUCCESSFULLY!               ")
    print("=" * 66)
    print("\nNext Steps to serve with Ollama locally for TaxShield:")
    print("1. If you used --export_gguf, the GGUF file is ready.")
    print("   Otherwise, export manually:")
    print(f"   model.save_pretrained_gguf('{args.output_dir}-gguf', tokenizer, quantization_method='q4_k_m')")
    print("2. Create and register the Ollama model:")
    print("   ollama create taxshield -f Modelfile")
    print("   ollama run taxshield")
    print("3. Configure TaxShield .env:")
    print("   VITE_ACTIVE_LLM_PROVIDER=custom")
    print("   VITE_CUSTOM_LLM_ENDPOINT=http://localhost:11434/v1")
    print("   VITE_CUSTOM_LLM_MODEL=taxshield")
    print("4. Benchmark against cloud providers:")
    print("   node scripts/runEval.js custom")


if __name__ == "__main__":
    main()

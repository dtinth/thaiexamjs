# thaiexamjs

An experiment and visualization project that evaluates AI language models on Thai standardized exams using the [ThaiExam dataset published by SCB 10X](https://www.scb.co.th/en/about-us/news/oct-2024/scb10x-standford.html) to [HELM](https://crfm.stanford.edu/helm/thaiexam/latest/).

[**See the results here.**](https://dtinth.github.io/thaiexamjs/)

## Sponsors

This project is funded by our generous sponsors who contribute funds and API keys:

- [Jetbodin Prakoonsuksapan](https://github.com/Jetbodin)
- [Sakol Assawasagool](https://github.com/koobitor)
- [Khachain Wangthammang](https://github.com/icez)
- [Kasidis Satangmongkol](https://github.com/toyeiei)
- [Tossapol Pomsuwan](https://github.com/mastervii)
- [R'ket](https://r-ket.app/) via [Veha Suwatphisankij](https://github.com/vehas) and [Natechawin Suthison](https://github.com/nsuthison)
- [Chrisada Sookdhis](https://github.com/chrisadas)

## Key Differences from HELM

This project differs from HELM's evaluation approach in several important ways:

1. **Zero-shot testing**: Unlike HELM's leaderboard which uses short prompts that include multiple exam questions, this project evaluates models on a zero-shot basis - models see only one question at a time and must produce an answer.

2. **Structured responses**: Models are required to output answers in JSON format, making parsing and evaluation more straightforward.

3. **Reasoning transparency**: The benchmark allows models to explain their reasoning process before responding, capturing their thought process. The dashboard lets you explore these explanations to better understand how different models approach the same questions.

## Installation

This project uses [Bun](https://bun.sh/). To install dependencies:

```bash
bun install
```

## Configuration

Prepare `.env` file with API keys based on the models you want to test. You only need to provide keys for the specific models you intend to run:

```sh
# For Claude models
ANTHROPIC_API_KEY=

# For Google Gemini models
GOOGLE_GENERATIVE_AI_API_KEY=

# For OpenAI models (GPT-4o, GPT-4.1, etc.)
OPENAI_API_KEY=

# For Grok models
XAI_API_KEY=

# For Typhoon models
OPENTYPHOON_API_KEY=

# For models hosted on Together.ai
TOGETHER_API_KEY=

# For models accessible via OpenRouter
OPENROUTER_API_KEY=
```

You can also set these optional environment variables:

- `QUESTION_FILTER`: Filter questions by pattern
- `MODEL_FILTER`: Filter models by pattern
- `WORKER_COUNT`: Number of parallel workers (default: 1)

## Usage

```bash
# Make the models take exams
bun work

# Run with specific question filter (e.g., only O-NET exams)
QUESTION_FILTER=onet bun work

# Run with specific model filter
MODEL_FILTER=claude bun work

# Run with multiple workers for parallel processing
WORKER_COUNT=4 bun work  # Start 4 workers to process the task queue in parallel

# Start interactive web report (on port 2518)
bun dev

# Export logs from local database to JSONL (`snapshot.jsonl.br`)
bun export

# Import logs from from `snapshot.jsonl.br` into local database
bun import
```

## Data Storage

During execution of `worker.ts`, all raw model outputs are stored in a local SQLite database at `.data/state.db`. Key points about the data storage:

- Responses are stored as unprocessed outputs from the LLM without any evaluation
- Entries are keyed by model-preset-id and question ID to prevent unnecessary duplicate work
- The database serves as a cache, so if you run the same model on the same questions, it will skip already-completed items
- You can export/import the logs in the local DB to/from `snapshot.jsonl.br` using `bun export` and `bun import` scripts — this is useful for transporting logs from one machine to another
- The repository contains the developer’s snapshot of `snapshot.jsonl.br` that you can import to get started (or you can skip to start with a blank slate)

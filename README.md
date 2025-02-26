# thaiexamjs

An experiment and visualization project that evaluates AI language models on Thai standardized exams using the ThaiExam dataset published by SCB 10X (https://www.scb.co.th/en/about-us/news/oct-2024/scb10x-standford.html) to HELM (https://crfm.stanford.edu/helm/thaiexam/latest/). 

This project differs from HELM's evaluation approach in several important ways:

1. **Zero-shot testing**: Unlike HELM's leaderboard which uses short prompts that include multiple exam questions, this project evaluates models on a zero-shot basis - models see only one question at a time and must produce an answer.

2. **Structured responses**: Models are required to output answers in JSON format, making parsing and evaluation more straightforward.

3. **Reasoning transparency**: The benchmark allows models to explain their reasoning process before responding, capturing their thought process. The dashboard lets you explore these explanations to better understand how different models approach the same questions.

Note: At this stage, we are using O-NET tests only (to save costs), although the ThaiExam dataset contains other kinds of standardized tests as well. See the [dataset's model card](https://huggingface.co/datasets/scb10x/thai_exam) for more details.

To install dependencies:

```bash
bun install
```

Prepare `.env` file:

```sh
ANTHROPIC_API_KEY=
AZURE_API_KEY=
AZURE_API_ENDPOINT=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=
```

To run:

```bash
# Make the model take exams
bun run index.ts <model-name>

# Run with sharding (process different subsets of exams)
SHARD=1/3 bun run index.ts <model-name>  # Process first third of exams
SHARD=2/3 bun run index.ts <model-name>  # Process second third of exams
SHARD=3/3 bun run index.ts <model-name>  # Process final third of exams

# Generate summarized file (`docs/onet.json`)
bun run summarize.ts

# Generate HTML report file (`docs/onet.html`)
bun run generateOnetReport.ts
```

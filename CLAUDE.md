# ThaiExamJS Development Guide

## Commands

- Run with model: `bun run index.ts <model-preset-id>`
- Run specific test: `bun run test.ts` (modify preset/question in file)
- Generate summary: `bun run summarize.ts`
- Generate HTML report: `bun run generateOnetReport.ts`

## Environment

- Required .env vars: ANTHROPIC_API_KEY, AZURE_API_KEY, AZURE_API_ENDPOINT, GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY
- Optional: SHARD

## Coding Style

- TypeScript with strict typing; use interfaces for structured data
- Use functional programming patterns where possible
- Import order: node modules, then external packages, then local modules
- Error handling: use try/catch with specific error messages
- Naming: camelCase for variables/functions, PascalCase for types/interfaces
- Use async/await for asynchronous operations
- Explicit type annotations for function parameters and returns

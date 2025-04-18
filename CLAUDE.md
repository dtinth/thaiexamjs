# ThaiExamJS Development Guide

## Commands

- Run worker to process exams: `bun work`
- Run specific questions: `QUESTION_FILTER=onet bun work` (filter by question ID)
- Run specific models: `MODEL_FILTER=claude bun work` (filter by model preset ID)
- Run specific test: `bun run scripts/test.ts` (modify preset/question in file)
- Start web server for report viewing: `bun dev`
- Export logs: `bun export`
- Import logs: `bun import`
- Generate static HTML reports: `bun html`

## Important Notes

- The `docs/` directory contains generated HTML files. Don't read or modify these directly; instead, update the generation scripts.

## Environment

- API Keys (add the ones you need for the models you want to test):
  - ANTHROPIC_API_KEY - For Claude models
  - GOOGLE_GENERATIVE_AI_API_KEY - For Gemini models
  - OPENAI_API_KEY - For OpenAI models (GPT-4o, GPT-4.1, etc.)
  - XAI_API_KEY - For Grok models
  - OPENTYPHOON_API_KEY - For Typhoon models
  - TOGETHER_API_KEY - For models hosted on Together.ai
  - OPENROUTER_API_KEY - For models accessible via OpenRouter
- Optional environment variables:
  - QUESTION_FILTER - Filter questions by pattern
  - MODEL_FILTER - Filter models by pattern
  - WORKER_COUNT - Number of parallel workers (default: 1)

## Coding Style

- TypeScript with strict typing; use interfaces for structured data
- Use functional programming patterns where possible
- Import order: node modules, then external packages, then local modules
- Error handling: use try/catch with specific error messages
- Naming: camelCase for variables/functions, PascalCase for types/interfaces
- Use async/await for asynchronous operations
- Explicit type annotations for function parameters and returns

## Architecture Patterns

- **Singleton Pattern**: Implemented with module-scoped instances for global access
- **Lazy Initialization**: Using nullish coalescing with assignment (`??=`) for just-in-time resource creation
- **Factory Pattern**: Static creation methods and factory functions to handle object construction
- **getOrCreate Pattern**: Using `@thai/get-or-create` utility for memoized object creation
- **Map-based Storage**: Using Maps for efficient key-value data management
- **Class-based Design**: Encapsulating functionality in classes with clear interfaces
- **HTML Generation**: Using `@thai/html` template literal tags for type-safe HTML generation

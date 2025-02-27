# ThaiExamJS Development Guide

## Commands

- Run with model: `bun run run-model <model-preset-id>`
- Run specific exam type: `EXAM_FILTER=onet bun run run-model <model-preset-id>`
- Run specific test: `bun run scripts/test.ts` (modify preset/question in file)
- Display report on console: `bun run report`
- Export logs: `bun run export`
- Import logs: `bun run import`
- Generate HTML reports: `bun html`

## Important Notes

- The `docs/` directory contains generated HTML files. Don't read or modify these directly; instead, update the generation scripts.

## Environment

- Required .env vars: ANTHROPIC_API_KEY, AZURE_API_KEY, AZURE_API_ENDPOINT, GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY
- Optional: SHARD, EXAM_FILTER

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

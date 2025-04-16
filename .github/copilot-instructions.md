# Copilot Instructions

## Working with Issues

- When working on an issue, write the implementation plan on the issue and keep it up-to-date.
- When updating the implementation plan, do the following:
  1. Update the issue description to reflect the latest plan. Make sure to read the latest issue description to ensure you have the latest information. Do not include outdated information in the plan.
  2. Write a comment briefly summarizing the plan update. Say something like "From GitHub Copilot: Previously, [old assumption]. However, [realization]. Therefore [concise summary of updates to the plan]. [commit-sha if applicable]".

## Code Style and Conventions

- Always match the project's code style and export conventions (e.g., use export const for named exports).
- Follow the correct import style for each package (default vs named import), especially for ESM modules.
- When the user references an existing file for a pattern, follow it closely unless requirements differ.
- Confirm package installation status before reporting missing packages.
- When using unstorage with a custom backend, follow the official documentation for driver composition.
- When the user points out an error, ask for details if not provided, but also proactively check for common mistakes in recent changes.

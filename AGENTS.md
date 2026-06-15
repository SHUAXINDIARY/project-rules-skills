# AGENTS.md

This repository contains reusable Cursor/Codex skills for initializing project rules.

## Commands

- `pnpm run dry-run:react` - Print the React Cursor and Codex rules templates.
- `pnpm run dry-run:vue` - Print the Vue Cursor and Codex rules templates.
- `pnpm run validate` - Run both dry-run generators.

## Notes

- The project has no runtime dependencies.
- Keep skills under `.agents/skills/<skill-name>/`.
- Do not put generated target-project rules in this repository unless they are intentional examples.

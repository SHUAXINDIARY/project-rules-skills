# Project Rules Skills

[中文](README.md)

[![skills.sh](https://skills.sh/b/SHUAXINDIARY/project-rules-skills)](https://www.skills.sh/s/SHUAXINDIARY/project-rules-skills)

Reusable Cursor/Codex skills for initializing generic Cursor project rules in JavaScript/TypeScript frontend projects.

## Repository Overview

This repository stores agent skills and helper scripts that generate consistent `.cursor/rules/project-base-rules.mdc` files for target projects. The generated rules focus on practical engineering guardrails: workspace protection, command usage, dependency discipline, TypeScript conventions, framework-specific frontend patterns, security, accessibility, validation, and delivery notes.

## Capabilities

- Provides the `init-project-rules` skill for initializing Cursor rules in React or Vue projects.
- Generates a reusable `.cursor/rules/project-base-rules.mdc` with `alwaysApply: true`.
- Infers the package manager from lockfiles when possible.
- Infers common build tools from `package.json`, including Rsbuild, Vite, Next.js, Nuxt, and Webpack.
- Supports dry-run output for review before writing files.
- Refuses to overwrite existing target rules unless `--force` is explicitly provided.

## Included Skill

| Skill | Purpose |
| --- | --- |
| `init-project-rules` | Generates `.cursor/rules/project-base-rules.mdc` for React or Vue frontend projects. |

## Requirements

- Node.js is required to run the generator script.
- `pnpm` is used for the repository convenience scripts.
- The project has no runtime dependencies.

## Usage

### Install from skills.sh

This repository is published on [skills.sh](https://www.skills.sh/s/SHUAXINDIARY/project-rules-skills) and can be installed directly with the `skills` CLI:

```bash
npx skills add SHUAXINDIARY/project-rules-skills
```

After installation, use the `init-project-rules` skill in any AI agent that supports skills.

### Use as an Agent Skill

In a Codex/Cursor-compatible agent environment that loads `.agents/skills`, ask the agent to use the skill:

```text
Use $init-project-rules to initialize Cursor project rules for a React app.
Use $init-project-rules to initialize Cursor project rules for a Vue app.
```

The skill instructs the agent to inspect the target project first, choose the correct stack, generate the rules, and avoid overwriting unrelated user changes.

### Use Repository Scripts

From this repository:

```bash
pnpm run init:react -- --project-root /absolute/path/to/react-project
pnpm run init:vue -- --project-root /absolute/path/to/vue-project
```

Preview the generated rules without writing files:

```bash
pnpm run dry-run:react
pnpm run dry-run:vue
```

Run both dry-run generators as a lightweight validation:

```bash
pnpm run validate
```

### Run the Script Directly

```bash
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack react
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack vue
```

Available options:

```text
--project-root <path>                 Target project root. Defaults to current working directory.
--stack react|vue                     Required framework entry.
--package-manager pnpm|npm|yarn|bun   Optional package-manager override.
--force                               Overwrite existing project-base-rules.mdc intentionally.
--dry-run                             Print generated rules instead of writing.
--help                                Show command help.
```

## Output

By default, the generator writes:

```text
<target-project>/.cursor/rules/project-base-rules.mdc
```

If that file already exists, the generator stops and asks you to review or merge manually. Use `--force` only when replacing the existing file is intentional.

## Repository Layout

```text
.
├── .agents/skills/init-project-rules/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── scripts/init_project_rules.mjs
├── AGENTS.md
├── README.md
├── README.en.md
└── package.json
```

## Maintenance Notes

- Keep skills under `.agents/skills/<skill-name>/`.
- Keep generated target-project rules out of this repository unless they are intentional examples.
- When updating the template, run `pnpm run validate` before delivery.
- Keep the generated rules generic; avoid hard-coding source-project paths, business routes, product copy, private data files, or local-only conventions.

# Project Rules Skills / 项目规则技能集

Reusable Cursor/Codex skills for initializing generic project rules in JavaScript/TypeScript frontend projects.

用于为 JavaScript/TypeScript 前端项目初始化通用 Cursor 项目规则的可复用 Cursor/Codex 技能集。

## Repository Overview / 仓库说明

This repository stores agent skills and helper scripts that generate consistent `.cursor/rules/project-base-rules.mdc` files for target projects. The generated rules focus on practical engineering guardrails: workspace protection, command usage, dependency discipline, TypeScript conventions, framework-specific frontend patterns, security, accessibility, validation, and delivery notes.

本仓库用于存放 agent 技能与配套脚本，帮助目标项目生成一致的 `.cursor/rules/project-base-rules.mdc`。生成的规则聚焦实用工程约束，包括工作区保护、命令使用、依赖管理、TypeScript 规范、框架相关前端约定、安全、可访问性、质量验证与交付说明。

## Capabilities / 能力说明

- Provides the `init-project-rules` skill for initializing Cursor rules in React or Vue projects.
- Generates a reusable `.cursor/rules/project-base-rules.mdc` with `alwaysApply: true`.
- Infers the package manager from lockfiles when possible.
- Infers common build tools from `package.json`, including Rsbuild, Vite, Next.js, Nuxt, and Webpack.
- Supports dry-run output for review before writing files.
- Refuses to overwrite existing target rules unless `--force` is explicitly provided.

- 提供 `init-project-rules` 技能，用于为 React 或 Vue 项目初始化 Cursor 规则。
- 生成带有 `alwaysApply: true` 的可复用 `.cursor/rules/project-base-rules.mdc`。
- 在可能时根据锁文件推断目标项目的包管理器。
- 根据 `package.json` 推断常见构建工具，包括 Rsbuild、Vite、Next.js、Nuxt 和 Webpack。
- 支持 dry-run 输出，便于写入前审阅内容。
- 默认拒绝覆盖目标项目已有规则文件，除非显式传入 `--force`。

## Included Skill / 内置技能

| Skill / 技能 | Purpose / 用途 |
| --- | --- |
| `init-project-rules` | Generates `.cursor/rules/project-base-rules.mdc` for React or Vue frontend projects. / 为 React 或 Vue 前端项目生成 `.cursor/rules/project-base-rules.mdc`。 |

## Requirements / 环境要求

- Node.js is required to run the generator script.
- `pnpm` is used for the repository convenience scripts.
- The project has no runtime dependencies.

- 运行生成脚本需要 Node.js。
- 本仓库的便捷命令使用 `pnpm`。
- 本项目没有运行时依赖。

## Usage / 如何使用

### Use as an Agent Skill / 作为 Agent 技能使用

In a Codex/Cursor-compatible agent environment that loads `.agents/skills`, ask the agent to use the skill:

在会加载 `.agents/skills` 的 Codex/Cursor 兼容 agent 环境中，可以直接让 agent 使用该技能：

```text
Use $init-project-rules to initialize Cursor project rules for a React app.
Use $init-project-rules to initialize Cursor project rules for a Vue app.
```

The skill instructs the agent to inspect the target project first, choose the correct stack, generate the rules, and avoid overwriting unrelated user changes.

该技能会要求 agent 先检查目标项目，再选择正确技术栈并生成规则，同时避免覆盖用户已有的无关改动。

### Use Repository Scripts / 使用仓库脚本

From this repository:

在本仓库中运行：

```bash
pnpm run init:react -- --project-root /absolute/path/to/react-project
pnpm run init:vue -- --project-root /absolute/path/to/vue-project
```

Preview the generated rules without writing files:

只预览生成内容，不写入文件：

```bash
pnpm run dry-run:react
pnpm run dry-run:vue
```

Run both dry-run generators as a lightweight validation:

同时运行两个 dry-run 生成器作为轻量验证：

```bash
pnpm run validate
```

### Run the Script Directly / 直接运行脚本

```bash
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack react
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack vue
```

Available options:

可用参数：

```text
--project-root <path>                 Target project root. Defaults to current working directory.
--stack react|vue                     Required framework entry.
--package-manager pnpm|npm|yarn|bun   Optional package-manager override.
--force                               Overwrite existing project-base-rules.mdc intentionally.
--dry-run                             Print generated rules instead of writing.
--help                                Show command help.
```

## Output / 输出结果

By default, the generator writes:

默认情况下，生成器会写入：

```text
<target-project>/.cursor/rules/project-base-rules.mdc
```

If that file already exists, the generator stops and asks you to review or merge manually. Use `--force` only when replacing the existing file is intentional.

如果该文件已经存在，生成器会停止并提示先人工审阅或合并。只有在明确需要替换现有文件时才使用 `--force`。

## Repository Layout / 仓库结构

```text
.
├── .agents/skills/init-project-rules/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── scripts/init_project_rules.mjs
├── AGENTS.md
├── README.md
└── package.json
```

## Maintenance Notes / 维护说明

- Keep skills under `.agents/skills/<skill-name>/`.
- Keep generated target-project rules out of this repository unless they are intentional examples.
- When updating the template, run `pnpm run validate` before delivery.
- Keep the generated rules generic; avoid hard-coding source-project paths, business routes, product copy, private data files, or local-only conventions.

- 技能应放在 `.agents/skills/<skill-name>/` 下。
- 不要把目标项目生成的规则文件提交到本仓库，除非它们是刻意维护的示例。
- 更新模板后，交付前运行 `pnpm run validate`。
- 生成规则应保持通用，不要硬编码来源项目路径、业务路由、产品文案、私有数据文件或仅本地适用的约定。

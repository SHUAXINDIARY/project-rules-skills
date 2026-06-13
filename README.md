# 项目规则技能集

[English](README.en.md)

[![skills.sh](https://skills.sh/b/SHUAXINDIARY/project-rules-skills)](https://www.skills.sh/s/SHUAXINDIARY/project-rules-skills)

用于为 JavaScript/TypeScript 前端项目初始化通用 Cursor 项目规则的可复用 Cursor/Codex 技能集。

## 仓库说明

本仓库用于存放 agent 技能与配套脚本，帮助目标项目生成一致的 `.cursor/rules/project-base-rules.mdc`。生成的规则聚焦实用工程约束，包括工作区保护、命令使用、依赖管理、TypeScript 规范、框架相关前端约定、安全、可访问性、质量验证与交付说明。

## 能力说明

- 提供 `init-project-rules` 技能，用于为 React 或 Vue 项目初始化 Cursor 规则。
- 生成带有 `alwaysApply: true` 的可复用 `.cursor/rules/project-base-rules.mdc`。
- 在可能时根据锁文件推断目标项目的包管理器。
- 根据 `package.json` 推断常见构建工具，包括 Rsbuild、Vite、Next.js、Nuxt 和 Webpack。
- 支持 dry-run 输出，便于写入前审阅内容。
- 默认拒绝覆盖目标项目已有规则文件，除非显式传入 `--force`。

## 内置技能

| 技能 | 用途 |
| --- | --- |
| `init-project-rules` | 为 React 或 Vue 前端项目生成 `.cursor/rules/project-base-rules.mdc`。 |

## 环境要求

- 运行生成脚本需要 Node.js。
- 本仓库的便捷命令使用 `pnpm`。
- 本项目没有运行时依赖。

## 如何使用

### 通过 skills.sh 直接安装

本仓库技能已发布到 [skills.sh](https://www.skills.sh/s/SHUAXINDIARY/project-rules-skills)，支持通过 `skills` CLI 直接安装：

```bash
npx skills add SHUAXINDIARY/project-rules-skills
```

安装后，可在支持 skills 的 AI agent 中调用 `init-project-rules` 技能。

### 作为 Agent 技能使用

在会加载 `.agents/skills` 的 Codex/Cursor 兼容 agent 环境中，可以直接让 agent 使用该技能：

```text
Use $init-project-rules to initialize Cursor project rules for a React app.
Use $init-project-rules to initialize Cursor project rules for a Vue app.
```

该技能会要求 agent 先检查目标项目，再选择正确技术栈并生成规则，同时避免覆盖用户已有的无关改动。

### 使用仓库脚本

在本仓库中运行：

```bash
pnpm run init:react -- --project-root /absolute/path/to/react-project
pnpm run init:vue -- --project-root /absolute/path/to/vue-project
```

只预览生成内容，不写入文件：

```bash
pnpm run dry-run:react
pnpm run dry-run:vue
```

同时运行两个 dry-run 生成器作为轻量验证：

```bash
pnpm run validate
```

### 直接运行脚本

```bash
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack react
node .agents/skills/init-project-rules/scripts/init_project_rules.mjs --project-root /absolute/project/path --stack vue
```

可用参数：

```text
--project-root <path>                 目标项目根目录，默认使用当前工作目录。
--stack react|vue                     必填，目标框架入口。
--package-manager pnpm|npm|yarn|bun   可选，手动指定包管理器。
--force                               明确覆盖已有 project-base-rules.mdc。
--dry-run                             只打印生成内容，不写入文件。
--help                                显示命令帮助。
```

## 输出结果

默认情况下，生成器会写入：

```text
<target-project>/.cursor/rules/project-base-rules.mdc
```

如果该文件已经存在，生成器会停止并提示先人工审阅或合并。只有在明确需要替换现有文件时才使用 `--force`。

## 仓库结构

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

## 维护说明

- 技能应放在 `.agents/skills/<skill-name>/` 下。
- 不要把目标项目生成的规则文件提交到本仓库，除非它们是刻意维护的示例。
- 更新模板后，交付前运行 `pnpm run validate`。
- 生成规则应保持通用，不要硬编码来源项目路径、业务路由、产品文案、私有数据文件或仅本地适用的约定。

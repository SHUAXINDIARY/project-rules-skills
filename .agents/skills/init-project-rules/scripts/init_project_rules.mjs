#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const STACKS = new Set(["react", "vue"]);
const PACKAGE_MANAGERS = new Set(["pnpm", "npm", "yarn", "bun"]);

const HELP_TEXT = `Usage:
  node init_project_rules.mjs --project-root <path> --stack react|vue [--package-manager pnpm|npm|yarn|bun] [--force] [--dry-run]

Options:
  --project-root       Target project root. Defaults to current working directory.
  --stack              Required. Framework entry: react or vue.
  --package-manager    Optional override. Inferred from lockfiles when omitted.
  --force              Overwrite an existing .cursor/rules/project-base-rules.mdc.
  --dry-run            Print generated content instead of writing.
  --help               Show this help.
`;

function parseArgs(argv) {
  const options = {
    projectRoot: process.cwd(),
    stack: undefined,
    packageManager: undefined,
    force: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help" || arg === "-h") {
      return { ...options, help: true };
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--project-root") {
      assertValue(arg, next);
      options.projectRoot = next;
      index += 1;
      continue;
    }

    if (arg === "--stack") {
      assertValue(arg, next);
      options.stack = next.toLowerCase();
      index += 1;
      continue;
    }

    if (arg === "--package-manager") {
      assertValue(arg, next);
      options.packageManager = next.toLowerCase();
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function assertValue(name, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value.`);
  }
}

function inferPackageManager(projectRoot) {
  const lockfileToManager = [
    ["pnpm-lock.yaml", "pnpm"],
    ["package-lock.json", "npm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
  ];

  const match = lockfileToManager.find(([lockfile]) =>
    existsSync(path.join(projectRoot, lockfile)),
  );

  return match?.[1] ?? "项目已有包管理器";
}

function inferBuildTool(projectRoot) {
  const packageJsonPath = path.join(projectRoot, "package.json");

  if (!existsSync(packageJsonPath)) {
    return "以现有构建配置与项目文档为准";
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies["@rsbuild/core"]) {
      return "Rsbuild";
    }
    if (
      dependencies.vite ||
      dependencies["@vitejs/plugin-react"] ||
      dependencies["@vitejs/plugin-vue"]
    ) {
      return "Vite";
    }
    if (dependencies.next) {
      return "Next.js";
    }
    if (dependencies.nuxt) {
      return "Nuxt";
    }
    if (dependencies.webpack) {
      return "Webpack";
    }
  } catch {
    return "以现有构建配置与项目文档为准";
  }

  return "以现有构建配置与项目文档为准";
}

function renderRules({ stack, packageManager, buildTool }) {
  const stackTitle = stack === "react" ? "React" : "Vue";
  const stackSection = stack === "react" ? renderReactRules() : renderVueRules();

  return `---
description: 项目通用开发规范，覆盖工作区保护、TypeScript、${stackTitle}、异步、前端体验与质量验证
alwaysApply: true
---

# 项目基础规则

## 使用范围

- 本规则适用于当前仓库的日常开发、维护、审查和交付。
- 修改前应先阅读与任务相关的现有文件；若存在 \`AGENTS.md\`、\`README.md\`、\`PRODUCT.md\`、\`DESIGN.md\`、现有 Cursor rules 或相关 skill，应一并参考。
- 优先遵循仓库已有目录结构、命名方式、组件模式、工具链配置和文档约定。
- 不要把其他项目的具体目录、业务数据、路由、文案或本地约束复制到当前项目。

## Agent 执行流程

- 开始修改前应检查当前工作区状态，识别用户已有改动；不得覆盖、回滚、删除或格式化无关文件。
- 每次任务优先做最小必要修改，避免顺手重构、重命名、迁移目录结构或引入无关抽象。
- 涉及多文件、架构、依赖、数据结构、构建配置或公共组件变更时，应先明确修改范围和执行方案。
- 发现需求不明确时，优先基于项目上下文做合理判断；若判断会影响产品方向、数据结构或破坏兼容性，应先向用户确认。
- 修改完成后应总结实际变更、验证结果、未验证项和潜在风险。

## 技术栈与命令

- 本项目按 ${stackTitle} 前端项目初始化规则；真实技术栈以 \`package.json\`、锁文件、配置文件和源码为准。
- 包管理器：${packageManager}。不要混用其他包管理器生成锁文件。
- 构建工具：${buildTool}。修改构建、打包、资源处理或性能相关内容前，应先阅读项目现有配置和官方文档。
- 不确定可用命令时，优先查看 \`package.json\` scripts、\`AGENTS.md\`、README 和项目已有文档。
- 新增依赖前必须确认项目现有依赖、浏览器 API 或轻量工具函数是否已满足需求。
- 不得为简单功能引入大型依赖；新增依赖必须说明用途、使用位置和必要性。
- 修改依赖后必须同步更新 \`package.json\` 与对应锁文件。
- 不要提交本地环境文件、缓存目录、构建产物、临时脚本、调试日志或编辑器自动生成文件。

## 工作区与文件边界

- 所有读写、生成和命令执行默认以当前项目根目录为边界。
- 新增源码、配置、文档、资源或脚本时，优先放入已有约定目录；没有明确目录时，先根据现有目录职责判断最小合适位置。
- 不要生成临时文件、调试产物、备份文件或一次性脚本并遗留在仓库中，除非它们是交付内容的一部分。
- 不要为了完成局部任务重写整个页面、组件、模块或样式系统。
- 不要在没有明确需求时修改公共 API、路由结构、数据结构或组件对外行为。
- 不要引入与项目技术栈不一致的框架、状态库、UI 库或构建工具。
- 不要进行无关格式化；若格式化工具自动修改大量文件，应确认这些变更与任务直接相关。
- 对公共组件、工具函数或类型定义的修改，应检查所有调用方是否仍然兼容。
- 删除代码前应确认没有引用、没有文档约定、没有数据依赖，并优先使用搜索工具验证。

## 安全与隐私

- 不得硬编码 token、密钥、Cookie、Authorization header、个人隐私数据或生产环境敏感地址。
- \`.env\`、\`.env.local\`、\`.env.*.local\` 等本地环境文件不得提交。
- 如需新增环境变量，应同步维护示例说明，例如 \`.env.example\` 或 README 中的环境变量说明。
- 日志中不得输出敏感信息；错误提示应保留必要调试上下文，但避免泄露用户数据、接口密钥或内部实现细节。
- 接入外部链接、图片、脚本、字体、CDN 或第三方资源前，应确认来源可信、用途必要，并优先使用项目内已有资源方案。
- 面向用户展示的外部数据应做容错处理，避免因字段缺失、格式变化或请求失败导致页面崩溃。

## TypeScript 规范

- TypeScript 类型应完整声明，避免使用 \`any\` 逃避建模；确需使用时必须说明边界原因并尽快收窄。
- 函数参数、返回值、组件 props、事件处理器和异步结果应有明确类型。
- 优先使用 \`interface\` 或具名 \`type\` 表达业务语义，避免在复杂位置堆叠匿名类型。
- 类型收窄应通过明确的判断函数、枚举、联合类型或标准库 API 完成，避免不必要的强制断言。
- 导出的 \`interface\`、具名 \`type\`、\`enum\`、公共函数、公共组件和公共 class 应添加简洁说明。
- 复杂业务类型、跨模块复用类型和对外暴露类型的关键字段应添加字段说明；简单内部局部类型可不强制逐字段注释。

## 异步与数据流

- 异步代码优先使用 \`async\` / \`await\`，不要在同一流程中混用复杂 \`.then()\` 链。
- 每个异步边界都要明确处理加载、成功、失败和空数据状态。
- 错误处理应保留必要上下文，避免静默吞错或只打印无意义日志。
- 不要在渲染逻辑中直接触发副作用；副作用应放在事件处理、生命周期、订阅或明确的服务函数中。
- 状态更新应保持不可变数据模式，不直接修改已有对象或数组。

## 函数、常量与注释

- 单个函数只承担一个清晰职责；当分支过多或嵌套过深时，拆分为具名辅助函数。
- 有副作用的函数应通过命名或注释表达意图，例如请求接口、写入缓存、更新 DOM 或修改全局状态。
- 魔法数字、固定文案、路由路径、存储 key、正则表达式等应提取为具名常量。
- 注释应解释业务意图、约束原因、复杂流程、外部契约或非显然取舍，避免重复描述代码表面行为。
- 函数内部只有在存在多阶段流程、复杂条件、异步边界、重试、回退、缓存、DOM 操作或外部系统交互时，才需要分段注释。
- 不要为了满足注释数量生成低价值注释，例如“设置变量”“返回结果”“调用函数”。

${stackSection}

## 数据文件与运行时容错

- 修改 JSON、YAML、CSV 等数据文件前后必须保证格式合法。
- 静态数据字段应保持向后兼容；重命名、删除或改变字段含义前，必须同步更新所有读取逻辑。
- 前端读取静态或远程数据时，应处理字段缺失、空数组、未知枚举值、重复数据和格式变化。
- 面向页面展示的数据转换逻辑应集中在工具函数、页面局部辅助函数或明确的数据适配层中，避免散落在模板或 JSX 中。
- 排序、分组、筛选、映射等规则应提取为具名函数或常量，避免在渲染结构中堆叠复杂表达式。
- 用户可见文案应对空数据、加载失败、无匹配结果和极端数据量提供合理反馈。

## 前端验收清单

- 交互元素必须可通过键盘访问，并具备清晰可见的 focus 状态。
- 按钮、链接、输入框、选择器等元素应使用语义化 HTML，避免用无语义元素模拟原生控件。
- 图片应有合理 \`alt\`；纯装饰图片使用空 \`alt\`。
- 表单控件必须有关联 label 或可读 aria 文案。
- 颜色不能作为唯一信息表达方式；状态变化应同时通过文本、图标、形状或布局表达。
- 页面在移动端宽度下不得出现非预期横向滚动，除非是明确设计的横向内容区域。
- 文案溢出时应有换行、省略、滚动或响应式布局处理，不能遮挡相邻内容。
- 加载、错误、空状态和极端长内容应在实现时同步考虑，不要只覆盖理想数据状态。

## Git 与工作区保护

- 不得回滚、覆盖或删除用户已有改动，除非用户明确要求。
- 发现工作区存在无关改动时，应保留并绕开，不要主动整理。
- 不要执行破坏性命令，例如 \`git reset --hard\`、强制 checkout、批量删除文件，除非用户明确要求。
- 提交前应只包含本次任务相关文件，避免混入缓存、构建产物、临时文件或其他任务变更。
- 若需要移动或重命名文件，应确保引用路径、导入路径、样式路径和文档说明同步更新。

## 质量验证与交付

- 修改后优先运行与改动相关的类型检查、构建、测试或 lint 命令。
- 若无法运行验证命令，应在交付说明中明确原因和未验证风险。
- 修改 UI 后应至少检查桌面端和移动端布局，不得出现明显遮挡、溢出、错位或不可点击区域。
- 修改数据处理逻辑后应覆盖正常数据、空数据、异常数据和边界数据。
- 修改构建、依赖、配置或资源处理逻辑后，应运行完整构建命令。
- 修复 bug 时应优先补充或更新能覆盖该问题的测试；若项目暂无测试体系，应说明手动验证方式。
- 若项目维护任务记录文件，交付前只能追加或补充本次任务相关内容，不得删除、覆盖或重排既有记录。
`;
}

function renderReactRules() {
  return `## React 实现约定

- 组件应保持单向数据流，避免在子组件中隐式修改父级状态或外部可变对象。
- \`useEffect\` 只用于同步外部系统、订阅、请求、定时器、DOM 操作或其他副作用，不用于派生普通渲染数据。
- 派生数据优先在渲染过程中计算，必要时使用 \`useMemo\`；不要滥用 state 保存可由 props 或已有 state 计算出的值。
- 列表渲染必须使用稳定 key；可增删改排的列表不得使用数组下标作为 key。
- 事件处理函数、hooks 和组件拆分应优先服务可读性，不为过早优化制造复杂结构。
- 自定义 hooks 应表达清晰职责，命名以 \`use\` 开头，并隐藏可复用的状态逻辑或副作用逻辑。
- 组件 props 应保持语义清晰；避免把大量无关配置塞进单个组件，必要时拆分为更具体的组件。
- 表单、筛选、搜索、分页、展开收起等交互状态应有明确的默认值、重置逻辑和异常输入处理。`;
}

function renderVueRules() {
  return `## Vue 实现约定

- 优先遵循项目现有 Vue 版本、组件风格和状态方案；若项目已使用 Composition API，优先使用 \`<script setup lang="ts">\`。
- 组件 props 应保持只读语义，不在子组件中直接修改 props 或外部可变对象；需要同步时使用明确的 emit、\`v-model\` 约定或状态管理层。
- 派生数据优先使用 \`computed\`；\`watch\` / \`watchEffect\` 只用于请求、订阅、持久化、DOM 或第三方系统同步等副作用。
- 模板中的复杂判断、排序、分组、筛选和映射应提取到 \`computed\`、具名函数或数据适配层。
- 列表渲染必须使用稳定 \`:key\`；可增删改排的列表不得使用数组下标作为 key。
- composable 应表达清晰职责，命名以 \`use\` 开头，并隐藏可复用的状态逻辑或副作用逻辑。
- 组件的 props、emits、slots 和暴露方法应保持语义清晰；避免把大量无关配置塞进单个组件。
- 表单、筛选、搜索、分页、展开收起等交互状态应有明确的默认值、重置逻辑和异常输入处理。
- 避免不必要的深度监听和大对象响应式包裹；大型静态数据、第三方实例或不可变配置应按项目模式使用浅响应或非响应式存储。`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (!options.stack || !STACKS.has(options.stack)) {
    throw new Error("--stack must be one of: react, vue.");
  }

  if (options.packageManager && !PACKAGE_MANAGERS.has(options.packageManager)) {
    throw new Error("--package-manager must be one of: pnpm, npm, yarn, bun.");
  }

  const projectRoot = path.resolve(options.projectRoot);

  if (!existsSync(projectRoot)) {
    throw new Error(`Project root does not exist: ${projectRoot}`);
  }

  const packageManager = options.packageManager ?? inferPackageManager(projectRoot);
  const buildTool = inferBuildTool(projectRoot);
  const content = renderRules({
    stack: options.stack,
    packageManager,
    buildTool,
  });

  if (options.dryRun) {
    process.stdout.write(content);
    return;
  }

  const rulesDir = path.join(projectRoot, ".cursor", "rules");
  const outputPath = path.join(rulesDir, "project-base-rules.mdc");

  if (existsSync(outputPath) && !options.force) {
    throw new Error(
      `Refusing to overwrite existing rules file: ${outputPath}\n` +
        "Read and merge it manually, or rerun with --force if replacement is intentional.",
    );
  }

  mkdirSync(rulesDir, { recursive: true });
  writeFileSync(outputPath, content, "utf8");
  process.stdout.write(`Wrote ${outputPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}

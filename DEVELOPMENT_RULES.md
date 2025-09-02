# Frontend Docs Search 项目个人开发规则

## 📋 项目概述

本项目是一个基于 AI 的前端技术文档智能搜索应用，采用 Next.js 15 + React 19 + TypeScript + Tailwind CSS 技术栈，集成 TensorFlow.js 实现语义搜索功能。

## 🛠️ 包管理规则

### ✅ 使用 Yarn 包管理器
- **强制使用 Yarn**，禁止使用 npm 进行依赖安装
- 所有依赖安装命令使用 `yarn add` 或 `yarn add -D`
- 包管理相关命令：
  ```bash
  yarn install           # 安装依赖
  yarn add [package]     # 安装生产依赖
  yarn add -D [package]  # 安装开发依赖
  yarn remove [package]  # 移除依赖
  yarn upgrade           # 升级依赖
  ```

### 🚫 禁止的包管理行为
- 禁止使用 `npm install`、`npm i`、`npm add` 等 npm 命令
- 禁止提交 `package-lock.json` 文件
- 禁止混用 npm 和 yarn（确保仅有 `yarn.lock` 文件存在）

## 🏗️ 技术栈规则

### 前端框架
- **Next.js 15.5.2** - 使用 App Router 模式
- **React 19.1.0** - 优先使用函数组件 + Hooks
- **TypeScript 5.x** - 严格类型检查，必须定义接口类型

### 样式规范
- **Tailwind CSS 4.x** - 主要样式解决方案
- 使用原子化 CSS 类，避免编写自定义 CSS
- 响应式设计使用 Tailwind 断点：`sm:`、`md:`、`lg:`、`xl:`
- 主题变量使用 CSS 自定义属性

### AI/机器学习
- **TensorFlow.js 4.22.0** - 客户端机器学习
- **Universal Sentence Encoder** - 语义向量化
- **Fuse.js** - 模糊搜索引擎

## 📝 代码规范

### 文件组织
```
src/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
├── services/           # 业务逻辑服务
├── types/              # TypeScript 类型定义
└── styles/             # 额外样式文件
```

### 组件开发规范
- 所有组件使用 TypeScript，必须定义 Props 接口
- 组件文件命名使用 PascalCase（如：`SearchBox.tsx`）
- 客户端组件必须添加 `"use client"` 指令
- 优先使用函数组件和 React Hooks

### 代码风格
- 使用双引号字符串
- 接口命名使用 PascalCase + Props/Type 后缀
- 函数命名使用 camelCase
- 常量命名使用 UPPER_SNAKE_CASE
- 路径导入使用 `@/` 别名

### 示例代码结构
```typescript
"use client";

import { useState, useCallback } from "react";
import { Component } from "@/components/Component";

interface ComponentProps {
  title: string;
  onAction: (value: string) => void;
  isLoading?: boolean;
}

export default function MyComponent({
  title,
  onAction,
  isLoading = false
}: ComponentProps) {
  const [state, setState] = useState<string>("");
  
  const handleAction = useCallback((value: string) => {
    onAction(value);
  }, [onAction]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {/* 组件内容 */}
    </div>
  );
}
```

## 🔧 开发工具配置

### ESLint 规则
- 基于 Next.js 核心规则和 TypeScript 配置
- 自动忽略构建文件：`.next/`、`out/`、`build/`
- 生产构建时忽略 ESLint 和 TypeScript 错误

### TypeScript 配置
- 目标版本：ES2017
- 严格模式启用
- 路径别名：`@/*` 映射到 `./src/*`
- 增量编译启用

## 🚀 开发流程

### 脚本命令
```bash
yarn dev              # 开发服务器
yarn build            # 生产构建
yarn start            # 启动生产服务器
yarn lint             # 代码检查
```

### 特殊脚本（数据相关）
```bash
yarn crawl-docs       # 爬取文档
yarn crawl-safe       # 安全模式爬取
yarn import-data      # 导入数据
```

### Git 工作流
- 主分支：`main`
- 功能分支：`feature/功能名`
- 修复分支：`fix/问题描述`
- 提交信息使用英文，格式：`type: description`

## 📚 文档规则

### 🚫 不生成文档
- **禁止生成** README.md 更新
- **禁止生成** 技术文档
- **禁止生成** API 文档
- **禁止生成** 总结文档
- 仅在用户明确要求时才创建文档

### 🚫 不生成测试用例
- **禁止生成** 单元测试
- **禁止生成** 集成测试
- **禁止生成** E2E 测试
- 仅在用户明确要求时才编写测试

## 🔍 搜索功能开发

### 搜索模式
- 语义搜索：使用 TensorFlow.js + Universal Sentence Encoder
- 关键词搜索：使用 Fuse.js 模糊匹配
- 混合搜索：结合两种方式

### 数据流程
1. 文档爬取（Puppeteer + Cheerio）
2. 内容处理（文本清理、分块）
3. 向量化（Universal Sentence Encoder）
4. 存储（Supabase + IndexedDB）
5. 搜索（实时向量相似度计算）

## 🎯 性能优化

### 加载优化
- 懒加载组件和模型
- IndexedDB 本地缓存
- 分页加载搜索结果
- 客户端向量计算

### 目标性能指标
- 语义搜索响应：< 200ms
- 模型首次加载：2-5秒
- 支持离线搜索

## 🔒 安全规则

- 环境变量存储敏感信息
- API 密钥不提交到仓库
- 用户输入进行验证和清理
- 使用 HTTPS 连接外部服务

## 📦 部署配置

### Vercel 部署
- 框架：Next.js
- 构建命令：`yarn build`
- 函数超时：30秒
- 环境变量配置通过 Vercel 控制台

### 环境管理
- 开发环境：本地 + Supabase 开发实例
- 生产环境：Vercel + Supabase 生产实例

## ⚡ 快速开发指南

### 新功能开发流程
1. 创建功能分支
2. 在 `src/components/` 创建组件
3. 在 `src/services/` 添加业务逻辑
4. 在 `src/types/` 定义类型
5. 更新主页面集成功能
6. 使用 `yarn lint` 检查代码
7. 测试功能并提交

### 常用开发模式
```typescript
// 1. 创建 TypeScript 接口
interface NewFeatureProps {
  data: string[];
  onUpdate: (item: string) => void;
}

// 2. 实现 React 组件
export default function NewFeature({ data, onUpdate }: NewFeatureProps) {
  // 组件逻辑
}

// 3. 添加到主页面
import NewFeature from "@/components/NewFeature";
```

---

**记住：始终使用 Yarn，不生成文档和测试，专注于功能实现！**
# 前端技术文档智能搜索系统

一个基于 AI 的前端技术文档搜索应用，支持语义搜索和关键词搜索，帮助开发者快速找到相关的技术文档。

## ✨ 特性

- 🔍 **智能语义搜索**: 基于 TensorFlow.js Universal Sentence Encoder 的向量搜索
- 🔎 **关键词搜索**: 传统的文本匹配搜索
- 🏷️ **分类筛选**: 按技术栈分类浏览文档
- 📊 **搜索统计**: 实时显示搜索性能和结果统计
- 🎯 **相关度评分**: 显示搜索结果的相关度
- 🔗 **外部链接**: 直接跳转到官方文档
- 📱 **响应式设计**: 支持桌面和移动设备
- ☁️ **云端数据**: 基于 Supabase 的云数据库

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI/ML**: TensorFlow.js, Universal Sentence Encoder
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **图标**: Heroicons

## 📚 文档覆盖

目前包含以下前端技术的文档：

- **React** (3 个文档): Hooks, Context API, 性能优化
- **Vue** (2 个文档): Composition API, 响应式系统
- **Angular** (2 个文档): 组件, 依赖注入
- **JavaScript** (2 个文档): async/await, Promises
- **CSS** (2 个文档): Flexbox, Grid
- **TypeScript** (1 个文档): 接口
- **HTML** (1 个文档): 语义化元素
- **Node.js** (1 个文档): 模块系统
- **Webpack** (1 个文档): 模块打包
- **Vite** (1 个文档): 快速构建

## 🚀 快速开始

### 前置条件

- Node.js 18+
- npm 或 yarn
- Supabase 账户

### 安装

1. 克隆仓库

```bash
git clone <your-repo-url>
cd TensorFlow
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

```bash
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置
```

4. 设置数据库

- 在 Supabase 中运行 `supabase/schema.sql`
- 导入文档数据: `npm run import-data`

5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📖 部署指南

详细的部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署到 Vercel

1. 推送代码到 Git 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 🔧 开发

### 项目结构

```
src/
├── app/                 # Next.js App Router
├── components/          # React 组件
├── services/           # 业务逻辑服务
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数

scripts/
└── import-data.js      # 数据导入脚本

supabase/
└── schema.sql          # 数据库表结构
```

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run import-data` - 导入文档数据到 Supabase

### 添加新文档

1. 编辑 `scripts/import-data.js`
2. 在 `documents` 数组中添加新文档
3. 运行 `npm run import-data`

文档格式：

```javascript
{
  id: 'unique-id',
  title: '文档标题',
  category: '技术分类',
  content: '文档内容...',
  url: 'https://官方文档链接',
  tags: ['标签1', '标签2'],
  summary: '简短摘要'
}
```

## 🎯 搜索功能

### 语义搜索

- 基于 Universal Sentence Encoder 模型
- 理解查询的语义含义
- 适合概念性搜索

### 关键词搜索

- 传统文本匹配
- 支持标题、内容、标签搜索
- 适合精确匹配

### 混合搜索

- 同时使用两种搜索方式
- 按相关度排序结果
- 提供最佳搜索体验

## 📊 性能

- 搜索响应时间: < 200ms
- 模型加载时间: 2-5 秒 (首次)
- 支持离线搜索 (模型加载后)

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [TensorFlow.js](https://www.tensorflow.org/js) - AI/ML 功能
- [Supabase](https://supabase.com) - 后端服务
- [Vercel](https://vercel.com) - 部署平台
- [Tailwind CSS](https://tailwindcss.com) - 样式框架

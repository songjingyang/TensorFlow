# 部署指南

本应用完全依赖 Supabase 作为数据库，以下是完整的部署步骤。

## 前置条件

1. [Supabase](https://supabase.com) 账户
2. [Vercel](https://vercel.com) 账户
3. [Git](https://git-scm.com/) 已安装

## 步骤1：设置 Supabase

### 1.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project"
3. 创建新项目，选择地区（建议选择离用户最近的地区）
4. 等待项目创建完成

### 1.2 创建数据库表
1. 在 Supabase 项目仪表板中，点击左侧的 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 文件的内容并粘贴到查询编辑器中
4. 点击 "Run" 执行 SQL 脚本

### 1.3 获取项目配置
1. 在 Supabase 项目仪表板中，点击左侧的 "Settings" > "API"
2. 复制以下信息：
   - **Project URL** (类似: `https://xxxxx.supabase.co`)
   - **anon public** key (以 `eyJ` 开头的长字符串)

## 步骤2：本地开发设置

### 2.1 配置环境变量
1. 复制 `.env.local.example` 为 `.env.local`
2. 填入 Supabase 配置：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 导入数据
```bash
npm run import-data
```

### 2.3 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 验证应用正常工作。

## 步骤3：部署到 Vercel

### 3.1 推送代码到 Git
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3.2 连接 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. Vercel 会自动检测到这是一个 Next.js 项目

### 3.3 配置环境变量
在 Vercel 项目设置中添加环境变量：
1. 在项目仪表板中，点击 "Settings" > "Environment Variables"
2. 添加以下变量：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase anon key

### 3.4 部署
1. 点击 "Deploy" 开始部署
2. 等待部署完成
3. 访问提供的 URL 验证应用正常工作

## 步骤4：验证部署

1. 访问部署的 URL
2. 确认搜索功能正常工作
3. 检查浏览器控制台是否有错误
4. 测试不同的搜索查询

## 故障排除

### 常见问题

1. **"Supabase配置缺失"错误**
   - 检查环境变量是否正确设置
   - 确认 Supabase URL 和 Key 没有多余的空格

2. **"没有找到文档数据"错误**
   - 运行 `npm run import-data` 导入数据
   - 检查 Supabase 表是否正确创建

3. **搜索功能不工作**
   - 检查浏览器控制台的错误信息
   - 确认 TensorFlow.js 模型正确加载

4. **部署失败**
   - 检查 Vercel 构建日志
   - 确认所有依赖都在 package.json 中

### 性能优化

1. **Supabase 地区选择**
   - 选择离目标用户最近的地区

2. **Vercel 地区设置**
   - 在 Vercel 项目设置中配置部署地区

3. **缓存策略**
   - 应用已配置适当的缓存策略

## 维护

### 添加新文档
1. 修改 `scripts/import-data.js` 中的 documents 数组
2. 运行 `npm run import-data` 重新导入数据

### 更新应用
1. 推送代码到 Git 仓库
2. Vercel 会自动重新部署

### 监控
- 使用 Vercel Analytics 监控性能
- 使用 Supabase 仪表板监控数据库使用情况

## 支持

如果遇到问题，请检查：
1. [Next.js 文档](https://nextjs.org/docs)
2. [Supabase 文档](https://supabase.com/docs)
3. [Vercel 文档](https://vercel.com/docs)

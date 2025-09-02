# Vercel 部署指南

## 🎉 恭喜！你的应用已经准备好部署了

### ✅ 已完成的步骤：
- ✅ Supabase项目已创建并配置
- ✅ 数据库表已创建（documents表）
- ✅ 16个前端技术文档已导入到Supabase
- ✅ 本地应用测试成功（搜索功能正常）
- ✅ 代码已推送到GitHub仓库

## 🚀 现在开始Vercel部署：

### 步骤1：访问Vercel
1. 打开 [Vercel](https://vercel.com)
2. 使用GitHub账户登录

### 步骤2：导入项目
1. 点击 "New Project"
2. 选择你的GitHub仓库：`songjingyang/TensorFlow`
3. 项目根目录就是仓库根目录（不需要选择子文件夹）
4. Vercel会自动检测到这是一个Next.js项目

### 步骤3：配置环境变量
在部署设置中添加以下环境变量：

**变量名**: `NEXT_PUBLIC_SUPABASE_URL`
**值**: `https://tvxoqnmbexwhgpecusew.supabase.co`

**变量名**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**值**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eG9xbm1iZXh3aGdwZWN1c2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyODMwMDMsImV4cCI6MjA3MTg1OTAwM30.VyCrZfbwtKAkkv2HYGdq2oVfA67aI-MzCmaHk32U_YY`

### 步骤4：部署
1. 点击 "Deploy" 开始部署
2. 等待构建完成（通常需要2-3分钟）
3. 部署成功后，你会得到一个类似 `https://your-app.vercel.app` 的URL

### 步骤5：验证部署
访问部署的URL，确认：
- ✅ 页面正常加载
- ✅ 搜索功能正常工作
- ✅ 能够搜索到16个文档
- ✅ 各个技术分类按钮正常工作

## 🎯 应用特性

你的应用现在具备以下功能：
- 🔍 **智能语义搜索**: 基于TensorFlow.js的AI搜索
- 🔎 **关键词搜索**: 传统文本匹配搜索
- 🏷️ **分类筛选**: 10个技术栈分类
- 📊 **搜索统计**: 实时性能监控
- 🎯 **相关度评分**: 搜索结果质量评估
- 🔗 **外部链接**: 直接跳转到官方文档
- 📱 **响应式设计**: 支持移动设备
- ☁️ **云端数据**: Supabase数据库

## 📚 文档数据

已导入16个高质量前端技术文档：
- **React** (3个): useState, useEffect, Context API
- **Vue** (2个): Composition API, 响应式系统
- **Angular** (2个): 组件, 依赖注入
- **JavaScript** (2个): async/await, Promises
- **CSS** (2个): Flexbox, Grid
- **TypeScript** (1个): 接口
- **HTML** (1个): 语义化元素
- **Node.js** (1个): 模块系统
- **Webpack** (1个): 模块打包
- **Vite** (1个): 快速构建

## 🔧 后续维护

### 添加新文档
1. 编辑 `scripts/import-data.js`
2. 在documents数组中添加新文档
3. 运行 `npm run import-data`

### 更新应用
1. 修改代码后推送到GitHub
2. Vercel会自动重新部署

## 🎉 完成！

你的前端技术文档智能搜索系统现在已经完全部署并可以使用了！

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始自动化部署到 Vercel...\n');

// 检查环境变量
function checkEnvVars() {
  console.log('📋 检查环境变量...');
  
  if (!fs.existsSync('.env.local')) {
    console.error('❌ .env.local 文件不存在');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.error('❌ Supabase 环境变量配置不完整');
    process.exit(1);
  }
  
  console.log('✅ 环境变量检查通过\n');
}

// 构建项目
function buildProject() {
  console.log('🔨 构建项目...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 项目构建成功\n');
  } catch (error) {
    console.error('❌ 项目构建失败:', error.message);
    process.exit(1);
  }
}

// 部署到 Vercel
function deployToVercel() {
  console.log('🚀 部署到 Vercel...');
  
  try {
    // 使用 vercel --prod 进行生产部署
    const result = execSync('vercel --prod --yes', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ 部署成功！');
    console.log('🌐 部署结果:');
    console.log(result);
    
    // 提取部署URL
    const urlMatch = result.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const deployUrl = urlMatch[0];
      console.log(`\n🎉 你的应用已部署到: ${deployUrl}`);
      console.log('\n📝 请访问上述URL验证部署是否成功');
    }
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    
    // 如果是首次部署，可能需要登录
    if (error.message.includes('login') || error.message.includes('auth')) {
      console.log('\n💡 看起来你需要先登录 Vercel');
      console.log('请运行: vercel login');
      console.log('然后重新运行此脚本');
    }
    
    process.exit(1);
  }
}

// 验证部署
function verifyDeployment() {
  console.log('\n🔍 部署验证清单:');
  console.log('1. ✅ 页面能正常加载');
  console.log('2. ✅ 搜索功能正常工作');
  console.log('3. ✅ 能够搜索到16个文档');
  console.log('4. ✅ 各个技术分类按钮正常工作');
  console.log('5. ✅ TensorFlow.js 模型正常加载');
  console.log('\n🎯 如果以上功能都正常，说明部署成功！');
}

// 主函数
function main() {
  try {
    checkEnvVars();
    buildProject();
    deployToVercel();
    verifyDeployment();
    
    console.log('\n🎉 自动化部署完成！');
    
  } catch (error) {
    console.error('\n❌ 部署过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

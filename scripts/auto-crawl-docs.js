#!/usr/bin/env node

const DocumentCrawler = require("./crawler/doc-crawler");
const ContentProcessor = require("./crawler/content-processor");
const {
  getAllTechConfigs,
  getHighPriorityUrls,
} = require("./crawler/tech-configs");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs").promises;
const path = require("path");

require("dotenv").config({ path: ".env.local" });

/**
 * 自动化文档爬取和导入系统
 */
class AutoDocCrawler {
  constructor() {
    this.crawler = new DocumentCrawler();
    this.processor = new ContentProcessor();
    this.supabase = null;
    this.results = {
      crawled: 0,
      processed: 0,
      imported: 0,
      errors: [],
    };
  }

  async init() {
    console.log("🚀 初始化自动化文档爬取系统...");

    // 初始化爬虫
    await this.crawler.init();

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("❌ Supabase 配置缺失，请检查环境变量");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ 系统初始化完成");
  }

  /**
   * 爬取指定技术栈的文档（增强错误处理）
   */
  async crawlTechStack(techName, options = {}) {
    console.log(`\n📚 开始爬取 ${techName} 文档...`);

    const urls = getHighPriorityUrls(techName);
    if (urls.length === 0) {
      console.log(`⚠️  ${techName} 没有配置的URL`);
      return {
        results: [],
        errors: [],
        stats: { total: 0, success: 0, failed: 0, successRate: 0 },
      };
    }

    console.log(`📄 准备爬取 ${urls.length} 个页面`);

    try {
      const crawlResult = await this.crawler.crawlMultiplePages(urls, {
        concurrency: options.concurrency || 2,
        continueOnError: options.continueOnError !== false,
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 2000,
        batchDelay: options.batchDelay || 1000,
      });

      // 更新统计信息
      this.results.crawled += crawlResult.results.length;

      // 记录技术栈级别的错误
      if (crawlResult.errors.length > 0) {
        crawlResult.errors.forEach((error) => {
          this.results.errors.push({
            tech: techName,
            ...error,
            stage: "crawl",
          });
        });
      }

      console.log(`\n📊 ${techName} 爬取统计:`);
      console.log(
        `✅ 成功: ${crawlResult.stats.success}/${
          crawlResult.stats.total
        } (${crawlResult.stats.successRate.toFixed(1)}%)`
      );
      console.log(
        `❌ 失败: ${crawlResult.stats.failed}/${crawlResult.stats.total}`
      );

      if (crawlResult.stats.success === 0) {
        console.warn(`⚠️  ${techName} 没有成功爬取任何页面`);
      }

      return crawlResult;
    } catch (error) {
      console.error(`❌ ${techName} 爬取过程失败:`, error.message);

      // 记录技术栈级别的致命错误
      this.results.errors.push({
        tech: techName,
        error: error.message,
        stack: error.stack,
        stage: "crawl_fatal",
        timestamp: new Date().toISOString(),
      });

      // 返回空结果但保持一致的数据结构
      return {
        results: [],
        errors: [
          {
            tech: techName,
            error: error.message,
            type: "TECH_STACK_FATAL",
            timestamp: new Date().toISOString(),
          },
        ],
        stats: {
          total: urls.length,
          success: 0,
          failed: urls.length,
          successRate: 0,
        },
      };
    }
  }

  /**
   * 处理爬取的文档（增强错误处理）
   */
  async processDocuments(rawDocs, category, options = {}) {
    console.log(`\n🔄 处理 ${category} 文档...`);

    if (!rawDocs || rawDocs.length === 0) {
      console.log(`⚠️  ${category} 没有文档需要处理`);
      return [];
    }

    const processedDocs = [];
    const processingErrors = [];
    const qualityThreshold = options.qualityThreshold || 30;

    console.log(`📄 开始处理 ${rawDocs.length} 个原始文档...`);

    for (let i = 0; i < rawDocs.length; i++) {
      const rawDoc = rawDocs[i];

      try {
        console.log(
          `🔄 [${i + 1}/${rawDocs.length}] 处理: ${
            rawDoc?.title || rawDoc?.url || "Unknown"
          }`
        );

        const processed = this.processor.processDocument(rawDoc, category);

        if (!processed) {
          console.warn(`⚠️  [${i + 1}/${rawDocs.length}] 处理结果为空，跳过`);
          continue;
        }

        if (processed.quality < qualityThreshold) {
          console.warn(
            `⚠️  [${i + 1}/${rawDocs.length}] 质量过低 (${
              processed.quality
            }/${qualityThreshold})，跳过`
          );
          continue;
        }

        // 分割长文档
        try {
          const sections = this.processor.splitLongDocument(processed);
          processedDocs.push(...sections);
          console.log(
            `✅ [${i + 1}/${rawDocs.length}] 处理成功，生成 ${
              sections.length
            } 个片段`
          );
        } catch (splitError) {
          console.error(
            `❌ [${i + 1}/${rawDocs.length}] 文档分割失败:`,
            splitError.message
          );
          // 分割失败时，仍然保留原文档
          processedDocs.push(processed);
        }
      } catch (error) {
        console.error(
          `❌ [${i + 1}/${rawDocs.length}] 文档处理失败:`,
          error.message
        );

        const errorInfo = {
          category,
          error: error.message,
          stack: error.stack,
          stage: "process",
          url: rawDoc?.url,
          title: rawDoc?.title,
          index: i,
          timestamp: new Date().toISOString(),
        };

        processingErrors.push(errorInfo);
        this.results.errors.push(errorInfo);

        // 继续处理下一个文档
        continue;
      }
    }

    console.log(`\n📊 ${category} 处理统计:`);
    console.log(`📄 原始文档: ${rawDocs.length}`);
    console.log(`✅ 处理成功: ${processedDocs.length}`);
    console.log(`❌ 处理失败: ${processingErrors.length}`);

    if (processedDocs.length === 0) {
      console.warn(`⚠️  ${category} 没有成功处理任何文档`);
      return [];
    }

    // 去重处理
    console.log(`🔄 执行去重处理...`);
    try {
      const uniqueDocs = this.processor.deduplicateDocuments(processedDocs);
      const duplicateCount = processedDocs.length - uniqueDocs.length;

      this.results.processed += uniqueDocs.length;

      console.log(`✅ ${category} 处理完成:`);
      console.log(`  📄 处理后文档: ${processedDocs.length}`);
      console.log(`  🔄 去重后文档: ${uniqueDocs.length}`);
      console.log(`  🗑️  重复文档: ${duplicateCount}`);

      return uniqueDocs;
    } catch (dedupeError) {
      console.error(`❌ ${category} 去重失败:`, dedupeError.message);

      // 去重失败时返回原始处理结果
      this.results.processed += processedDocs.length;
      console.log(
        `⚠️  ${category} 跳过去重，返回 ${processedDocs.length} 个文档`
      );

      return processedDocs;
    }
  }

  /**
   * 导入文档到 Supabase
   */
  async importToSupabase(docs) {
    console.log(`\n💾 导入 ${docs.length} 个文档到 Supabase...`);

    if (docs.length === 0) {
      console.log("⚠️  没有文档需要导入");
      return;
    }

    try {
      // 清空现有数据（可选）
      if (process.argv.includes("--clear")) {
        console.log("🗑️  清空现有数据...");
        await this.supabase.from("documents").delete().neq("id", "");
      }

      // 批量插入
      const batchSize = 10;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);

        const { error } = await this.supabase.from("documents").upsert(
          batch.map((doc) => ({
            id: doc.id,
            title: doc.title,
            category: doc.category,
            content: doc.content,
            url: doc.url,
            tags: doc.tags,
            summary: doc.summary,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );

        if (error) {
          console.error(
            `❌ 批次 ${Math.floor(i / batchSize) + 1} 导入失败:`,
            error.message
          );
          this.results.errors.push({
            error: error.message,
            stage: "import",
            batch: Math.floor(i / batchSize) + 1,
          });
        } else {
          this.results.imported += batch.length;
          console.log(
            `✅ 批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(
              docs.length / batchSize
            )} 导入成功`
          );
        }

        // 避免过于频繁的请求
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(`✅ 导入完成: ${this.results.imported} 个文档`);
    } catch (error) {
      console.error("❌ 导入过程失败:", error.message);
      this.results.errors.push({ error: error.message, stage: "import" });
    }
  }

  /**
   * 保存结果到本地文件
   */
  async saveToFile(docs, filename) {
    try {
      const outputDir = path.join(__dirname, "../data/crawled");
      await fs.mkdir(outputDir, { recursive: true });

      const filepath = path.join(outputDir, filename);
      await fs.writeFile(filepath, JSON.stringify(docs, null, 2), "utf8");

      console.log(`💾 结果已保存到: ${filepath}`);
    } catch (error) {
      console.error("❌ 保存文件失败:", error.message);
    }
  }

  /**
   * 运行完整的爬取流程
   */
  async runFullCrawl(options = {}) {
    const startTime = Date.now();
    console.log("🎯 开始完整的文档爬取流程...\n");

    try {
      await this.init();

      const techStacks = options.techStacks || [
        "react",
        "vue",
        "angular",
        "javascript",
        "typescript",
        "css",
      ];
      const allProcessedDocs = [];

      // 逐个处理技术栈（增强错误处理）
      for (let i = 0; i < techStacks.length; i++) {
        const techName = techStacks[i];
        console.log(
          `\n🎯 [${i + 1}/${techStacks.length}] 开始处理技术栈: ${techName}`
        );

        try {
          // 爬取
          const crawlResult = await this.crawlTechStack(techName, options);

          if (!crawlResult || !crawlResult.results) {
            console.warn(`⚠️  ${techName} 爬取结果为空，跳过处理`);
            continue;
          }

          if (crawlResult.results.length === 0) {
            console.warn(`⚠️  ${techName} 没有成功爬取任何文档，跳过处理`);
            continue;
          }

          // 处理
          const processedDocs = await this.processDocuments(
            crawlResult.results,
            techName,
            {
              qualityThreshold: options.qualityThreshold || 30,
              continueOnError: options.continueOnError !== false,
            }
          );

          if (processedDocs && processedDocs.length > 0) {
            allProcessedDocs.push(...processedDocs);
            console.log(
              `✅ ${techName} 完成，添加 ${processedDocs.length} 个文档到总集合`
            );
          } else {
            console.warn(`⚠️  ${techName} 处理后没有有效文档`);
          }

          // 保存中间结果
          if (
            options.saveIntermediate &&
            processedDocs &&
            processedDocs.length > 0
          ) {
            try {
              await this.saveToFile(processedDocs, `${techName}-docs.json`);
            } catch (saveError) {
              console.error(
                `❌ ${techName} 中间结果保存失败:`,
                saveError.message
              );
              // 保存失败不影响主流程
            }
          }
        } catch (error) {
          console.error(`❌ ${techName} 整体处理失败:`, error.message);

          // 记录技术栈级别的错误
          this.results.errors.push({
            tech: techName,
            error: error.message,
            stack: error.stack,
            stage: "tech_stack_full",
            timestamp: new Date().toISOString(),
          });

          // 根据配置决定是否继续
          if (options.stopOnTechStackError) {
            console.error(`🛑 ${techName} 失败，根据配置停止执行`);
            throw error;
          } else {
            console.log(`⏭️  ${techName} 失败，继续处理下一个技术栈`);
            continue;
          }
        }

        // 技术栈间的延迟
        if (i < techStacks.length - 1) {
          const delay = options.techStackDelay || 2000;
          console.log(`⏳ 等待 ${delay}ms 后处理下一个技术栈...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // 最终去重
      console.log("\n🔄 执行最终去重...");
      const finalDocs = this.processor.deduplicateDocuments(
        allProcessedDocs,
        0.7
      );

      // 保存完整结果
      await this.saveToFile(finalDocs, "all-docs.json");

      // 导入到数据库
      await this.importToSupabase(finalDocs);

      // 保存错误日志
      await this.saveErrorLog();

      // 输出统计信息
      this.printSummary(startTime);
    } catch (error) {
      console.error("❌ 爬取流程失败:", error.message);
    } finally {
      await this.crawler.close();
    }
  }

  /**
   * 保存错误日志
   */
  async saveErrorLog() {
    if (this.results.errors.length === 0) {
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const errorLogPath = path.join(
        __dirname,
        "../data/logs",
        `errors-${timestamp}.json`
      );

      await fs.mkdir(path.dirname(errorLogPath), { recursive: true });

      const errorReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalErrors: this.results.errors.length,
          crawled: this.results.crawled,
          processed: this.results.processed,
          imported: this.results.imported,
        },
        errorsByStage: {},
        errorsByTech: {},
        errors: this.results.errors,
      };

      // 按阶段分组错误
      this.results.errors.forEach((error) => {
        const stage = error.stage || "unknown";
        if (!errorReport.errorsByStage[stage]) {
          errorReport.errorsByStage[stage] = [];
        }
        errorReport.errorsByStage[stage].push(error);
      });

      // 按技术栈分组错误
      this.results.errors.forEach((error) => {
        const tech = error.tech || "unknown";
        if (!errorReport.errorsByTech[tech]) {
          errorReport.errorsByTech[tech] = [];
        }
        errorReport.errorsByTech[tech].push(error);
      });

      await fs.writeFile(
        errorLogPath,
        JSON.stringify(errorReport, null, 2),
        "utf8"
      );
      console.log(`📋 错误日志已保存: ${errorLogPath}`);
    } catch (error) {
      console.error("❌ 保存错误日志失败:", error.message);
    }
  }

  /**
   * 打印执行摘要（增强版）
   */
  printSummary(startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log("\n" + "=".repeat(50));
    console.log("📊 执行摘要");
    console.log("=".repeat(50));
    console.log(`⏱️  总耗时: ${duration} 秒`);
    console.log(`📄 爬取页面: ${this.results.crawled}`);
    console.log(`🔄 处理文档: ${this.results.processed}`);
    console.log(`💾 导入文档: ${this.results.imported}`);
    console.log(`❌ 错误数量: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log("\n❌ 错误详情:");
      this.results.errors.forEach((error, index) => {
        console.log(
          `${index + 1}. [${error.stage}] ${error.tech || ""}: ${error.error}`
        );
      });
    }

    console.log("\n🎉 文档爬取流程完成!");
  }

  /**
   * 快速测试单个技术栈
   */
  async testSingleTech(techName) {
    console.log(`🧪 测试爬取 ${techName}...`);

    try {
      await this.init();

      const crawlResult = await this.crawlTechStack(techName, {
        concurrency: 1,
      });

      if (!crawlResult || !crawlResult.results) {
        console.log(`❌ 爬取结果为空`);
        return;
      }

      const processedDocs = await this.processDocuments(
        crawlResult.results,
        techName
      );

      console.log(`\n📊 测试结果:`);
      console.log(`- 爬取: ${crawlResult.results.length} 个页面`);
      console.log(`- 处理: ${processedDocs.length} 个文档`);
      console.log(`- 错误: ${crawlResult.errors.length} 个`);
      console.log(`- 成功率: ${crawlResult.stats.successRate.toFixed(1)}%`);

      if (processedDocs.length > 0) {
        console.log(`- 示例文档: ${processedDocs[0].title}`);
        console.log(`- 内容长度: ${processedDocs[0].content.length} 字符`);
        console.log(`- 质量评分: ${processedDocs[0].quality}`);
      }

      if (crawlResult.errors.length > 0) {
        console.log(`\n❌ 错误详情:`);
        crawlResult.errors.slice(0, 3).forEach((error, index) => {
          console.log(`${index + 1}. ${error.url}: ${error.error}`);
        });
      }
    } catch (error) {
      console.error("❌ 测试失败:", error.message);
    } finally {
      await this.crawler.close();
    }
  }
}

// 命令行接口
async function main() {
  const crawler = new AutoDocCrawler();

  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
📚 自动化文档爬取系统 (增强错误处理版)

用法:
  node auto-crawl-docs.js [选项]

基本选项:
  --test <tech>         测试单个技术栈 (react, vue, angular, javascript, typescript, css)
  --tech <techs>        指定技术栈，用逗号分隔 (默认: 全部)
  --clear               清空现有数据
  --save                保存中间结果
  --help                显示帮助信息

错误处理选项:
  --max-retries <n>     每个页面的最大重试次数 (默认: 3)
  --retry-delay <ms>    重试间隔时间，毫秒 (默认: 2000)
  --concurrency <n>     并发爬取数量 (默认: 2)
  --batch-delay <ms>    批次间延迟时间，毫秒 (默认: 1000)
  --tech-delay <ms>     技术栈间延迟时间，毫秒 (默认: 2000)
  --quality <n>         文档质量阈值 (默认: 30)
  --stop-on-error       遇到技术栈错误时停止执行
  --no-continue         页面失败时不继续处理其他页面

性能选项:
  --fast                快速模式 (降低延迟，提高并发)
  --safe                安全模式 (增加延迟，降低并发)

示例:
  # 基本使用
  node auto-crawl-docs.js --test react
  node auto-crawl-docs.js --tech react,vue --save
  node auto-crawl-docs.js --clear

  # 错误处理配置
  node auto-crawl-docs.js --max-retries 5 --retry-delay 3000
  node auto-crawl-docs.js --concurrency 1 --batch-delay 2000 --safe
  node auto-crawl-docs.js --stop-on-error --quality 50

  # 快速模式 (适合网络良好时)
  node auto-crawl-docs.js --fast --concurrency 4

  # 安全模式 (适合网络不稳定时)
  node auto-crawl-docs.js --safe --max-retries 5
    `);
    return;
  }

  if (args.includes("--test")) {
    const techIndex = args.indexOf("--test") + 1;
    const techName = args[techIndex] || "react";
    await crawler.testSingleTech(techName);
    return;
  }

  // 解析命令行参数
  const getArgValue = (argName, defaultValue) => {
    const index = args.indexOf(argName);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
  };

  const options = {
    saveIntermediate: args.includes("--save"),
    continueOnError: !args.includes("--no-continue"),
    stopOnTechStackError: args.includes("--stop-on-error"),

    // 重试配置
    maxRetries: parseInt(getArgValue("--max-retries", "3")),
    retryDelay: parseInt(getArgValue("--retry-delay", "2000")),

    // 并发配置
    concurrency: parseInt(getArgValue("--concurrency", "2")),
    batchDelay: parseInt(getArgValue("--batch-delay", "1000")),
    techStackDelay: parseInt(getArgValue("--tech-delay", "2000")),

    // 质量配置
    qualityThreshold: parseInt(getArgValue("--quality", "30")),
  };

  // 预设模式
  if (args.includes("--fast")) {
    options.concurrency = 4;
    options.batchDelay = 500;
    options.techStackDelay = 1000;
    options.retryDelay = 1000;
    console.log("🚀 启用快速模式");
  }

  if (args.includes("--safe")) {
    options.concurrency = 1;
    options.batchDelay = 3000;
    options.techStackDelay = 5000;
    options.retryDelay = 5000;
    options.maxRetries = 5;
    console.log("🛡️  启用安全模式");
  }

  // 技术栈配置
  if (args.includes("--tech")) {
    const techIndex = args.indexOf("--tech") + 1;
    const techList = args[techIndex];
    if (techList) {
      options.techStacks = techList.split(",").map((t) => t.trim());
    }
  }

  console.log("⚙️  配置参数:", {
    并发数: options.concurrency,
    最大重试: options.maxRetries,
    重试延迟: `${options.retryDelay}ms`,
    批次延迟: `${options.batchDelay}ms`,
    技术栈延迟: `${options.techStackDelay}ms`,
    质量阈值: options.qualityThreshold,
    继续执行: options.continueOnError,
    遇错停止: options.stopOnTechStackError,
  });

  await crawler.runFullCrawl(options);
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AutoDocCrawler;

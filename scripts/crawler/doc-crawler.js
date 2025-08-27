const puppeteer = require("puppeteer");
const { parse } = require("node-html-parser");
const fs = require("fs").promises;
const path = require("path");

/**
 * 智能文档爬虫系统
 * 支持多种前端技术栈的官方文档爬取
 */
class DocumentCrawler {
  constructor(options = {}) {
    this.options = {
      headless: true,
      timeout: 30000,
      waitForSelector: "main, article, .content, #content",
      ...options,
    };
    this.browser = null;
  }

  async init() {
    console.log("🚀 启动浏览器...");
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("✅ 浏览器已关闭");
    }
  }

  /**
   * 爬取单个页面内容（带重试机制）
   */
  async crawlPage(url, config = {}) {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const page = await this.browser.newPage();

      try {
        console.log(`📄 正在爬取 (尝试 ${attempt}/${maxRetries}): ${url}`);

        // 设置页面配置
        await this.setupPage(page, config);

        // 导航到页面
        await page.goto(url, {
          waitUntil: "networkidle2",
          timeout: this.options.timeout,
        });

        // 等待主要内容加载
        await this.waitForContent(page, config, url);

        // 获取页面内容
        const content = await this.extractPageContent(page, config);

        console.log(`✅ 爬取成功: ${url}`);
        return content;
      } catch (error) {
        console.error(
          `❌ 爬取失败 (尝试 ${attempt}/${maxRetries}) ${url}:`,
          error.message
        );

        if (attempt === maxRetries) {
          // 最后一次尝试失败，记录详细错误
          const errorInfo = {
            url,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            attempts: maxRetries,
            type: this.classifyError(error),
          };

          console.error(`🚫 页面最终失败: ${url}`, errorInfo);
          return { error: errorInfo, url };
        }

        // 等待后重试
        console.log(`⏳ ${retryDelay}ms 后重试...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } finally {
        await page.close();
      }
    }
  }

  /**
   * 设置页面配置
   */
  async setupPage(page, config) {
    // 设置用户代理
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    );

    // 设置视口
    await page.setViewport({ width: 1280, height: 720 });

    // 拦截不必要的资源
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  /**
   * 等待内容加载
   */
  async waitForContent(page, config, url) {
    try {
      await page.waitForSelector(
        config.contentSelector || this.options.waitForSelector,
        {
          timeout: 10000,
        }
      );
    } catch (e) {
      console.warn(`⚠️  内容选择器未找到，继续处理: ${url}`);
    }
  }

  /**
   * 提取页面内容
   */
  async extractPageContent(page, config) {
    // 获取页面内容
    return await page.evaluate((config) => {
      // 移除不需要的元素
      const removeSelectors = [
        "nav",
        "header",
        "footer",
        ".navigation",
        ".sidebar",
        ".breadcrumb",
        ".toc",
        ".table-of-contents",
        ".edit-page",
        ".feedback",
        ".advertisement",
        ".ads",
        "script",
        "style",
        ".cookie-banner",
        ".banner",
      ];

      removeSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      });

      // 获取主要内容区域
      const contentSelectors = [
        config.contentSelector,
        "main",
        "article",
        ".content",
        "#content",
        ".main-content",
        ".documentation",
        ".docs-content",
        ".markdown-body",
        ".prose",
      ].filter(Boolean);

      let mainContent = null;
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          mainContent = element;
          break;
        }
      }

      if (!mainContent) {
        mainContent = document.body;
      }

      // 提取文本内容和结构
      const extractContent = (element) => {
        const result = {
          text: "",
          headings: [],
          codeBlocks: [],
          links: [],
        };

        // 提取标题
        element
          .querySelectorAll("h1, h2, h3, h4, h5, h6")
          .forEach((heading) => {
            result.headings.push({
              level: parseInt(heading.tagName.charAt(1)),
              text: heading.textContent.trim(),
              id: heading.id || "",
            });
          });

        // 提取代码块
        element.querySelectorAll("pre, code").forEach((code) => {
          const codeText = code.textContent.trim();
          if (codeText.length > 10) {
            // 过滤太短的代码
            result.codeBlocks.push({
              language: code.className.match(/language-(\w+)/)?.[1] || "text",
              code: codeText,
            });
          }
        });

        // 提取链接
        element.querySelectorAll("a[href]").forEach((link) => {
          const href = link.getAttribute("href");
          const text = link.textContent.trim();
          if (text && href && !href.startsWith("#")) {
            result.links.push({ text, href });
          }
        });

        // 提取纯文本内容
        result.text = element.textContent.replace(/\s+/g, " ").trim();

        return result;
      };

      return {
        title: document.title,
        url: window.location.href,
        content: extractContent(mainContent),
        meta: {
          description:
            document.querySelector('meta[name="description"]')?.content || "",
          keywords:
            document.querySelector('meta[name="keywords"]')?.content || "",
        },
      };
    }, config);
  }

  /**
   * 错误分类
   */
  classifyError(error) {
    const message = error.message.toLowerCase();

    if (message.includes("timeout")) {
      return "TIMEOUT";
    } else if (message.includes("net::") || message.includes("network")) {
      return "NETWORK";
    } else if (message.includes("navigation")) {
      return "NAVIGATION";
    } else if (message.includes("selector")) {
      return "SELECTOR";
    } else if (message.includes("protocol")) {
      return "PROTOCOL";
    } else {
      return "UNKNOWN";
    }
  }

  /**
   * 批量爬取多个页面（增强错误处理）
   */
  async crawlMultiplePages(urls, config = {}) {
    const results = [];
    const errors = [];
    const concurrency = config.concurrency || 3;
    const continueOnError = config.continueOnError !== false; // 默认继续执行

    console.log(
      `📚 开始批量爬取 ${urls.length} 个页面，并发数: ${concurrency}`
    );

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      console.log(
        `🔄 处理批次 ${Math.floor(i / concurrency) + 1}/${Math.ceil(
          urls.length / concurrency
        )}`
      );

      const batchPromises = batch.map((url, batchIndex) => {
        const actualUrl = typeof url === "string" ? url : url.url;
        const urlConfig =
          typeof url === "string" ? config : { ...config, ...url.config };

        return this.crawlPage(actualUrl, urlConfig)
          .then((result) => ({
            success: true,
            result,
            url: actualUrl,
            index: i + batchIndex,
          }))
          .catch((error) => ({
            success: false,
            error,
            url: actualUrl,
            index: i + batchIndex,
          }));
      });

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((promiseResult, batchIndex) => {
          const actualIndex = i + batchIndex;

          if (promiseResult.status === "fulfilled") {
            const { success, result, error, url } = promiseResult.value;

            if (success && result && !result.error) {
              results.push(result);
              console.log(
                `✅ [${actualIndex + 1}/${urls.length}] 成功: ${url}`
              );
            } else {
              // 处理页面级错误
              const errorInfo = result?.error ||
                error || { message: "Unknown error", url };
              errors.push({
                ...errorInfo,
                index: actualIndex,
                batch: Math.floor(i / concurrency) + 1,
              });
              console.error(
                `❌ [${actualIndex + 1}/${urls.length}] 失败: ${url} - ${
                  errorInfo.error || errorInfo.message
                }`
              );
            }
          } else {
            // 处理Promise级错误
            const url = batch[batchIndex];
            const actualUrl = typeof url === "string" ? url : url.url;
            errors.push({
              url: actualUrl,
              error: promiseResult.reason?.message || "Promise rejected",
              type: "PROMISE_ERROR",
              index: actualIndex,
              batch: Math.floor(i / concurrency) + 1,
              timestamp: new Date().toISOString(),
            });
            console.error(
              `❌ [${actualIndex + 1}/${urls.length}] Promise失败: ${actualUrl}`
            );
          }
        });
      } catch (batchError) {
        console.error(
          `❌ 批次 ${Math.floor(i / concurrency) + 1} 处理失败:`,
          batchError.message
        );

        if (!continueOnError) {
          throw new Error(`批次处理失败，停止执行: ${batchError.message}`);
        }

        // 记录批次级错误
        batch.forEach((url, batchIndex) => {
          const actualUrl = typeof url === "string" ? url : url.url;
          errors.push({
            url: actualUrl,
            error: `批次处理失败: ${batchError.message}`,
            type: "BATCH_ERROR",
            index: i + batchIndex,
            batch: Math.floor(i / concurrency) + 1,
            timestamp: new Date().toISOString(),
          });
        });
      }

      // 避免过于频繁的请求
      if (i + concurrency < urls.length) {
        const delay = config.batchDelay || 1000;
        console.log(`⏳ 等待 ${delay}ms 后处理下一批次...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // 输出详细统计
    console.log(`\n📊 批量爬取统计:`);
    console.log(
      `✅ 成功: ${results.length}/${urls.length} (${(
        (results.length / urls.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `❌ 失败: ${errors.length}/${urls.length} (${(
        (errors.length / urls.length) *
        100
      ).toFixed(1)}%)`
    );

    if (errors.length > 0) {
      console.log(`\n🔍 错误分类:`);
      const errorTypes = {};
      errors.forEach((error) => {
        const type = error.type || "UNKNOWN";
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });

      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} 个`);
      });
    }

    return {
      results,
      errors,
      stats: {
        total: urls.length,
        success: results.length,
        failed: errors.length,
        successRate: (results.length / urls.length) * 100,
      },
    };
  }

  /**
   * 保存爬取结果到文件
   */
  async saveResults(results, outputPath) {
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf8");
      console.log(`💾 结果已保存到: ${outputPath}`);
    } catch (error) {
      console.error("❌ 保存文件失败:", error.message);
    }
  }

  /**
   * 从文件加载爬取结果
   */
  async loadResults(inputPath) {
    try {
      const data = await fs.readFile(inputPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("❌ 加载文件失败:", error.message);
      return null;
    }
  }
}

module.exports = DocumentCrawler;

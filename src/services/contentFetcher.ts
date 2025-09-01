/**
 * 内容获取服务
 * 用于获取外部链接的实时内容
 */

export interface FetchedContent {
  content: string;
  title?: string;
  lastUpdated: Date;
  success: boolean;
  error?: string;
}

export class ContentFetcher {
  private static instance: ContentFetcher;
  private cache: Map<string, { content: FetchedContent; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  static getInstance(): ContentFetcher {
    if (!ContentFetcher.instance) {
      ContentFetcher.instance = new ContentFetcher();
    }
    return ContentFetcher.instance;
  }

  /**
   * 获取外部链接内容
   */
  async fetchContent(url: string): Promise<FetchedContent> {
    try {
      // 检查缓存
      const cached = this.getCachedContent(url);
      if (cached) {
        return cached;
      }

      // 由于浏览器的CORS限制，我们需要使用代理服务
      // 这里使用一个公共的CORS代理服务
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('无法获取内容');
      }

      // 解析HTML内容
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // 提取主要内容
      const content = this.extractMainContent(doc);
      const title = doc.querySelector('title')?.textContent || '';

      const result: FetchedContent = {
        content,
        title,
        lastUpdated: new Date(),
        success: true,
      };

      // 缓存结果
      this.setCachedContent(url, result);

      return result;
    } catch (error) {
      console.error('获取内容失败:', error);
      return {
        content: '',
        lastUpdated: new Date(),
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 提取HTML文档的主要内容
   */
  private extractMainContent(doc: Document): string {
    // 尝试多种选择器来获取主要内容
    const selectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '#content',
      '.markdown-body', // GitHub等平台
      '.wiki-content',  // Wiki类网站
    ];

    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        return this.cleanContent(element.textContent || '');
      }
    }

    // 如果没有找到特定的内容区域，尝试获取body内容
    const body = doc.querySelector('body');
    if (body) {
      // 移除脚本、样式等不需要的元素
      const clone = body.cloneNode(true) as Element;
      const unwantedElements = clone.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .navigation');
      unwantedElements.forEach(el => el.remove());
      
      return this.cleanContent(clone.textContent || '');
    }

    return '无法提取内容';
  }

  /**
   * 清理文本内容
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ') // 合并多个空白字符
      .replace(/\n\s*\n/g, '\n\n') // 合并多个换行
      .trim()
      .substring(0, 10000); // 限制内容长度
  }

  /**
   * 获取缓存内容
   */
  private getCachedContent(url: string): FetchedContent | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.content;
    }
    return null;
  }

  /**
   * 设置缓存内容
   */
  private setCachedContent(url: string, content: FetchedContent): void {
    this.cache.set(url, {
      content,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 检查URL是否可以获取内容
   */
  canFetchContent(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // 检查是否是支持的协议
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export default ContentFetcher;

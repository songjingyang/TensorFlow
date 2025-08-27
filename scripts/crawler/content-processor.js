/**
 * 内容处理器
 * 负责清洗、分析和格式化爬取的文档内容
 */
class ContentProcessor {
  constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'
    ]);
  }

  /**
   * 处理单个文档
   */
  processDocument(rawDoc, category) {
    if (!rawDoc || !rawDoc.content) {
      return null;
    }

    try {
      // 基础信息提取
      const processed = {
        title: this.cleanTitle(rawDoc.title),
        url: rawDoc.url,
        category: category,
        content: this.cleanContent(rawDoc.content.text),
        headings: rawDoc.content.headings || [],
        codeBlocks: rawDoc.content.codeBlocks || [],
        links: rawDoc.content.links || [],
        meta: rawDoc.meta || {}
      };

      // 生成摘要
      processed.summary = this.generateSummary(processed.content);

      // 提取标签
      processed.tags = this.extractTags(processed);

      // 生成唯一ID
      processed.id = this.generateId(processed.title, processed.url);

      // 内容质量评分
      processed.quality = this.calculateQuality(processed);

      return processed;

    } catch (error) {
      console.error('❌ 文档处理失败:', error.message);
      return null;
    }
  }

  /**
   * 清理标题
   */
  cleanTitle(title) {
    if (!title) return '';
    
    return title
      .replace(/\s*\|\s*.*$/, '') // 移除网站名称
      .replace(/\s*-\s*.*$/, '')  // 移除副标题
      .replace(/\s+/g, ' ')       // 规范化空格
      .trim();
  }

  /**
   * 清理内容
   */
  cleanContent(content) {
    if (!content) return '';

    return content
      .replace(/\s+/g, ' ')                    // 规范化空格
      .replace(/\n\s*\n/g, '\n')              // 移除多余换行
      .replace(/[^\w\s\u4e00-\u9fff.,!?;:()\[\]{}'"\/\-=+*&%$#@]/g, '') // 保留基本字符
      .trim();
  }

  /**
   * 生成摘要
   */
  generateSummary(content, maxLength = 200) {
    if (!content) return '';

    // 按句子分割
    const sentences = content.split(/[.!?。！？]/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // 选择前几个有意义的句子
    let summary = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (summary.length + trimmed.length <= maxLength) {
        summary += (summary ? '. ' : '') + trimmed;
      } else {
        break;
      }
    }

    return summary || content.substring(0, maxLength) + '...';
  }

  /**
   * 提取标签
   */
  extractTags(doc) {
    const tags = new Set();
    const text = (doc.title + ' ' + doc.content + ' ' + doc.headings.map(h => h.text).join(' ')).toLowerCase();

    // 技术关键词映射
    const techKeywords = {
      'react': ['react', 'jsx', 'component', 'hook', 'state', 'props'],
      'vue': ['vue', 'vuejs', 'composition', 'reactive', 'directive'],
      'angular': ['angular', 'component', 'service', 'directive', 'module'],
      'javascript': ['javascript', 'js', 'function', 'async', 'promise', 'closure'],
      'typescript': ['typescript', 'ts', 'interface', 'type', 'generic'],
      'css': ['css', 'style', 'flexbox', 'grid', 'animation', 'responsive'],
      'html': ['html', 'element', 'attribute', 'semantic', 'form'],
      'node': ['node', 'nodejs', 'npm', 'module', 'server'],
      'webpack': ['webpack', 'bundle', 'loader', 'plugin'],
      'vite': ['vite', 'build', 'dev', 'hmr']
    };

    // 匹配技术关键词
    for (const [tech, keywords] of Object.entries(techKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.add(tech);
      }
    }

    // 从标题和标题中提取关键词
    const importantWords = this.extractKeywords(doc.title + ' ' + doc.headings.map(h => h.text).join(' '));
    importantWords.forEach(word => tags.add(word));

    // 从代码块中提取语言标签
    doc.codeBlocks.forEach(block => {
      if (block.language && block.language !== 'text') {
        tags.add(block.language);
      }
    });

    return Array.from(tags).slice(0, 10); // 限制标签数量
  }

  /**
   * 提取关键词
   */
  extractKeywords(text, maxKeywords = 5) {
    if (!text) return [];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word) &&
        !/^\d+$/.test(word)
      );

    // 计算词频
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // 按频率排序并返回前N个
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * 生成文档ID
   */
  generateId(title, url) {
    const cleanTitle = title.toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, '')
      .replace(/\s+/g, '-');
    
    const urlPart = url.split('/').pop()?.replace(/[^\w]/g, '') || '';
    
    return `${cleanTitle}-${urlPart}`.substring(0, 50);
  }

  /**
   * 计算内容质量评分
   */
  calculateQuality(doc) {
    let score = 0;

    // 内容长度评分 (0-30分)
    const contentLength = doc.content.length;
    if (contentLength > 500) score += 30;
    else if (contentLength > 200) score += 20;
    else if (contentLength > 100) score += 10;

    // 结构化程度评分 (0-25分)
    if (doc.headings.length > 0) score += 10;
    if (doc.headings.length > 2) score += 10;
    if (doc.codeBlocks.length > 0) score += 5;

    // 标题质量评分 (0-20分)
    if (doc.title && doc.title.length > 5) score += 10;
    if (doc.title && doc.title.length > 10) score += 10;

    // 标签丰富度评分 (0-15分)
    score += Math.min(doc.tags.length * 3, 15);

    // 链接数量评分 (0-10分)
    score += Math.min(doc.links.length * 2, 10);

    return Math.min(score, 100);
  }

  /**
   * 智能分割长文档
   */
  splitLongDocument(doc, maxLength = 2000) {
    if (doc.content.length <= maxLength) {
      return [doc];
    }

    const sections = [];
    const headings = doc.headings.sort((a, b) => a.level - b.level);
    
    if (headings.length === 0) {
      // 没有标题，按段落分割
      return this.splitByParagraphs(doc, maxLength);
    }

    // 按标题分割
    let currentSection = { ...doc };
    let currentContent = '';
    
    const contentParts = doc.content.split(/(?=\n[#]{1,6}\s)/);
    
    contentParts.forEach((part, index) => {
      if (currentContent.length + part.length > maxLength && currentContent) {
        // 保存当前段落
        sections.push({
          ...currentSection,
          content: currentContent.trim(),
          id: `${doc.id}-part-${sections.length + 1}`,
          summary: this.generateSummary(currentContent)
        });
        currentContent = part;
      } else {
        currentContent += (currentContent ? '\n' : '') + part;
      }
    });

    // 添加最后一个段落
    if (currentContent.trim()) {
      sections.push({
        ...currentSection,
        content: currentContent.trim(),
        id: `${doc.id}-part-${sections.length + 1}`,
        summary: this.generateSummary(currentContent)
      });
    }

    return sections.length > 0 ? sections : [doc];
  }

  /**
   * 按段落分割文档
   */
  splitByParagraphs(doc, maxLength) {
    const paragraphs = doc.content.split(/\n\s*\n/);
    const sections = [];
    let currentContent = '';

    paragraphs.forEach(paragraph => {
      if (currentContent.length + paragraph.length > maxLength && currentContent) {
        sections.push({
          ...doc,
          content: currentContent.trim(),
          id: `${doc.id}-part-${sections.length + 1}`,
          summary: this.generateSummary(currentContent)
        });
        currentContent = paragraph;
      } else {
        currentContent += (currentContent ? '\n\n' : '') + paragraph;
      }
    });

    if (currentContent.trim()) {
      sections.push({
        ...doc,
        content: currentContent.trim(),
        id: `${doc.id}-part-${sections.length + 1}`,
        summary: this.generateSummary(currentContent)
      });
    }

    return sections.length > 0 ? sections : [doc];
  }

  /**
   * 去重处理
   */
  deduplicateDocuments(docs, similarityThreshold = 0.8) {
    const unique = [];
    
    for (const doc of docs) {
      const isDuplicate = unique.some(existing => 
        this.calculateSimilarity(doc.content, existing.content) > similarityThreshold
      );
      
      if (!isDuplicate) {
        unique.push(doc);
      }
    }

    console.log(`🔄 去重完成: ${docs.length} -> ${unique.length}`);
    return unique;
  }

  /**
   * 计算文本相似度 (简单版本)
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

module.exports = ContentProcessor;

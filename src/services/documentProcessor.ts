import { Document } from '@/types';

export class DocumentProcessor {
  /**
   * 处理和增强文档数据
   */
  static processDocuments(rawDocuments: any[]): Document[] {
    return rawDocuments.map(doc => this.processDocument(doc));
  }

  /**
   * 处理单个文档
   */
  private static processDocument(rawDoc: any): Document {
    return {
      id: rawDoc.id,
      title: this.cleanText(rawDoc.title),
      category: rawDoc.category,
      content: this.enhanceContent(rawDoc.content),
      url: rawDoc.url,
      tags: this.processTags(rawDoc.tags || []),
      summary: this.generateSummary(rawDoc.content, rawDoc.summary)
    };
  }

  /**
   * 清理文本内容
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 增强文档内容
   */
  private static enhanceContent(content: string): string {
    // 添加更多上下文信息
    let enhanced = this.cleanText(content);
    
    // 添加常见的同义词和相关术语
    enhanced = this.addContextualTerms(enhanced);
    
    return enhanced;
  }

  /**
   * 添加上下文术语
   */
  private static addContextualTerms(content: string): string {
    const termMappings: { [key: string]: string[] } = {
      'React': ['React.js', 'ReactJS', '前端框架', '组件库'],
      'Vue': ['Vue.js', 'VueJS', '渐进式框架', '响应式'],
      'Angular': ['AngularJS', '企业级框架', 'TypeScript框架'],
      'JavaScript': ['JS', 'ECMAScript', '脚本语言', '动态语言'],
      'TypeScript': ['TS', '类型安全', '静态类型', '微软'],
      'CSS': ['样式表', '层叠样式表', '前端样式'],
      'HTML': ['超文本标记语言', '网页结构', '标记语言'],
      'Node.js': ['NodeJS', '服务端JavaScript', '后端JavaScript'],
      'Webpack': ['模块打包器', '构建工具', '前端工程化'],
      'Vite': ['构建工具', '开发服务器', '快速构建']
    };

    let enhanced = content;
    
    Object.entries(termMappings).forEach(([term, synonyms]) => {
      if (enhanced.includes(term)) {
        // 随机添加一些同义词，避免内容过长
        const selectedSynonyms = synonyms.slice(0, 2);
        enhanced += ` ${selectedSynonyms.join(' ')}`;
      }
    });

    return enhanced;
  }

  /**
   * 处理标签
   */
  private static processTags(tags: string[]): string[] {
    const processed = tags.map(tag => tag.toLowerCase().trim());
    
    // 添加自动生成的标签
    const autoTags = this.generateAutoTags(tags);
    
    return [...new Set([...processed, ...autoTags])];
  }

  /**
   * 自动生成相关标签
   */
  private static generateAutoTags(existingTags: string[]): string[] {
    const autoTags: string[] = [];
    
    // 基于现有标签生成相关标签
    const tagRelations: { [key: string]: string[] } = {
      'react': ['jsx', 'virtual-dom', 'component'],
      'vue': ['template', 'directive', 'single-file-component'],
      'angular': ['component', 'service', 'module'],
      'javascript': ['es6', 'es2015', 'browser'],
      'typescript': ['types', 'interfaces', 'compiler'],
      'css': ['styles', 'layout', 'design'],
      'html': ['markup', 'semantic', 'accessibility'],
      'hooks': ['functional-component', 'state-management'],
      'async': ['promise', 'callback', 'event-loop'],
      'performance': ['optimization', 'speed', 'efficiency']
    };

    existingTags.forEach(tag => {
      const related = tagRelations[tag.toLowerCase()];
      if (related) {
        autoTags.push(...related);
      }
    });

    return autoTags;
  }

  /**
   * 生成文档摘要
   */
  private static generateSummary(content: string, existingSummary?: string): string {
    if (existingSummary) {
      return existingSummary;
    }

    // 简单的摘要生成：取前两句话
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 2).join('。');
    
    return summary.length > 150 ? summary.substring(0, 147) + '...' : summary + '。';
  }

  /**
   * 验证文档数据完整性
   */
  static validateDocument(doc: Document): boolean {
    const required = ['id', 'title', 'category', 'content', 'url'];
    return required.every(field => doc[field as keyof Document] && 
      String(doc[field as keyof Document]).trim().length > 0);
  }

  /**
   * 按分类统计文档
   */
  static getDocumentStats(documents: Document[]): { [category: string]: number } {
    const stats: { [category: string]: number } = {};
    
    documents.forEach(doc => {
      stats[doc.category] = (stats[doc.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * 搜索建议生成
   */
  static generateSearchSuggestions(documents: Document[]): string[] {
    const suggestions = new Set<string>();
    
    documents.forEach(doc => {
      // 添加标题作为建议
      suggestions.add(doc.title);
      
      // 添加标签组合作为建议
      doc.tags.forEach(tag => {
        suggestions.add(`${doc.category} ${tag}`);
        suggestions.add(`如何使用 ${tag}`);
        suggestions.add(`${tag} 教程`);
      });
    });

    return Array.from(suggestions).slice(0, 50); // 限制建议数量
  }
}

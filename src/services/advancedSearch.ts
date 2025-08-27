import { Document, SearchResult } from '@/types';
import { 
  SearchConfig, 
  SearchMode, 
  SortBy, 
  AdvancedSearchOptions, 
  SearchMetadata,
  SearchCache,
  SpellCheckConfig
} from './searchConfig';

export class AdvancedSearchService {
  private searchCache: Map<string, SearchCache> = new Map();
  private searchAnalytics: any[] = [];

  /**
   * 执行高级搜索
   */
  async performAdvancedSearch(
    query: string,
    documents: Document[],
    semanticSearchFn: (query: string, docs: Document[]) => Promise<SearchResult[]>,
    keywordSearchFn: (query: string, docs: Document[]) => SearchResult[],
    options: AdvancedSearchOptions = {}
  ): Promise<{ results: SearchResult[]; metadata: SearchMetadata }> {
    const startTime = performance.now();
    
    // 设置默认选项
    const {
      mode = SearchMode.HYBRID,
      sortBy = SortBy.RELEVANCE,
      filters = {},
      enableHighlight = true,
      includeMetadata = true
    } = options;

    // 检查缓存
    const cacheKey = this.generateCacheKey(query, filters);
    if (SearchConfig.semantic.enableCache && this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < SearchConfig.semantic.cacheExpiry) {
        return { results: cached.results, metadata: cached.metadata };
      }
    }

    // 应用过滤器
    const filteredDocuments = this.applyFilters(documents, filters);

    // 拼写检查和查询优化
    const optimizedQuery = this.optimizeQuery(query);

    // 执行搜索
    let results: SearchResult[] = [];
    let semanticResults: SearchResult[] = [];
    let keywordResults: SearchResult[] = [];

    switch (mode) {
      case SearchMode.SEMANTIC:
        semanticResults = await semanticSearchFn(optimizedQuery, filteredDocuments);
        results = semanticResults;
        break;
      
      case SearchMode.KEYWORD:
        keywordResults = keywordSearchFn(optimizedQuery, filteredDocuments);
        results = keywordResults;
        break;
      
      case SearchMode.FUZZY:
        keywordResults = this.performFuzzySearch(optimizedQuery, filteredDocuments);
        results = keywordResults;
        break;
      
      case SearchMode.EXACT:
        results = this.performExactSearch(optimizedQuery, filteredDocuments);
        break;
      
      case SearchMode.HYBRID:
      default:
        semanticResults = await semanticSearchFn(optimizedQuery, filteredDocuments);
        keywordResults = keywordSearchFn(optimizedQuery, filteredDocuments);
        results = this.combineResults(semanticResults, keywordResults);
        break;
    }

    // 应用排序
    results = this.sortResults(results, sortBy, optimizedQuery);

    // 应用高亮
    if (enableHighlight) {
      results = this.applyHighlighting(results, optimizedQuery);
    }

    // 限制结果数量
    if (filters.maxResults) {
      results = results.slice(0, filters.maxResults);
    }

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // 创建元数据
    const metadata: SearchMetadata = {
      searchTime,
      totalResults: results.length,
      semanticResults: semanticResults.length,
      keywordResults: keywordResults.length,
      query: optimizedQuery,
      mode,
      filters
    };

    // 缓存结果
    if (SearchConfig.semantic.enableCache) {
      this.searchCache.set(cacheKey, {
        query: optimizedQuery,
        category: filters.categories?.[0] || 'all',
        results,
        timestamp: Date.now(),
        metadata
      });
    }

    // 记录分析数据
    this.recordAnalytics(optimizedQuery, results, searchTime);

    return { results, metadata };
  }

  /**
   * 应用过滤器
   */
  private applyFilters(documents: Document[], filters: any): Document[] {
    let filtered = documents;

    // 分类过滤
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(doc => filters.categories.includes(doc.category));
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        filters.tags.some((tag: string) => doc.tags.includes(tag))
      );
    }

    // 分数过滤
    if (filters.minScore !== undefined) {
      filtered = filtered.filter(doc => {
        // 这里需要在实际搜索后应用，暂时保留所有文档
        return true;
      });
    }

    return filtered;
  }

  /**
   * 查询优化
   */
  private optimizeQuery(query: string): string {
    let optimized = query.trim().toLowerCase();

    // 拼写检查
    if (SpellCheckConfig.enabled) {
      optimized = this.performSpellCheck(optimized);
    }

    // 移除停用词（简单实现）
    const stopWords = ['的', '是', '在', '有', '和', '与', '或', '但', '如何', '什么', '怎么'];
    const words = optimized.split(/\s+/);
    const filteredWords = words.filter(word => !stopWords.includes(word));
    
    return filteredWords.join(' ');
  }

  /**
   * 拼写检查
   */
  private performSpellCheck(query: string): string {
    const words = query.split(/\s+/);
    const correctedWords = words.map(word => {
      // 检查常见拼写错误
      for (const [correct, misspellings] of Object.entries(SpellCheckConfig.commonMisspellings)) {
        if (misspellings.includes(word)) {
          return correct;
        }
      }
      return word;
    });

    return correctedWords.join(' ');
  }

  /**
   * 模糊搜索
   */
  private performFuzzySearch(query: string, documents: Document[]): SearchResult[] {
    const results: SearchResult[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    documents.forEach(doc => {
      const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
      let score = 0;
      let matchCount = 0;

      queryWords.forEach(word => {
        if (docText.includes(word)) {
          score += 1;
          matchCount++;
        } else {
          // 模糊匹配
          const fuzzyScore = this.calculateFuzzyScore(word, docText);
          if (fuzzyScore > 0.7) {
            score += fuzzyScore;
            matchCount++;
          }
        }
      });

      if (matchCount > 0) {
        const finalScore = score / queryWords.length;
        if (finalScore > 0.3) {
          results.push({
            document: doc,
            score: finalScore,
            highlights: this.extractHighlights(doc, query)
          });
        }
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 精确搜索
   */
  private performExactSearch(query: string, documents: Document[]): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    documents.forEach(doc => {
      const docText = `${doc.title} ${doc.content}`.toLowerCase();
      
      if (docText.includes(lowerQuery)) {
        // 计算精确匹配分数
        const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
        const score = titleMatch ? 1.0 : 0.8;

        results.push({
          document: doc,
          score,
          highlights: this.extractHighlights(doc, query)
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 计算模糊匹配分数
   */
  private calculateFuzzyScore(word: string, text: string): number {
    // 简单的编辑距离算法
    const words = text.split(/\s+/);
    let maxScore = 0;

    words.forEach(textWord => {
      const score = this.levenshteinSimilarity(word, textWord);
      maxScore = Math.max(maxScore, score);
    });

    return maxScore;
  }

  /**
   * 计算编辑距离相似度
   */
  private levenshteinSimilarity(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * 合并搜索结果
   */
  private combineResults(semanticResults: SearchResult[], keywordResults: SearchResult[]): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // 添加语义搜索结果
    semanticResults.forEach(result => {
      resultMap.set(result.document.id, {
        ...result,
        score: result.score * SearchConfig.semantic.weight
      });
    });

    // 合并关键词搜索结果
    keywordResults.forEach(result => {
      const existing = resultMap.get(result.document.id);
      if (existing) {
        existing.score += result.score * SearchConfig.keyword.weight;
        if (result.highlights) {
          existing.highlights = [...(existing.highlights || []), ...result.highlights];
        }
      } else {
        resultMap.set(result.document.id, {
          ...result,
          score: result.score * SearchConfig.keyword.weight
        });
      }
    });

    return Array.from(resultMap.values());
  }

  /**
   * 排序结果
   */
  private sortResults(results: SearchResult[], sortBy: SortBy, query: string): SearchResult[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case SortBy.TITLE:
          return a.document.title.localeCompare(b.document.title);
        
        case SortBy.CATEGORY:
          return a.document.category.localeCompare(b.document.category);
        
        case SortBy.RELEVANCE:
        default:
          // 应用排序加权
          let scoreA = a.score;
          let scoreB = b.score;

          // 标题匹配加权
          if (a.document.title.toLowerCase().includes(query.toLowerCase())) {
            scoreA *= SearchConfig.ranking.titleBoost;
          }
          if (b.document.title.toLowerCase().includes(query.toLowerCase())) {
            scoreB *= SearchConfig.ranking.titleBoost;
          }

          return scoreB - scoreA;
      }
    });
  }

  /**
   * 应用高亮
   */
  private applyHighlighting(results: SearchResult[], query: string): SearchResult[] {
    return results.map(result => ({
      ...result,
      highlights: this.extractHighlights(result.document, query)
    }));
  }

  /**
   * 提取高亮片段
   */
  private extractHighlights(document: Document, query: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentences = document.content.split(/[.!?]+/);

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (queryWords.some(word => lowerSentence.includes(word))) {
        highlights.push(sentence.trim());
      }
    });

    return highlights.slice(0, SearchConfig.highlighting.maxHighlights);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(query: string, filters: any): string {
    return `${query}_${JSON.stringify(filters)}`;
  }

  /**
   * 记录分析数据
   */
  private recordAnalytics(query: string, results: SearchResult[], searchTime: number): void {
    if (SearchConfig.ux.enableAnalytics) {
      this.searchAnalytics.push({
        query,
        resultCount: results.length,
        searchTime,
        timestamp: new Date()
      });

      // 保持分析数据在合理范围内
      if (this.searchAnalytics.length > 1000) {
        this.searchAnalytics = this.searchAnalytics.slice(-500);
      }
    }
  }

  /**
   * 获取搜索分析数据
   */
  getAnalytics() {
    return this.searchAnalytics;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.searchCache.size,
      entries: Array.from(this.searchCache.keys())
    };
  }
}

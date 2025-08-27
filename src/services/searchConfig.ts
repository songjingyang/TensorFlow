// 搜索引擎配置
export const SearchConfig = {
  // 语义搜索配置
  semantic: {
    threshold: 0.3,           // 相似度阈值
    weight: 0.7,              // 语义搜索权重
    maxResults: 50,           // 最大结果数
    enableCache: true,        // 启用缓存
    cacheExpiry: 300000,      // 缓存过期时间（5分钟）
  },

  // 关键词搜索配置
  keyword: {
    threshold: 0.3,           // Fuse.js 阈值
    weight: 0.3,              // 关键词搜索权重
    minMatchCharLength: 2,    // 最小匹配字符长度
    includeMatches: true,     // 包含匹配信息
    includeScore: true,       // 包含分数
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'content', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'summary', weight: 0.1 }
    ]
  },

  // 结果排序配置
  ranking: {
    titleBoost: 1.5,          // 标题匹配加权
    exactMatchBoost: 2.0,     // 精确匹配加权
    recentBoost: 1.2,         // 最近文档加权
    popularityBoost: 1.3,     // 热门文档加权
    categoryMatchBoost: 1.1,  // 分类匹配加权
  },

  // 搜索建议配置
  suggestions: {
    maxSuggestions: 8,        // 最大建议数
    minQueryLength: 2,        // 最小查询长度
    debounceDelay: 300,       // 防抖延迟（毫秒）
    enableAutoComplete: true, // 启用自动完成
    enableSpellCheck: true,   // 启用拼写检查
  },

  // 高亮配置
  highlighting: {
    maxHighlights: 3,         // 最大高亮片段数
    highlightLength: 150,     // 高亮片段长度
    contextPadding: 20,       // 上下文填充
    highlightTag: 'mark',     // 高亮标签
    highlightClass: 'search-highlight', // 高亮CSS类
  },

  // 性能配置
  performance: {
    maxConcurrentSearches: 3, // 最大并发搜索数
    searchTimeout: 5000,      // 搜索超时（毫秒）
    enableWorker: false,      // 启用Web Worker（暂不支持）
    batchSize: 100,           // 批处理大小
  },

  // 用户体验配置
  ux: {
    showSearchTime: true,     // 显示搜索时间
    showResultCount: true,    // 显示结果数量
    enableSearchHistory: true, // 启用搜索历史
    maxHistoryItems: 50,      // 最大历史记录数
    enableAnalytics: true,    // 启用分析
  }
};

// 搜索模式枚举
export enum SearchMode {
  SEMANTIC = 'semantic',     // 仅语义搜索
  KEYWORD = 'keyword',       // 仅关键词搜索
  HYBRID = 'hybrid',         // 混合搜索（默认）
  FUZZY = 'fuzzy',          // 模糊搜索
  EXACT = 'exact'           // 精确搜索
}

// 排序方式枚举
export enum SortBy {
  RELEVANCE = 'relevance',   // 相关性（默认）
  DATE = 'date',            // 日期
  TITLE = 'title',          // 标题
  CATEGORY = 'category',    // 分类
  POPULARITY = 'popularity' // 热门度
}

// 搜索过滤器接口
export interface SearchFilters {
  categories?: string[];     // 分类过滤
  tags?: string[];          // 标签过滤
  dateRange?: {             // 日期范围
    start?: Date;
    end?: Date;
  };
  minScore?: number;        // 最小分数
  maxResults?: number;      // 最大结果数
}

// 高级搜索选项接口
export interface AdvancedSearchOptions {
  mode?: SearchMode;        // 搜索模式
  sortBy?: SortBy;         // 排序方式
  filters?: SearchFilters;  // 过滤器
  enableHighlight?: boolean; // 启用高亮
  enableSuggestions?: boolean; // 启用建议
  includeMetadata?: boolean; // 包含元数据
}

// 搜索结果元数据接口
export interface SearchMetadata {
  searchTime: number;       // 搜索耗时
  totalResults: number;     // 总结果数
  semanticResults: number;  // 语义搜索结果数
  keywordResults: number;   // 关键词搜索结果数
  query: string;           // 查询词
  mode: SearchMode;        // 搜索模式
  filters: SearchFilters;  // 应用的过滤器
}

// 搜索缓存接口
export interface SearchCache {
  query: string;
  category: string;
  results: any[];
  timestamp: number;
  metadata: SearchMetadata;
}

// 搜索分析数据接口
export interface SearchAnalytics {
  query: string;
  category: string;
  resultCount: number;
  clickedResults: string[]; // 点击的文档ID
  searchTime: number;
  timestamp: Date;
  userAgent?: string;
}

// 拼写检查配置
export const SpellCheckConfig = {
  enabled: true,
  maxSuggestions: 3,
  minSimilarity: 0.7,
  commonMisspellings: {
    'react': ['raect', 'recat', 'reactt'],
    'javascript': ['javascrip', 'javscript', 'javasript'],
    'typescript': ['typescrip', 'typscript', 'typescipt'],
    'angular': ['angualr', 'anglar', 'angulr'],
    'vue': ['veu', 'vu', 'vuee'],
    'css': ['cs', 'ccs'],
    'html': ['htm', 'htlm'],
    'webpack': ['webpac', 'webpak', 'webpackk'],
    'vite': ['vit', 'vitee'],
    'nodejs': ['node', 'nodjs', 'nodejs']
  }
};

// 搜索快捷键配置
export const SearchShortcuts = {
  focusSearch: 'Ctrl+K',    // 聚焦搜索框
  clearSearch: 'Escape',    // 清空搜索
  nextResult: 'ArrowDown',  // 下一个结果
  prevResult: 'ArrowUp',    // 上一个结果
  selectResult: 'Enter',    // 选择结果
  openInNewTab: 'Ctrl+Enter' // 新标签页打开
};

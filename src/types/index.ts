// 文档接口定义
export interface Document {
  id: string;
  title: string;
  category: string;
  content: string;
  url: string;
  tags: string[];
  embedding?: number[];
  summary?: string;
}

// 搜索结果接口
export interface SearchResult {
  document: Document;
  score: number;
  highlights?: string[];
}

// 搜索选项接口
export interface SearchOptions {
  category?: string;
  limit?: number;
  threshold?: number;
}

// 文档类别枚举
export enum DocumentCategory {
  REACT = 'React',
  VUE = 'Vue',
  ANGULAR = 'Angular',
  JAVASCRIPT = 'JavaScript',
  TYPESCRIPT = 'TypeScript',
  CSS = 'CSS',
  HTML = 'HTML',
  NODEJS = 'Node.js',
  WEBPACK = 'Webpack',
  VITE = 'Vite',
  ALL = 'all'
}

// 搜索引擎状态
export interface SearchEngineState {
  isInitialized: boolean;
  isLoading: boolean;
  error?: string;
}

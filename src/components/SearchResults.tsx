"use client";

import { SearchResult } from "@/types";
import DocumentCard from "./DocumentCard";
import "@/styles/scrollbar.css";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  metadata?: {
    searchTime: number;
    totalResults: number;
    semanticResults: number;
    keywordResults: number;
    query: string;
    mode: string;
  };
  isSearching?: boolean; // 新增：搜索加载状态
  onLoadMore?: () => void; // 加载更多回调
  hasMore?: boolean; // 是否还有更多结果
  isLoadingMore?: boolean; // 是否正在加载更多
}

export default function SearchResults({
  results,
  query,
  metadata,
  isSearching = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: SearchResultsProps) {
  // 搜索加载状态
  if (isSearching) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">正在搜索</h3>
            <p className="text-gray-600">正在为您查找相关文档...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始搜索</h3>
            <p className="text-gray-600">输入关键词搜索前端技术文档</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A6.002 6.002 0 003 9a6.002 6.002 0 006-6h6a6.002 6.002 0 006 6 6.002 6.002 0 00-6 8.5V17z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              未找到相关结果
            </h3>
            <p className="text-gray-600">尝试使用不同的关键词或检查拼写</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 固定的结果统计信息 */}
      <div className="flex-shrink-0 mb-4 pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          找到{" "}
          <span className="font-medium text-gray-900">{results.length}</span>{" "}
          个相关结果
          {query && (
            <>
              ，关键词：
              <span className="font-medium text-gray-900">"{query}"</span>
            </>
          )}
        </p>
      </div>

      {/* 可滚动的搜索结果区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar search-results-container pr-2 -mr-2">
        <div className="space-y-4 pb-4">
          {results.map((result, index) => (
            <div key={result.document.id} className="search-result-item">
              <DocumentCard
                document={result.document}
                score={result.score}
                highlights={result.highlights}
                query={query}
                rank={index + 1}
              />
            </div>
          ))}
        </div>

        {/* 加载更多按钮 */}
        {hasMore && onLoadMore && (
          <div className="mt-8 text-center pb-4">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isLoadingMore
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  加载中...
                </div>
              ) : (
                "加载更多结果"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

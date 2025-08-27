"use client";

import { SearchResult } from "@/types";
import DocumentCard from "./DocumentCard";

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
}

export default function SearchResults({
  results,
  query,
  metadata,
}: SearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
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
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
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
    );
  }

  return (
    <div>
      <div className="mb-4">
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

      <div className="space-y-4">
        {results.map((result, index) => (
          <DocumentCard
            key={result.document.id}
            document={result.document}
            score={result.score}
            highlights={result.highlights}
            query={query}
            rank={index + 1}
          />
        ))}
      </div>

      {results.length > 10 && (
        <div className="mt-8 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            加载更多结果
          </button>
        </div>
      )}
    </div>
  );
}

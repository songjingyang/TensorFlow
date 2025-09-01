"use client";

import { useState } from "react";
import { Document } from "@/types";
import {
  ArrowTopRightOnSquareIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ContentFetcher, FetchedContent } from "@/services/contentFetcher";
import RichTextRenderer from "./RichTextRenderer";

interface DocumentCardProps {
  document: Document;
  score: number;
  highlights?: string[];
  query: string;
  rank: number;
}

export default function DocumentCard({
  document,
  score,
  highlights,
  query,
  rank,
}: DocumentCardProps) {
  // 展开状态管理
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<FetchedContent | null>(
    null
  );
  const [isFetchingContent, setIsFetchingContent] = useState(false);

  const contentFetcher = ContentFetcher.getInstance();
  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      React: "bg-blue-100 text-blue-800",
      Vue: "bg-green-100 text-green-800",
      Angular: "bg-red-100 text-red-800",
      JavaScript: "bg-yellow-100 text-yellow-800",
      TypeScript: "bg-indigo-100 text-indigo-800",
      CSS: "bg-purple-100 text-purple-800",
      HTML: "bg-orange-100 text-orange-800",
      "Node.js": "bg-emerald-100 text-emerald-800",
      Webpack: "bg-cyan-100 text-cyan-800",
      Vite: "bg-violet-100 text-violet-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // 截取内容摘要
  const getContentSummary = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // 处理展开/收起
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 获取最新内容
  const handleFetchLatestContent = async () => {
    if (!contentFetcher.canFetchContent(document.url)) {
      alert("该链接不支持内容获取");
      return;
    }

    setIsFetchingContent(true);
    try {
      const content = await contentFetcher.fetchContent(document.url);
      setFetchedContent(content);
    } catch (error) {
      console.error("获取内容失败:", error);
    } finally {
      setIsFetchingContent(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {rank}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
              document.category
            )}`}
          >
            {document.category}
          </span>
          <span className="text-xs text-gray-500">
            相关度: {Math.round(score * 100)}%
          </span>
        </div>
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </a>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {highlightText(document.title, query)}
        </a>
      </h3>

      {/* 内容显示区域 - 使用富文本渲染器 */}
      <div className="mb-4">
        {isExpanded ? (
          <RichTextRenderer
            content={document.content}
            query={query}
            contentType="markdown"
            className="max-h-96 overflow-y-auto"
          />
        ) : (
          <p className="text-gray-600 leading-relaxed">
            {highlightText(getContentSummary(document.content), query)}
          </p>
        )}
      </div>

      {/* 展开/收起按钮 */}
      <div className="mb-4">
        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4" />
              收起内容
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4" />
              展开完整内容
            </>
          )}
        </button>
      </div>

      {/* 展开状态下的额外功能 */}
      {isExpanded && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">文档内容</h4>
            <button
              onClick={handleFetchLatestContent}
              disabled={isFetchingContent}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isFetchingContent
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isFetchingContent ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  获取中...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-3 w-3" />
                  获取最新内容
                </>
              )}
            </button>
          </div>

          {/* 显示获取的最新内容 */}
          {fetchedContent && (
            <div className="mt-3">
              {fetchedContent.success ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-600 font-medium">
                      ✓ 最新内容已获取
                    </span>
                    <span className="text-xs text-gray-500">
                      更新时间: {fetchedContent.lastUpdated.toLocaleString()}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto bg-white p-3 rounded border">
                    <RichTextRenderer
                      content={fetchedContent.content}
                      query={query}
                      contentType="html"
                      className="text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-600">
                  ✗ 获取失败: {fetchedContent.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 高亮片段 */}
      {highlights && highlights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">相关片段:</h4>
          <div className="space-y-1">
            {highlights.slice(0, 2).map((highlight, index) => (
              <p
                key={index}
                className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
              >
                ...{highlightText(highlight, query)}...
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 标签 */}
      {document.tags && document.tags.length > 0 && (
        <div className="flex items-center space-x-2">
          <TagIcon className="h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {document.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 5 && (
              <span className="text-xs text-gray-500">
                +{document.tags.length - 5} 更多
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

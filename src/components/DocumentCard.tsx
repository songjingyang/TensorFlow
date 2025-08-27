"use client";

import { Document } from "@/types";
import {
  ArrowTopRightOnSquareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

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

      <p className="text-gray-600 mb-4 leading-relaxed">
        {highlightText(getContentSummary(document.content), query)}
      </p>

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

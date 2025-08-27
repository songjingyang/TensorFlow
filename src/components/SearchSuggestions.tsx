"use client";

import { useState, useEffect } from "react";
import {
  ClockIcon,
  ArrowTrendingUpIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  popularSearches: { query: string; count: number }[];
  recentSearches: string[];
  onSuggestionClick: (suggestion: string) => void;
  onClearHistory?: () => void;
  isVisible: boolean;
}

export default function SearchSuggestions({
  query,
  suggestions,
  popularSearches,
  recentSearches,
  onSuggestionClick,
  onClearHistory,
  isVisible,
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, suggestions]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, selectedIndex, suggestions]);

  if (!isVisible) return null;

  const hasQuery = query.length > 0;
  const filteredSuggestions = hasQuery
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* 搜索建议 */}
      {hasQuery && filteredSuggestions.length > 0 && (
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
            搜索建议
          </div>
          {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => onSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedIndex === index
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <span className="truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 分隔线 */}
      {hasQuery &&
        filteredSuggestions.length > 0 &&
        (recentSearches.length > 0 || popularSearches.length > 0) && (
          <div className="border-t border-gray-100" />
        )}

      {/* 最近搜索 */}
      {!hasQuery && recentSearches.length > 0 && (
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <div className="text-xs font-medium text-gray-500 flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>最近搜索</span>
            </div>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                清除
              </button>
            )}
          </div>
          {recentSearches.slice(0, 5).map((search, index) => (
            <button
              key={`recent-${index}`}
              onClick={() => onSuggestionClick(search)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedIndex === index + filteredSuggestions.length
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="truncate">{search}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 热门搜索 */}
      {!hasQuery && popularSearches.length > 0 && (
        <div className="p-2">
          {recentSearches.length > 0 && (
            <div className="border-t border-gray-100 mb-2" />
          )}
          <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1 flex items-center space-x-1">
            <ArrowTrendingUpIcon className="h-3 w-3" />
            <span>热门搜索</span>
          </div>
          {popularSearches.slice(0, 5).map((item, index) => (
            <button
              key={`popular-${index}`}
              onClick={() => onSuggestionClick(item.query)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedIndex ===
                index + filteredSuggestions.length + recentSearches.length
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{item.query}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {item.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {hasQuery && filteredSuggestions.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          <div className="text-sm">没有找到相关建议</div>
          <div className="text-xs mt-1">尝试使用不同的关键词</div>
        </div>
      )}

      {/* 快捷键提示 */}
      <div className="border-t border-gray-100 p-2 bg-gray-50">
        <div className="text-xs text-gray-400 text-center">
          <span className="inline-flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs">
              ↑↓
            </kbd>
            <span>导航</span>
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs">
              Enter
            </kbd>
            <span>选择</span>
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs">
              Esc
            </kbd>
            <span>关闭</span>
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SearchSuggestions from "./SearchSuggestions";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  popularSearches?: { query: string; count: number }[];
  recentSearches?: string[];
  onGetSuggestions?: (query: string) => Promise<string[]>;
}

export default function SearchBox({
  onSearch,
  placeholder = "搜索前端技术文档...",
  suggestions = [],
  popularSearches = [],
  recentSearches = [],
  onGetSuggestions,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 获取动态建议
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2 && onGetSuggestions) {
        setIsLoading(true);
        try {
          const newSuggestions = await onGetSuggestions(query);
          setDynamicSuggestions(newSuggestions);
        } catch (error) {
          console.error("获取搜索建议失败:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDynamicSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, onGetSuggestions]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setShowSuggestions(
        value.length > 0 ||
          recentSearches.length > 0 ||
          popularSearches.length > 0
      );
    },
    [recentSearches.length, popularSearches.length]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
        setShowSuggestions(false);
      }
    },
    [query, onSearch]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      onSearch(suggestion);
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleClearHistory = useCallback(() => {
    // 这里可以添加清除历史记录的逻辑
    console.log("清除搜索历史");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, []);

  return (
    <div className="relative mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </form>

      {/* 搜索建议组件 */}
      <SearchSuggestions
        query={query}
        suggestions={[...suggestions, ...dynamicSuggestions]}
        popularSearches={popularSearches}
        recentSearches={recentSearches}
        onSuggestionClick={handleSuggestionClick}
        onClearHistory={handleClearHistory}
        isVisible={showSuggestions}
      />
    </div>
  );
}

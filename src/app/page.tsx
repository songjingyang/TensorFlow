"use client";

import { useState, useEffect } from "react";
import SearchBox from "@/components/SearchBox";
import SearchResults from "@/components/SearchResults";
import CategoryFilter from "@/components/CategoryFilter";
import SearchStats from "@/components/SearchStats";
import { SearchEngine } from "@/services/searchEngine";
import { DocumentLoader } from "@/services/documentLoader";
import { SearchMode } from "@/services/searchConfig";

export default function Home() {
  const [searchEngine, setSearchEngine] = useState<SearchEngine | null>(null);
  const [documentLoader, setDocumentLoader] = useState<DocumentLoader | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // 新增：搜索加载状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.HYBRID);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<
    { query: string; count: number }[]
  >([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // 初始化搜索引擎和文档数据
    const initializeApp = async () => {
      try {
        const loader = new DocumentLoader();
        await loader.loadDocuments();

        const engine = new SearchEngine();
        await engine.initialize(loader.getDocuments());

        setDocumentLoader(loader);
        setSearchEngine(engine);

        // 加载搜索历史和热门搜索
        const history = await engine.getSearchHistory(10);
        const popular = await engine.getPopularSearches(5);

        setRecentSearches(history.map((h) => h.query));
        setPopularSearches(popular);

        setIsLoading(false);
      } catch (error) {
        console.error("初始化失败:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSearch = async (query: string) => {
    if (!searchEngine || !query.trim()) {
      setSearchResults([]);
      setSearchMetadata(null);
      return;
    }

    setSearchQuery(query);
    setIsSearching(true); // 开始搜索，显示加载状态

    try {
      // 使用高级搜索
      const { results, metadata } = await searchEngine.advancedSearch(query, {
        mode: searchMode,
        filters: {
          categories:
            selectedCategory === "all" ? undefined : [selectedCategory],
          maxResults: 20,
        },
        enableHighlight: true,
        includeMetadata: true,
      });

      setSearchResults(results);
      setSearchMetadata(metadata);

      // 更新搜索历史
      if (!recentSearches.includes(query)) {
        setRecentSearches((prev) => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error("搜索失败:", error);
      setSearchResults([]);
      setSearchMetadata(null);
    } finally {
      setIsSearching(false); // 搜索完成，隐藏加载状态
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    if (searchQuery && searchEngine) {
      await handleSearch(searchQuery);
    }
  };

  const handleGetSuggestions = async (query: string): Promise<string[]> => {
    if (!searchEngine) return [];
    try {
      return await searchEngine.getSearchSuggestions(query, 8);
    } catch (error) {
      console.error("获取搜索建议失败:", error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化搜索引擎...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* 固定头部区域 */}
        <header className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            前端技术文档搜索
          </h1>
          <p className="text-gray-600">基于 TensorFlow.js 的智能语义搜索引擎</p>
        </header>

        <div className="max-w-6xl mx-auto flex-1 flex flex-col">
          {/* 固定搜索框区域 */}
          <div className="flex-shrink-0 mb-6">
            <SearchBox
              onSearch={handleSearch}
              suggestions={suggestions}
              popularSearches={popularSearches}
              recentSearches={recentSearches}
              onGetSuggestions={handleGetSuggestions}
              isSearching={isSearching}
            />
          </div>

          {/* 主要内容区域 - 可滚动 */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* 左侧边栏 - 固定高度 */}
            <div className="lg:w-1/4 flex-shrink-0">
              <div className="sticky top-0 space-y-4">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />

                {searchMetadata && (
                  <SearchStats
                    metadata={searchMetadata}
                    documentStats={documentLoader?.getDocumentStats()}
                  />
                )}
              </div>
            </div>

            {/* 右侧搜索结果区域 - 独立滚动 */}
            <div className="lg:w-3/4 flex-1 min-h-0">
              <div className="h-full">
                <SearchResults
                  results={searchResults}
                  query={searchQuery}
                  metadata={searchMetadata}
                  isSearching={isSearching}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

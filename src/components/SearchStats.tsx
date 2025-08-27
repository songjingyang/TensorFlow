'use client';

import { ClockIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SearchStatsProps {
  metadata?: {
    searchTime: number;
    totalResults: number;
    semanticResults: number;
    keywordResults: number;
    query: string;
    mode: string;
  };
  documentStats?: { [category: string]: number };
}

export default function SearchStats({ metadata, documentStats }: SearchStatsProps) {
  if (!metadata && !documentStats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
        <ChartBarIcon className="h-4 w-4 mr-2" />
        搜索统计
      </h3>

      {/* 搜索结果统计 */}
      {metadata && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">搜索耗时</span>
            <span className="font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {metadata.searchTime.toFixed(0)}ms
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">总结果数</span>
            <span className="font-medium text-gray-900">
              {metadata.totalResults} 个
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">语义搜索</span>
            <span className="font-medium text-blue-600">
              {metadata.semanticResults} 个
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">关键词搜索</span>
            <span className="font-medium text-green-600">
              {metadata.keywordResults} 个
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">搜索模式</span>
            <span className="font-medium text-gray-900 capitalize">
              {metadata.mode}
            </span>
          </div>
        </div>
      )}

      {/* 文档库统计 */}
      {documentStats && (
        <div>
          {metadata && <div className="border-t border-gray-100 pt-4" />}
          <h4 className="text-xs font-medium text-gray-700 mb-3 flex items-center">
            <DocumentTextIcon className="h-3 w-3 mr-1" />
            文档库统计
          </h4>
          
          <div className="space-y-2">
            {Object.entries(documentStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{category}</span>
                <div className="flex items-center">
                  <div 
                    className="h-2 bg-blue-200 rounded mr-2"
                    style={{ 
                      width: `${Math.max(20, (count / Math.max(...Object.values(documentStats))) * 60)}px` 
                    }}
                  >
                    <div 
                      className="h-full bg-blue-500 rounded"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(documentStats))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="font-medium text-gray-900 w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">总计</span>
              <span className="font-medium text-gray-900">
                {Object.values(documentStats).reduce((sum, count) => sum + count, 0)} 个文档
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 搜索提示 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div className="mb-1">💡 搜索技巧：</div>
          <ul className="space-y-1 text-xs">
            <li>• 使用具体的技术术语</li>
            <li>• 尝试不同的关键词组合</li>
            <li>• 利用分类筛选缩小范围</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

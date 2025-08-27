'use client';

import { DocumentCategory } from '@/types';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { value: DocumentCategory.ALL, label: '全部', color: 'bg-gray-100 text-gray-800' },
    { value: DocumentCategory.REACT, label: 'React', color: 'bg-blue-100 text-blue-800' },
    { value: DocumentCategory.VUE, label: 'Vue', color: 'bg-green-100 text-green-800' },
    { value: DocumentCategory.ANGULAR, label: 'Angular', color: 'bg-red-100 text-red-800' },
    { value: DocumentCategory.JAVASCRIPT, label: 'JavaScript', color: 'bg-yellow-100 text-yellow-800' },
    { value: DocumentCategory.TYPESCRIPT, label: 'TypeScript', color: 'bg-indigo-100 text-indigo-800' },
    { value: DocumentCategory.CSS, label: 'CSS', color: 'bg-purple-100 text-purple-800' },
    { value: DocumentCategory.HTML, label: 'HTML', color: 'bg-orange-100 text-orange-800' },
    { value: DocumentCategory.NODEJS, label: 'Node.js', color: 'bg-emerald-100 text-emerald-800' },
    { value: DocumentCategory.WEBPACK, label: 'Webpack', color: 'bg-cyan-100 text-cyan-800' },
    { value: DocumentCategory.VITE, label: 'Vite', color: 'bg-violet-100 text-violet-800' },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">技术分类</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.value
                ? 'ring-2 ring-blue-500 ring-offset-1 ' + category.color
                : category.color + ' hover:opacity-80'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

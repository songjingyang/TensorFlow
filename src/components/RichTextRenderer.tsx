"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface RichTextRendererProps {
  content: string;
  query?: string;
  contentType?: "markdown" | "html" | "text";
  className?: string;
}

export default function RichTextRenderer({
  content,
  query,
  contentType = "markdown",
  className = "",
}: RichTextRendererProps) {
  // 检测内容类型
  const detectedType = useMemo(() => {
    if (contentType !== "markdown") return contentType;
    
    // 简单的Markdown检测
    const markdownPatterns = [
      /^#{1,6}\s+/m, // 标题
      /^\*\s+/m,     // 无序列表
      /^\d+\.\s+/m,  // 有序列表
      /```[\s\S]*?```/m, // 代码块
      /`[^`]+`/,     // 行内代码
      /\*\*[^*]+\*\*/,   // 粗体
      /\*[^*]+\*/,   // 斜体
      /\[[^\]]+\]\([^)]+\)/, // 链接
    ];
    
    const hasMarkdown = markdownPatterns.some(pattern => pattern.test(content));
    return hasMarkdown ? "markdown" : "text";
  }, [content, contentType]);

  // 高亮搜索关键词的函数
  const highlightText = (text: string, searchQuery?: string) => {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // 处理内容高亮
  const processedContent = useMemo(() => {
    if (!query) return content;
    return highlightText(content, query);
  }, [content, query]);

  // 自定义组件
  const components = {
    // 代码块
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // 标题
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2">
        {children}
      </h4>
    ),
    
    // 段落
    p: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    
    // 列表
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-4">
        {children}
      </li>
    ),
    
    // 链接
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    
    // 引用
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    
    // 表格
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-300 px-4 py-2">
        {children}
      </td>
    ),
    
    // 强调
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">
        {children}
      </em>
    ),
    
    // 分割线
    hr: () => (
      <hr className="border-gray-300 my-6" />
    ),
  };

  // 根据内容类型渲染
  if (detectedType === "markdown") {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }

  if (detectedType === "html") {
    return (
      <div
        className={`prose prose-sm max-w-none text-gray-700 leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{
          __html: processedContent,
        }}
      />
    );
  }

  // 纯文本渲染（保持原有的高亮功能）
  return (
    <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${className}`}>
      {query ? (
        <span
          dangerouslySetInnerHTML={{
            __html: processedContent,
          }}
        />
      ) : (
        content
      )}
    </div>
  );
}

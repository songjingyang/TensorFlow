import { Document } from "@/types";
import { DocumentProcessor } from "./documentProcessor";
import { SupabaseService } from "./supabaseService";

export class DocumentLoader {
  private documents: Document[] = [];
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = new SupabaseService();
  }

  async loadDocuments(): Promise<void> {
    try {
      console.log("开始从Supabase加载文档数据...");

      // 检查Supabase配置
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error(
          "Supabase配置缺失。请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。"
        );
      }

      // 从Supabase加载文档
      const supabaseDocs = await this.supabaseService.getAllDocuments();

      if (supabaseDocs.length > 0) {
        console.log(`从Supabase成功加载了 ${supabaseDocs.length} 个文档`);
        this.documents = DocumentProcessor.processDocuments(supabaseDocs);
      } else {
        console.warn(
          "Supabase中没有找到文档数据。请运行数据导入脚本：npm run import-data"
        );
        this.documents = [];
      }
    } catch (error) {
      console.error("从Supabase加载文档失败:", error);
      throw new Error(
        `文档加载失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  getDocuments(): Document[] {
    return this.documents;
  }

  getDocumentStats(): { [category: string]: number } {
    return DocumentProcessor.getDocumentStats(this.documents);
  }

  getSearchSuggestions(): string[] {
    return DocumentProcessor.generateSearchSuggestions(this.documents);
  }

  getDocumentsByCategory(category: string): Document[] {
    if (category === "all") {
      return this.documents;
    }
    return this.documents.filter((doc) => doc.category === category);
  }
}

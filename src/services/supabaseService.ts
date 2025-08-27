import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document } from '@/types';

// Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// 数据库表结构接口
interface DocumentRow {
  id: string;
  title: string;
  category: string;
  content: string;
  url: string;
  tags: string[];
  summary?: string;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /**
   * 获取所有文档
   */
  async getAllDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取文档失败:', error);
        return [];
      }

      return this.transformRowsToDocuments(data || []);
    } catch (error) {
      console.error('获取文档异常:', error);
      return [];
    }
  }

  /**
   * 按分类获取文档
   */
  async getDocumentsByCategory(category: string): Promise<Document[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('按分类获取文档失败:', error);
        return [];
      }

      return this.transformRowsToDocuments(data || []);
    } catch (error) {
      console.error('按分类获取文档异常:', error);
      return [];
    }
  }

  /**
   * 搜索文档
   */
  async searchDocuments(query: string, category?: string): Promise<Document[]> {
    try {
      let queryBuilder = this.supabase
        .from('documents')
        .select('*');

      // 如果指定了分类，添加分类过滤
      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category);
      }

      // 使用全文搜索
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('搜索文档失败:', error);
        return [];
      }

      return this.transformRowsToDocuments(data || []);
    } catch (error) {
      console.error('搜索文档异常:', error);
      return [];
    }
  }

  /**
   * 获取文档统计信息
   */
  async getDocumentStats(): Promise<{ [category: string]: number }> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('category')
        .order('category');

      if (error) {
        console.error('获取文档统计失败:', error);
        return {};
      }

      const stats: { [category: string]: number } = {};
      data?.forEach(row => {
        stats[row.category] = (stats[row.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('获取文档统计异常:', error);
      return {};
    }
  }

  /**
   * 批量插入文档
   */
  async insertDocuments(documents: Document[]): Promise<boolean> {
    try {
      const rows = documents.map(doc => this.transformDocumentToRow(doc));
      
      const { error } = await this.supabase
        .from('documents')
        .insert(rows);

      if (error) {
        console.error('插入文档失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('插入文档异常:', error);
      return false;
    }
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .update(this.transformDocumentToRow(updates as Document))
        .eq('id', id);

      if (error) {
        console.error('更新文档失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('更新文档异常:', error);
      return false;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除文档失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除文档异常:', error);
      return false;
    }
  }

  /**
   * 检查数据库连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('数据库连接检查失败:', error);
      return false;
    }
  }

  /**
   * 初始化数据库表
   */
  async initializeDatabase(): Promise<boolean> {
    try {
      // 检查表是否存在，如果不存在则创建
      const { error } = await this.supabase.rpc('create_documents_table_if_not_exists');
      
      if (error) {
        console.error('初始化数据库失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('初始化数据库异常:', error);
      return false;
    }
  }

  /**
   * 转换数据库行为Document对象
   */
  private transformRowsToDocuments(rows: DocumentRow[]): Document[] {
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      url: row.url,
      tags: Array.isArray(row.tags) ? row.tags : [],
      summary: row.summary
    }));
  }

  /**
   * 转换Document对象为数据库行
   */
  private transformDocumentToRow(doc: Document): Partial<DocumentRow> {
    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      url: doc.url,
      tags: doc.tags,
      summary: doc.summary
    };
  }

  /**
   * 获取Supabase客户端实例
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

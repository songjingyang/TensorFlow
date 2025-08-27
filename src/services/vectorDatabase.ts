import Dexie, { Table } from 'dexie';
import { Document } from '@/types';

// 向量数据库条目接口
interface VectorEntry {
  id: string;
  documentId: string;
  embedding: number[];
  text: string;
  category: string;
  createdAt: Date;
}

// 搜索历史接口
interface SearchHistory {
  id?: number;
  query: string;
  category: string;
  timestamp: Date;
  resultCount: number;
}

// 用户偏好接口
interface UserPreference {
  id?: number;
  key: string;
  value: any;
  updatedAt: Date;
}

class VectorDatabase extends Dexie {
  vectors!: Table<VectorEntry>;
  searchHistory!: Table<SearchHistory>;
  preferences!: Table<UserPreference>;

  constructor() {
    super('FrontendDocsSearchDB');
    
    this.version(1).stores({
      vectors: 'id, documentId, category, createdAt',
      searchHistory: '++id, query, category, timestamp',
      preferences: '++id, key, updatedAt'
    });
  }
}

export class VectorDatabaseService {
  private db: VectorDatabase;

  constructor() {
    this.db = new VectorDatabase();
  }

  /**
   * 存储文档向量
   */
  async storeDocumentVectors(documents: Document[], embeddings: number[][]): Promise<void> {
    try {
      const vectorEntries: VectorEntry[] = documents.map((doc, index) => ({
        id: `vector_${doc.id}`,
        documentId: doc.id,
        embedding: embeddings[index] || [],
        text: `${doc.title} ${doc.content}`,
        category: doc.category,
        createdAt: new Date()
      }));

      await this.db.vectors.bulkPut(vectorEntries);
      console.log(`已存储 ${vectorEntries.length} 个文档向量`);
    } catch (error) {
      console.error('存储文档向量失败:', error);
      throw error;
    }
  }

  /**
   * 获取文档向量
   */
  async getDocumentVectors(documentIds?: string[]): Promise<VectorEntry[]> {
    try {
      if (documentIds) {
        const vectorIds = documentIds.map(id => `vector_${id}`);
        return await this.db.vectors.where('id').anyOf(vectorIds).toArray();
      }
      return await this.db.vectors.toArray();
    } catch (error) {
      console.error('获取文档向量失败:', error);
      return [];
    }
  }

  /**
   * 按分类获取向量
   */
  async getVectorsByCategory(category: string): Promise<VectorEntry[]> {
    try {
      if (category === 'all') {
        return await this.db.vectors.toArray();
      }
      return await this.db.vectors.where('category').equals(category).toArray();
    } catch (error) {
      console.error('按分类获取向量失败:', error);
      return [];
    }
  }

  /**
   * 删除文档向量
   */
  async deleteDocumentVectors(documentIds: string[]): Promise<void> {
    try {
      const vectorIds = documentIds.map(id => `vector_${id}`);
      await this.db.vectors.where('id').anyOf(vectorIds).delete();
    } catch (error) {
      console.error('删除文档向量失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有向量
   */
  async clearAllVectors(): Promise<void> {
    try {
      await this.db.vectors.clear();
      console.log('已清空所有向量数据');
    } catch (error) {
      console.error('清空向量失败:', error);
      throw error;
    }
  }

  /**
   * 记录搜索历史
   */
  async recordSearchHistory(query: string, category: string, resultCount: number): Promise<void> {
    try {
      await this.db.searchHistory.add({
        query,
        category,
        timestamp: new Date(),
        resultCount
      });

      // 保持搜索历史在合理范围内（最多100条）
      const count = await this.db.searchHistory.count();
      if (count > 100) {
        const oldestRecords = await this.db.searchHistory
          .orderBy('timestamp')
          .limit(count - 100)
          .toArray();
        
        const idsToDelete = oldestRecords.map(record => record.id!);
        await this.db.searchHistory.where('id').anyOf(idsToDelete).delete();
      }
    } catch (error) {
      console.error('记录搜索历史失败:', error);
    }
  }

  /**
   * 获取搜索历史
   */
  async getSearchHistory(limit: number = 20): Promise<SearchHistory[]> {
    try {
      return await this.db.searchHistory
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  /**
   * 获取热门搜索词
   */
  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    try {
      const history = await this.db.searchHistory.toArray();
      const queryCount: { [query: string]: number } = {};

      history.forEach(record => {
        queryCount[record.query] = (queryCount[record.query] || 0) + 1;
      });

      return Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('获取热门搜索失败:', error);
      return [];
    }
  }

  /**
   * 保存用户偏好
   */
  async savePreference(key: string, value: any): Promise<void> {
    try {
      const existing = await this.db.preferences.where('key').equals(key).first();
      
      if (existing) {
        await this.db.preferences.update(existing.id!, {
          value,
          updatedAt: new Date()
        });
      } else {
        await this.db.preferences.add({
          key,
          value,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('保存用户偏好失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户偏好
   */
  async getPreference(key: string, defaultValue?: any): Promise<any> {
    try {
      const preference = await this.db.preferences.where('key').equals(key).first();
      return preference ? preference.value : defaultValue;
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return defaultValue;
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<{
    vectorCount: number;
    searchHistoryCount: number;
    preferencesCount: number;
    categories: string[];
  }> {
    try {
      const [vectorCount, searchHistoryCount, preferencesCount, vectors] = await Promise.all([
        this.db.vectors.count(),
        this.db.searchHistory.count(),
        this.db.preferences.count(),
        this.db.vectors.toArray()
      ]);

      const categories = [...new Set(vectors.map(v => v.category))];

      return {
        vectorCount,
        searchHistoryCount,
        preferencesCount,
        categories
      };
    } catch (error) {
      console.error('获取数据库统计失败:', error);
      return {
        vectorCount: 0,
        searchHistoryCount: 0,
        preferencesCount: 0,
        categories: []
      };
    }
  }

  /**
   * 清理数据库
   */
  async cleanup(): Promise<void> {
    try {
      // 清理30天前的搜索历史
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await this.db.searchHistory
        .where('timestamp')
        .below(thirtyDaysAgo)
        .delete();

      console.log('数据库清理完成');
    } catch (error) {
      console.error('数据库清理失败:', error);
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}

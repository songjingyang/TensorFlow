import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import Fuse from "fuse.js";
import { Document, SearchResult, SearchOptions } from "@/types";
import { VectorDatabaseService } from "./vectorDatabase";
import { AdvancedSearchService } from "./advancedSearch";
import { AdvancedSearchOptions } from "./searchConfig";

export class SearchEngine {
  private model: use.UniversalSentenceEncoder | null = null;
  private documents: Document[] = [];
  private documentEmbeddings: tf.Tensor | null = null;
  private fuseIndex: Fuse<Document> | null = null;
  private vectorDB: VectorDatabaseService;
  private advancedSearchService: AdvancedSearchService;
  private isInitialized = false;

  constructor() {
    this.vectorDB = new VectorDatabaseService();
    this.advancedSearchService = new AdvancedSearchService();
  }

  async initialize(documents: Document[]): Promise<void> {
    try {
      console.log("正在初始化搜索引擎...");

      // 设置 TensorFlow.js 后端
      await tf.ready();
      console.log("TensorFlow.js 后端已就绪");

      // 加载 Universal Sentence Encoder 模型
      console.log("正在加载 Universal Sentence Encoder 模型...");
      this.model = await use.load();
      console.log("模型加载完成");

      // 存储文档
      this.documents = documents;

      // 生成文档嵌入向量
      await this.generateDocumentEmbeddings();

      // 存储向量到数据库
      await this.storeVectorsToDatabase();

      // 初始化 Fuse.js 用于关键词搜索
      this.initializeFuseSearch();

      this.isInitialized = true;
      console.log("搜索引擎初始化完成");
    } catch (error) {
      console.error("搜索引擎初始化失败:", error);
      throw error;
    }
  }

  private async generateDocumentEmbeddings(): Promise<void> {
    if (!this.model) {
      throw new Error("模型未加载");
    }

    console.log("正在生成文档嵌入向量...");

    // 为每个文档创建文本表示（标题 + 内容 + 标签）
    const documentTexts = this.documents.map((doc) => {
      const tagsText = doc.tags.join(" ");
      return `${doc.title} ${doc.content} ${tagsText}`;
    });

    // 生成嵌入向量
    this.documentEmbeddings = (await this.model.embed(
      documentTexts
    )) as unknown as tf.Tensor;
    console.log("文档嵌入向量生成完成");
  }

  private async storeVectorsToDatabase(): Promise<void> {
    if (!this.documentEmbeddings) {
      return;
    }

    try {
      // 将张量转换为数组
      const embeddingData =
        (await this.documentEmbeddings.array()) as number[][];

      // 存储到向量数据库
      await this.vectorDB.storeDocumentVectors(this.documents, embeddingData);
      console.log("向量已存储到数据库");
    } catch (error) {
      console.error("存储向量到数据库失败:", error);
    }
  }

  private initializeFuseSearch(): void {
    const fuseOptions = {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "content", weight: 0.3 },
        { name: "tags", weight: 0.2 },
        { name: "summary", weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    };

    this.fuseIndex = new Fuse(this.documents, fuseOptions);
    console.log("Fuse.js 搜索索引初始化完成");
  }

  async search(
    query: string,
    category: string = "all",
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    if (!this.isInitialized || !this.model || !this.documentEmbeddings) {
      throw new Error("搜索引擎未初始化");
    }

    const { limit = 10, threshold = 0.3 } = options;

    try {
      // 过滤文档（按分类）
      const filteredDocuments =
        category === "all"
          ? this.documents
          : this.documents.filter((doc) => doc.category === category);

      if (filteredDocuments.length === 0) {
        return [];
      }

      // 1. 语义搜索
      const semanticResults = await this.performSemanticSearch(
        query,
        filteredDocuments,
        threshold
      );

      // 2. 关键词搜索
      const keywordResults = this.performKeywordSearch(
        query,
        filteredDocuments
      );

      // 3. 合并和排序结果
      const combinedResults = this.combineSearchResults(
        semanticResults,
        keywordResults,
        limit
      );

      // 4. 记录搜索历史
      await this.vectorDB.recordSearchHistory(
        query,
        category,
        combinedResults.length
      );

      return combinedResults;
    } catch (error) {
      console.error("搜索失败:", error);
      throw error;
    }
  }

  /**
   * 高级搜索方法
   */
  async advancedSearch(
    query: string,
    options: AdvancedSearchOptions = {}
  ): Promise<{ results: SearchResult[]; metadata: unknown }> {
    if (!this.isInitialized || !this.model || !this.documentEmbeddings) {
      throw new Error("搜索引擎未初始化");
    }

    // 准备文档集合
    const documents = options.filters?.categories
      ? this.documents.filter((doc) =>
          options.filters!.categories!.includes(doc.category)
        )
      : this.documents;

    // 使用高级搜索服务
    return await this.advancedSearchService.performAdvancedSearch(
      query,
      documents,
      (q: string, docs: Document[]) => this.performSemanticSearch(q, docs, 0.3),
      (q: string, docs: Document[]) => this.performKeywordSearch(q, docs),
      options
    );
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 8
  ): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // 基于文档标题的建议
    this.documents.forEach((doc) => {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(doc.title);
      }

      // 基于标签的建议
      doc.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(`${doc.category} ${tag}`);
          suggestions.add(`如何使用 ${tag}`);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * 获取相关文档推荐
   */
  async getRelatedDocuments(
    documentId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    const targetDoc = this.documents.find((doc) => doc.id === documentId);
    if (!targetDoc) {
      return [];
    }

    // 使用文档标题和标签作为查询
    const query = `${targetDoc.title} ${targetDoc.tags.join(" ")}`;
    const results = await this.search(query, "all", { limit: limit + 1 });

    // 排除目标文档本身
    return results
      .filter((result) => result.document.id !== documentId)
      .slice(0, limit);
  }

  private async performSemanticSearch(
    query: string,
    documents: Document[],
    threshold: number
  ): Promise<SearchResult[]> {
    if (!this.model || !this.documentEmbeddings) {
      return [];
    }

    // 生成查询的嵌入向量
    const queryEmbedding = await this.model.embed([query]);

    // 计算余弦相似度
    const similarities = tf.matMul(
      queryEmbedding as unknown as tf.Tensor,
      this.documentEmbeddings as unknown as tf.Tensor,
      false,
      true
    );
    const similarityScores = await similarities.data();

    // 清理张量内存
    queryEmbedding.dispose();
    similarities.dispose();

    // 创建结果数组
    const results: SearchResult[] = [];

    for (let i = 0; i < documents.length; i++) {
      const score = similarityScores[i];
      if (score >= threshold) {
        results.push({
          document: documents[i],
          score: score,
          highlights: this.extractHighlights(documents[i], query),
        });
      }
    }

    // 按相似度排序
    return results.sort((a, b) => b.score - a.score);
  }

  private performKeywordSearch(
    query: string,
    _documents: Document[]
  ): SearchResult[] {
    if (!this.fuseIndex) {
      return [];
    }

    // 使用 Fuse.js 进行模糊搜索
    const fuseResults = this.fuseIndex.search(query);

    return fuseResults.map((result) => ({
      document: result.item,
      score: 1 - (result.score || 0), // Fuse.js 的分数越低越好，所以要反转
      highlights: this.extractHighlightsFromMatches([
        ...(result.matches || []),
      ]),
    }));
  }

  private combineSearchResults(
    semanticResults: SearchResult[],
    keywordResults: SearchResult[],
    limit: number
  ): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // 添加语义搜索结果（权重 0.7）
    semanticResults.forEach((result) => {
      resultMap.set(result.document.id, {
        ...result,
        score: result.score * 0.7,
      });
    });

    // 合并关键词搜索结果（权重 0.3）
    keywordResults.forEach((result) => {
      const existing = resultMap.get(result.document.id);
      if (existing) {
        // 如果已存在，合并分数
        existing.score = existing.score + result.score * 0.3;
        // 合并高亮
        if (result.highlights) {
          existing.highlights = [
            ...(existing.highlights || []),
            ...result.highlights,
          ];
        }
      } else {
        // 如果不存在，添加新结果
        resultMap.set(result.document.id, {
          ...result,
          score: result.score * 0.3,
        });
      }
    });

    // 转换为数组并排序
    const combinedResults = Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return combinedResults;
  }

  private extractHighlights(document: Document, query: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    // 在内容中查找包含查询词的句子
    const sentences = document.content.split(/[.!?]+/);

    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      if (queryWords.some((word) => lowerSentence.includes(word))) {
        highlights.push(sentence.trim());
      }
    });

    return highlights.slice(0, 3); // 最多返回3个高亮片段
  }

  private extractHighlightsFromMatches(matches: unknown[]): string[] {
    const highlights: string[] = [];

    matches.forEach((match) => {
      if (match && typeof match === "object" && "value" in match) {
        const matchObj = match as { value?: string };
        if (matchObj.value && typeof matchObj.value === "string") {
          highlights.push(matchObj.value);
        }
      }
    });

    return highlights.slice(0, 3);
  }

  async getSearchHistory(limit: number = 20) {
    return await this.vectorDB.getSearchHistory(limit);
  }

  async getPopularSearches(limit: number = 10) {
    return await this.vectorDB.getPopularSearches(limit);
  }

  async getDatabaseStats() {
    return await this.vectorDB.getStats();
  }

  async saveUserPreference(key: string, value: unknown) {
    return await this.vectorDB.savePreference(key, value);
  }

  async getUserPreference(key: string, defaultValue?: unknown) {
    return await this.vectorDB.getPreference(key, defaultValue);
  }

  dispose(): void {
    if (this.documentEmbeddings) {
      this.documentEmbeddings.dispose();
      this.documentEmbeddings = null;
    }
    this.model = null;
    this.fuseIndex = null;
    this.isInitialized = false;
  }
}

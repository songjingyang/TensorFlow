-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取文档
CREATE POLICY "Allow public read access" ON documents
    FOR SELECT USING (true);

-- 创建策略：允许所有人插入文档（用于初始化数据）
CREATE POLICY "Allow public insert access" ON documents
    FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人更新文档
CREATE POLICY "Allow public update access" ON documents
    FOR UPDATE USING (true);

-- 创建策略：允许所有人删除文档
CREATE POLICY "Allow public delete access" ON documents
    FOR DELETE USING (true);

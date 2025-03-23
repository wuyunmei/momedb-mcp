# MemoDB MCP Server

MCP 服务器，用于管理 AI 应用的对话上下文和个人知识库。该服务器通过模型上下文协议(MCP)提供用户数据、对话内容和知识管理的工具。

## 主要功能

### 1. 用户管理
- `create_user`: 创建新用户
- `get_user`: 获取用户信息
- `update_user`: 更新用户信息
- `delete_user`: 删除用户

### 2. 对话数据管理
- `insert_blob`: 插入对话数据
- `get_blob`: 获取对话数据
- `delete_blob`: 删除对话数据

### 3. 知识库管理
- `query_knowledge`: 查询知识库
  * 支持全文搜索
  * 支持按类型、标签、来源过滤
  * 支持限制返回结果数量
- `add_knowledge`: 添加新知识
  * 支持设置知识来源
  * 支持设置知识类型
  * 支持添加标签
- `update_knowledge`: 更新已有知识
  * 支持更新内容和元数据
  * 支持修改标签
- `relate_knowledge`: 创建知识关联
  * 支持设置关联类型
  * 支持设置关联权重

## 技术亮点

1. **类型安全**
   - 使用 TypeScript 实现
   - 完整的类型定义和检查
   - 编译时错误检测

2. **错误处理**
   - 全面的错误处理机制
   - 详细的错误信息
   - 错误日志记录

3. **API 设计**
   - 基于 JSON-RPC 2.0 协议
   - RESTful API 风格
   - 清晰的接口定义

4. **可扩展性**
   - 模块化设计
   - 插件式工具注册
   - 易于添加新功能

## 安装和配置

1. 安装依赖:
```bash
npm install
```

2. 配置环境变量:
创建 `.env` 文件并设置:
```env
MEMOBASE_API_URL=your_api_url    # API 服务器地址
MEMOBASE_API_KEY=your_api_key    # API 访问密钥
```

3. 构建项目:
```bash
npm run build
```

4. 运行服务器:
```bash
# 生产环境
npm start

# 开发环境
npm run dev
```

## API 示例

### 1. 添加知识
```typescript
const result = await callTool('add_knowledge', {
  uid: 'user123',
  content: '人工智能是计算机科学的一个分支...',
  metadata: {
    source: 'wiki',
    type: 'article',
    tags: ['AI', '计算机科学', '技术']
  }
});
```

### 2. 查询知识
```typescript
const result = await callTool('query_knowledge', {
  uid: 'user123',
  query: '人工智能',
  filters: {
    types: ['article'],
    tags: ['AI'],
    sources: ['wiki']
  },
  limit: 10
});
```

### 3. 关联知识
```typescript
const result = await callTool('relate_knowledge', {
  uid: 'user123',
  source_kid: 'knowledge1',
  target_kid: 'knowledge2',
  relation_type: 'related_to',
  weight: 0.8
});
```

## 开发指南

1. **添加新工具**
   - 在 `src/tools` 目录下创建工具实现
   - 在 `src/api/types.ts` 添加类型定义
   - 在 `src/index.ts` 注册工具

2. **修改配置**
   - 编辑 `src/config.ts` 更新配置项
   - 在 `.env` 文件中添加新的环境变量

3. **运行测试**
```bash
npm test
```

## 常见问题

如果您在使用过程中遇到问题，请参考 [常见问题与解决方案](docs/TROUBLESHOOTING.md) 文档。

## 许可证

MIT

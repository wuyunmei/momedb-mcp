# 常见问题与解决方案

## 开发环境问题

### 1. TypeScript ESM 模块加载错误

**问题描述**:
运行 `npm run dev` 时出现错误:
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /path/to/src/index.ts
```

**解决方案**:
1. 确保 tsconfig.json 配置正确:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "build",
    "rootDir": "src"
  }
}
```

2. 在 package.json 中正确配置:
```json
{
  "type": "module",
  "scripts": {
    "dev": "NODE_OPTIONS='--loader ts-node/esm' ts-node-esm src/index.ts"
  }
}
```

### 2. 环境变量配置

**问题描述**:
API 请求失败，提示未授权或找不到服务器。

**解决方案**:
1. 确保设置了必要的环境变量:
```bash
MEMOBASE_API_URL=your_api_url
MEMOBASE_API_KEY=your_api_key
```

2. 可以通过以下方式设置:
   - 创建 .env 文件
   - 在命令行中设置
   - 在 Docker 环境中设置

### 3. 文件权限问题

**问题描述**:
运行 `npm start` 时提示没有执行权限。

**解决方案**:
1. 确保构建脚本包含权限设置:
```json
{
  "scripts": {
    "build": "tsc && chmod +x build/index.js"
  }
}
```

2. 手动设置权限:
```bash
chmod +x build/index.js
```

## API 使用问题

### 1. 知识库查询返回空结果

**问题描述**:
使用 query_knowledge 工具时没有返回预期的结果。

**解决方案**:
1. 检查查询参数:
```typescript
const result = await callTool('query_knowledge', {
  uid: 'user123',
  query: '查询关键词',
  filters: {
    // 避免设置过多限制条件
    types: ['article'],
    tags: ['AI']
  },
  // 适当增加限制数量
  limit: 20
});
```

2. 确保已经添加了知识数据
3. 检查过滤条件是否过于严格

### 2. 知识关联创建失败

**问题描述**:
使用 relate_knowledge 工具时出现错误。

**解决方案**:
1. 确保源知识和目标知识都存在
2. 检查权重值是否在有效范围内(0-1)
3. 使用正确的关系类型

## 部署问题

### 1. Docker 部署

**问题描述**:
Docker 容器启动失败。

**解决方案**:
1. 确保 Dockerfile 正确配置:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

2. 正确设置环境变量:
```bash
docker run -e MEMOBASE_API_URL=url -e MEMOBASE_API_KEY=key momedb-mcp
```

### 2. 生产环境日志

**问题描述**:
生产环境中难以追踪问题。

**解决方案**:
1. 使用环境变量控制日志级别
2. 配置日志输出格式
3. 考虑使用日志收集服务

## 性能优化

### 1. 大量知识查询性能问题

**问题描述**:
知识库查询响应时间过长。

**解决方案**:
1. 合理使用查询限制:
```typescript
{
  limit: 10,  // 限制返回结果数量
  filters: {  // 使用精确的过滤条件
    types: ['article'],
    tags: ['重要']
  }
}
```

2. 考虑实现缓存机制
3. 优化数据库索引

### 2. 内存使用优化

**问题描述**:
服务器内存使用过高。

**解决方案**:
1. 实现流式处理大型响应
2. 及时清理不需要的数据
3. 监控内存使用情况

## 最佳实践

1. 开发环境:
   - 使用 .env.example 提供环境变量示例
   - 使用 nodemon 实现开发环境热重载
   - 保持依赖包更新

2. 错误处理:
   - 实现全局错误处理
   - 提供有意义的错误消息
   - 记录详细的错误日志

3. 测试:
   - 编写单元测试
   - 进行集成测试
   - 进行负载测试

4. 监控:
   - 实现健康检查
   - 监控 API 响应时间
   - 监控错误率和系统资源
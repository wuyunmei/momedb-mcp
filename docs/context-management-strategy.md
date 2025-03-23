# 上下文管理与知识检索策略

本文档是对AI个人私域知识赋能方案的补充，重点关注如何确保用户请求能先从私域知识库中检索信息作为上下文，同时保证上下文不会过大，以及如何适时压缩和修正用户信息。

## 1. 知识检索优先级设计

### 1.1 检索流程优化

为确保用户请求优先从私域知识库中检索信息，我们设计以下检索流程：

1. **用户请求预处理**
   - 对用户输入进行意图识别
   - 提取关键实体和概念
   - 生成检索查询

2. **分层检索策略**
   - **第一层**：私域知识库优先检索
     - 个人文档
     - 个人笔记
     - 历史对话
     - 用户自定义知识
   - **第二层**：如私域知识不足，再检索公共知识库
     - 通用知识库
     - 专业领域知识库
     - 最新信息源

3. **检索结果合并**
   - 私域知识优先排序
   - 相关性加权
   - 时间衰减因子（新信息权重更高）

### 1.2 私域知识优先机制

```typescript
// 检索优先级实现示例
async function retrieveKnowledge(query: string, context: Context): Promise<KnowledgeResult[]> {
  // 1. 分析查询
  const queryAnalysis = await analyzeQuery(query, context);
  
  // 2. 私域知识检索
  const privateResults = await retrievePrivateKnowledge(
    queryAnalysis,
    context.userId,
    {
      maxResults: 10,
      minRelevance: 0.7,
      includeMetadata: true
    }
  );
  
  // 3. 判断私域知识是否足够
  const isPrivateKnowledgeSufficient = evaluateKnowledgeSufficiency(
    privateResults,
    queryAnalysis,
    {
      minResultCount: 3,
      minCoverageScore: 0.8,
      minConfidenceScore: 0.75
    }
  );
  
  // 4. 如果私域知识不足，再检索公共知识
  let publicResults: KnowledgeResult[] = [];
  if (!isPrivateKnowledgeSufficient) {
    publicResults = await retrievePublicKnowledge(
      queryAnalysis,
      {
        maxResults: 5,
        minRelevance: 0.75,
        domains: queryAnalysis.relevantDomains
      }
    );
  }
  
  // 5. 合并结果并排序
  return mergeAndRankResults(privateResults, publicResults, queryAnalysis);
}
```

## 2. 上下文大小控制策略

### 2.1 上下文预算管理

为确保上下文不会过大，我们实施上下文预算管理机制：

1. **上下文预算分配**
   - 总预算：设定总token数限制（如4000 tokens）
   - 分配比例：
     - 对话历史：30%
     - 私域知识：50%
     - 系统指令：15%
     - 预留空间：5%

2. **动态预算调整**
   - 根据对话复杂度调整分配
   - 根据知识相关性调整分配
   - 根据用户偏好调整分配

3. **预算监控与控制**
   - 实时token计数
   - 超出预警机制
   - 自动裁剪策略

### 2.2 上下文预算实现

```typescript
// 上下文预算管理实现示例
class ContextBudgetManager {
  private totalBudget: number;
  private allocations: Record<string, number>;
  private usage: Record<string, number>;
  
  constructor(totalBudget: number = 4000) {
    this.totalBudget = totalBudget;
    this.allocations = {
      conversationHistory: Math.floor(totalBudget * 0.3),
      privateKnowledge: Math.floor(totalBudget * 0.5),
      systemInstructions: Math.floor(totalBudget * 0.15),
      reserved: Math.floor(totalBudget * 0.05)
    };
    this.usage = {
      conversationHistory: 0,
      privateKnowledge: 0,
      systemInstructions: 0,
      reserved: 0
    };
  }
  
  // 检查是否有足够预算
  canAddToContext(section: string, tokenCount: number): boolean {
    return this.usage[section] + tokenCount <= this.allocations[section];
  }
  
  // 添加内容到上下文
  addToContext(section: string, content: string, tokenCount?: number): boolean {
    const tokens = tokenCount || this.estimateTokens(content);
    if (!this.canAddToContext(section, tokens)) {
      return false;
    }
    
    this.usage[section] += tokens;
    return true;
  }
  
  // 动态调整预算分配
  reallocateBudget(newAllocations: Partial<Record<string, number>>): void {
    // 验证新分配总和不超过总预算
    let totalAllocation = 0;
    for (const section in {...this.allocations, ...newAllocations}) {
      totalAllocation += (newAllocations[section] !== undefined) 
        ? newAllocations[section] 
        : this.allocations[section];
    }
    
    if (totalAllocation > this.totalBudget) {
      throw new Error('Budget reallocation exceeds total budget');
    }
    
    // 应用新分配
    this.allocations = {...this.allocations, ...newAllocations};
  }
  
  // 估算文本的token数量
  private estimateTokens(text: string): number {
    // 简单估算：英文约为单词数的1.3倍，中文约为字符数的1.5倍
    // 实际应用中应使用更精确的tokenizer
    const wordCount = text.split(/\s+/).length;
    const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishCharCount = text.length - chineseCharCount;
    
    return Math.ceil(wordCount * 1.3 + chineseCharCount * 1.5);
  }
  
  // 获取当前使用情况
  getUsage(): Record<string, {used: number, total: number, percentage: number}> {
    const result: Record<string, {used: number, total: number, percentage: number}> = {};
    
    for (const section in this.allocations) {
      result[section] = {
        used: this.usage[section],
        total: this.allocations[section],
        percentage: Math.round((this.usage[section] / this.allocations[section]) * 100)
      };
    }
    
    return result;
  }
  
  // 获取剩余总预算
  getRemainingBudget(): number {
    let totalUsed = 0;
    for (const section in this.usage) {
      totalUsed += this.usage[section];
    }
    return this.totalBudget - totalUsed;
  }
}
```

## 3. 信息压缩与修正策略

### 3.1 知识压缩技术

为了在有限的上下文空间中包含更多相关信息，我们采用以下压缩技术：

1. **摘要生成**
   - 提取式摘要：选择最重要的句子
   - 生成式摘要：重新生成简洁的摘要
   - 多级摘要：根据重要性分层摘要

2. **信息浓缩**
   - 删除冗余信息
   - 合并相似内容
   - 提取核心观点
   - 简化表达方式

3. **结构化压缩**
   - 转换为结构化格式（如JSON）
   - 使用缩写和符号
   - 采用列表而非段落
   - 去除修饰性语言

### 3.2 动态压缩级别

根据上下文预算和信息重要性，实施动态压缩：

| 压缩级别 | 压缩率 | 应用场景 | 技术方法 |
|---------|-------|---------|---------|
| 轻度压缩 | 20-30% | 预算充足，信息高度相关 | 删除冗余，简化表达 |
| 中度压缩 | 40-60% | 预算有限，信息较相关 | 提取式摘要，结构化转换 |
| 重度压缩 | 70-80% | 预算紧张，信息次要 | 生成式摘要，核心观点提取 |
| 极度压缩 | 90%+ | 预算极限，信息辅助 | 关键词提取，元数据保留 |

### 3.3 压缩实现示例

```typescript
// 动态压缩实现示例
async function compressKnowledge(
  knowledge: KnowledgeItem[],
  compressionConfig: CompressionConfig
): Promise<KnowledgeItem[]> {
  // 1. 计算总token数
  const totalTokens = knowledge.reduce((sum, item) => 
    sum + estimateTokens(item.content), 0);
  
  // 2. 确定需要的压缩率
  const targetTokens = compressionConfig.targetTokens;
  const requiredCompressionRate = Math.max(0, 1 - (targetTokens / totalTokens));
  
  // 3. 根据压缩率选择压缩策略
  let compressionStrategy: CompressionStrategy;
  
  if (requiredCompressionRate < 0.3) {
    compressionStrategy = new LightCompressionStrategy();
  } else if (requiredCompressionRate < 0.6) {
    compressionStrategy = new MediumCompressionStrategy();
  } else if (requiredCompressionRate < 0.8) {
    compressionStrategy = new HeavyCompressionStrategy();
  } else {
    compressionStrategy = new ExtremeCompressionStrategy();
  }
  
  // 4. 应用压缩策略
  const compressedKnowledge = await Promise.all(
    knowledge.map(async item => {
      // 根据项目重要性决定是否压缩
      if (item.importance >= compressionConfig.preserveThreshold) {
        // 高重要性项目保持原样或轻度压缩
        return requiredCompressionRate > 0.5 
          ? await compressionStrategy.compressLightly(item)
          : item;
      } else {
        // 低重要性项目进行完全压缩
        return await compressionStrategy.compress(item);
      }
    })
  );
  
  // 5. 如果压缩后仍超出目标，进行选择性删除
  let resultKnowledge = [...compressedKnowledge];
  if (getTotalTokens(resultKnowledge) > targetTokens) {
    // 按重要性排序
    resultKnowledge.sort((a, b) => b.importance - a.importance);
    
    // 保留最重要的项目直到达到目标token数
    let currentTokens = 0;
    resultKnowledge = resultKnowledge.filter(item => {
      const itemTokens = estimateTokens(item.content);
      if (currentTokens + itemTokens <= targetTokens) {
        currentTokens += itemTokens;
        return true;
      }
      return false;
    });
  }
  
  return resultKnowledge;
}
```

### 3.4 信息修正机制

除了压缩，我们还需要对信息进行修正，确保其准确性和时效性：

1. **事实更新**
   - 检测过时信息
   - 更新为最新事实
   - 标记更新时间

2. **矛盾解决**
   - 检测知识库中的矛盾
   - 基于可信度和时间选择正确信息
   - 标记不确定性

3. **上下文适应**
   - 根据当前对话调整表述
   - 增加上下文相关的连接词
   - 调整专业术语的使用

## 4. 上下文动态调整机制

### 4.1 上下文滑动窗口

实现上下文滑动窗口机制，动态调整上下文内容：

1. **窗口设计**
   - 固定窗口：保持最近N轮对话
   - 重要性窗口：保留重要对话，删除次要对话
   - 混合窗口：结合时间和重要性

2. **窗口调整触发条件**
   - 上下文接近预算上限（如达到85%）
   - 对话主题发生显著变化
   - 用户明确指示（如"让我们谈新话题"）

3. **窗口内容选择策略**
   - 保留最近的用户输入
   - 保留包含关键决策的对话
   - 保留与当前主题相关的知识
   - 压缩或删除次要信息

### 4.2 上下文重构

当上下文需要大幅调整时，执行上下文重构：

1. **重构触发条件**
   - 上下文超出预算
   - 对话主题完全转换
   - 长时间对话后的优化

2. **重构步骤**
   - 提取对话关键信息
   - 生成对话摘要
   - 重新检索相关知识
   - 构建新的精简上下文

3. **重构实现**

```typescript
// 上下文重构实现示例
async function reconstructContext(
  currentContext: Context,
  newQuery: string
): Promise<Context> {
  // 1. 分析当前上下文和新查询
  const contextAnalysis = await analyzeContext(currentContext);
  const queryAnalysis = await analyzeQuery(newQuery);
  
  // 2. 判断是否需要完全重构
  const needsFullReconstruction = determineIfNeedsReconstruction(
    contextAnalysis,
    queryAnalysis,
    currentContext.tokenCount
  );
  
  if (needsFullReconstruction) {
    // 3. 生成对话摘要
    const conversationSummary = await summarizeConversation(
      currentContext.conversationHistory,
      {
        maxTokens: Math.floor(currentContext.budgetManager.getAllocation('conversationHistory') * 0.3),
        focusOnTopics: queryAnalysis.relevantTopics
      }
    );
    
    // 4. 提取关键用户信息
    const keyUserInfo = extractKeyUserInfo(
      currentContext.userProfile,
      queryAnalysis.relevantAspects
    );
    
    // 5. 重新检索知识
    const freshKnowledge = await retrieveKnowledge(
      newQuery,
      {
        userId: currentContext.userId,
        previousTopics: contextAnalysis.topics,
        newTopics: queryAnalysis.topics
      }
    );
    
    // 6. 构建新上下文
    return {
      ...currentContext,
      conversationHistory: [
        { role: 'system', content: 'Previous conversation summary: ' + conversationSummary },
        { role: 'system', content: 'Key user information: ' + JSON.stringify(keyUserInfo) },
        { role: 'user', content: newQuery }
      ],
      knowledgeContext: await compressKnowledge(
        freshKnowledge,
        {
          targetTokens: currentContext.budgetManager.getAllocation('privateKnowledge'),
          preserveThreshold: 0.8
        }
      ),
      tokenCount: calculateTokenCount(/* new context */),
      lastReconstructionTime: Date.now()
    };
  } else {
    // 7. 增量更新上下文
    return await incrementallyUpdateContext(currentContext, newQuery, queryAnalysis);
  }
}
```

### 4.3 渐进式信息加载

为避免一次性加载过多信息，实现渐进式信息加载机制：

1. **初始上下文最小化**
   - 仅加载最基本的用户信息
   - 仅加载最相关的知识
   - 保持系统指令简洁

2. **按需加载策略**
   - 根据对话进展动态加载更多信息
   - 当AI表示信息不足时加载相关知识
   - 用户请求详细信息时深入检索

3. **信息缓存机制**
   - 缓存近期使用的知识
   - 预加载可能需要的相关知识
   - 定期刷新缓存内容

## 5. 实现路径与集成方案

### 5.1 与现有系统集成

将上述上下文管理策略集成到AI个人私域知识赋能方案中：

1. **知识检索层扩展**
   - 添加优先级管理模块
   - 实现分层检索策略
   - 集成相关性评分系统

2. **AI交互层增强**
   - 集成上下文预算管理器
   - 添加信息压缩模块
   - 实现上下文动态调整机制

3. **MCP工具扩展**
   - 添加上下文管理相关工具
   - 实现知识压缩工具
   - 开发上下文监控工具

### 5.2 实现阶段

1. **阶段一：基础上下文管理（1个月）**
   - 实现基本的上下文预算管理
   - 开发简单的信息压缩功能
   - 集成私域知识优先检索

2. **阶段二：高级上下文优化（1-2个月）**
   - 实现动态压缩策略
   - 开发上下文滑动窗口
   - 集成信息修正机制

3. **阶段三：智能上下文管理（2-3个月）**
   - 实现上下文重构
   - 开发渐进式信息加载
   - 集成自适应预算分配

### 5.3 评估与优化

1. **评估指标**
   - 上下文利用率：有效信息占比
   - 知识覆盖率：相关知识包含比例
   - 响应质量：基于上下文的回答准确性
   - 系统性能：处理时间和资源消耗

2. **持续优化**
   - 基于用户反馈调整压缩策略
   - 优化检索优先级算法
   - 改进上下文重构触发条件
   - 调整预算分配比例

## 6. 结论

通过实施本文档中描述的上下文管理与知识检索策略，我们可以确保：

1. 用户请求优先从私域知识库中检索信息作为上下文
2. 上下文大小保持在合理范围内，不会过大
3. 用户信息能够适时进行压缩和修正
4. 系统能够根据对话动态调整上下文内容

这些策略将显著提升AI对个人私域知识的利用效率，使AI能够在有限的上下文窗口中提供更加个性化、准确的服务。
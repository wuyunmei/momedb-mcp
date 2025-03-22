# 使用指南

本文档提供了MemoBase MCP服务器的使用指南，介绍如何使用提供的工具来管理AI应用的对话上下文。

## 可用工具

MemoBase MCP服务器提供了以下工具：

### 用户管理工具

#### create_user

创建新用户。

**参数：**

```json
{
  "data": {
    "ANY": "userName"
  }
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>create_user</tool_name>
<arguments>
{
  "data": {
    "ANY": "userName"
  }
}
</arguments>
</use_mcp_tool>
```

#### get_user

获取用户信息。

**参数：**

```json
{
  "uid": "user-id"
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>get_user</tool_name>
<arguments>
{
  "uid": "user-id"
}
</arguments>
</use_mcp_tool>
```

#### update_user

更新用户信息。

**参数：**

```json
{
  "uid": "user-id",
  "data": {
    "ANY": "newUserName"
  }
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>update_user</tool_name>
<arguments>
{
  "uid": "user-id",
  "data": {
    "ANY": "newUserName"
  }
}
</arguments>
</use_mcp_tool>
```

#### delete_user

删除用户。

**参数：**

```json
{
  "uid": "user-id"
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>delete_user</tool_name>
<arguments>
{
  "uid": "user-id"
}
</arguments>
</use_mcp_tool>
```

### 数据管理工具

#### insert_blob

插入对话数据。

**参数：**

```json
{
  "uid": "user-id",
  "blob_type": "chat",
  "blob_data": {
    "messages": [
      {
        "role": "user",
        "content": "Hi, I'm here again"
      },
      {
        "role": "assistant",
        "content": "Hi, Gus! How can I help you?",
        "alias": "Character"
      }
    ]
  }
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>insert_blob</tool_name>
<arguments>
{
  "uid": "user-id",
  "blob_type": "chat",
  "blob_data": {
    "messages": [
      {
        "role": "user",
        "content": "Hi, I'm here again"
      },
      {
        "role": "assistant",
        "content": "Hi, Gus! How can I help you?",
        "alias": "Character"
      }
    ]
  }
}
</arguments>
</use_mcp_tool>
```

#### get_blob

获取对话数据。

**参数：**

```json
{
  "uid": "user-id",
  "bid": "blob-id"
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>get_blob</tool_name>
<arguments>
{
  "uid": "user-id",
  "bid": "blob-id"
}
</arguments>
</use_mcp_tool>
```

#### delete_blob

删除对话数据。

**参数：**

```json
{
  "uid": "user-id",
  "bid": "blob-id"
}
```

**示例：**

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>delete_blob</tool_name>
<arguments>
{
  "uid": "user-id",
  "bid": "blob-id"
}
</arguments>
</use_mcp_tool>
```

## 错误处理

MemoBase MCP服务器会返回以下错误代码：

- `InvalidParams`：参数无效
- `NotFound`：资源不存在
- `Unauthorized`：未授权
- `InternalError`：内部错误

每个错误都会包含一个描述性的错误消息，帮助你理解问题所在。

## 示例工作流

### 创建用户并存储对话

1. 创建用户

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>create_user</tool_name>
<arguments>
{
  "data": {
    "ANY": "John"
  }
}
</arguments>
</use_mcp_tool>
```

2. 使用返回的用户ID插入对话数据

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>insert_blob</tool_name>
<arguments>
{
  "uid": "user-id-from-step-1",
  "blob_type": "chat",
  "blob_data": {
    "messages": [
      {
        "role": "user",
        "content": "Tell me about AI"
      },
      {
        "role": "assistant",
        "content": "AI, or artificial intelligence, refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.",
        "alias": "Assistant"
      }
    ]
  }
}
</arguments>
</use_mcp_tool>
```

3. 使用返回的Blob ID获取对话数据

```
<use_mcp_tool>
<server_name>memobase</server_name>
<tool_name>get_blob</tool_name>
<arguments>
{
  "uid": "user-id-from-step-1",
  "bid": "blob-id-from-step-2"
}
</arguments>
</use_mcp_tool>
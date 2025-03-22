# 安装和配置指南

本文档提供了MemoBase MCP服务器的安装和配置指南。

## 前提条件

- Node.js 18.x 或更高版本
- npm 或 yarn
- MemoBase API密钥

## 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/momedb-mcp.git
cd momedb-mcp
```

2. 安装依赖

```bash
npm install
# 或者
yarn install
```

3. 构建项目

```bash
npm run build
# 或者
yarn build
```

## 配置

MemoBase MCP服务器需要以下环境变量：

- `MEMOBASE_API_KEY`：MemoBase API密钥
- `MEMOBASE_API_URL`（可选）：MemoBase API的基础URL，默认为 `https://api.memobase.dev`

### 设置环境变量

#### 在Linux/macOS上

```bash
export MEMOBASE_API_KEY="your-api-key"
export MEMOBASE_API_URL="https://api.memobase.dev"  # 可选
```

#### 在Windows上

```cmd
set MEMOBASE_API_KEY=your-api-key
set MEMOBASE_API_URL=https://api.memobase.dev  # 可选
```

### 使用.env文件

你也可以创建一个`.env`文件来设置环境变量：

```
MEMOBASE_API_KEY=your-api-key
MEMOBASE_API_URL=https://api.memobase.dev  # 可选
```

## 配置MCP设置

要将MemoBase MCP服务器添加到Cline，你需要编辑MCP设置文件。

### 在macOS上

编辑文件：`~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "memobase": {
      "command": "node",
      "args": ["/path/to/momedb-mcp/build/index.js"],
      "env": {
        "MEMOBASE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 在Windows上

编辑文件：`%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "memobase": {
      "command": "node",
      "args": ["C:\\path\\to\\momedb-mcp\\build\\index.js"],
      "env": {
        "MEMOBASE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 验证安装

安装完成后，你可以通过以下命令验证MCP服务器是否正常工作：

```bash
node build/index.js
```

如果一切正常，你应该会看到类似以下的输出：

```
MemoBase MCP服务器正在运行...
```

现在，你可以在Cline中使用MemoBase MCP服务器提供的工具了。
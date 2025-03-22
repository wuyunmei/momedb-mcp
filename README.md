# MemoDB MCP Server

MCP server for managing AI application conversation context. This server provides tools for managing user data and conversation blobs through the Model Context Protocol (MCP).

## Features

- User management (create, read, update, delete)
- Conversation blob storage
- JSON-RPC based MCP interface
- TypeScript implementation with full type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
Create a `.env` file with:
```
API_BASE_URL=your_api_url
```

3. Build:
```bash
npm run build
```

4. Run:
```bash
npm start
```

## Available Tools

### User Management
- `create_user`: Create a new user
- `get_user`: Get user information
- `update_user`: Update user information
- `delete_user`: Delete a user

### Blob Management
- `insert_blob`: Insert conversation data
- `get_blob`: Get conversation data
- `delete_blob`: Delete conversation data

## Development

```bash
npm run dev
```

## License

MIT

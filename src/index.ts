#!/usr/bin/env node
import { Server, StdioServerTransport } from './mcp/server.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from './mcp/types.js';
import * as userTools from './tools/user.js';
import * as blobTools from './tools/blob.js';
import { 
  User, 
  Blob, 
  CreateBlobRequest, 
  GetBlobRequest, 
  DeleteBlobRequest 
} from './api/types.js';

class MemobaseMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'momedb-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_user',
          description: 'Create a new user',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'User name' },
            },
            required: ['name'],
          },
        },
        {
          name: 'get_user',
          description: 'Get user information',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
            },
            required: ['uid'],
          },
        },
        {
          name: 'update_user',
          description: 'Update user information',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              name: { type: 'string', description: 'New user name' },
            },
            required: ['uid', 'name'],
          },
        },
        {
          name: 'delete_user',
          description: 'Delete a user',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
            },
            required: ['uid'],
          },
        },
        {
          name: 'insert_blob',
          description: 'Insert conversation data',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              blob_type: { type: 'string', description: 'Type of blob (e.g., "chat")' },
              blob_data: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant'] },
                        content: { type: 'string' },
                        alias: { type: 'string' },
                      },
                      required: ['role', 'content'],
                    },
                  },
                },
                required: ['messages'],
              },
            },
            required: ['uid', 'blob_type', 'blob_data'],
          },
        },
        {
          name: 'get_blob',
          description: 'Get conversation data',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              bid: { type: 'string', description: 'Blob ID' },
            },
            required: ['uid', 'bid'],
          },
        },
        {
          name: 'delete_blob',
          description: 'Delete conversation data',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              bid: { type: 'string', description: 'Blob ID' },
            },
            required: ['uid', 'bid'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        let result;
        switch (request.params.name) {
          case 'create_user':
            result = await userTools.createUser(request.params.arguments as { name: string });
            break;
          case 'get_user':
            result = await userTools.getUser(request.params.arguments as { uid: string });
            break;
          case 'update_user':
            result = await userTools.updateUser(request.params.arguments as { uid: string; name: string });
            break;
          case 'delete_user':
            result = await userTools.deleteUser(request.params.arguments as { uid: string });
            break;
          case 'insert_blob':
            result = await blobTools.insertBlob(request.params.arguments as CreateBlobRequest);
            break;
          case 'get_blob':
            result = await blobTools.getBlob(request.params.arguments as GetBlobRequest);
            break;
          case 'delete_blob':
            result = await blobTools.deleteBlob(request.params.arguments as DeleteBlobRequest);
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Memobase MCP server running on stdio');
  }
}

const server = new MemobaseMcpServer();
server.run().catch(console.error);

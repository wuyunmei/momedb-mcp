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
import * as knowledgeTools from './tools/knowledge.js';
import {
  User,
  Blob,
  Knowledge,
  KnowledgeRelation,
  CreateBlobRequest,
  GetBlobRequest,
  DeleteBlobRequest,
  QueryKnowledgeRequest,
  AddKnowledgeRequest,
  UpdateKnowledgeRequest,
  RelateKnowledgeRequest
} from './api/types.js';

class MemobaseMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'memobase',
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
        {
          name: 'query_knowledge',
          description: 'Query knowledge base',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              query: { type: 'string', description: 'Search query' },
              filters: {
                type: 'object',
                properties: {
                  types: { type: 'array', items: { type: 'string' }, description: 'Knowledge types to filter' },
                  tags: { type: 'array', items: { type: 'string' }, description: 'Tags to filter' },
                  sources: { type: 'array', items: { type: 'string' }, description: 'Sources to filter' },
                },
              },
              limit: { type: 'number', description: 'Maximum number of results' },
            },
            required: ['uid', 'query'],
          },
        },
        {
          name: 'add_knowledge',
          description: 'Add new knowledge',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              content: { type: 'string', description: 'Knowledge content' },
              metadata: {
                type: 'object',
                properties: {
                  source: { type: 'string', description: 'Knowledge source' },
                  type: { type: 'string', description: 'Knowledge type' },
                  tags: { type: 'array', items: { type: 'string' }, description: 'Knowledge tags' },
                },
                required: ['source', 'type', 'tags'],
              },
            },
            required: ['uid', 'content', 'metadata'],
          },
        },
        {
          name: 'update_knowledge',
          description: 'Update existing knowledge',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              kid: { type: 'string', description: 'Knowledge ID' },
              content: { type: 'string', description: 'New content' },
              metadata: {
                type: 'object',
                properties: {
                  source: { type: 'string', description: 'Knowledge source' },
                  type: { type: 'string', description: 'Knowledge type' },
                  tags: { type: 'array', items: { type: 'string' }, description: 'Knowledge tags' },
                },
              },
            },
            required: ['uid', 'kid'],
          },
        },
        {
          name: 'relate_knowledge',
          description: 'Create relation between knowledge items',
          inputSchema: {
            type: 'object',
            properties: {
              uid: { type: 'string', description: 'User ID' },
              source_kid: { type: 'string', description: 'Source knowledge ID' },
              target_kid: { type: 'string', description: 'Target knowledge ID' },
              relation_type: { type: 'string', description: 'Type of relation' },
              weight: { type: 'number', description: 'Relation weight (0-1)' },
            },
            required: ['uid', 'source_kid', 'target_kid', 'relation_type', 'weight'],
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
          case 'query_knowledge':
            result = await knowledgeTools.queryKnowledge(request.params.arguments as QueryKnowledgeRequest);
            break;
          case 'add_knowledge':
            result = await knowledgeTools.addKnowledge(request.params.arguments as AddKnowledgeRequest);
            break;
          case 'update_knowledge':
            result = await knowledgeTools.updateKnowledge(request.params.arguments as UpdateKnowledgeRequest);
            break;
          case 'relate_knowledge':
            result = await knowledgeTools.relateKnowledge(request.params.arguments as RelateKnowledgeRequest);
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

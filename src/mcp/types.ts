export enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
}

export class McpError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
    this.name = 'McpError';
  }
}

export interface ServerInfo {
  name: string;
  version: string;
}

export interface ServerConfig {
  capabilities: {
    tools?: Record<string, unknown>;
    resources?: Record<string, unknown>;
  };
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ListToolsRequest {
  jsonrpc: '2.0';
  method: string;
  params: Record<string, never>;
}

export interface CallToolRequest {
  jsonrpc: '2.0';
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export const ListToolsRequestSchema = {
  type: 'object',
  properties: {
    jsonrpc: { const: '2.0' },
    method: { const: 'tools/list', description: 'List available tools' },
    params: { type: 'object', additionalProperties: false },
  },
  required: ['jsonrpc', 'method', 'params'],
  additionalProperties: false,
};

export const CallToolRequestSchema = {
  type: 'object',
  properties: {
    jsonrpc: { const: '2.0' },
    method: { const: 'tools/call', description: 'Call a tool' },
    params: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        arguments: { type: 'object' },
      },
      required: ['name', 'arguments'],
      additionalProperties: false,
    },
  },
  required: ['jsonrpc', 'method', 'params'],
  additionalProperties: false,
};

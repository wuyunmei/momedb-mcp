import { 
  ServerInfo, 
  ServerConfig, 
  McpError, 
  ErrorCode, 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListToolsRequest,
  CallToolRequest
} from './types.js';

type RequestHandler<T extends ListToolsRequest | CallToolRequest> = (request: T) => Promise<any>;

export class Server {
  private handlers: Map<string, RequestHandler<any>> = new Map();
  public onerror?: (error: Error) => void;

  constructor(
    private info: ServerInfo,
    private config: ServerConfig
  ) {}

  setRequestHandler<T extends ListToolsRequest | CallToolRequest>(
    schema: typeof ListToolsRequestSchema | typeof CallToolRequestSchema,
    handler: RequestHandler<T>
  ) {
    const method = schema.properties.method.const;
    this.handlers.set(method, handler);
  }

  async handleRequest(request: ListToolsRequest | CallToolRequest): Promise<any> {
    try {
      if (typeof request !== 'object' || request === null) {
        throw new McpError(ErrorCode.InvalidRequest, 'Invalid request format');
      }

      const { jsonrpc, method, params } = request;

      if (jsonrpc !== '2.0') {
        throw new McpError(ErrorCode.InvalidRequest, 'Invalid JSON-RPC version');
      }

      const handler = this.handlers.get(method);
      if (!handler) {
        throw new McpError(ErrorCode.MethodNotFound, `Method not found: ${method}`);
      }

      const result = await handler(request);
      return {
        jsonrpc: '2.0',
        result,
      };
    } catch (error) {
      if (error instanceof McpError) {
        return {
          jsonrpc: '2.0',
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      const internalError = new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : 'Unknown error'
      );

      if (this.onerror) {
        this.onerror(error as Error);
      }

      return {
        jsonrpc: '2.0',
        error: {
          code: internalError.code,
          message: internalError.message,
        },
      };
    }
  }

  async processInput(input: string): Promise<string> {
    try {
      const request = JSON.parse(input);
      const response = await this.handleRequest(request);
      return JSON.stringify(response);
    } catch (error) {
      const parseError = new McpError(
        ErrorCode.ParseError,
        'Invalid JSON: ' + (error instanceof Error ? error.message : 'Unknown error')
      );

      return JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: parseError.code,
          message: parseError.message,
        },
      });
    }
  }

  async connect(transport: { onMessage: (callback: (message: string) => Promise<string>) => void }) {
    transport.onMessage(async (message) => {
      return this.processInput(message);
    });
  }

  async close() {
    // Cleanup if needed
  }
}

export class StdioServerTransport {
  onMessage(callback: (message: string) => Promise<string>): void {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          const response = await callback(line);
          process.stdout.write(response + '\n');
        }
      }
    });

    process.stdin.on('end', () => {
      if (buffer.trim()) {
        callback(buffer).then((response) => {
          process.stdout.write(response + '\n');
        });
      }
    });
  }
}

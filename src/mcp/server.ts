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

  async handleRequest(request: any): Promise<any> {
    try {
      if (typeof request !== 'object' || request === null) {
        throw new McpError(ErrorCode.InvalidRequest, 'Invalid request format');
      }

      const { jsonrpc, method, params, id } = request;

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
        id,
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
    console.error('[INFO] Server connecting to transport');
    return new Promise<void>((resolve) => {
      // 首先发送初始化消息
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 'init',
        result: {
          name: this.info.name,
          version: this.info.version,
          capabilities: this.config.capabilities
        }
      }) + '\n';

      process.stdout.write(initMessage, () => {
        console.error('[INFO] Sent initialization message');

        // 然后设置消息处理器
        transport.onMessage(async (message) => {
          console.error('[DEBUG] Received message:', message);
          try {
            // 解析消息以获取id
            const request = JSON.parse(message);
            const response = await this.processInput(message);
            
            // 确保响应包含正确的id
            let finalResponse = response;
            const responseObj = JSON.parse(response);
            if (!responseObj.id && request.id) {
              responseObj.id = request.id;
              finalResponse = JSON.stringify(responseObj);
            }

            console.error('[DEBUG] Sending response:', finalResponse);
            return finalResponse;
          } catch (error) {
            console.error('[ERROR] Error processing message:', error);
            return JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32000,
                message: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`
              }
            });
          }
        });

        console.error('[INFO] Server connected to transport');
        resolve();
      });
    });
  }

  async close() {
    // Cleanup if needed
  }
}

export class StdioServerTransport {
  private messageCallback?: (message: string) => Promise<string>;
  private initialized = false;

  onMessage(callback: (message: string) => Promise<string>): void {
    this.messageCallback = callback;
    this.setupTransport();
  }

  private setupTransport(): void {
    console.error('[INFO] Setting up transport...');

    // 设置stdin为原始模式
    process.stdin.setRawMode?.(true);
    process.stdin.setEncoding('utf8');
    process.stdin.resume();

    let buffer = '';

    const sendResponse = (response: string) => {
      try {
        console.error('[DEBUG] Sending response:', response);
        process.stdout.write(response + '\n');
      } catch (error) {
        console.error('[ERROR] Failed to send response:', error);
      }
    };

    const handleMessage = async (message: string) => {
      if (!this.messageCallback) {
        console.error('[ERROR] No message callback registered');
        return;
      }

      try {
        console.error('[DEBUG] Processing message:', message);
        const response = await this.messageCallback(message);
        sendResponse(response);
      } catch (error) {
        console.error('[ERROR] Failed to process message:', error);
        sendResponse(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }));
      }
    };

    // 初始化完成后发送就绪消息
    const sendReadyMessage = () => {
      if (this.initialized) return;
      this.initialized = true;
      
      sendResponse(JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        result: {
          status: 'ready',
          pid: process.pid,
          time: new Date().toISOString()
        }
      }));
    };

    // 处理输入数据
    process.stdin.on('data', (chunk: string) => {
      console.error('[DEBUG] Received chunk:', chunk);
      
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      if (!this.initialized) {
        sendReadyMessage();
      }

      for (const line of lines) {
        if (line.trim()) {
          handleMessage(line).catch(error => {
            console.error('[ERROR] Unexpected error handling message:', error);
          });
        }
      }
    });

    // 错误处理
    process.stdin.on('error', (error) => {
      console.error('[ERROR] stdin error:', error);
    });

    process.stdout.on('error', (error) => {
      console.error('[ERROR] stdout error:', error);
    });

    // 处理进程信号
    process.on('SIGINT', () => {
      console.error('[INFO] Received SIGINT signal');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('[INFO] Received SIGTERM signal');
      process.exit(0);
    });

    // 发送初始就绪消息
    setImmediate(sendReadyMessage);

    console.error('[INFO] Transport setup complete');
  }
}

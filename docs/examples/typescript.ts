// TypeScript Examples for Columnist MCP Server

interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface QueryResult<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

interface InsertResult {
  success: boolean;
  insertedIds: string[];
}

interface MCPError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

// Example 1: Type-safe MCP Client
class ColumnistMCPClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private async callTool<T>(name: string, args: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ name, arguments: args })
    });

    if (!response.ok) {
      const error: MCPError = await response.json();
      throw new Error(`MCP Error: ${error.error} (${error.code})`);
    }

    const result = await response.json();
    return JSON.parse(result.content[0].text);
  }

  // Example 2: Type-safe query method
  async queryMessages(
    database: string,
    options: {
      where?: Record<string, any>;
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<QueryResult<Message>> {
    return this.callTool<QueryResult<Message>>('columnist_query', {
      database,
      table: 'messages',
      ...options
    });
  }

  // Example 3: Type-safe search method
  async searchMessages(
    database: string,
    query: string,
    options: {
      filters?: Record<string, any>;
      limit?: number;
    } = {}
  ): Promise<QueryResult<Message>> {
    return this.callTool<QueryResult<Message>>('columnist_search', {
      database,
      table: 'messages',
      query,
      ...options
    });
  }

  // Example 4: Type-safe insert method
  async insertMessages(
    database: string,
    messages: Message[]
  ): Promise<InsertResult> {
    return this.callTool<InsertResult>('columnist_insert', {
      database,
      table: 'messages',
      records: messages
    });
  }

  // Example 5: Resource discovery
  async listResources(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/resources/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list resources');
    }

    return response.json();
  }
}

// Example 6: Usage examples
async function demonstrateMCPClient() {
  const client = new ColumnistMCPClient(
    'http://localhost:3000/mcp',
    process.env.MCP_TOKEN!
  );

  try {
    // Query messages
    const queryResult = await client.queryMessages('my-app', {
      where: { userId: 'user-123' },
      orderBy: { field: 'timestamp', direction: 'desc' },
      limit: 10
    });

    console.log('Query results:', queryResult.data);

    // Search messages
    const searchResult = await client.searchMessages('my-app', 'hello world', {
      limit: 5
    });

    console.log('Search results:', searchResult.data);

    // Insert new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: 'Hello from TypeScript!',
      userId: 'user-123',
      timestamp: new Date()
    };

    const insertResult = await client.insertMessages('my-app', [newMessage]);
    console.log('Insert result:', insertResult);

    // List available resources
    const resources = await client.listResources();
    console.log('Available resources:', resources);

  } catch (error) {
    console.error('MCP operation failed:', error);
  }
}

// Example 7: Error handling with type guards
function isMCPError(error: any): error is MCPError {
  return error && typeof error.error === 'string' && typeof error.code === 'string';
}

async function safeMCPOperation<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (isMCPError(error)) {
      console.error(`MCP Error ${error.code}: ${error.error}`);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

export {
  ColumnistMCPClient,
  Message,
  QueryResult,
  InsertResult,
  MCPError,
  demonstrateMCPClient,
  safeMCPOperation
};
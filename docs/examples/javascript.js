// JavaScript/Node.js Examples for Columnist MCP Server

// Example 1: Basic MCP Client Setup
const { MCPServer } = require('columnist-mcp-server');

// Initialize MCP server
const server = new MCPServer({
  databaseName: 'my-app',
  authToken: process.env.MCP_AUTH_TOKEN,
  port: 3000
});

// Start server
server.start().then(() => {
  console.log('MCP Server started on port 3000');
});

// Example 2: Querying the database via MCP
async function queryMessages() {
  const response = await fetch('http://localhost:3000/mcp/tools/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_TOKEN}`
    },
    body: JSON.stringify({
      name: 'columnist_query',
      arguments: {
        database: 'my-app',
        table: 'messages',
        where: { userId: 'user-123' },
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: 10
      }
    })
  });

  const result = await response.json();
  console.log('Query results:', result.content[0].text);
}

// Example 3: Full-text search
async function searchMessages(query) {
  const response = await fetch('http://localhost:3000/mcp/tools/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_TOKEN}`
    },
    body: JSON.stringify({
      name: 'columnist_search',
      arguments: {
        database: 'my-app',
        table: 'messages',
        query: query,
        limit: 5
      }
    })
  });

  const result = await response.json();
  return JSON.parse(result.content[0].text);
}

// Example 4: Inserting records
async function insertMessage(message) {
  const response = await fetch('http://localhost:3000/mcp/tools/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_TOKEN}`
    },
    body: JSON.stringify({
      name: 'columnist_insert',
      arguments: {
        database: 'my-app',
        table: 'messages',
        records: [message]
      }
    })
  });

  const result = await response.json();
  return JSON.parse(result.content[0].text);
}

// Example 5: Error handling
async function safeQuery() {
  try {
    const result = await queryMessages();
    return result;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Authentication failed - check your token');
    } else if (error.response?.status === 403) {
      console.error('Permission denied - insufficient access');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded - try again later');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

module.exports = {
  queryMessages,
  searchMessages,
  insertMessage,
  safeQuery
};
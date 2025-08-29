// React/Next.js Integration Examples for Columnist MCP

import React, { useState, useEffect } from 'react';

// Example 1: Custom React Hook for MCP Client
function useMCPClient(baseUrl, authToken) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callTool = async (toolName, args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: toolName,
          arguments: args
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const result = await response.json();
      const parsedData = JSON.parse(result.content[0].text);
      setData(parsedData);
      return parsedData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callTool, loading, error, data };
}

// Example 2: Message List Component
function MessageList({ database, authToken }) {
  const { callTool, loading, error, data } = useMCPClient(
    'http://localhost:3000/mcp',
    authToken
  );

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, [database]);

  const loadMessages = async () => {
    try {
      const result = await callTool('columnist_query', {
        database,
        table: 'messages',
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: 20
      });
      setMessages(result.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const searchMessages = async (query) => {
    try {
      const result = await callTool('columnist_search', {
        database,
        table: 'messages',
        query,
        limit: 10
      });
      setMessages(result.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const sendMessage = async (content) => {
    try {
      await callTool('columnist_insert', {
        database,
        table: 'messages',
        records: [{
          id: `msg-${Date.now()}`,
          content,
          userId: 'current-user',
          timestamp: new Date().toISOString()
        }]
      });
      await loadMessages(); // Reload messages
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search messages..."
          onChange={(e) => searchMessages(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={loadMessages}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="border rounded p-3">
            <p className="text-gray-800">{message.content}</p>
            <div className="text-sm text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSubmit={sendMessage} />
    </div>
  );
}

// Example 3: Message Input Component
function MessageInput({ onSubmit }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="border rounded px-3 py-2 flex-1"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </form>
  );
}

// Example 4: Authentication Provider
function MCPAuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      // In a real app, this would call your auth service
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Login failed');

      const { token, user: userData } = await response.json();
      setAuthToken(token);
      setUser(userData);
      localStorage.setItem('mcp_token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('mcp_token');
  };

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('mcp_token');
    if (token) {
      setAuthToken(token);
      // Optionally validate token with backend
    }
  }, []);

  return (
    <MCPContext.Provider value={{ authToken, user, login, logout }}>
      {children}
    </MCPContext.Provider>
  );
}

// Example 5: Real-time updates with WebSocket
function useRealtimeMessages(database, authToken) {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!authToken) return;

    const websocket = new WebSocket(`ws://localhost:3000/mcp/ws?token=${authToken}`);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      websocket.send(JSON.stringify({
        type: 'subscribe',
        database,
        table: 'messages'
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message_insert') {
        setMessages(prev => [data.message, ...prev]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [database, authToken]);

  return messages;
}

// Example 6: Next.js API Route for MCP Proxy
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tool, arguments: args } = req.body;
  const authToken = req.headers.authorization?.replace('Bearer ', '');

  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const response = await fetch('http://localhost:3000/mcp/tools/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: tool,
        arguments: args
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('MCP proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export components for use in other files
export {
  useMCPClient,
  MessageList,
  MessageInput,
  MCPAuthProvider,
  useRealtimeMessages
};
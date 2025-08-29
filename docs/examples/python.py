# Python Examples for Columnist MCP Server

import requests
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Message:
    id: str
    content: str
    user_id: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class QueryResult:
    data: List[Message]
    total: Optional[int] = None
    limit: Optional[int] = None
    offset: Optional[int] = None

@dataclass
class InsertResult:
    success: bool
    inserted_ids: List[str]

class ColumnistMCPClient:
    """Python client for Columnist MCP Server"""
    
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.auth_token = auth_token
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        })
    
    def _call_tool(self, name: str, args: Dict) -> Any:
        """Call an MCP tool and return parsed result"""
        url = f"{self.base_url}/tools/call"
        payload = {
            "name": name,
            "arguments": args
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        return json.loads(result["content"][0]["text"])
    
    def query_messages(self, database: str, **kwargs) -> QueryResult:
        """
        Query messages from the database
        
        Args:
            database: Database name
            where: Filter conditions (dict)
            order_by: Sorting configuration
            limit: Maximum records to return
            offset: Records to skip
        """
        args = {
            "database": database,
            "table": "messages",
            **kwargs
        }
        
        result = self._call_tool("columnist_query", args)
        return QueryResult(**result)
    
    def search_messages(self, database: str, query: str, **kwargs) -> QueryResult:
        """
        Search messages using full-text search
        
        Args:
            database: Database name
            query: Search query string
            filters: Additional filters (dict)
            limit: Maximum results to return
        """
        args = {
            "database": database,
            "table": "messages",
            "query": query,
            **kwargs
        }
        
        result = self._call_tool("columnist_search", args)
        return QueryResult(**result)
    
    def insert_messages(self, database: str, messages: List[Dict]) -> InsertResult:
        """
        Insert messages into the database
        
        Args:
            database: Database name
            messages: List of message dictionaries
        """
        args = {
            "database": database,
            "table": "messages",
            "records": messages
        }
        
        result = self._call_tool("columnist_insert", args)
        return InsertResult(**result)
    
    def list_resources(self) -> List[Dict]:
        """List available database resources"""
        url = f"{self.base_url}/resources/list"
        response = self.session.post(url)
        response.raise_for_status()
        
        result = response.json()
        return result["resources"]

# Example usage
def demonstrate_mcp_client():
    # Initialize client
    client = ColumnistMCPClient(
        base_url="http://localhost:3000/mcp",
        auth_token="your-auth-token-here"
    )
    
    try:
        # Example 1: Query messages
        query_result = client.query_messages(
            database="my-app",
            where={"user_id": "user-123"},
            order_by={"field": "timestamp", "direction": "desc"},
            limit=10
        )
        
        print(f"Found {len(query_result.data)} messages")
        for message in query_result.data:
            print(f"- {message['content']} ({message['timestamp']})")
        
        # Example 2: Search messages
        search_result = client.search_messages(
            database="my-app",
            query="hello world",
            limit=5
        )
        
        print(f"Search found {len(search_result.data)} results")
        
        # Example 3: Insert new message
        new_message = {
            "id": f"msg-{int(datetime.now().timestamp())}",
            "content": "Hello from Python!",
            "user_id": "user-123",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"source": "python-client"}
        }
        
        insert_result = client.insert_messages("my-app", [new_message])
        print(f"Inserted message with IDs: {insert_result.inserted_ids}")
        
        # Example 4: List resources
        resources = client.list_resources()
        print("Available resources:")
        for resource in resources:
            print(f"- {resource['name']}: {resource['uri']}")
            
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        if e.response.status_code == 401:
            print("Authentication failed - check your token")
        elif e.response.status_code == 403:
            print("Permission denied")
        elif e.response.status_code == 429:
            print("Rate limit exceeded")
    except Exception as e:
        print(f"Unexpected error: {e}")

# Example 5: Async version using aiohttp
import aiohttp
import asyncio

class AsyncColumnistMCPClient:
    """Async Python client for Columnist MCP Server"""
    
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.auth_token = auth_token
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }
    
    async def _call_tool(self, name: str, args: Dict) -> Any:
        """Async call to MCP tool"""
        url = f"{self.base_url}/tools/call"
        payload = {
            "name": name,
            "arguments": args
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self.headers) as response:
                response.raise_for_status()
                result = await response.json()
                return json.loads(result["content"][0]["text"])
    
    async def query_messages_async(self, database: str, **kwargs) -> QueryResult:
        args = {
            "database": database,
            "table": "messages",
            **kwargs
        }
        
        result = await self._call_tool("columnist_query", args)
        return QueryResult(**result)

# Run examples
if __name__ == "__main__":
    demonstrate_mcp_client()
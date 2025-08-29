#!/bin/bash

# Columnist MCP Server cURL Examples
# These examples demonstrate how to interact with the MCP server using cURL

# Configuration
BASE_URL="http://localhost:3000/mcp"
AUTH_TOKEN="your-auth-token-here"
DATABASE="my-app"

# Example 1: Server Discovery
echo "=== Example 1: Server Discovery ==="
curl -X POST "$BASE_URL/discovery" \
  -H "Content-Type: application/json" \
  | jq .

echo ""

# Example 2: List Resources (requires auth)
echo "=== Example 2: List Resources ==="
curl -X POST "$BASE_URL/resources/list" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  | jq .

echo ""

# Example 3: Query Messages
echo "=== Example 3: Query Messages ==="
curl -X POST "$BASE_URL/tools/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "columnist_query",
    "arguments": {
      "database": "'$DATABASE'",
      "table": "messages",
      "where": { "userId": "user-123" },
      "orderBy": { "field": "timestamp", "direction": "desc" },
      "limit": 5
    }
  }' \
  | jq .

echo ""

# Example 4: Full-text Search
echo "=== Example 4: Full-text Search ==="
curl -X POST "$BASE_URL/tools/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "columnist_search",
    "arguments": {
      "database": "'$DATABASE'",
      "table": "messages",
      "query": "hello world",
      "limit": 3
    }
  }' \
  | jq .

echo ""

# Example 5: Insert New Message
echo "=== Example 5: Insert New Message ==="
curl -X POST "$BASE_URL/tools/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "columnist_insert",
    "arguments": {
      "database": "'$DATABASE'",
      "table": "messages",
      "records": [{
        "id": "msg-$(date +%s)",
        "content": "Hello from cURL!",
        "userId": "user-123",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
      }]
    }
  }' \
  | jq .

echo ""

# Example 6: Error Handling - Invalid Auth
echo "=== Example 6: Error Handling - Invalid Auth ==="
curl -X POST "$BASE_URL/tools/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{
    "name": "columnist_query",
    "arguments": {
      "database": "'$DATABASE'",
      "table": "messages"
    }
  }' \
  -w "HTTP Status: %{http_code}\
" \
  | jq . 2>/dev/null || echo "Request failed (expected)"

echo ""

# Example 7: Error Handling - Invalid Database
echo "=== Example 7: Error Handling - Invalid Database ==="
curl -X POST "$BASE_URL/tools/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "columnist_query",
    "arguments": {
      "database": "nonexistent-db",
      "table": "messages"
    }
  }' \
  -w "HTTP Status: %{http_code}\
" \
  | jq .

echo ""

# Example 8: Read Resource Content
echo "=== Example 8: Read Resource Content ==="
# First get the resource URI from listing
RESOURCE_URI=$(curl -s -X POST "$BASE_URL/resources/list" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  | jq -r '.resources[0].uri')

echo "Reading resource: $RESOURCE_URI"

curl -X POST "$BASE_URL/resources/read" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "uri": "'$RESOURCE_URI'"
  }' \
  | jq .

echo ""

# Example 9: Rate Limit Testing
echo "=== Example 9: Rate Limit Testing ==="
for i in {1..5}; do
  echo "Request $i:"
  curl -X POST "$BASE_URL/tools/call" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "name": "columnist_query",
      "arguments": {
        "database": "'$DATABASE'",
        "table": "messages",
        "limit": 1
      }
    }' \
    -w "HTTP Status: %{http_code}\
" \
    -o /dev/null -s
  sleep 0.5
done

echo ""
echo "=== All examples completed ==="

# Helper function to test connection
test_connection() {
  echo "Testing connection to MCP server..."
  
  if curl -s "$BASE_URL/discovery" > /dev/null; then
    echo "✓ MCP server is reachable"
    return 0
  else
    echo "✗ MCP server is not reachable"
    return 1
  fi
}

# Uncomment to test connection:
# test_connection
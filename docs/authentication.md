# Authentication & Security

## Overview
Columnist MCP Server supports multiple authentication methods to secure access to your database operations. This guide covers all available authentication options and security best practices.

## Authentication Methods

### 1. Bearer Token Authentication (JWT)

The primary authentication method uses JSON Web Tokens (JWT) with Bearer token scheme.

#### Configuration

```javascript
// Server-side configuration
const { AuthManager } = require('columnist-mcp-server');

const authManager = new AuthManager({
  secret: process.env.MCP_AUTH_SECRET, // Required for production
  requireAuth: true, // Default: true
  allowedOrigins: ['https://yourdomain.com'] // CORS origins
});
```

#### Generating Tokens

```javascript
// Generate a JWT token
const token = authManager.generateToken({
  userId: 'user-123',
  role: 'admin',
  permissions: ['read', 'write', 'search']
}, '24h'); // Expires in 24 hours

console.log('Generated token:', token);
```

#### Client Usage

```javascript
// JavaScript/Node.js
const response = await fetch('http://localhost:3000/mcp/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'columnist_query',
    arguments: { database: 'my-app', table: 'messages' }
  })
});
```

```python
# Python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

response = requests.post(
    'http://localhost:3000/mcp/tools/call',
    headers=headers,
    json={
        'name': 'columnist_query',
        'arguments': {'database': 'my-app', 'table': 'messages'}
    }
)
```

### 2. API Key Authentication

For simpler use cases, API keys can be used instead of JWT tokens.

#### Configuration

```javascript
// Custom API key middleware
app.use('/mcp', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
});
```

#### Client Usage

```javascript
// Using API key
const response = await fetch('http://localhost:3000/mcp/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.MCP_API_KEY
  },
  body: JSON.stringify({/* request body */})
});
```

### 3. OAuth2 Integration

For enterprise applications, OAuth2 can be integrated using passport.js or similar middleware.

#### Example OAuth2 Setup

```javascript
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://provider.com/oauth2/authorize',
  tokenURL: 'https://provider.com/oauth2/token',
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: 'https://yourapp.com/auth/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Verify user and create session
  return done(null, profile);
}));

// Protect MCP routes
app.use('/mcp', passport.authenticate('oauth2'));
```

## Security Best Practices

### 1. Token Management

#### Key Rotation
```bash
# Rotate secrets regularly
# Generate new secret
openssl rand -base64 32 > new-secret.txt

# Update environment variable
export MCP_AUTH_SECRET=$(cat new-secret.txt)
```

#### Token Expiration
```javascript
// Short-lived tokens for better security
const token = authManager.generateToken(payload, '1h'); // 1 hour expiration

// Refresh token mechanism
const refreshToken = authManager.generateToken(
  { userId: payload.userId }, 
  '7d' // Longer expiration for refresh
);
```

### 2. Environment Variables

Never hardcode secrets in your code:

```bash
# .env file (never commit to version control)
MCP_AUTH_SECRET=your-super-secure-random-secret-here
MCP_API_KEY=your-api-key-here
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const mcpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/mcp', mcpLimiter);
```

### 4. CORS Configuration

Restrict cross-origin requests:

```javascript
const cors = require('cors');

app.use('/mcp', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Error Handling

### Authentication Errors

```json
{
  "error": "Authentication failed",
  "code": "AUTH_001",
  "message": "Invalid or expired token"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| AUTH_001 | Invalid token | 401 |
| AUTH_002 | Token expired | 401 |
| AUTH_003 | Missing authorization header | 401 |
| AUTH_004 | Invalid authorization scheme | 401 |
| RATE_001 | Rate limit exceeded | 429 |
| PERM_001 | Insufficient permissions | 403 |

## Production Deployment

### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S columnist -u 1001

USER columnist

EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Kubernetes Secrets

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-secrets
type: Opaque
data:
  MCP_AUTH_SECRET: $(echo -n "your-secret" | base64)
  MCP_API_KEY: $(echo -n "your-api-key" | base64)
```

### 3. Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## Compliance

### GDPR Compliance

- Implement data minimization in token payloads
- Provide token revocation mechanisms
- Log access with user consent where required

### HIPAA Considerations

- Ensure end-to-end encryption for healthcare data
- Implement strict access controls
- Maintain audit logs of all database operations

## Troubleshooting

### Common Issues

1. **Token not working**
   - Check token expiration
   - Verify secret matches between client and server
   
2. **CORS errors**
   - Verify allowed origins configuration
   - Check preflight requests
   
3. **Rate limiting**
   - Adjust rate limit settings based on expected traffic
   - Implement exponential backoff in clients

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
const authManager = new AuthManager({
  secret: process.env.MCP_AUTH_SECRET,
  requireAuth: true,
  debug: process.env.NODE_ENV === 'development' // Enable debug logs
});
```

## Examples

### Complete Authentication Setup

```javascript
const express = require('express');
const { AuthManager } = require('columnist-mcp-server');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const authManager = new AuthManager({
  secret: process.env.MCP_AUTH_SECRET,
  requireAuth: process.env.NODE_ENV === 'production'
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/mcp', limiter);

// Authentication
app.use('/mcp', authManager.middleware());

// Your MCP routes here...

app.listen(3000, () => {
  console.log('MCP Server running on port 3000');
});
```

This comprehensive authentication guide ensures secure and compliant access to your Columnist MCP server across all deployment scenarios.
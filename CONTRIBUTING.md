# Contributing to Columnist

Thank you for your interest in contributing to Columnist! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/columnist-io/db.git
   cd db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build the library**
   ```bash
   npm run build:lib
   ```

## Project Structure

```
columnist/
├── lib/                    # Core database library
│   ├── columnist.ts        # Main database implementation
│   ├── index.ts           # Library exports
│   └── schema-examples.ts  # Example schemas
├── hooks/                  # React hooks
│   ├── use-columnist.ts    # Database instance hook
│   ├── use-live-query.ts   # Reactive query hook
│   └── use-stats.ts        # Statistics hook
├── app/                    # Demo Next.js app
│   ├── test/              # Test page
│   └── devtools/          # Database inspector
└── components/            # UI components for demo
```

## Testing

1. **Manual Testing**
   ```bash
   npm run dev
   # Visit http://localhost:3000/test
   ```

2. **Type Checking**
   ```bash
   npm run typecheck
   ```

3. **Build Testing**
   ```bash
   npm run build:lib
   npm pack --dry-run
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Ensure no TypeScript errors

## Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm run typecheck
   npm run build:lib
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Convention

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Areas for Contribution

### High Priority
- **Vector Search Optimization** - Implement PQ/IVF for large datasets
- **Security Features** - Add encryption at rest
- **Sync Adapters** - Real-time synchronization
- **Performance** - Query optimization and compound indexes

### Medium Priority
- **Documentation** - API examples and tutorials
- **Testing** - Unit and integration tests
- **Devtools** - Enhanced database inspector
- **Migration Tools** - Schema evolution helpers

### Low Priority
- **UI Improvements** - Better demo interface
- **Example Apps** - Real-world usage examples
- **Benchmarks** - Performance comparisons

## Questions or Issues?

- **Documentation**: Check the [README](README.md) first
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue to discuss before implementing
- **Questions**: Start a discussion in the repository

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

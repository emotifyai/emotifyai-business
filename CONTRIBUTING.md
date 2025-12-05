# Contributing to Verba

Thank you for your interest in contributing to Verba! This document provides guidelines for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, version)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear use case
   - Expected behavior
   - Why it's valuable
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   bun test
   bun type-check
   bun lint
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in component"
   git commit -m "docs: update README"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Fill out PR template**
   - Description of changes
   - Related issues
   - Testing done
   - Screenshots if UI changes

## Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/verba.git
cd verba

# Install dependencies
bun install

# Copy environment files
cp apps/extension/.env.example apps/extension/.env.local
cp apps/web/.env.local.example apps/web/.env.local

# Run development servers
bun dev
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### React
- Use functional components
- Use hooks for state management
- Keep components small and focused
- Extract reusable logic into custom hooks

### Formatting
- Use Prettier for formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas

### Naming Conventions
- Components: PascalCase (`Button.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

## Testing

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases
- Use descriptive test names

```typescript
describe('Button component', () => {
  it('should render with correct text', () => {
    // test implementation
  })
  
  it('should call onClick when clicked', () => {
    // test implementation
  })
})
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add dark mode toggle
fix: resolve authentication redirect loop
docs: update installation instructions
refactor: simplify API client error handling
```

## Review Process

1. **Automated checks** must pass:
   - TypeScript compilation
   - Tests
   - Linting

2. **Code review** by maintainers:
   - Code quality
   - Test coverage
   - Documentation
   - Breaking changes

3. **Approval and merge**:
   - At least one approval required
   - Squash and merge preferred

## Questions?

- Open a discussion on GitHub
- Email: dev@verba.app
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Verba! 🚀

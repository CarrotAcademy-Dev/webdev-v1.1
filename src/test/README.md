# Testing Guide - CarrotAcademy v1.1

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run tests with UI (interactive)
npm test:ui

# Run specific test file
npm test -- src/utils/__tests__/storage.test.js

# Run tests matching pattern
npm test -- --grep "auth"
```

## Test Structure

```
src/
├── test/
│   ├── setup.js              # Global test setup
│   ├── helpers/              # Test utilities
│   └── README.md             # This file
├── utils/
│   └── __tests__/            # Utils tests
│       ├── storage.test.js
│       └── formatters.test.js
├── components/
│   └── ProtectedRoute/
│       └── __tests__/        # Component tests
│           └── index.test.jsx
└── context/
    └── __tests__/            # Context tests
        └── AuthContext.test.jsx
```

## Writing Tests

### Unit Test Example (Utils)

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { auth } from '@/utils/storage'

describe('auth storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve user data', () => {
    const user = { id: '1', email: 'test@example.com' }
    auth.setUser(user)
    
    const retrieved = auth.getUser()
    expect(retrieved).toEqual(user)
  })
})
```

### Component Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

describe('ProtectedRoute', () => {
  it('should redirect when user not authenticated', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
```

## Coverage Goals

- **Utils**: 80%+ (high ROI, pure functions)
- **Auth/RBAC**: 90%+ (critical security paths)
- **Components**: 60%+ (focus on logic, not styling)
- **Overall**: 70%+

## Best Practices

1. **Test behavior, not implementation**
2. **Use data-testid sparingly** - prefer accessible queries (getByRole, getByLabelText)
3. **Mock external dependencies** - API calls, localStorage, etc.
4. **Keep tests independent** - each test should run in isolation
5. **Use descriptive test names** - "should redirect to login when token expired"

## Debugging Tests

```bash
# Run with UI (interactive mode)
npm test:ui

# Run with verbose output
npm test -- --reporter=verbose

# Debug specific test
node --inspect-brk node_modules/.bin/vitest run src/utils/__tests__/storage.test.js
```

## CI/CD Integration

Tests will run automatically on:
- Pull Request to `develop` or `main`
- Pre-commit hook (future)
- GitHub Actions workflow (future)

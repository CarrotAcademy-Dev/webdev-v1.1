# Logging Guidelines - CarrotAcademy v1.1

## TL;DR

❌ **Dont's:**
```javascript
console.log('User data:', userData);  // Expose sensitive data
console.log(password, token);          // Log credentials
```

✅ **Do's:**
```javascript
import { logger } from '@/utils/logger';

logger.debug('User logged in', { email: user.email });  // Safe, dev only
logger.error('Login failed', error, 'auth');             // Always logged
```

## Why Logging Matters
  
1. **Security**: Prevent sensitive data exposure in production console
2. **Performance**: Reduce console noise in production
3. **Debugging**: Enable detailed logs only when needed
4. **Maintenance**: Centralized logging makes it easy to add tracking (Sentry, LogRocket)

## Usage Guide

### Import

```javascript
import { logger } from '@/utils/logger';
```

### Log Levels

#### 1. Debug (Development Only)
Use for detailed debugging info, data inspection, flow tracking

```javascript
logger.debug('Fetching user data', { userId: 123 });
logger.debug('API response', responseData, 'csoService');
```

**When to use:**
- Function entry/exit points
- Data transformations
- API request/response details
- State changes

#### 2. Info (Always Logged)
Use for important events that help understand app behavior

```javascript
logger.info('User logged in successfully');
logger.info('Session extended', { newExpiry: expiryTime });
```

**When to use:**
- User actions (login, logout, submit)
- Important state transitions
- Feature usage

#### 3. Warn (Always Logged)
Use for potential issues that don't break functionality

```javascript
logger.warn('Token expiring soon', { remainingMinutes: 5 });
logger.warn('Optional config missing', { key: 'VITE_APP_NAME' });
```

**When to use:**
- Deprecated feature usage
- Missing optional configuration
- Recoverable errors
- Performance warnings

#### 4. Error (Always Logged + Tracked)
Use for actual errors that need attention

```javascript
logger.error('Failed to fetch data', error, 'csoService');
logger.error('Auth token invalid', new Error('Token expired'), 'auth');
```

**When to use:**
- API failures
- Validation errors
- Authentication failures
- Unexpected exceptions

### Advanced Features

#### Group Logs
For debugging complex flows:

```javascript
logger.group('💰 Processing Payment');
logger.debug('Validating payment data', paymentData);
logger.debug('Calling payment API');
logger.debug('Payment response', response);
logger.groupEnd();
```

#### Table Display
For arrays of objects:

```javascript
logger.table(students);  // Shows data in table format
```

#### Performance Measurement
Track execution time:

```javascript
logger.time('Data Transformation');
// ... expensive operation ...
logger.timeEnd('Data Transformation');  // Logs: "Data Transformation: 234ms"
```

## Automatic Data Sanitization

Logger automatically redacts sensitive fields:

```javascript
const userData = {
  email: 'user@example.com',
  password: 'secret123',
  token: 'abc123xyz'
};

logger.debug('User data', userData);
// Output: { email: 'user@example.com', password: '[REDACTED]', token: '[REDACTED]' }
```

**Sanitized fields:** password, token, authorization, apiKey, secret

## Migration Guide

### Replace Old Patterns

❌ **Old:**
```javascript
const isDebugLoggingEnabled = import.meta.env.DEV;
const debugLog = (...args) => {
  if (isDebugLoggingEnabled) console.log(...args);
};

debugLog('User data:', userData);
console.error('Error:', error);
```

✅ **New:**
```javascript
import { logger } from '@/utils/logger';

logger.debug('User data', userData);
logger.error('Error occurred', error, 'componentName');
```

### Backward Compatibility

For files that already use `debugLog`, you can import legacy functions:

```javascript
import { debugLog, debugError } from '@/utils/logger';

debugLog('This still works');  // But prefer logger.debug()
```

## Production Console

**Goal:** Clean console in production

```
# Development Console (verbose):
[DEBUG] User logged in { email: 'user@example.com' }
[DEBUG] Fetching dashboard data
[INFO] Dashboard loaded successfully

# Production Console (minimal):
[INFO] Dashboard loaded successfully
[ERROR] Failed to fetch data [TRACKED]
```

## Context Parameter

Add context to help identify log source:

```javascript
// In csoApiService.jsx
logger.debug('Fetching prospektif data', { psid }, 'csoService');

// In AuthContext.jsx
logger.error('Session validation failed', error, 'auth');

// In DashboardPage
logger.warn('Data incomplete', { missingFields }, 'dashboard');
```

**Output:**
```
[2026-03-31T09:00:00.000Z] [csoService] DEBUG: Fetching prospektif data
```

## Best Practices

### ✅ DO

- Use appropriate log levels
- Add context parameter
- Log errors with full error object
- Use debug level for verbose info
- Group related logs

### ❌ DON'T

- Log passwords, tokens, or sensitive data directly
- Use console.log directly (use logger)
- Log inside loops (performance!)
- Log in production without context
- Over-log (be selective)

## Environment Variables

Control logging behavior:

```env
# Development
VITE_ENABLE_DEBUG_MODE=true   # Enable debug logs

# Production
VITE_ENABLE_DEBUG_MODE=false  # Disable debug logs (default)
```

## Future Integration

Logger is designed to easily integrate with:

- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay
- **DataDog**: Application performance monitoring

Just modify `logger.error()` to send to tracking service.

## Examples by Use Case

### API Service
```javascript
import { logger } from '@/utils/logger';

export const fetchData = async (params) => {
  logger.debug('API call initiated', { params }, 'apiService');
  
  try {
    const response = await axios.get('/api/data', { params });
    logger.debug('API response received', { status: response.status }, 'apiService');
    return response.data;
  } catch (error) {
    logger.error('API call failed', error, 'apiService');
    throw error;
  }
};
```

### React Component
```javascript
import { logger } from '@/utils/logger';

function DashboardPage() {
  useEffect(() => {
    logger.debug('Dashboard mounted', null, 'dashboard');
    return () => logger.debug('Dashboard unmounted', null, 'dashboard');
  }, []);

  const handleSubmit = async (data) => {
    logger.info('Form submitted', { formType: 'prospektif' });
    try {
      await submitData(data);
      logger.info('Form submission successful');
    } catch (error) {
      logger.error('Form submission failed', error, 'dashboard');
    }
  };
}
```

### Auth Flow
```javascript
import { logger } from '@/utils/logger';

export const login = async (email, password) => {
  logger.group('🔐 Login Flow');
  logger.debug('Login attempt', { email }, 'auth');
  
  try {
    const response = await authApi.login(email, password);
    logger.info('Login successful', { email });
    logger.groupEnd();
    return response;
  } catch (error) {
    logger.error('Login failed', error, 'auth');
    logger.groupEnd();
    throw error;
  }
};
```

## Checklist

Before merging to production:

- [ ] No `console.log` calls in critical files
- [ ] All errors logged with `logger.error()`
- [ ] Sensitive data not logged
- [ ] Debug logs use `logger.debug()`
- [ ] Context added to important logs
- [ ] Production console is clean

---

**Remember:** Good logging helps debugging without compromising security! 🔒✨

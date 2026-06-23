# Copilot Instructions - CarrotAcademy v1.1

Internal dashboard SPA for Carrot Academy built with React 18, Vite, Chakra UI, and TanStack Query. Features role-based access control (RBAC), session management, and real-time productivity tracking.

## Build, Test, and Lint Commands

```bash
# Development server (HTTPS enabled in dev mode)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint all files
npm run lint

# Lint specific file
npx eslint src/path/to/file.jsx
```

**No test suite currently configured.**

## High-Level Architecture

### Data Flow Pattern

The codebase follows a **strict separation of concerns** between API services, page components, and UI components:

```
API Service Layer (src/features/*/)
    ↓ (axios calls)
Backend (Google Apps Script)
    ↓ (raw data)
API Service Layer
    ↓ (transformed data)
React Query (useQuery/useMutation in pages)
    ↓ (cached data + handlers)
Page Components (src/pages/*/)
    ↓ (props)
UI Components (src/components/*/)
```

**Key Principle**: API services handle ONLY data fetching/posting. Pages handle data transformation (in `select` option) and business logic. UI components receive props and render.

### React Query Configuration

**Location**: `src/config/api.config.js`

```javascript
staleTime: 5 * 60 * 1000      // Data considered fresh for 5 minutes
cacheTime: 10 * 60 * 1000     // Cache retained for 10 minutes
retry: 3                       // Retry failed queries 3 times
refetchOnWindowFocus: false   // Don't refetch on window focus
```

**Pattern**: Use `queryKey` arrays for cache invalidation. Always invalidate related queries after mutations:

```javascript
// In mutation onSuccess
queryClient.invalidateQueries({ queryKey: ['prospektifData'] });
queryClient.invalidateQueries({ queryKey: ['dashboardProspektifPersonal'] });
```

### Feature-Based API Services

**Location**: `src/features/{auth,cso,eso}/`

Each feature has its own API service file:
- `authApiService.jsx` - Authentication endpoints
- `csoApiService.jsx` - Customer Support Officer operations
- `esoApiService.jsx` - Education Support Officer operations

**Pattern**: Create dedicated axios client per service with feature-specific endpoints:

```javascript
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: false,
    timeout: API_CONFIG.timeout,
    validateStatus: () => true  // Handle all HTTP status codes manually
});

const ENDPOINT = {
    'csoBersama': API_CONFIG.endpoints.csoBersama,
    'csoPersonal': API_CONFIG.endpoints.csoPersonal
}
```

**Important**: Use `URLSearchParams` for POST requests to avoid preflight OPTIONS requests:

```javascript
const params = new URLSearchParams();
params.append('action', 'getData');
params.append('psid', psid);
const response = await apiClient.post(ENDPOINT.csoPersonal, params);
```

### Google Apps Script Backend

Backend is currently **Google Apps Script (GAS)** with **Google Sheets as database**. This means:
- Data comes as 2D arrays (rows/columns)
- Use helper functions `transformRawData()` and `transformProspektifData()` to convert to objects
- Response structure: `{ success: boolean, data: any, message?: string }`
- **Future plan**: Migrate to Node.js backend with PostgreSQL/MongoDB

### State Management Philosophy

- **Server state**: React Query (`useQuery`, `useMutation`) - handles ALL API data
- **Global UI state**: React Context (only for auth and sidebar)
  - `AuthContext` - User authentication, session management
  - `SidebarContext` - Sidebar open/close state
- **Local component state**: `useState` for UI-only state
- **Complex local state**: `useReducer` when `useState` becomes unwieldy

**Do NOT use Redux** - React Query handles server state, Context handles global UI state.

### Role-Based Access Control (RBAC)

**Location**: `src/utils/constants/accessControl.js`

**3 Roles**: `staff`, `admin`, `super_admin`

**12 Jabatan (Job Titles)**: CSO, ESO, Finance, IT, Marcom, Mentor, Intern, Operation, Education, HRGA, SMS, OB

**Access Logic**: Routes can be protected by role OR jabatan (or both):

```javascript
// In App.jsx
<ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
    <Layout><DashboardProspektifPage /></Layout>
</ProtectedRoute>

// Access granted if user is CSO OR (admin/super_admin)
```

**Predefined Groups**: Use `ACCESS_GROUPS` constants for consistency:
- `ADMIN_ONLY` - Admin and Super Admin only
- `CSO_ONLY` - CSO jabatan only
- `CSO_OR_ADMIN` - CSO or Admin roles
- `ESO_OR_ADMIN` - ESO or Admin roles
- `STAFF_ONLY` - All authenticated staff
- `EVERYONE` - All authenticated users

**Menu Visibility**: `src/Layout/Navbar/utils.js` contains `filterMenuByAccess()` to conditionally show menu items based on user permissions.

### Session Management & Token Expiry

**Token Lifetime**: 9 hours (540 minutes) with extension capability

**Warning System**:
- **15 min before expiry**: Toast notification
- **10 min before expiry**: Modal with [Extend Session] or [Logout] options
- **0 min**: Auto-logout with redirect to login

**Real-time Tracking**: Session badge in Navbar shows remaining time with color coding:
- 🟢 Green: > 2 hours
- 🟡 Yellow: 30 min - 2 hours
- 🟠 Orange: 10-30 min
- 🔴 Red: < 10 min

**Productivity Monitoring** (Feb 2026):
- Tracks productive vs idle time
- Grace period: 30 min tolerance for multitasking
- Session states: Productive → Grace (30m) → Idle
- Auto-save every 10 seconds to localStorage
- Orphaned session detection (9-hour threshold)

**Implementation**: `src/context/AuthContext.jsx` - handles token validation, extension, and auto-logout.

See `TOKEN_EXPIRY_GUIDE.md` for full implementation details.

### Password Management System

**Routes**:
- `/forgot-password` - Public route for password reset
- `/update-password` - Protected route for password change

**Requirements**:
- 8-20 characters
- Min 1 lowercase, 1 uppercase, 1 number, 1 special character
- Real-time strength indicator with visual feedback
- Client-side AND server-side validation
- Auto-logout after successful password change

### Theme System

**Dark/Light Mode**: Integrated with Chakra UI's `useColorMode`

**Styled Components Integration**: Use CSS variables for theme-aware styling:

```javascript
const StyledCard = styled.div`
  background-color: var(--chakra-colors-chakra-body-bg);
  color: var(--chakra-colors-chakra-body-text);
  
  /* Automatic theme switching via data-theme attribute */
  [data-theme='dark'] & {
    border-color: var(--chakra-colors-dark-border);
  }
`;
```

**Theme Toggle**: Available in Navbar and Settings page

See `THEME_GUIDE.md` for comprehensive theming patterns.

## Key Conventions

### File Naming

- **Components**: PascalCase - `InfoCard/index.jsx`, `Login.Styled.jsx`
- **Utilities**: camelCase - `formatters.js`, `errorHandler.js`
- **API Services**: camelCase with suffix - `csoApiService.jsx`, `authApiService.jsx`
- **Constants**: camelCase files, SCREAMING_SNAKE_CASE exports - `accessControl.js` exports `ROLES`, `JABATAN`

### Component Structure

**Pattern**: Co-located styles with index file

```
ComponentName/
  ├── index.jsx              # Component logic
  └── ComponentName.Styled.jsx  # Styled components
```

**Example**: `src/components/InfoCard/`

### Styling Patterns

**Primary**: Styled Components with CSS variables
**Secondary**: Chakra UI components for forms, buttons, modals

**When to use Styled Components**:
- Custom layouts and containers
- Complex hover/active states
- Responsive design with media queries
- Component-specific animations

**When to use Chakra UI**:
- Form controls (Input, Select, Checkbox)
- Buttons and interactive elements
- Toasts and modals
- Accessibility features (FormControl, FormLabel)

**Transient Props**: Prefix props with `$` to prevent passing to DOM:

```javascript
<StyledCard $hoverable={true} $clickable={onClick !== undefined}>

const StyledCard = styled.div`
  ${props => props.$hoverable && `
    &:hover { transform: translateY(-4px); }
  `}
`;
```

### Path Aliases

**jsconfig.json** defines `@` alias pointing to `src/`:

```javascript
import { API_CONFIG } from '@/config/api.config';
import { formatDate } from '@/utils/formatters';
import { useLocalStorage } from '@/hooks/useLocalStorage';
```

**Resolved by**: `vite-jsconfig-paths` plugin in `vite.config.js`

### Storage Management

**Location**: `src/utils/storage.js`

**Pattern**: Prefixed wrapper functions with expiry support:

```javascript
import { auth, generic } from '@/utils/storage';

// Auth-specific storage (prefixed: 'carrot_academy_auth_')
auth.setUser(userData);          // Saves with 9-hour expiry
const user = auth.getUser();     // Auto-removes if expired
auth.clearAuth();                // Removes all auth data

// Generic storage (prefixed: 'carrot_academy_')
generic.setItem('theme', 'dark');
const theme = generic.getItem('theme');
```

**NEVER directly use localStorage** - always use these wrappers for:
- Automatic key prefixing (prevents collisions)
- Expiry checking (auto-cleanup)
- Error handling (try-catch built-in)

### Custom Hooks

**Location**: `src/hooks/`

**Available**:
- `useDebounce(value, delay)` - Debounce input values
- `useLoadingState()` - Manage loading states
- `useLocalStorage(key, initialValue)` - Synced localStorage state
- `usePagination(data, itemsPerPage)` - Client-side pagination
- `useTaskSummary(data)` - Calculate task summaries
- `useTheme()` - Theme management (delegates to Chakra's useColorMode)

### Error Handling

**Location**: `src/utils/errorHandler.js`

**Pattern**: Use `ApiError` class and `logError` function:

```javascript
import { ApiError, logError } from '@/utils/errorHandler';

try {
    const response = await apiClient.get('/data');
    if (!response.data.success) {
        throw new ApiError(response.data.message || 'Failed to fetch');
    }
    return response.data;
} catch (error) {
    logError(error, { context: 'fetchData', additionalInfo: { userId } });
    throw error;
}
```

**Toast Pattern**: Use Chakra's `useToast` for user feedback:

```javascript
const toast = useToast();

// Success
toast({ title: 'Data saved', status: 'success', duration: 3000 });

// Error
toast({ title: 'Error', description: error.message, status: 'error', duration: 5000 });
```

### Formatters

**Location**: `src/utils/formatters.js`

**Common functions**:
- `formatDate(dateString, format)` - Uses date-fns
- `formatCurrency(amount)` - Indonesian Rupiah format
- `getJabatanAbbreviation(jabatan)` - CSO, ESO, etc.
- `capitalizeFirstLetter(string)`

Always use these instead of inline formatting for consistency.

### Lazy Loading

**All page components** are lazy loaded in `App.jsx`:

```javascript
const OverviewPage = lazy(() => import('./pages/Staff/OverviewPage'));
const DashboardProspektifPage = lazy(() => import('./pages/Staff/CSO/Personal/DashboardProspektifPage'));
```

Wrapped with `<Suspense fallback={<Loading />}>` for better initial load performance.

### Commit Convention

**Format**: `<type>: <description>`

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Example**: `feat: add productivity tracking to session management`

See `GIT_WORKFLOW.md` for branching strategy.

### Component Memoization

**Pattern**: Use `memo()` for expensive components or components that receive stable props:

```javascript
import { memo } from 'react';

function InfoCard({ title, value }) {
    // Component logic
}

export default memo(InfoCard);
```

Especially useful for:
- List items that rarely change
- Components receiving callbacks (wrap callbacks with `useCallback`)
- Dashboard cards displaying static data

### Accessibility

**Keyboard Navigation**: Interactive elements need keyboard support:

```javascript
<StyledCard
    role="button"
    tabIndex={0}
    onClick={handleClick}
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    }}
>
```

**Form Labels**: Always use `FormControl` with `FormLabel` from Chakra UI for accessibility.

## Documentation Index

**Essential reading order** for new developers:

1. `README.md` - Project overview, tech stack, installation
2. `QUICK_REFERENCE.md` - Cheat sheet for common patterns
3. `IMPLEMENTATION_STATUS.md` - Status of features and utilities
4. `RBAC_GUIDE.md` - Access control system
5. `TOKEN_EXPIRY_GUIDE.md` - Session management details
6. `THEME_GUIDE.md` - Dark/Light mode implementation
7. `GIT_WORKFLOW.md` - Branching strategy and commit conventions

**Feature-specific**:
- `DASHBOARD_PROSPEKTIF_GUIDE.md` - Prospektif dashboard features
- `DASHBOARD_REMINDER_GUIDE.md` - Reminder & Janjian Temu features
- `USER_FLOW_GUIDE.md` - Detailed user flow diagrams

**Master Index**: `FLOW_DOCUMENTATION_INDEX.md`

## Environment Variables

**Location**: `.env` (not committed)

**Required**:
```env
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID
VITE_API_CSO_BERSAMA_ENDPOINT=YOUR_CSO_BERSAMA_ENDPOINT
VITE_API_CSO_PERSONAL_ENDPOINT=YOUR_CSO_PERSONAL_ENDPOINT
VITE_API_ESO_BERSAMA_ENDPOINT=YOUR_ESO_BERSAMA_ENDPOINT
VITE_API_ESO_PERSONAL_ENDPOINT=YOUR_ESO_PERSONAL_ENDPOINT
VITE_API_AUTH_ENDPOINT=YOUR_AUTH_ENDPOINT
VITE_APP_NAME=CarrotAcademy Dashboard
VITE_APP_VERSION=1.1.0
VITE_ENABLE_DEBUG_MODE=false
```

**Access in code**: `import.meta.env.VITE_VARIABLE_NAME`

## Deployment

**Platform**: Vercel (configured via `vercel.json`)

**Process**:
1. Merge feature branch to `develop` via Pull Request
2. Test thoroughly in develop branch
3. Merge `develop` to `main` for production
4. Vercel auto-deploys from `main` branch

See `DEPLOYMENT.md` for detailed deployment steps.

## Common Pitfalls

### 1. Direct localStorage Usage
❌ **Don't**: `localStorage.setItem('user', JSON.stringify(user))`  
✅ **Do**: `auth.setUser(user)`

### 2. Missing Query Invalidation
❌ **Don't**: Forget to invalidate after mutations  
✅ **Do**: Always invalidate related queries in `onSuccess`

### 3. Props Passing to DOM
❌ **Don't**: `<StyledDiv hoverable={true}>` (warning in console)  
✅ **Do**: `<StyledDiv $hoverable={true}>` (transient prop)

### 4. Hardcoded Access Control
❌ **Don't**: `allowedRoles={['admin', 'super_admin']}`  
✅ **Do**: `{...ACCESS_GROUPS.ADMIN_ONLY}`

### 5. Theme-Unaware Styles
❌ **Don't**: `background: #1a1a1a;` (hardcoded color)  
✅ **Do**: `background: var(--chakra-colors-chakra-body-bg);` (theme-aware)

### 6. Mixing Server and UI State
❌ **Don't**: Store API response in Context  
✅ **Do**: Use React Query for API data, Context only for UI state (auth, sidebar)

### 7. Missing Loading States
❌ **Don't**: Render data without checking `isLoading`  
✅ **Do**: Always handle `isLoading`, `isError`, and empty states

## Performance Considerations

- **Lazy Loading**: All pages lazy loaded via `React.lazy()`
- **Code Splitting**: Vite splits vendor chunks (react, chakra, charts)
- **React Query Caching**: 5-minute stale time reduces API calls
- **Component Memoization**: Use `memo()` for list items and stable components
- **Bundle Size**: Chart.js, Recharts, and react-chartjs-2 are code-split to `charts-vendor` chunk
- **Image Optimization**: SVGs imported as components via `vite-plugin-svgr`

## Recent Major Updates (February 2026)

- ✅ Auth API V2.0 with POST method and device tracking
- ✅ Session productivity monitoring with real-time tracking
- ✅ Forgot password flow with email integration
- ✅ Update password with strength indicator
- ✅ Orphaned session detection & recovery
- ✅ Settings page with profile management

See `PROGRESS_REPORT_FEB28_2026.md` for details.

# Perbaikan Sistem - Dokumentasi

### 1. **Configuration Management**
- Buat `.env` untuk environment variables
- Buat `src/config/api.config.js` untuk centralized config
- Pisahkan API URLs dari kode

### 2. **Error Handling**
- Buat `src/utils/errorHandler.js`
- Custom error classes (ApiError, ValidationError, NetworkError)
- Centralized error logging
- User-friendly error messages
- Retry mechanism

### 3. **Input Validation**
- Buat `src/utils/validation.js`
- Validators untuk email, phone, date, etc
- Form validation helper
- Input sanitization

### 4. **Loading State Management**
- Buat `src/hooks/useLoadingState.js`
- Multiple loading states support
- Async operation helper

### 5. **Data Formatting**
- Buat `src/utils/formatters.js`
- Date formatting (berbagai format)
- Currency, number, phone formatting
- Text utilities (truncate, capitalize, etc)

### 6. **Storage Management** ENHANCED
- Buat `src/utils/storage.js`
- Safe localStorage wrapper
- Expiry support
- Auth helpers
- Token expiry with auto-cleanup (Dec 2025)
- Session monitoring methods
- isTokenExpiringSoon(), getTokenRemainingTime(), extendToken()

### 7. **Custom Hooks**
- `useDebounce` - untuk search/filter
- `usePagination` - untuk pagination logic
- `useLocalStorage` - sync state dengan localStorage

### 8. **Security & Access Control** NEW (Dec 2025)
- Token expiry & session management system
- Auto-logout on token expiry (8 hours)
- Session timeout warning dialog
- Real-time session timer badge in Navbar
- Role-Based Access Control (RBAC)
- 3 Roles: Staff, Admin, Super Admin
- 12 Jabatan types with access groups
- Enhanced ProtectedRoute component
- Multi-layer access control (route, menu, component)
- Access denied page

### 9. **New Pages & Features** (Dec 2025)
- Prospektif Form Page (42 fields, CRUD, search by PSID)
- Register User Page (admin-only, password validation)
- Password strength meter
- SessionTimeout component with modal dialog
- LostNFound bug fixes (checkbox, data movement, PIC field)
- Attendance Calendar API integration
- Attendance streak calculation

---

## Yang Perlu Dilakukan Selanjutnya

### **Priority 1: Implementasi Utilities ke Existing Code**

#### 1.1 Update `csoApiService.jsx`
```jsx
// Sebelum:
const ENDPOINT = {
    'csoBersama': '/AKfycbz...../exec',
}

// Sesudah:
import { API_CONFIG } from '@/config/api.config';

const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
});

const ENDPOINT = {
    'csoBersama': API_CONFIG.endpoints.csoBersama,
}
```

#### 1.2 Update Error Handling di API Service
```jsx
// Sebelum:
catch (error) {
    console.error("Error:", error);
    throw error;
}

// Sesudah:
import { logError, ApiError } from '@/utils/errorHandler';

catch (error) {
    logError(error, 'getPendaftaranLanjutan');
    throw new ApiError(error.message || 'Failed to fetch data', error.response?.status);
}
```

#### 1.3 Update AuthContext dengan Storage Utility
```jsx
// Sebelum:
localStorage.setItem('user', JSON.stringify(result));
const storedUser = localStorage.getItem('user');

// Sesudah:
import { auth } from '@/utils/storage';

auth.setUser(result, 448); // 8 jam expiry
const storedUser = auth.getUser();

// New features (Dec 2025):
const { extendSession, getSessionTimeRemaining } = useContext(AuthContext);
const remaining = getSessionTimeRemaining(); // Get minutes remaining
extendSession(); // Extend by 8 hours
```

#### 1.4 Update PendaftaranLanjutanPage
```jsx
// Sebelum:
const [currentPage, setCurrentPage] = useState(1);
const indexOfLastItem = currentPage * itemsPerPage;
// ... manual pagination logic

// Sesudah:
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/utils/formatters';
import { handleError } from '@/utils/errorHandler';

const {
    currentItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
} = usePagination(pendaftaranData.dataOpen, 10);

// Error handling dengan utility
onError: (error) => {
    handleError(error, toast, 'markAsSent');
}

// Date formatting
<td>{formatDate.toShortDate(item.tanggalKirim)}</td>
```

#### 1.5 Implement RBAC System
```jsx
// App.jsx - Route protection
import { ACCESS_GROUPS } from '@/utils/constants/accessControl';

<ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
  <Layout><ProspektifFormPage /></Layout>
</ProtectedRoute>

<ProtectedRoute {...ACCESS_GROUPS.ADMIN_ONLY}>
  <Layout><RegisterUserPage /></Layout>
</ProtectedRoute>

// Navbar.jsx - Menu visibility
const isCSO = currentUser?.jabatan === JABATAN.CSO;
const isAdmin = currentUser?.role === 'admin';
const showCSOMenu = isCSO || isAdmin;
```

---

### **Priority 2: Testing**

#### 2.1 Setup Testing Framework
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

#### 2.2 Buat Test untuk Utilities
```javascript
// src/utils/__tests__/formatters.test.js
import { formatDate, formatCurrency } from '../formatters';

describe('formatters', () => {
    test('formatDate.toShortDate', () => {
        expect(formatDate.toShortDate('2025-01-15')).toBe('15/01/2025');
    });
});
```

---

### **Priority 3: Performance Optimization**

#### 3.1 Implement React Query Config
```jsx
// main.jsx
import { QUERY_CONFIG } from '@/config/api.config';

const queryClient = new QueryClient(QUERY_CONFIG);
```

#### 3.2 Add Memoization
```jsx
// Untuk expensive calculations
const sortedData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// Untuk callbacks
const handleClick = useCallback((id) => {
    // logic
}, [dependency]);
```

---

### **Priority 4: Code Quality**

#### 4.1 Add PropTypes atau TypeScript
```bash
# Option 1: PropTypes
npm install prop-types

# Option 2: TypeScript (lebih baik untuk long-term)
npm install --save-dev typescript @types/react @types/react-dom
```

#### 4.2 Add Prettier
```bash
npm install --save-dev prettier
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "es5"
}
```

---

### **Priority 5: Documentation**

#### 5.1 Component Documentation
```jsx
/**
 * PendaftaranLanjutanPage Component
 * 
 * @description Halaman untuk mengelola pendaftaran lanjutan siswa
 * @features
 * - Tabs untuk data open/close
 * - Pagination (10 items per page)
 * - Date picker untuk mark as sent
 * - Optimistic updates
 * 
 * @example
 * <Route path="/pendaftaran-lanjutan" element={<PendaftaranLanjutanPage />} />
 */
```

#### 5.2 API Documentation
```jsx
/**
 * Get pendaftaran lanjutan data
 * 
 * @returns {Promise<{dataOpen: Array, dataClose: Array}>}
 * @throws {ApiError} When API call fails
 * 
 * @example
 * const data = await getPendaftaranLanjutan();
 */
export const getPendaftaranLanjutan = async () => {
    // ...
};
```

---

## Checklist Implementasi

### Immediate (Hari Ini)
- [x] Copy file `.env.example` ke `.env` dan isi nilai yang sesuai
- [x] Update `csoApiService.jsx` gunakan config dari `api.config.js`
- [x] Update `AuthContext.jsx` gunakan `storage.js`
- [x] Test error handling di development
- [x] Implement token expiry system
- [x] Implement RBAC system
- [x] Create Prospektif Form page
- [x] Create Register User page

### This Week
- [x] Update semua pages gunakan utilities yang baru
- [x] Implement `usePagination` hook di semua table
- [x] Add validation di semua form inputs (RegisterUser, ProspektifForm)
- [ ] Test di berbagai browser
- [x] Session management with warnings
- [x] Protected routes for CSO & Admin
- [x] Password validation with strength meter

### This Month
- [ ] Add unit tests untuk utilities
- [ ] Add integration tests untuk critical flows
- [ ] Setup CI/CD pipeline
- [ ] Performance audit dengan Lighthouse

---

## Security Checklist

- [x] API URLs di environment variables
- [x] Token expiry & auto-logout (8 hours)
- [x] Session monitoring & warnings
- [x] Role-Based Access Control (RBAC)
- [x] Multi-layer access protection
- [x] Password validation (8-20 chars, complexity rules)
- [x] Add input sanitization di semua forms (validation utility)
- [ ] Implement CSRF protection
- [ ] Add rate limiting di backend
- [ ] Audit dependencies (`npm audit`)
- [ ] Backend token validation (REQUIRED)
- [ ] Add Content Security Policy headers

---

## Accessibility Checklist

- [ ] Add proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Screen reader testing
- [ ] Color contrast check
- [ ] Focus indicators
- [ ] Alt text untuk images

---

## Performance Targets

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.0s
- [ ] Lighthouse Score > 90
- [ ] Bundle size < 500KB (gzipped)

---

## Resources untuk next Developer

### Wajib Baca
1. React Query Documentation: https://tanstack.com/query/latest
2. Chakra UI Components: https://chakra-ui.com/docs/components
3. React Best Practices: https://react.dev/learn

### Recommended Learning Path
1. **Week 1**: Pahami struktur project dan utilities yang baru
2. **Week 2**: Implement utilities ke 1-2 pages
3. **Week 3**: Code review dan refactoring
4. **Week 4**: Testing dan documentation

---

## Troubleshooting Common Issues

### Issue: "Cannot read property of undefined"
**Solution**: Check data structure dari API, tambah optional chaining (`?.`)

### Issue: "localStorage is not defined"
**Solution**: Gunakan storage utility yang sudah handle SSR

### Issue: "Too many re-renders"
**Solution**: Check dependencies di useEffect, useMemo, useCallback

### Issue: "API timeout"
**Solution**: Check network, increase timeout di config, implement retry

---

## Contact

Jika ada pertanyaan atau butuh help:
1. Check dokumentasi ini dulu
2. Check console untuk error messages
3. Check React DevTools untuk component state
4. Ask senior developer

---

## Additional Documentation

- **Token Expiry Guide**: `TOKEN_EXPIRY_GUIDE.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Dashboard Guides**: `DASHBOARD_PROSPEKTIF_GUIDE.md`, `DASHBOARD_REMINDER_GUIDE.md`
- **Git Workflow**: `GIT_WORKFLOW.md`

---

**Last Updated**: December 13, 2025
**Version**: 1.2.0
**Major Updates**: Token Expiry System, RBAC Implementation, New Pages (Prospektif Form, Register User)

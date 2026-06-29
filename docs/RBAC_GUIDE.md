# Role-Based Access Control (RBAC) - Implementation Guide

## Overview
Sistem Role-Based Access Control (RBAC) untuk mengontrol akses user berdasarkan Role dan Jabatan dengan multi-layer protection.

**Implementation Date**: December 2025  
**Status**: Production Ready (dengan backend validation)

---

## Konsep Dasar

### Hierarchy Structure
```
User Authentication
    ↓
Role (Tingkat Akses Umum)
    ├─ Super Admin (Full Access)
    ├─ Admin (Management Access)
    └─ Staff (Limited Access)
    ↓
Jabatan (Posisi Spesifik)
    ├─ Customer Support Officer (CSO)
    ├─ Education Support Officer (ESO)
    ├─ Finance
    ├─ IT
    ├─ Marketing & Communication (Marcom)
    ├─ Mentor
    ├─ Intern
    ├─ Operation
    ├─ Education (EDU)
    ├─ Human Resources & General Affairs (HRGA)
    ├─ Social Media Specialist (SMS)
    └─ Office Boy (OB)
```

### Access Logic
```
Access Granted IF:
  - User memiliki Role yang sesuai, OR
  - User memiliki Jabatan yang sesuai, OR
  - Kombinasi keduanya (tergantung requireAny flag)
```

---

## Arsitektur RBAC

### 1. **Access Control Constants**
**File**: `src/utils/constants/accessControl.js`

```javascript
// 3 Roles
export const ROLES = {
    STAFF: 'staff',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
};

// 12 Jabatan
export const JABATAN = {
    CSO: 'Customer Support Officer',
    ESO: 'Education Support Officer',
    FINANCE: 'Finance',
    IT: 'IT',
    MARCOM: 'Marketing Communication',
    MENTOR: 'Mentor',
    INTERN: 'Intern',
    OPERATION: 'Operation',
    EDU: 'Education',
    HRGA: 'Human Resources & General Affairs',
    SMS: 'Social Media Specialist',
    OB: 'Office Boy',
};

// 8 Predefined Access Groups
export const ACCESS_GROUPS = {
    // Admin & Super Admin only
    ADMIN_ONLY: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [],
        requireAny: false,
    },
    
    // Super Admin only
    SUPER_ADMIN_ONLY: {
        allowedRoles: [ROLES.SUPER_ADMIN],
        allowedJabatan: [],
        requireAny: false,
    },
    
    // CSO Jabatan only
    CSO_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.CSO],
        requireAny: false,
    },
    
    // CSO or Admin (Most common for CSO pages)
    CSO_OR_ADMIN: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [JABATAN.CSO],
        requireAny: true, // Either role OR jabatan
    },
    
    // ESO Jabatan only
    ESO_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.ESO],
        requireAny: false,
    },
    
    // ESO or Admin
    ESO_OR_ADMIN: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [JABATAN.ESO],
        requireAny: true,
    },
    
    // Finance Jabatan onl
    FINANCE_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.FINANCE],
        requireAny: false,
    },
    
    // Finance or Admi
    FINANCE_OR_ADMIN: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [JABATAN.FINANCE],
        requireAny: true,
    },
    
    // HRGA Jabatan only
    HRGA_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.HRGA],
        requireAny: false,
    },
    
    // HRGA or Admin
    HRGA_OR_ADMIN: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [JABATAN.HRGA],
        requireAny: true,
    },
    
    // All staff members
    STAFF_ONLY: {
        allowedRoles: [ROLES.STAFF],
        allowedJabatan: [],
        requireAny: false,
    },
    
    // All authenticated users
    ALL_ROLES: {
        allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [],
        requireAny: false,
    },
    
    // Custom combination example
    CUSTOM: {
        allowedRoles: [],
        allowedJabatan: [],
        requireAny: true,
    },
};
```

---

### 2. **Enhanced ProtectedRoute Component**
**File**: `src/components/ProtectedRoute/index.jsx`

```javascript
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

export default function ProtectedRoute({ 
    children, 
    allowedRoles = [], 
    allowedJabatan = [],
    requireAny = false 
}) {
    const { currentUser } = useContext(AuthContext);

    // Step 1: Check if user is logged in
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Step 2: If no restrictions, allow access
    if (allowedRoles.length === 0 && allowedJabatan.length === 0) {
        return children;
    }

    // Step 3: Check role access
    const hasRoleAccess = allowedRoles.length === 0 || 
                         allowedRoles.includes(currentUser.role);

    // Step 4: Check jabatan access
    const hasJabatanAccess = allowedJabatan.length === 0 || 
                            allowedJabatan.includes(currentUser.jabatan);

    // Step 5: Determine final access based on requireAny flag
    const hasAccess = requireAny 
        ? (hasRoleAccess || hasJabatanAccess)  // Either one is enough
        : (hasRoleAccess && hasJabatanAccess); // Both required

    // Step 6: Redirect if no access
    if (!hasAccess) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
}
```

**Props Explanation**:
- `allowedRoles`: Array of roles yang diperbolehkan
- `allowedJabatan`: Array of jabatan yang diperbolehkan
- `requireAny`: 
  - `true`: User hanya perlu salah satu (role OR jabatan)
  - `false`: User harus memenuhi keduanya (role AND jabatan)

---

### 3. **Access Denied Page**
**File**: `src/components/AccessDenied/index.jsx`

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Heading, Text, VStack } from '@chakra-ui/react';
import { FiShield, FiHome, FiArrowLeft } from 'react-icons/fi';

export default function AccessDenied() {
    const navigate = useNavigate();

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
            <VStack spacing={6} textAlign="center" p={8} maxW="md">
                <FiShield size={80} color="white" />
                <Heading size="2xl" color="white">
                    Access Denied
                </Heading>
                <Text fontSize="lg" color="whiteAlpha.900">
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                </Text>
                <Text fontSize="md" color="whiteAlpha.800">
                    Halaman ini hanya dapat diakses oleh user dengan role atau jabatan tertentu.
                </Text>
                
                <VStack spacing={3} pt={4} w="full">
                    <Button
                        leftIcon={<FiHome />}
                        colorScheme="whiteAlpha"
                        variant="solid"
                        onClick={() => navigate('/home')}
                        w="full"
                        size="lg"
                    >
                        Kembali ke Home
                    </Button>
                    <Button
                        leftIcon={<FiArrowLeft />}
                        variant="outline"
                        colorScheme="whiteAlpha"
                        onClick={() => navigate(-1)}
                        w="full"
                    >
                        Kembali ke Halaman Sebelumnya
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
}
```

---

## Multi-Layer Protection

### Layer 1: Route Protection
**File**: `src/App.jsx`

```javascript
import { ACCESS_GROUPS } from '@/utils/constants/accessControl';

// Example: CSO Pages (28 routes)
<Route 
    path="/my-tasks/prospektif-form" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}>
            <Layout>
                <ProspektifFormPage />
            </Layout>
        </ProtectedRoute>
    } 
/>

// Example: Admin Pages
<Route 
    path="/admin/register-user" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.ADMIN_ONLY}>
            <Layout>
                <RegisterUserPage />
            </Layout>
        </ProtectedRoute>
    } 
/>

// Example: All Staff Pages
<Route 
    path="/home" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.ALL_ROLES}>
            <Layout>
                <OverviewPage />
            </Layout>
        </ProtectedRoute>
    } 
/>
```

**Protected Routes**:
- 50+ CSO Routes: `CSO_OR_ADMIN` (CSO jabatan OR Admin role)
- 15+ ESO Routes: `ESO_OR_ADMIN` (ESO jabatan OR Admin role)
- 16 Finance Routes: `FINANCE_OR_ADMIN` (Finance jabatan OR Admin role)
- 16 HRGA Routes: `HRGA_OR_ADMIN` (HRGA jabatan OR Admin role)
- 1 Admin Route: `ADMIN_ONLY` (Admin/Super Admin only)
- Common Routes: `ALL_ROLES` (All authenticated users)

**Example: Finance Pages**
```javascript
// Finance Bersama (Shared) - Route Protection
<Route 
    path="/my-tasks/finance-bersama/tagihan" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
                <TagihanPage />
            </Layout>
        </ProtectedRoute>
    } 
/>

// Finance Personal - Route Protection
<Route 
    path="/my-tasks/finance-personal/dashboard-pendapatan" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.FINANCE_OR_ADMIN}>
            <Layout>
                <DashboardPendapatanPage />
            </Layout>
        </ProtectedRoute>
    } 
/>
```

**Example: HRGA Pages**
```javascript
// HR Recruitment - Route Protection
<Route 
    path="/my-tasks/hrga/hr-recruitment/dashboard-report" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
                <DashboardReportPage />
            </Layout>
        </ProtectedRoute>
    } 
/>

// Asset Management - Route Protection
<Route 
    path="/my-tasks/hrga/asset/dashboard-asset" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.HRGA_OR_ADMIN}>
            <Layout>
                <DashboardAssetPage />
            </Layout>
        </ProtectedRoute>
    } 
/>
```

---

### Layer 2: Menu Visibility
**File**: `src/components/Navbar/index.jsx`

```javascript
import { JABATAN } from '@/utils/constants/accessControl';

const { currentUser } = useContext(AuthContext);

// Check permissions
const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
const isCSO = currentUser?.jabatan === JABATAN.CSO;
const showCSOMenu = isCSO || isAdmin;

// Conditional menu rendering
const menuData = useMemo(() => {
    const baseMenu = [/* Home, Profile, Logout */];

    // Add CSO menu only if user has access
    if (showCSOMenu) {
        baseMenu.splice(1, 0, {
            mainIcon: <PiSuitcaseBold />,
            items: [
                {
                    category: "Bersama",
                    items: [
                        { label: "Prospektif Form", path: "/my-tasks/prospektif-form" },
                        // ... 14 more items
                    ]
                },
                {
                    category: "Personal",
                    items: [
                        { label: "Dashboard Prospektif", path: "/my-tasks/dashboard-prospektif" },
                        // ... 12 more items
                    ]
                }
            ],
        });
    }

    // Add Admin menu only if user is admin
    if (isAdmin) {
        baseMenu.splice(showCSOMenu ? 2 : 1, 0, {
            mainIcon: <FiShield />,
            items: [
                {
                    category: "Admin",
                    items: [
                        { label: "Register User", path: "/admin/register-user" },
                    ]
                }
            ],
        });
    }

    return baseMenu;
}, [isAdmin, showCSOMenu]);
```

**Benefit**: User hanya melihat menu yang mereka punya akses

---

### Layer 3: Component-Level Protection
**File**: `src/pages/RegisterUserPage/index.jsx`

```javascript
import { ACCESS_GROUPS } from '@/utils/constants/accessControl';

export default function RegisterUserPage() {
    const { currentUser } = useContext(AuthContext);

    // Check access di component level
    const hasAccess = ACCESS_GROUPS.ADMIN_ONLY.allowedRoles.includes(currentUser?.role);

    if (!hasAccess) {
        return (
            <Box p={8} textAlign="center">
                <Heading size="lg" color="red.500">Access Denied</Heading>
                <Text mt={4}>Halaman ini hanya untuk Admin.</Text>
            </Box>
        );
    }

    return (
        // Component content
    );
}
```

**Use Case**: Extra protection untuk sensitive components

---

### Layer 4: Backend Validation (REQUIRED)
**Backend (Google Apps Script example)**:

```javascript
function registerUser(userData) {
    // Get current user from session/token
    const currentUser = getCurrentUserFromToken();
    
    // Validate role
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return {
            success: false,
            message: 'Unauthorized: Admin access required'
        };
    }
    
    // Proceed with registration
    // ...
}

function getProspektifData(psid) {
    const currentUser = getCurrentUserFromToken();
    
    // Validate access
    const isCSO = currentUser.jabatan === 'Customer Support Officer';
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    
    if (!isCSO && !isAdmin) {
        return {
            success: false,
            message: 'Unauthorized: CSO or Admin access required'
        };
    }
    
    // Proceed with data fetch
    // ...
}
```

**CRITICAL**: Client-side protection adalah UX layer. Backend WAJIB validate semua request!

---

## Usage Examples

### Example 1: Create Custom Access Group
```javascript
// src/utils/constants/accessControl.js

export const ACCESS_GROUPS = {
    // ... existing groups
    
    // Finance team only
    FINANCE_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.FINANCE],
        requireAny: false,
    },
    
    // Finance or Admin
    FINANCE_OR_ADMIN: {
        allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [JABATAN.FINANCE],
        requireAny: true,
    },
    
    // Multiple jabatan
    EDUCATION_TEAM: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.ESO, JABATAN.MENTOR, JABATAN.EDU],
        requireAny: true, // Any of these jabatan
    },
};
```

---

### Example 2: Protect New Route
```javascript
// src/App.jsx

import { ACCESS_GROUPS } from '@/utils/constants/accessControl';

// Finance page - only Finance jabatan
<Route 
    path="/finance/invoices" 
    element={
        <ProtectedRoute {...ACCESS_GROUPS.FINANCE_ONLY}>
            <Layout>
                <InvoicesPage />
            </Layout>
        </ProtectedRoute>
    } 
/>

// Or use custom inline
<Route 
    path="/education/students" 
    element={
        <ProtectedRoute 
            allowedJabatan={[JABATAN.ESO, JABATAN.MENTOR]}
            requireAny={true}
        >
            <Layout>
                <StudentsPage />
            </Layout>
        </ProtectedRoute>
    } 
/>
```

---

### Example 3: Conditional Rendering in Component
```javascript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ROLES, JABATAN } from '@/utils/constants/accessControl';

export default function DashboardPage() {
    const { currentUser } = useContext(AuthContext);
    
    const isAdmin = currentUser?.role === ROLES.ADMIN || 
                   currentUser?.role === ROLES.SUPER_ADMIN;
    const isFinance = currentUser?.jabatan === JABATAN.FINANCE;
    
    return (
        <Box>
            <Heading>Dashboard</Heading>
            
            {/* Show financial data only for Finance or Admin */}
            {(isFinance || isAdmin) && (
                <Box mt={4}>
                    <Heading size="md">Financial Overview</Heading>
                    {/* Financial charts and data */}
                </Box>
            )}
            
            {/* Admin-only section */}
            {isAdmin && (
                <Box mt={4}>
                    <Heading size="md">Admin Controls</Heading>
                    {/* Admin-specific controls */}
                </Box>
            )}
        </Box>
    );
}
```

---

### Example 4: Dynamic Button Visibility
```javascript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ROLES } from '@/utils/constants/accessControl';

export default function UserListPage() {
    const { currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.role === ROLES.ADMIN || 
                   currentUser?.role === ROLES.SUPER_ADMIN;
    
    return (
        <Box>
            <HStack justify="space-between">
                <Heading>User List</Heading>
                
                {/* Show "Add User" button only for Admin */}
                {isAdmin && (
                    <Button 
                        colorScheme="blue" 
                        onClick={() => navigate('/admin/register-user')}
                    >
                        Add New User
                    </Button>
                )}
            </HStack>
            
            {/* User list table */}
        </Box>
    );
}
```

---

## Access Flow Diagram

```
User Login
    ↓
Store user data (role, jabatan, nama, email)
    ↓
User navigates to protected route
    ↓
ProtectedRoute checks:
    1. Is user logged in? → No: Redirect to /login
    2. Are there restrictions? → No: Allow access
    3. Check role match
    4. Check jabatan match
    5. Apply requireAny logic
    6. Grant or Deny access
    ↓
If Denied → Redirect to /access-denied
If Granted → Render component
    ↓
Component may have additional checks
    ↓
User interacts with features
    ↓
Backend validates access on every API call
```

---

## Testing Scenarios

### Test Case 1: CSO User
**User Data**:
```json
{
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    "jabatan": "Customer Support Officer"
}
```

**Expected Behavior**:
- Can access all CSO pages (28 routes)
- CSO menu visible in Navbar (28 items)
- Cannot access Admin pages (Register User)
- Admin menu NOT visible
- Can access common pages (Home, Profile, Attendance)

---

### Test Case 2: Admin User
**User Data**:
```json
{
    "nama": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "jabatan": "IT Developer"
}
```

**Expected Behavior**:
- Can access all CSO pages (CSO_OR_ADMIN allows)
- Can access all Admin pages
- Both CSO and Admin menus visible
- Can access all common pages
- Can register new users

---

### Test Case 3: Finance User
**User Data**:
```json
{
    "nama": "Finance User",
    "email": "finance@example.com",
    "role": "staff",
    "jabatan": "Finance"
}
```

**Expected Behavior**:
- Cannot access CSO pages → Redirected to /access-denied
- CSO menu NOT visible
- Cannot access Admin pages
- Admin menu NOT visible
- Can access common pages (Home, Profile)

---

### Test Case 4: Force URL Access
**Scenario**: Finance user tries to manually navigate to `/my-tasks/prospektif-form`

**Flow**:
1. User types URL in browser
2. React Router loads route
3. ProtectedRoute wrapper checks access
4. User role: "staff", jabatan: "Finance"
5. Required: CSO jabatan OR Admin role
6. User has neither → Access Denied
7. Redirect to `/access-denied`

**Result**: Protected successfully

---

## Troubleshooting

### Issue 1: User can't access page they should have access to
**Debug Steps**:
1. Check `currentUser` data in AuthContext:
   ```javascript
   console.log('Current User:', currentUser);
   ```
2. Check route configuration in App.jsx
3. Verify ACCESS_GROUP configuration matches requirements
4. Check `requireAny` flag (true vs false)

**Common Fix**: Wrong requireAny setting
```javascript
// Before (wrong - requires BOTH)
<ProtectedRoute 
    allowedRoles={[ROLES.ADMIN]}
    allowedJabatan={[JABATAN.CSO]}
    requireAny={false} // User needs to be Admin AND CSO (impossible)
>

// After (correct - requires EITHER)
<ProtectedRoute 
    allowedRoles={[ROLES.ADMIN]}
    allowedJabatan={[JABATAN.CSO]}
    requireAny={true} // User can be Admin OR CSO
>
```

---

### Issue 2: Menu shows but route is protected
**Cause**: Menu visibility logic doesn't match route protection

**Fix**: Ensure consistency
```javascript
// Navbar.jsx
const showCSOMenu = isCSO || isAdmin;

// App.jsx - Must match!
<ProtectedRoute {...ACCESS_GROUPS.CSO_OR_ADMIN}> // Matches logic above
```

---

### Issue 3: Access denied loop
**Cause**: /access-denied route itself might be protected

**Fix**: Make sure access-denied is NOT protected
```javascript
// App.jsx
<Route path="/access-denied" element={<AccessDenied />} /> // No ProtectedRoute wrapper
```

---

## Security Best Practices

### DO:
1. **Always validate on backend** - Client-side is just UX
2. **Use constants** - Never hardcode role/jabatan strings
3. **Consistent logic** - Menu visibility = Route protection
4. **Test all scenarios** - Different role/jabatan combinations
5. **Default deny** - If unsure, restrict access
6. **Log access attempts** - Monitor for unauthorized attempts

### DON'T:
1. **Don't rely only on client-side** - Easy to bypass
2. **Don't expose sensitive data** - Even if UI is hidden
3. **Don't hardcode permissions** - Use constants file
4. **Don't mix AND/OR logic** - Be clear with requireAny
5. **Don't skip backend validation** - Critical for security
6. **Don't forget edge cases** - Test null/undefined values

---

## Security Layers Summary

| Layer | Location | Purpose | Bypassable? |
|-------|----------|---------|-------------|
| **1. Route Protection** | App.jsx | Prevent route access | Yes (via dev tools) |
| **2. Menu Visibility** | Navbar.jsx | Hide menu items | Yes (force URL) |
| **3. Component Check** | Page components | Extra UI protection | Yes (modify code) |
| **4. Backend Validation** | API Server | TRUE security | NO (if implemented correctly) |

**Conclusion**: Layers 1-3 are for **User Experience**. Layer 4 is for **Security**.

---

## Scalability

### Adding New Jabatan
```javascript
// 1. Add to constants
export const JABATAN = {
    // ... existing
    NEW_POSITION: 'New Position Name',
};

// 2. Create access group if needed
export const ACCESS_GROUPS = {
    // ... existing
    NEW_POSITION_ONLY: {
        allowedRoles: [],
        allowedJabatan: [JABATAN.NEW_POSITION],
        requireAny: false,
    },
};

// 3. Use in routes
<ProtectedRoute {...ACCESS_GROUPS.NEW_POSITION_ONLY}>
    <NewPage />
</ProtectedRoute>
```

### Adding New Role
```javascript
// 1. Add to constants
export const ROLES = {
    // ... existing
    MANAGER: 'manager',
};

// 2. Update access groups
export const ACCESS_GROUPS = {
    MANAGEMENT: {
        allowedRoles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
        allowedJabatan: [],
        requireAny: false,
    },
};
```

---

## Related Documentation

- **Token Expiry**: `TOKEN_EXPIRY_GUIDE.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Project README**: `README.md`
- **Improvements**: `IMPROVEMENTS.md`

---

**Version**: 1.0.0  
**Last Updated**: June 23, 2026  
**Status**: Production Ready  
**Next Steps**: Implement backend validation for all protected endpoints

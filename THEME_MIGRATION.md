# Theme Migration Guide

## Quick Replace Pattern untuk Update Components

Untuk mengupdate component agar theme-aware, gunakan pattern berikut:

### 1. Import useColorModeValue
```jsx
import { useColorModeValue } from '@chakra-ui/react';
```

### 2. Define theme colors di component
```jsx
function MyComponent() {
    const bgColor = useColorModeValue('white', 'dark.bg.card');
    const borderColor = useColorModeValue('light.border', 'dark.border');
    const textColor = useColorModeValue('light.text.primary', 'dark.text.primary');
    
    return (
        <Box bg={bgColor} borderColor={borderColor} color={textColor}>
            Content
        </Box>
    );
}
```

### 3. Replace Pattern (Find & Replace)

**Find**: `bg="white"`
**Replace**: `bg={useColorModeValue('white', 'dark.bg.card')}`

**Find**: `bg="#FFFFFF"`
**Replace**: `bg={useColorModeValue('white', 'dark.bg.card')}`

**Find**: `backgroundColor="white"`
**Replace**: `backgroundColor={useColorModeValue('white', 'dark.bg.card')}`

### 4. Common Patterns

#### Box/Card Components
```jsx
// Before
<Box bg="white" p={4} borderRadius="lg">

// After
<Box bg={useColorModeValue('white', 'dark.bg.card')} p={4} borderRadius="lg">
```

#### Table Components
```jsx
// Before  
<Table variant="simple">

// After (already themed via provider.jsx)
<Table variant="simple"> // No change needed!
```

#### Modal/Dialog
```jsx
// Before
<ModalContent bg="white">

// After (already themed via provider.jsx)
<ModalContent> // No change needed!
```

### 5. Files yang Perlu Update Manual

Files dengan banyak `bg="white"`:
- [x] src/pages/Staff/CSO/Personal/TrackTicketFmePage/index.jsx (4 instances)
- [x] src/pages/Staff/CSO/Personal/TicketingInternal/index.jsx (4 instances)
- [x] src/pages/Staff/CSO/Personal/ReviewKaryawanPage/index.jsx (2 instances)
- [x] src/pages/Staff/CSO/Personal/DashboardReminder/index.jsx (6 instances)
- [x] src/pages/Staff/CSO/Personal/ProfilSiswaPage/index.jsx (2 instances)
- [x] src/pages/Staff/CSO/Personal/DashboardProspektifPage/index.jsx
- [x] src/pages/Staff/CSO/Personal/DashboardPortfolioPage/index.jsx
- [x] src/pages/Staff/CSO/Personal/FdStudenIdentityPage/index.jsx

### 6. Automated Fix

Tambahkan hook di top component:
```jsx
import { useColorModeValue } from '@chakra-ui/react';

function Component() {
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    
    // Then use {cardBg} instead of "white"
}
```

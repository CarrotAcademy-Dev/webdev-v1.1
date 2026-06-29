# Dashboard Reminder - Documentation

## Overview
Dashboard Reminder adalah halaman untuk menampilkan berbagai reminder yang perlu diperhatikan oleh CSO Personal, termasuk:
- Foundation siswa yang akan naik modul
- Siswa yang sedang cuti
- Reminder chat untuk siswa fulltime
- Reminder harga fulltime (normal & promo)
- Holiday reminder

## Key Differences from Dashboard Prospektif

### Dashboard Prospektif
- **1 API endpoint** yang mengembalikan semua data sekaligus (KPI + tables)
- Menggunakan **checklist** untuk tracking task completion
- Filter: **date** saja (format: d mmm yyyy)
- State management: Object dengan Set per-date untuk checked items

### Dashboard Reminder
- **5 API endpoints terpisah** untuk tiap widget
- **Tidak ada checklist** - hanya display data
- Filter: **2 format berbeda**:
  - `bulan_tahun` (mmm yyyy) untuk Foundation & Cuti
  - `date` (d mmm yyyy) untuk Chat & Harga Fulltime
- No state management untuk checklist (read-only dashboard)

## API Endpoints

### Base URL
```
https://script.google.com/macros/s/AKfycb...../exec
```

### 1. Foundation Naik Modul
**Method:** GET  
**Action:** `get-dashboard-reminder`  
**Target:** `foundation-naik-modul`  
**Params:** `bulan_tahun` (format: mmm yyyy, e.g. "Nov 2025")

**Response:**
```json
{
  "status": "success",
  "result": [
    {
      "nama": "Radmilo Darren Jevera",
      "umur": "10 tahun 0 bulan",
      "tanggal_kelas_terdekat": "29 Nov 2025"
    }
  ],
  "result_jumlah": 1
}
```

**Table Columns:**
- Nomor (auto-increment)
- Nama
- Umur
- Tanggal Kelas Terdekat

---

### 2. Siswa Cuti
**Method:** GET  
**Action:** `get-dashboard-reminder`  
**Target:** `data-cuti`  
**Params:** `bulan_tahun` (format: mmm yyyy, e.g. "Nov 2025")

**Response:**
```json
{
  "status": "success",
  "result": [
    {
      "nama": "Aira Tatyana Danisha",
      "modul": "Drawing",
      "tanggal_kelas_terakhir": "2 Aug 2025"
    }
  ]
}
```

**Table Columns:**
- Nomor (auto-increment)
- Nama
- Modul
- Tanggal Kelas Terakhir

---

### 3. Reminder Chat Fulltime
**Method:** GET  
**Action:** `get-dashboard-reminder`  
**Target:** `reminder-chat-fulltime`  
**Params:** `date` (format: d mmm yyyy, e.g. "24 Nov 2025")

**Response:**
```json
{
  "status": "success",
  "result": [
    {
      "angkatan": "FD Aug 2025",
      "info": "Welcome Chat",
      "tanggal": "22 Jul 2025"
    }
  ],
  "result_jumlah": 12
}
```

**Table Columns:**
- Nomor (auto-increment)
- Angkatan
- Info
- Tanggal

---

### 4. Reminder Harga Fulltime
**Method:** GET  
**Action:** `get-dashboard-reminder`  
**Target:** `reminder-harga-fulltime`  
**Params:** `date` (format: d mmm yyyy, e.g. "24 Nov 2025")

**Response:**
```json
{
  "status": "success",
  "result_normal": [
    {
      "kode_faktur": "INV/231/8/2025",
      "nama": "Jauzaa Kamil Fathimah",
      "total_tagihan": "52500000",
      "sisa_biaya": "",
      "pembayaran_terakhir": "26 Jun 2025"
    }
  ],
  "result_promo": [
    {
      "kode_faktur": "INV/230/8/2025",
      "nama": "Jauzaa Kamil Fathimah",
      "total_tagihan": "1000000",
      "sisa_biaya": "",
      "pembayaran_terakhir": "6/26/2025"
    }
  ],
  "result_normal_jumlah": 1,
  "result_promo_jumlah": 1
}
```

**Table Columns (2 tables: Normal & Promo):**
- Nomor (auto-increment)
- Kode Faktur
- Nama
- Total Tagihan
- Sisa Biaya
- Pembayaran Terakhir

---

### 5. Reminder Holiday
**Method:** GET  
**Action:** `get-dashboard-reminder`  
**Target:** `reminder-holiday`  
**Params:** None (no filter needed)

**Response:**
```json
{
  "status": "success",
  "result": {
    "reminder_holiday": {
      "tanggal": "25 Dec 2025",
      "keterangan": "Hari Raya Natal",
      "sisa_hari": 31
    }
  }
}
```

**Display:** Alert box with holiday info at top of page

---

## Implementation Details

### File Structure
```
src/
├── features/cso/
│   └── csoApiService.jsx                    # 5 API functions
├── pages/Staff/CSO/Personal/
│   └── DashboardReminder/
│       ├── index.jsx                        # Main component
│       └── DashboardReminder.styled.jsx     # Styled components
├── components/Navbar/index.jsx               # Menu entry
└── App.jsx                                   # Route config
```

### API Service Functions (csoApiService.jsx)

#### 1. getReminderFoundationNaikModul
```javascript
export const getReminderFoundationNaikModul = async (dataFilter) => {
  const response = await apiClient.get(ENDPOINT.csoPersonal, {
    params: { 
      action: 'get-dashboard-reminder',
      target: 'foundation-naik-modul',
      bulan_tahun: dataFilter
    }
  });
  return result.result || [];
}
```

#### 2. getReminderSiswaCuti
```javascript
export const getReminderSiswaCuti = async (dataFilter) => {
  const response = await apiClient.get(ENDPOINT.csoPersonal, {
    params: {
      action: 'get-dashboard-reminder',
      target: 'data-cuti',
      bulan_tahun: dataFilter  // Fixed typo from buln_tahun
    }
  });
  return result.result || [];
}
```

#### 3. getReminderChatFulltime
```javascript
export const getReminderChatFulltime = async (dataFilter) => {
  const response = await apiClient.get(ENDPOINT.csoPersonal, {
    params: {
      action: 'get-dashboard-reminder',
      target: "reminder-chat-fulltime",
      date: dataFilter
    }
  });
  return result.result || [];
}
```

#### 4. getReminderHargaFulltime
```javascript
export const getReminderHargaFulltime = async (dataFilter) => {
  const response = await apiClient.get(ENDPOINT.csoPersonal, {
    params: {
      action: 'get-dashboard-reminder',
      target: 'reminder-harga-fulltime',
      date: dataFilter
    }
  });
  
  // Return structured object, not array
  return {
    normal: result.result_normal || [],
    promo: result.result_promo || [],
    normalCount: result.result_normal_jumlah || 0,
    promoCount: result.result_promo_jumlah || 0
  };
}
```

#### 5. getReminderHoliday
```javascript
export const getReminderHoliday = async () => {
  const response = await apiClient.get(ENDPOINT.csoPersonal, {
    params: {
      action: 'get-dashboard-reminder',
      target: 'reminder-holiday'
    }
  });
  
  // Return the nested reminder_holiday object
  return result.result?.reminder_holiday || {};
}
```

### Component Architecture (index.jsx)

#### State Management
```javascript
// Date filter states - 2 different formats
const [monthYearFilter, setMonthYearFilter] = useState(formatToMonthYear(currentDate));
const [dateFilter, setDateFilter] = useState(formatToDayMonthYear(currentDate));

// Pagination states - separate for each table
const [foundationPage, setFoundationPage] = useState(1);
const [cutiPage, setCutiPage] = useState(1);
const [chatPage, setChatPage] = useState(1);
const [hargaNormalPage, setHargaNormalPage] = useState(1);
const [hargaPromoPage, setHargaPromoPage] = useState(1);
const itemsPerPage = 5;
```

#### React Query - 5 Independent Queries
```javascript
// Query 1: Foundation - uses monthYearFilter
const { data: foundationData = [], isLoading: foundationLoading } = useQuery({
  queryKey: ['reminderFoundation', monthYearFilter],
  queryFn: () => getReminderFoundationNaikModul(monthYearFilter),
  staleTime: 5 * 60 * 1000,
});

// Query 2: Cuti - uses monthYearFilter
const { data: cutiData = [], isLoading: cutiLoading } = useQuery({
  queryKey: ['reminderCuti', monthYearFilter],
  queryFn: () => getReminderSiswaCuti(monthYearFilter),
  staleTime: 5 * 60 * 1000,
});

// Query 3: Chat - uses dateFilter
const { data: chatData = [], isLoading: chatLoading } = useQuery({
  queryKey: ['reminderChat', dateFilter],
  queryFn: () => getReminderChatFulltime(dateFilter),
  staleTime: 5 * 60 * 1000,
});

// Query 4: Harga - uses dateFilter, returns object
const { data: hargaData = { normal: [], promo: [] }, isLoading: hargaLoading } = useQuery({
  queryKey: ['reminderHarga', dateFilter],
  queryFn: () => getReminderHargaFulltime(dateFilter),
  staleTime: 5 * 60 * 1000,
});

// Query 5: Holiday - no filter
const { data: holidayData = {}, isLoading: holidayLoading } = useQuery({
  queryKey: ['reminderHoliday'],
  queryFn: getReminderHoliday,
  staleTime: 5 * 60 * 1000,
});
```

#### Pagination Helper
```javascript
const paginateData = (dataArray, currentPage) => {
  if (!dataArray || dataArray.length === 0) {
    return { paginatedData: [], totalPages: 1 };
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return {
    paginatedData: dataArray.slice(startIndex, endIndex),
    totalPages: Math.ceil(dataArray.length / itemsPerPage)
  };
};
```

#### Reusable Components
```javascript
// Pagination Controls
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <Flex justify="space-between" align="center" mt={4}>
    <Text>Halaman {currentPage} dari {totalPages}</Text>
    <Flex gap={2}>
      <IconButton icon={<FiChevronLeft />} onClick={() => onPageChange(currentPage - 1)} />
      <IconButton icon={<FiChevronRight />} onClick={() => onPageChange(currentPage + 1)} />
    </Flex>
  </Flex>
);

// Table Header
const TableHeader = ({ children }) => (
  <Box as="th" bg="#FE7743" color="white" fontWeight="bold">
    {children}
  </Box>
);

// Table Cell
const TableCell = ({ children, wrap = false }) => (
  <Box as="td" wordBreak={wrap ? "break-word" : "normal"}>
    {children}
  </Box>
);

// Skeleton Loading
const TableSkeleton = ({ columns = 3 }) => (
  <>
    {[...Array(5)].map((_, idx) => (
      <Box as="tr" key={idx}>
        {[...Array(columns)].map((_, colIdx) => (
          <TableCell key={colIdx}>
            <Skeleton height={20} />
          </TableCell>
        ))}
      </Box>
    ))}
  </>
);
```

### UI Layout

#### Page Structure
```
┌─────────────────────────────────────┐
│ Dashboard Reminder (Title)          │
├─────────────────────────────────────┤
│ Overview Cards (2x3 Grid)           │
│ ┌──────┬──────┬──────┐             │
│ │Found │Chat  │Holida│             │
│ │Nation│FT    │y     │             │
│ ├──────┼──────┼──────┤             │
│ │Boot  │Harga │Harga │             │
│ │camp  │Promo │Normal│             │
│ └──────┴──────┴──────┘             │
├─────────────────────────────────────┤
│ Filters (Date Pickers)              │
│ - Month/Year Picker (Foundation)    │
│ - Full Date Picker (Chat & Harga)   │
├─────────────────────────────────────┤
│ Foundation Naik Modul Table          │
│ [Total: X]                          │
│ ┌─────┬──────┬──────┬────────────┐  │
│ │ No  │ Nama │ Umur │ Tgl Kelas  │  │
│ └─────┴──────┴──────┴────────────┘  │
│ [Pagination]                        │
├─────────────────────────────────────┤
│ Siswa Cuti Table                    │
│ [Total: X]                          │
│ ┌─────┬──────┬────────┬──────────┐  │
│ │ No  │ Nama │ Modul  │ Tgl Akhir│  │
│ └─────┴──────┴────────┴──────────┘  │
│ [Pagination]                        │
├─────────────────────────────────────┤
│ Chat Fulltime Table                 │
│ [Total: X]                          │
│ ┌─────┬──────────┬──────┬────────┐  │
│ │ No  │ Angkatan │ Info │ Tanggal│  │
│ └─────┴──────────┴──────┴────────┘  │
│ [Pagination]                        │
├─────────────────────────────────────┤
│ Harga Fulltime - Normal Table       │
│ [Total: X]                          │
│ ┌───┬────────┬────┬────┬────┬────┐  │
│ │No │ Faktur │Nama│Tag.│Sisa│Byr │  │
│ └───┴────────┴────┴────┴────┴────┘  │
│ [Pagination]                        │
├─────────────────────────────────────┤
│ Harga Fulltime - Promo Table        │
│ [Total: X]                          │
│ ┌───┬────────┬────┬────┬────┬────┐  │
│ │No │ Faktur │Nama│Tag.│Sisa│Byr │  │
│ └───┴────────┴────┴────┴────┴────┘  │
│ [Pagination]                        │
└─────────────────────────────────────┘
```

### Styling
- **Page Title:** `#FE7743` (brand orange)
- **Table Header:** `#fcf7ecff` (beige/cream) with `#3b3b43ff` text - **matching Dashboard Prospektif**
- **Overview Cards:** White with `#1e5aa8` (blue) icon backgrounds
- **Overview Value Boxes:** `#fef3c7` (light yellow/cream) - **matching spreadsheet design**
- **Background:** White cards with soft shadows
- **Border radius:** `12px` (rounded)
- **Pagination:** Orange colorScheme
- **Custom Scrollbar:** Styled for smooth UX
- **Hover Effects:** Cards lift on hover (translateY -4px)
- **Date Picker:** Styled with border transition on focus

### Features
1. **5 independent data fetches** - each section loads separately
2. **Single Date Picker** - One unified date filter that auto-converts to both formats (mmm yyyy & d mmm yyyy)
3. **Overview Cards** - 6 summary cards with icons matching spreadsheet design
4. **Consistent Styling** - Styled components matching Dashboard Prospektif
5. **Pagination** - 5 items per page for each table
6. **Skeleton loading** - per-table loading states
7. **Responsive tables** - horizontal scroll on small screens with custom scrollbar
8. **Total counts** - displayed next to section titles
9. **Empty state** - "Tidak ada data" message
10. **Beige/Cream headers** - Matching Dashboard Prospektif color scheme (#fcf7ecff)
11. **Smart Format Conversion** - Single date auto-formats for different API endpoints

### Route & Navigation
- **Route:** `/my-tasks/dashboard-reminder`
- **Menu:** CSO → Personal → Dashboard Reminder
- **Protected:** Yes (requires login via ProtectedRoute)
- **Lazy loaded:** Yes (via React.lazy)

### Usage Example

### Single Date Filter with Auto-Format
```javascript
// User selects ONE date: 25 Dec 2025
setSelectedDate(new Date("2025-12-25"));

// Auto-converts to 2 formats for different APIs:
const monthYearFilter = formatToMonthYear(selectedDate); // "Dec 2025" → Foundation & Cuti
const dateFilter = formatToDayMonthYear(selectedDate);   // "25 Dec 2025" → Chat & Harga

// All 5 endpoints auto-refetch with correct format
```

### Pagination
```javascript
// User clicks next page on Foundation table
setFoundationPage(2); // Shows items 6-10

// Independent pagination for each table
// Changing foundationPage doesn't affect cutiPage, chatPage, etc.
```

### Data Flow
```
User Input (Filter) 
  ↓
React Query detects queryKey change 
  ↓
Calls API service function 
  ↓
Google Apps Script processes request 
  ↓
Returns JSON data 
  ↓
React Query caches result (5 min staleTime) 
  ↓
Component renders table with data 
  ↓
User clicks pagination 
  ↓
Component slices cached data for new page (no refetch)
```

### Common Issues & Solutions

### Issue 1: DatePicker not showing
**Cause:** react-datepicker CSS not imported  
**Solution:** Make sure `'react-datepicker/dist/react-datepicker.css'` is imported at top of component

### Issue 2: Date format mismatch
**Cause:** DatePicker returns Date object, API expects string  
**Solution:** Use `formatToMonthYear()` and `formatToDayMonthYear()` helper functions

### Issue 2: Skeleton loading doesn't show
**Cause:** Data already in cache (staleTime = 5 min)  
**Solution:** Wait 5 minutes or manually clear React Query cache

### Issue 3: Harga data not displaying
**Cause:** Expecting array instead of object  
**Solution:** Access via `hargaData.normal` and `hargaData.promo`

### Issue 4: Holiday not showing
**Cause:** Wrong object path in response  
**Solution:** Backend returns `result.result.reminder_holiday`, not `result.result` directly

## Testing Checklist

- [ ] Holiday alert shows correct data on page load
- [ ] Month/Year filter updates Foundation & Cuti tables
- [ ] Date filter updates Chat & Harga tables
- [ ] Pagination works independently for all 5 tables
- [ ] Skeleton loading appears during initial fetch
- [ ] Empty state message shows when no data
- [ ] Total counts match actual data length
- [ ] Table horizontal scroll works on mobile
- [ ] Navigation from menu works correctly
- [ ] Protected route redirects unauthenticated users

## Recent Updates

### Version 1.2 (2025-11-24)
- **Single Date Filter** - Unified to 1 date picker at top (auto-converts to both formats)
- **Smart Format Conversion** - One date → two formats (mmm yyyy & d mmm yyyy)
- **Better UX** - Cleaner UI with filter next to page title
- **Z-index Fix** - DatePicker popup no longer hidden by table headers

### Version 1.1 (2025-11-24)
- **Added Date Pickers** - Replaced text inputs with react-datepicker
- **Added Overview Cards** - 6 summary cards with icons (2x3 grid)
- **Consistent Styling** - Created styled component file matching Dashboard Prospektif
- **Updated Colors** - Table headers now use beige/cream (#fcf7ecff) instead of orange
- **Icon Integration** - Added react-icons for overview cards (FiTrendingUp, FiMessageSquare, etc.)
- **Hover Effects** - Cards animate on hover for better UX
- **Custom Scrollbar** - Styled scrollbar for tables

## Future Enhancements

1. ~~**Date pickers** instead of text inputs for better UX~~ **DONE**
2. ~~**Dashboard overview** card showing total counts for all sections~~ **DONE**
3. **Export to Excel** functionality for each table
4. **Search/filter** within tables
5. **Sort** by column headers
6. **Email/notification** for upcoming holidays or reminders
7. **Bootcamp Countdown** - Implement real data for bootcamp overview card

---

**Created:** 2025-11-24  
**Last Updated:** 2025-11-24  
**Version:** 1.1  
**Status:** Complete & Enhanced

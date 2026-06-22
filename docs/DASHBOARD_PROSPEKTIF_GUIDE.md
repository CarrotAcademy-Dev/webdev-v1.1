# Dashboard Prospektif Personal - Implementation Guide

**Created**: November 19, 2025  
**Status**: COMPLETED

---

## Overview

Dashboard Prospektif Personal adalah halaman untuk CSO Personal yang menampilkan data prospektif siswa harian dengan fitur:
- Filter tanggal
- KPI Cards (Trial Class, First Class, Follow Up 1-3)
- 5 Tabel data dengan checklist interaktif
- Real-time update setelah checklist

---

## File Structure

```
src/
├── features/cso/
│   └── csoApiService.jsx                          # API functions added
├── pages/Staff/CSO/Personal/
│   └── DashboardProspektifPage/
│       ├── index.jsx                               # Main component
│       └── DashboardProspektif.styled.jsx         # Styled components
├── components/
│   ├── Navbar/index.jsx                            # Menu added
│   └── Menu/index.jsx                              # Already supports nested menu
├── config/
│   └── api.config.js                               # csoPersonal endpoint added
├── App.jsx                                         # Route added
└── .env                                            # Endpoint already configured
```

---

## 🔌 API Integration

### 1. **Get Dashboard Data**
```javascript
// GET Request
getDashboardProspektifPersonal(dateFilter)

// Endpoint
https://script.google.com/macros/s/AKfycby89..../exec

// Parameters
- action: 'get-dashbord-prospektif'
- date_req: '2025-11-19' (YYYY-MM-DD format)

// Response
{
  status: 'success',
  result: {
    angka: {
      followup_1: "4 / 4",
      followup_2: "6 / 6",
      followup_3: "10 / 13",
      trial_class: 0,
      first_class: 4
    },
    data: {
      daftar_first_class: [[psid, nama, tanggal, nomorSiswa, nomorOrtu], ...],
      daftar_trial_class: [[psid, nama, tanggal, nomorSiswa, nomorOrtu], ...],
      list_ongoing_fu1: [[tanggal, psid, nama, nomorSiswa, nomorOrtu], ...],
      list_ongoing_fu2: [[tanggal, psid, nama, nomorSiswa, nomorOrtu], ...],
      list_ongoing_fu3: [[tanggal, psid, nama, nomorSiswa, nomorOrtu], ...]
    }
  }
}
```

### 2. **Checklist Item**
```javascript
// POST Request
ceklisDashboardProspektif({ target, psid, pic })

// Parameters
- action: 'ceklis-dashbord-prospektif'
- target: 'follow-up1' | 'follow-up2' | 'follow-up3' | 'trial-class' | 'first-class'
- psid: student ID (string)
- pic: user name (from auth.getUser())

// Response
{
  status: 'success',
  message: 'Catherine Michelle Desideratus berhasil di update.'
}
```

---

## UI Components

### KPI Cards (5 cards)
- **Trial Class hari ini** - Jumlah trial class untuk tanggal terpilih
- **First Class hari ini** - Jumlah first class untuk tanggal terpilih
- **Follow Up 1** - Format "done / total" (e.g., "4 / 4")
- **Follow Up 2** - Format "done / total" (e.g., "6 / 6")
- **Follow Up 3** - Format "done / total" (e.g., "10 / 13")

### Tables (5 tables)

#### 1. Trial Class Table
- Columns: Halaman (Checkbox) | No | Nama | Tanggal Trial Class | Nomor Handphone
- Checklist target: `trial-class`

#### 2. First Class Table
- Columns: Halaman (Checkbox) | No | Nama | Tanggal First Class | Nomor Handphone
- Checklist target: `first-class`

#### 3. Follow Up 1 Table
- Columns: Halaman (Checkbox) | No | Tanggal Follow Up 1 | PSID | Nama | Nomor Handphone
- Checklist target: `follow-up1`

#### 4. Follow Up 2 Table
- Columns: Halaman (Checkbox) | No | Tanggal Follow Up 2 | PSID | Nama | Nomor Handphone
- Checklist target: `follow-up2`

#### 5. Follow Up 3 Table
- Columns: Halaman (Checkbox) | No | Tanggal Follow Up 3 | PSID | Nama | Nomor Handphone
- Checklist target: `follow-up3`

---

## Features

### 1. Date Filter
```jsx
<Input
  type="date"
  value={selectedDate}
  onChange={handleDateChange}
/>
```
- Default: Today's date
- Format: YYYY-MM-DD
- Auto-refetch data on change

### 2. Interactive Checklist
```jsx
<Checkbox
  colorScheme="green"
  isDisabled={checklistMutation.isPending}
  onChange={() => handleChecklist(targetType, psid)}
/>
```
- Disabled during mutation (prevent double-click)
- Auto-refetch after success
- Toast notification on success/error
- Automatic PIC assignment from logged-in user

### 3. Real-time Updates
- Uses React Query for data fetching
- Automatic refetch after checklist update
- Loading skeleton during fetch
- Error handling with toast

---

## Usage Example

### Navigate to Page
```
Menu > CSO Personal > Dashboard Prospektif
URL: /my-tasks/dashboard-prospektif
```

### User Flow
1. User selects date using date picker
2. System fetches data for selected date
3. KPI cards show summary statistics
4. Tables display detailed data
5. User checks checkbox to mark item as done
6. System updates backend and refetches data
7. Toast shows success/error message

---

## Data Flow

```
User Action (Select Date)
    ↓
useQuery triggers
    ↓
getDashboardProspektifPersonal(date)
    ↓
API Call to Google Apps Script
    ↓
Response with angka + data
    ↓
Render KPI Cards + Tables
    ↓
User clicks Checkbox
    ↓
useMutation triggers
    ↓
ceklisDashboardProspektif({ target, psid, pic })
    ↓
API Updates Google Sheets
    ↓
onSuccess: refetch() + toast
    ↓
Updated data displayed
```

---

## Key Implementation Details

### 1. Phone Number Priority
```javascript
const nomorHP = nomorSiswa || nomorOrtu || '-';
```
Menampilkan nomor siswa, jika tidak ada tampilkan nomor orang tua, jika tidak ada tampilkan "-"

### 2. Auto PIC Assignment
```javascript
const user = auth.getUser();
// ...
await checklistMutation.mutateAsync({
  target,
  psid: psid.toString(),
  pic: user.name
});
```
PIC diambil otomatis dari user yang sedang login

### 3. Date Format Handling
```javascript
const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```
Memastikan format tanggal sesuai dengan requirement backend

---

## Styling Highlights

### Responsive Design
- Mobile-friendly tables with horizontal scroll
- Stacked layout for KPI cards on small screens
- Responsive padding and margins

### Interactive Elements
- Hover effects on table rows
- Card hover animations (translateY + shadow)
- Custom scrollbar styling

### Color Scheme
- Primary: `brand.primary` (for headers and titles)
- Accent: `brand.accent` (for KPI numbers)
- Success: Green checkbox (colorScheme="green")
- Table borders: Gray.200

---

## Error Handling

### API Errors
```javascript
try {
  // API call
} catch (error) {
  toast({
    title: "Gagal",
    description: error.message || "Terjadi kesalahan",
    status: "error",
    duration: 3000,
    isClosable: true,
  });
}
```

### User Validation
```javascript
if (!user?.name) {
  toast({
    title: "Error",
    description: "User tidak ditemukan",
    status: "error",
  });
  return;
}
```

---

## Performance Considerations

### 1. React Query Caching
```javascript
queryKey: ['dashboardProspektifPersonal', selectedDate]
```
- Data cached per date
- No unnecessary refetches for same date

### 2. Lazy Loading
```javascript
const DashboardProspektifPage = lazy(() => 
  import('./pages/Staff/CSO/Personal/DashboardProspektifPage')
);
```
- Component loaded only when route is accessed

### 3. Skeleton Loading
- Smooth loading experience
- Prevents layout shift
- User feedback during fetch

---

## Security

### Authentication Required
```jsx
<ProtectedRoute>
  <Layout>
    <DashboardProspektifPage />
  </Layout>
</ProtectedRoute>
```

### User Context
- PIC automatically from logged-in user
- No manual user input for tracking

---

## Testing Checklist

- [x] Date filter changes trigger refetch
- [x] KPI cards display correct numbers
- [x] Tables show correct data structure
- [x] Checkbox triggers mutation
- [x] Toast shows on success/error
- [x] Loading states work properly
- [x] Empty state displays correctly
- [x] Responsive on mobile devices
- [x] Route accessible via menu
- [x] Protected route works

---

## Future Enhancements

### Possible Improvements:
1. **Export to Excel** - Download filtered data
2. **Bulk Checklist** - Check multiple items at once
3. **Date Range Filter** - View data for multiple days
4. **History Log** - Show who checked what and when
5. **Search/Filter** - Search by name or PSID within tables
6. **Statistics Chart** - Visual representation of completion rates

---

## Related Documentation

- [API Documentation](https://script.google.com/u/0/home/projects/1BKQoFMON384EvewtC7Xtm7T1l3tJ6eEG8cyeB0xtZxOOczWevfobLaXZ/edit)
- [csoApiService.jsx](../src/features/cso/csoApiService.jsx) - API functions
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Utilities used

---

## Team Notes

### For Backend Team:
- Endpoint sudah implemented di Google Apps Script
- Response format sudah sesuai requirement
- Filter tanggal wajib diisi (validation di backend)

### For Frontend Team:
- Pattern yang sama bisa digunakan untuk halaman CSO Personal lainnya
- Reusable components: TableHeader, TableCell, FollowUpTable, ClassTable
- Style konsisten dengan halaman CSO Bersama lainnya

### For QA Team:
- Test dengan berbagai tanggal
- Test checklist dengan berbagai target types
- Test empty state (tanggal tanpa data)
- Test error scenarios (network error, invalid date)

---

**Status**: READY FOR PRODUCTION

**Last Updated**: November 19, 2025

**Questions?** Contact: Development Team

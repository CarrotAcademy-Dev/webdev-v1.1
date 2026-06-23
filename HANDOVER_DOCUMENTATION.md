# CarrotAcademy v1.1 - Handover Documentation

**Created**: June 22, 2026  
**Last Updated**: June 23, 2026  
**Purpose**: Complete handover guide untuk developer/team berikutnya  
**Status**: Ready for handover

---

## Table of Contents

1. [System Overview & Current State](#1-system-overview--current-state)
2. [Credentials & Endpoint Mapping](#2-credentials--endpoint-mapping)
3. [Pending Tasks & Next Steps](#3-pending-tasks--next-steps)

---

## 1. System Overview & Current State

### 1.1 Project Summary

**CarrotAcademy v1.1** adalah internal da SPA yang dibangun dengan:
- **Frontend**: React 18 + Vite
- **UI Library**: Chakra UI + Styled Components
- **State Management**: React Query (server state) + React Context (global UI state)
- **Backend**: Google Apps Script (GAS) dengan Google Sheets database
- **Deployment**: Vercel (auto-deploy dari branch `main` dan `develop`)
- **Security**: Role-Based Access Control (RBAC), Session Management dengan auto-logout

**Live URLs**:
- **Production**: `https://[vercel-domain].vercel.app` (deploy dari `main` branch)
- **Staging**: `https://[vercel-domain]-git-develop.vercel.app` (deploy dari `develop` branch)

---

### 1.2 Current Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CARROT ACADEMY v1.1                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND (Vite + React 18)                                  │
│  ├─ Pages (50+ pages untuk CSO, ESO, Finance, HRGA, Admin)   │
│  ├─ Components (30+ reusable components)                     │
│  ├─ Features (Auth, CSO, ESO, Finance, HR)                   │
│  ├─ Utilities (storage, formatters, validation, etc)         │
│  ├─ Context (Auth, Sidebar)                                  │
│  ├─ Hooks (custom hooks untuk common logic)                  │
│  └─ Services (API integration layer)                         │
│                                                              │
│  API LAYER (Axios clients per feature)                       │
│  ├─ authApiService.jsx (login, register, password mgmt)      │
│  ├─ csoApiService.jsx (CSO operations)                       │
│  ├─ esoApiService.jsx (ESO operations)                       │
│  ├─ financeApiService.jsx (Finance operations)               │
│  ├─ hrApiService.jsx (HR/Recruitment operations)             │
│  └─ assetApiServices.jsx (HRGA/ Asset management)            │
│                                                              │
│  BACKEND (Google Apps Script)                                │
│  ├─ Auth Endpoint (login, register, password)                │
│  ├─ CSO Endpoints (Bersama & Personal)                       │
│  ├─ ESO Endpoints (Bersama & Personal)                       │
│  ├─ Finance Endpoints (Bersama & Personal)                   │
│  ├─ HR Endpoints (Recruitment & Asset Management)            │
│  └─ Database: Google Sheets (multiple spreadsheets)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 1.3 Development Status (Per 23 Juni 2026)

#### COMPLETED FEATURES

**Authentication & Security**
- Login dengan email & password
- Role-Based Access Control (RBAC) - 3 roles: Staff, Admin, Super Admin
- 12 Jabatan types dengan access groups
- Token expiry (8 jam) dengan auto-logout
- Session monitoring dengan productive/idle tracking
- Session timer badge di navbar (real-time)
- Forgot password dengan email reset
- Update password dengan strength indicator
- Register user page (admin-only)

**Dashboard & Reporting**
- Overview dashboard (semua user)
- Attendance calendar & history
- KPI details page
- Task summary & statistics
- Profile page (view & edit)
- Settings page (theme toggle, password change)

**CSO Features (50+ pages)**
- Dashboard Prospektif (Personal)
- Dashboard Reminder
- Profil Siswa
- Lost & Found
- Daftar Trial Students
- Statistik Prospektif
- Daily Story
- Janji Temu
- Ticket Management (Internal & External)
- Merchandise Delivery
- Pendaftaran Lanjutan
- Partnership Management
- Dashboard Siswa Aktif
- Rekap Jadwal Mentor
- Daftar Kelas Tersedia
- Portfolio Dashboard
- Invoice Dashboard
- Review Karyawan
- & lebih lainnya...

**ESO Features**
- Dashboard FD (Foundation)
- Ticketing Internal & External
- Student Report
- Kelengkapan Data
- Nomor Urut Sertifikat
- Artwork of the Month
- Progress Report Monthly
- Daftar Offboarding
- & lainnya

**Finance Division Features**
- **Bersama (Shared)**: Approval Pendaftaran, Daftar Harga, Data BKM, Bukti Pembayaran, Tagihan, Daftar Offboarding, Pendaftaran Fulltime Course, Merchandise Delivery, Ticketing External
- **Personal**: Dashboard Pendapatan, Daftar Harga, Ticketing Internal, Track Ticket, Review Karyawan, Statistik Tagihan, Profile Siswa
- Total: 16 pages
- API Service: `financeApiService.jsx`

**HRGA Division Features**
- **HR Recruitment** (7 pages): Dashboard Report, HR Requests, Jam Kerja, Tugas Interview, Hasil Response Test, Applicant Data, Penilaian Kandidat
- **Asset Management** (9 pages): Dashboard Asset, Asset Data, Daily Asset, Detail Barang, Maintenance, Peminjaman Barang, Penyusutan, Services, Asset History
- Total: 16 pages
- API Services: `hrApiService.jsx` + `assetApiServices.jsx`
- Endpoints: HR Recruitment & HRGA Asset Management

**System Features**
- Dark/Light mode toggle
- Responsive design (mobile, tablet, desktop)
- Error handling & logging
- Input validation
- Loading states & skeletons
- Toast notifications
- Lazy loading untuk performance

#### IN PROGRESS / PARTIAL

- Export to Excel functionality (partial)
- Real-time notifications (not yet implemented)
- Printing features (partial)

#### NOT YET IMPLEMENTED

- WebSocket real-time updates
- File upload (document, image)
- Advanced reporting & analytics
- Mobile app version
- Email integration (except password reset)

---

### 1.4 Technology Stack

```
Frontend:
  - React 18.3.1
  - Vite 6.3.5 (bundler)
  - React Router DOM 6.30.3
  - Chakra UI 2.8.2
  - Styled Components 6.1.11
  - React Query 5.82.0 (TanStack Query)
  - Axios 1.10.0
  - date-fns 4.1.0
  - React Icons 5.2.1
  - Recharts 3.0.0
  - Chart.js 4.5.0

Backend:
  - Google Apps Script (v8.1)
  - Google Sheets (multiple spreadsheets as database)

Deployment:
  - Vercel (auto-deploy)
  - GitHub (version control)

Development:
  - ESLint 9.25.0
  - Vitest 4.1.2 (test runner)
  - @vitejs/plugin-react 4.4.1
```

---

### 1.5 Folder Structure

```
src/
├── App.jsx                          # Main routing
├── main.jsx                         # Entry point, providers setup
├── index.css                        # Global styles + CSS variables
│
├── components/                      # Reusable UI components
│   ├── Login/
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Layout/
│   ├── SessionTimeout/
│   ├── ProtectedRoute/
│   ├── Table/
│   ├── TasksChart/
│   ├── AttendanceCalendar/
│   ├── PasswordStrengthIndicator/
│   ├── Settings/
│   ├── ThemeToggle/
│   └── ... (30+ components)
│
├── pages/                           # Full-page components
│   ├── Staff/
│   │   ├── OverviewPage.jsx
│   │   ├── CSO/
│   │   │   ├── Bersama/            # Shared CSO tasks (50+ pages)
│   │   │   └── Personal/           # Personal CSO tasks
│   │   ├── ESO/
│   │   │   ├── Bersama/            # ESO shared (10+ pages)
│   │   │   └── Personal/           # ESO personal (5+ pages)
│   │   ├── Finance/
│   │   │   ├── Bersama/            # Finance shared (9 pages)
│   │   │   └── Personal/           # Finance personal (7 pages)
│   │   └── HRGA/
│   │       ├── HRRecruitmen/       # HR Recruitment (7 pages)
│   │       └── Asset/              # Asset Management (9 pages)
│   ├── Admin/
│   │   └── RegisterUserPage.jsx
│   ├── Login.jsx
│   ├── ForgotPassword.jsx
│   ├── UpdatePassword.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   └── AccessDenied/
│
├── features/                        # API services per division
│   ├── auth/
│   │   └── authApiService.jsx       # Auth API functions
│   ├── cso/
│   │   └── csoApiService.jsx        # CSO API functions (100+ functions)
│   ├── eso/
│   │   └── esoApiService.jsx        # ESO API functions
│   ├── finance/
│   │   └── financeApiService.jsx    # Finance API functions
│   └── hr/
│       ├── hrApiService.jsx         # HR Recruitment API functions
│       └── assetApiServices.jsx     # Asset Management API functions
│
├── context/                         # React Context
│   ├── AuthContext.jsx              # Auth state + session management
│   └── SidebarContext.jsx           # Sidebar open/close state
│
├── hooks/                           # Custom React hooks
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   ├── usePagination.js
│   ├── useTaskSummary.js
│   ├── useLoadingState.js
│   └── useTheme.js
│
├── utils/                           # Utility functions
│   ├── storage.js                   # localStorage wrapper with expiry
│   ├── formatters.js                # Date, currency, number formatters
│   ├── errorHandler.js              # Error handling & logging
│   ├── validation.js                # Form validation
│   ├── logger.js                    # Centralized logging
│   ├── validateEnv.js              # Env var validation
│   ├── themeColors.js              # Theme color definitions
│   └── constants/
│       ├── accessControl.js         # RBAC roles & access groups
│       └── data.jsx                 # Constant data
│
├── config/                          # Configuration files
│   ├── api.config.js                # API endpoints, query client config
│   └── navigation.config.js         # Menu configuration with RBAC
│
├── services/
│   └── baseApiService.js            # Base API configuration
│
└── test/
    ├── setup.js
    └── helpers/
```

---

### 1.6 Current Deployment Status

| Environment |  Status  |    Deploy From    |                    URL                    |
|-------------|----------|-------------------|-------------------------------------------|
| Production  | Live     | `main` branch     | `https://[domain].vercel.app`             |
| Staging     | Live     | `develop` branch  | `https://[domain]-git-develop.vercel.app` |
| Local Dev   | Working  | Run `npm run dev` | `https://localhost:5173`                  |

**Last Deployment**: 22 Juni 2026 (manual merge from develop to main)

---

## 2. Credentials & Endpoint Mapping

### 2.1 Environment Variables (REQUIRED)

Semua env vars harus dikonfigurasi di `.env` file untuk production deployment.

```bash
# .env file structure
# ==================

# API Base URL (Google Apps Script base)
VITE_API_BASE_URL=https://script.google.com/macros/s

# CSO API Endpoints (Google Apps Script)
VITE_API_CSO_BERSAMA_ENDPOINT=https://script.google.com/macros/s/[CSO_BERSAMA_SCRIPT_ID]/exec
VITE_API_CSO_PERSONAL_ENDPOINT=https://script.google.com/macros/s/[CSO_PERSONAL_SCRIPT_ID]/exec

# ESO API Endpoints
VITE_API_ESO_BERSAMA_ENDPOINT=https://script.google.com/macros/s/[ESO_BERSAMA_SCRIPT_ID]/exec
VITE_API_ESO_PERSONAL_ENDPOINT=https://script.google.com/macros/s/[ESO_PERSONAL_SCRIPT_ID]/exec

# Finance API Endpoints
VITE_API_FINANCE_BERSAMA_ENDPOINT=https://script.google.com/macros/s/[FINANCE_BERSAMA_SCRIPT_ID]/exec
VITE_API_FINANCE_PERSONAL_ENDPOINT=https://script.google.com/macros/s/[FINANCE_PERSONAL_SCRIPT_ID]/exec

# HR API Endpoints
VITE_HR_RECRUITMENT_ENDPOINT=https://script.google.com/macros/s/[HR_RECRUITMENT_SCRIPT_ID]/exec
VITE_HRGA_ASSET_ENDPOINT=https://script.google.com/macros/s/[HRGA_ASSET_SCRIPT_ID]/exec

# Auth API Endpoint
VITE_API_AUTH_ENDPOINT=https://script.google.com/macros/s/[AUTH_SCRIPT_ID]/exec

# HR API Endpoints
VITE_HR_RECRUITMENT_ENDPOINT=https://script.google.com/macros/s/[HR_RECRUITMENT_SCRIPT_ID]/exec
VITE_HRGA_ASSET_ENDPOINT=https://script.google.com/macros/s/[HRGA_ASSET_SCRIPT_ID]/exec

# App Configuration
VITE_APP_NAME=CarrotAcademy Dashboard
VITE_APP_VERSION=1.1.0

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false  # Set to 'true' for dev logging
VITE_ENABLE_ANALYTICS=false
```

### 2.2 Google Apps Script Endpoints

#### **AUTH ENDPOINT** - Authentication & User Management

|    Function     |       Action      | Method |                         Parameters                      |
|-----------------|-------------------|--------|---------------------------------------------------------|
| Login           | `login`           | POST   | `email`, `password`, `device_name` (optional)           |
| Register User   | `register`        | POST   | `nama`, `email`, `password`, `jabatan`, `role`, `aktif` |
| Forgot Password | `forgot-password` | POST   | `email`                                                 |
| Update Password | `update-password` | POST   | `email`, `old_password`, `new_password`                 |
| Validate Token  | `validate-token`  | POST   | `token`                                                 |

**Response Format:**
```javascript
{
  status: 'success' | 'error',
  message: 'string',
  data: {
    // User object
    id: 'string',
    email: 'string',
    nama: 'string',
    role: 'staff' | 'admin' | 'super_admin',
    jabatan: 'string',
    token: 'string', // JWT or session token
    tokenExpiry: 'timestamp',
  }
}
```

---

#### **CSO BERSAMA ENDPOINT** - Shared CSO Tasks

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Trial Students Data | `data-siswa-trial`        | GET    | -          | Array of trial student records |
| Merchandise Data    | `get-kirim-merchandise`   | GET    | -          | Merchandise delivery list      |
| Jenis Merchandise   | `jenis-merchandise`       | GET    | -          | Array of merchandise types     |
| Daily Story Data    | `get-daily-story`         | GET    | `date`     | Daily story records            |
| Janji Temu          | `get-janji-temu`          | GET    | `date`     | Appointment list               |
| Lost & Found        | `get-lost-found`          | GET    | -          | Lost & Found items             |
| Prospektif Marcom   | `get-prospektif-marcom`   | GET    | -          | Prospektif dari Marketing      |
| Daftar Kelas        | `get-daftar-kelas`        | GET    | -          | Available classes              |
| Rekap Jadwal        | `get-rekap-jadwal-mentor` | GET    | -          | Mentor schedule recap          |
| & many more         | ...                       | ...    | ...        | ...                            |

---

#### **CSO PERSONAL ENDPOINT** - Personal CSO Tasks

|         Function         |             Action           | Method |          Parameters          | Returns |
|--------------------------|------------------------------|--------|------------------------------|---------|
| Dashboard Prospektif     | `get-dashbord-prospektif`    | GET    | `date_req` (YYYY-MM-DD)      | KPI + 5 tables data |
| Checklist Prospektif     | `ceklis-dashbord-prospektif` | POST   | `target`, `psid`, `pic`      | Success/Error message |
| Dashboard Reminder       | `get-dashboard-reminder`     | GET    | `target`, `date/bulan_tahun` | Reminder data |
| Profil Siswa             | `get-profil-siswa`           | GET    | `psid`                       | Student profile data |
| Prospektif Form          | `get-prospektif-form`        | GET    | `psid`                       | Prospektif data untuk form |
| Create/Update Prospektif | `update-prospektif`          | POST   | `psid`, `field_data`         | Updated record |
| & many more              | ...                          | ...    | ...                          | ... |

---

#### **ESO BERSAMA ENDPOINT** - Shared ESO Tasks

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Student Report      | `get-student-report`      | GET    | `date`     | Student learning progress      |
| Ticketing External  | `get-ticketing-external`  | GET    | `year`     | External tickets by year       |
| Artwork Month       | `get-artwork-month`       | GET    | `date`     | Monthly artwork data           |
| Kelengkapan Data    | `get-kelengkapan-data`    | GET    | -          | Data completeness records      |
| Nomor Urut Sertifikat | `get-nomor-urut-sertif` | GET    | `type`     | Certificate number assignments |
| Progress Report     | `get-progress-report`     | GET    | `month,year` | Monthly progress reports      |
| & more              | ...                       | ...    | ...        | ...                            |

#### **ESO PERSONAL ENDPOINT** - Personal ESO Tasks

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Dashboard FD        | `get-dashboard-fd`        | GET    | -          | Foundation dashboard data      |
| Ticketing Internal  | `get-ticketing-internal`  | GET    | -          | Internal tickets               |
| & more              | ...                       | ...    | ...        | ...                            |

---

#### **FINANCE BERSAMA ENDPOINT** - Shared Finance Tasks

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Approval Pendaftaran | `get-approval-pendaft`   | GET    | -          | Pending registrations for approval |
| Daftar Harga        | `get-daftar-harga`        | GET    | -          | Price list                     |
| Data BKM            | `get-data-bkm`            | GET    | -          | Bank & Component Master data   |
| Bukti Pembayaran    | `get-bukti-pembayaran`    | GET    | -          | Payment proofs                 |
| Tagihan             | `get-tagihan`             | GET    | -          | Invoice list                   |
| Daftar Offboarding  | `get-daftar-offboarding`  | GET    | -          | Offboarding records            |
| Pendaftaran FTC     | `get-pendaft-fulltime`    | GET    | -          | Fulltime course registrations  |
| Merchandise         | `get-kirim-merchandise`   | GET    | -          | Merchandise delivery list      |
| Ticketing External  | `get-ticketing-external`  | GET    | -          | External tickets               |
| & more              | ...                       | ...    | ...        | ...                            |

#### **FINANCE PERSONAL ENDPOINT** - Personal Finance Tasks

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Dashboard Pendapatan | `get-dashboard-pendapat` | GET    | -          | Revenue dashboard              |
| Daftar Harga Personal | `get-daftar-harga-pers` | GET    | -          | Personal price list            |
| Ticketing Internal  | `get-ticketing-internal`  | GET    | -          | Internal tickets               |
| Track Ticket        | `get-track-ticket-from-me` | GET   | -          | Tickets from this user         |
| Review Karyawan     | `get-review-karyawan`     | GET    | -          | Employee reviews               |
| Statistik Tagihan   | `get-statistik-tagihan`   | GET    | `date`     | Invoice statistics             |
| Profile Siswa       | `get-profile-siswa`       | GET    | `psid`     | Student profile                |
| & more              | ...                       | ...    | ...        | ...                            |

---

#### **HR RECRUITMENT ENDPOINT** - Hiring & Recruitment

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Dashboard Report    | `get-dashboard-report`    | GET    | -          | Recruitment dashboard data    |
| HR Requests         | `get-hr-requests`         | GET    | -          | Open HR requests               |
| Jam Kerja           | `get-jam-kerja`           | GET    | -          | Working hours data             |
| Tugas Interview     | `get-tugas-interview`     | GET    | -          | Interview assignments         |
| Hasil Response Test | `get-hasil-response-test` | GET    | -          | Candidate test results         |
| Applicant Data      | `get-applicant-data`      | GET    | -          | All applicants                 |
| Penilaian Kandidat  | `get-penilaian-kandidat`  | GET    | `id_kandidat` | Candidate assessment       |
| & more              | ...                       | ...    | ...        | ...                            |

---

#### **HRGA ASSET ENDPOINT** - Asset Management

|       Function      |            Action         | Method | Parameters |            Returns             |
|---------------------|---------------------------|--------|------------|--------------------------------|
| Dashboard Asset     | `get-dashboard-asset`     | GET    | -          | Asset overview                 |
| Asset Data          | `get-asset-data`          | GET    | -          | All assets inventory           |
| Daily Asset         | `get-daily-asset`         | GET    | `date`     | Daily asset movements          |
| Detail Barang       | `get-detail-barang`       | GET    | `asset_id` | Item details                   |
| Maintenance         | `get-maintenance`         | GET    | -          | Maintenance records            |
| Peminjaman Barang   | `get-peminjaman-barang`   | GET    | -          | Item loans & returns           |
| Penyusutan          | `get-penyusutan`          | GET    | `periode`  | Depreciation calculations      |
| Services            | `get-services`            | GET    | -          | Service records                |
| Asset History       | `get-asset-history`       | GET    | `asset_id` | Asset transaction history      |
| & more              | ...                       | ...    | ...        | ...                            |

---

### 2.3 Google Sheets Database Mapping

**Current Database Structure:**

|  Spreadsheet Name   |              Purpose            | Division | Status |
|---------------------|---------------------------------|----------|--------|
| CSO Master Data     | Student data, prospektif, trial | CSO      | Active |
| CSO Personal Tasks  | Personal dashboard data         | CSO      | Active |
| ESO Student Reports | Student learning progress       | ESO      | Active |
| ESO FD Data         | Foundation data & tracking      | ESO      | Active |
| ESO Offboarding     | Offboarding process tracking    | ESO      | Active |
| Finance Tagihan     | Invoicing data                  | Finance  | Active |
| Finance Pembayaran  | Payment records                 | Finance  | Active |
| Finance BKM         | Bank & Component Master         | Finance  | Active |
| Finance Pricing     | Price list management           | Finance  | Active |
| HR Candidates       | Recruitment candidate data      | HRGA     | Active |
| HR Assets           | Asset inventory & tracking      | HRGA     | Active |
| HR Maintenance      | Asset maintenance records       | HRGA     | Active |
| Auth Users          | User accounts & credentials     | Auth     | Active |
| System Logs         | Activity logging                | System   | Active |

**Important Notes:**
- Data di Google Sheets dikirim sebagai 2D array (rows/columns)
- Frontend menggunakan `transformRawData()` & `transformProspektifData()` untuk convert ke objects
- Backup dilakukan secara manual (setup automated backup di GAS jika needed)

---

### 2.4 API Service Layer Mapping

**Location**: `src/features/{division}/` files

```javascript
// authApiService.jsx
- registerUser()
- validatePassword()
- updatePassword()
- forgotPassword()

// csoApiService.jsx (100+ functions)
- getTrialStudents()
- getMerchandiseData()
- getDashboardProspektif()
- ceklisDashboardProspektif()
- getDashboardReminder()
- getProfilSiswa()
- postDataKirimMerch()
- ... & many more

// esoApiService.jsx
- getStudentReport()
- getTicketingExternal()
- getArtworkMonth()
- getKelengkapanData()
- getNomorUrutSertifikat()
- getProgressReport()
- ... & many more

// financeApiService.jsx (NEW - 16 pages)
- getApprovalPendaftaran()
- getDaftarHarga()
- getDataBKM()
- getBuktiPembayaran()
- getTagihan()
- getStatistikTagihan()
- getDashboardPendapatan()
- getTicketingInternal()
- getTrackTicket()
- getProfileSiswa()
- ... & more

// hrApiService.jsx (NEW - HR Recruitment)
- getDashboardReport()
- getHRRequests()
- getApplicantData()
- getTugasInterview()
- getHasilResponseTest()
- getPenilaianKandidat()
- ... & more

// assetApiServices.jsx (NEW - Asset Management)
- getDashboardAsset()
- getAssetData()
- getDailyAsset()
- getDetailBarang()
- getMaintenance()
- getPeminjamanBarang()
- getPenyusutan()
- getServices()
- getAssetHistory()
- ... & more
```

All services use centralized Axios client from `API_CONFIG.baseURL`

---

### 2.5 Database Credentials (SECURE)

> **IMPORTANT**: These should be stored securely, NOT in version control

**Required for Production:**
- [ ] Google Service Account credentials (for backend GAS automation)
- [ ] Master Google Sheet IDs (if needed for direct access)
- [ ] API Keys for any external services
- [ ] Vercel deployment environment variables
- [ ] GitHub repository access tokens

**How to Setup:**
1. Create `.env.local` file (NOT committed to git)
2. Add all credentials securely
3. Each developer gets their own `.env.local` for local development
4. Production credentials set via Vercel dashboard → Settings → Environment Variables

---

## 3. Pending Tasks & Next Steps

### 3.1 Critical Issues (HARUS DIKERJAKAN)

#### Priority 1: HIGH IMPACT - Do ASAP

- [ ] **Database Backup Strategy**
  - [ ] Setup automated backup untuk Google Sheets (daily/weekly)
  - [ ] Document restore procedure
  - [ ] Test restore process
  - [ ] Update disaster recovery plan

- [ ] **Performance Optimization**
  - [ ] Audit bundle size (Chart.js, Recharts are heavy)
  - [ ] Implement code splitting lebih optimal
  - [ ] Add performance monitoring (Vercel Analytics / Sentry)
  - [ ] Optimize images & assets
  - [ ] Lazy load Chart components

- [ ] **Error Tracking & Monitoring**
  - [ ] Setup Sentry.io untuk production error tracking
  - [ ] Add error boundary di strategic places
  - [ ] Setup error notification (email/Slack)
  - [ ] Create error handling dashboard

- [ ] **Security Audit**
  - [ ] Review authentication flow untuk security vulnerabilities
  - [ ] Add HTTPS enforcement
  - [ ] Review CORS configuration
  - [ ] Audit password storage & transmission
  - [ ] Setup security headers (CSP, X-Frame-Options, etc)

---

#### Priority 2: MEDIUM - Should do soon

- [ ] **Testing Suite**
  - [ ] Setup unit tests dengan Vitest
  - [ ] Add integration tests untuk API calls
  - [ ] Add E2E tests dengan Playwright/Cypress
  - [ ] Setup CI/CD pipeline untuk run tests
  - [ ] Target: 60%+ code coverage

- [ ] **Documentation**
  - [ ] Update API documentation (endpoint parameters, response format)
  - [ ] Create GAS function documentation
  - [ ] Add inline code comments di complex functions
  - [ ] Create developer onboarding guide
  - [ ] Setup JSDoc comments

- [ ] **Real-time Features**
  - [ ] Implement WebSocket untuk real-time updates
  - [ ] Add notification system
  - [ ] Real-time data sync untuk collaborative editing
  - [ ] Presence indicator (who's working on what)

- [ ] **File Upload & Management**
  - [ ] Setup file upload functionality
  - [ ] Integrate dengan Cloud Storage (Google Drive / AWS S3)
  - [ ] Implement file preview & versioning
  - [ ] Add file size limits & validation

---

#### Priority 3: NICE TO HAVE - Consider later

- [ ] **Advanced Reporting**
  - [ ] Implement dashboard-like reporting UI
  - [ ] Add data export (CSV, PDF, Excel)
  - [ ] Custom report builder
  - [ ] Scheduled report generation & email

- [ ] **Mobile App**
  - [ ] Evaluate React Native / Flutter for mobile
  - [ ] Create mobile-optimized UI
  - [ ] Offline support dengan service workers
  - [ ] Push notifications

- [ ] **Analytics & Business Intelligence**
  - [ ] Setup analytics tracking (Google Analytics / Mixpanel)
  - [ ] Create KPI dashboards
  - [ ] Add business metrics tracking
  - [ ] Setup A/B testing capability

- [ ] **Backend Migration**
  - [ ] Evaluate Node.js + Express/NestJS
  - [ ] Design PostgreSQL schema
  - [ ] Migrate GAS logic ke Node.js
  - [ ] Setup proper database (PostgreSQL/MongoDB)
  - [ ] Implement proper authentication (JWT, OAuth2)

---

### 3.2 Feature Enhancements (NEXT ROADMAP)

#### Q3 2026 (Jul - Sep)
- [ ] Finance module testing & validation
- [ ] HRGA module testing & validation  
- [ ] Export to Excel functionality (all pages)
- [ ] Print-friendly layouts
- [ ] Advanced filtering & search
- [ ] User activity audit log
- [ ] Improved dashboard with widgets
- [ ] Bulk import functionality

#### Q4 2026 (Oct - Dec)
- [ ] Real-time notifications
- [ ] File upload & document management
- [ ] Advanced reporting features
- [ ] Mobile app (beta)
- [ ] Offline mode support
- [ ] Custom dashboard builder
- [ ] Automated database backup
- [ ] Performance monitoring (Sentry/Vercel Analytics)

#### 2027 (Future)
- [ ] Backend migration ke Node.js + Express/NestJS
- [ ] Database upgrade (PostgreSQL)
- [ ] Microservices architecture
- [ ] Advanced analytics & BI
- [ ] AI-powered insights
- [ ] Multi-tenant support
- [ ] WebSocket real-time features

---

### 3.3 Known Bugs & Issues

#### Current Bugs (To Fix)

- [ ] **Session Bug**: Sometimes session timer doesn't sync across tabs
  - **Impact**: Low
  - **Workaround**: Refresh page
  - **Fix**: Use shared storage sync mechanism

- [ ] **Chart Loading**: Recharts sometimes flickers on re-render
  - **Impact**: Low
  - **Workaround**: None
  - **Fix**: Memoize chart components

- [ ] **Mobile Menu**: Sidebar menu overlaps content on mobile
  - **Impact**: Medium
  - **Workaround**: Close sidebar manually
  - **Fix**: Improve responsive breakpoints

- [ ] **Dark Mode**: Some styled components don't fully respect theme
  - **Impact**: Low
  - **Workaround**: None
  - **Fix**: Audit all styled components (see THEME_UPDATE_SUMMARY.md)

---

### 3.4 Tech Debt & Refactoring Opportunities

- [ ] **Consolidate API Services**: Too many individual functions, extract common patterns
- [ ] **Component Refactoring**: Some components too large (>500 lines), split into smaller
- [ ] **Reduce Context Usage**: Some stores could use Redux for better debugging
- [ ] **Utility Consolidation**: Remove duplicate formatting functions
- [ ] **Type Safety**: Add TypeScript untuk better type checking
- [ ] **Test Coverage**: Aim for 60%+ coverage
- [ ] **Performance**: Audit & optimize re-renders

---

### 3.5 Handover Checklist (FOR NEXT DEVELOPER)

#### Before Starting Development

- [ ] Read README.md & QUICK_REFERENCE.md
- [ ] Review RBAC_GUIDE.md untuk understand access control
- [ ] Read TOKEN_EXPIRY_GUIDE.md untuk session management
- [ ] Review THEME_GUIDE.md untuk styling patterns
- [ ] Understand API_CONFIG.js & environment variables
- [ ] Setup local development (npm install, .env.local)
- [ ] Test local development server (npm run dev)
- [ ] Review git workflow (GIT_WORKFLOW.md)

#### During Development

- [ ] Follow coding conventions (see QUICK_REFERENCE.md)
- [ ] Use API services, never call endpoints directly
- [ ] Follow component structure (components/, pages/)
- [ ] Use storage wrapper, never direct localStorage
- [ ] Always validate environment variables on startup
- [ ] Add error handling untuk API calls
- [ ] Test di multiple browsers & screen sizes
- [ ] Follow commit conventions (feat:, fix:, etc)

#### Before Deploying

- [ ] Run `npm run lint` - zero errors
- [ ] Test locally dengan `npm run dev`
- [ ] Test production build dengan `npm run build && npm run preview`
- [ ] Verify all env vars in Vercel dashboard
- [ ] Test in staging environment first
- [ ] Create pull request untuk code review
- [ ] Merge to `main` untuk production deploy

---

### 3.6 Resources & Documentation

#### Essential Reading
1. **README.md** - Project overview & setup
2. **QUICK_REFERENCE.md** - Cheat sheet untuk common patterns
3. **RBAC_GUIDE.md** - Access control implementation
4. **TOKEN_EXPIRY_GUIDE.md** - Session management
5. **GIT_WORKFLOW.md** - Git workflow & branching strategy

#### Feature Guides
- **DASHBOARD_PROSPEKTIF_GUIDE.md** - CSO Prospektif dashboard
- **DASHBOARD_REMINDER_GUIDE.md** - CSO Reminder dashboard
- **APP_NAVIGATION_FLOW.md** - Navigation & routing structure

#### Troubleshooting
- Check LOGGING_GUIDE.md untuk setup logging
- See errorHandler.js untuk error handling patterns
- Review storage.js untuk localStorage usage

#### External Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Chakra UI Components](https://chakra-ui.com/docs/components)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Google Apps Script Guide](https://developers.google.com/apps-script)

---

### 3.7 Contact & Support

#### Key Contacts (Update as needed)
- **Project Manager**: [Name]
- **Lead Developer**: [Name]
- **Backend (GAS)**: [Name]
- **DevOps/Deployment**: [Name]

#### Important Links
- **Repository**: https://github.com/CarrotAcademy-Dev/webdev-v1.1
- **Issue Tracker**: [GitHub Issues URL]
- **Deployment Dashboard**: []
- **Database**: [Google Sheets shared folder URL]
- **Backend Documentation**: https://app.notion.com/p/21e7887e2d2380c782b9e8b3fe31c2f6?v=21e7887e2d2380dd9044000c85e0b847&source=copy_link

---

### 3.8 Future Considerations

#### Scaling Challenges
- As user base grows, GAS might hit rate limits
- Consider database migration timeline
- Plan for multi-instance deployment
- Evaluate load testing needs

#### Architecture Review
- Consider microservices for GAS functions
- Evaluate standalone backend (Node.js)
- Plan for better separation of concerns
- Consider caching strategy (Redis)

#### Security Enhancements
- Implement proper OAuth2 flow
- Add 2FA (Two Factor Authentication)
- Setup WAF (Web Application Firewall)
- Regular security audits
- Penetration testing

---

## Quick Links

|                     Document                   |       Purpose      | Read Time |
|------------------------------------------------|--------------------|-----------|
| [README.md](README.md)                         | Project overview   | 10 min    |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md)       | Cheat sheet        | 5 min     |
| [RBAC_GUIDE.md](RBAC_GUIDE.md)                 | Access control     | 15 min    |
| [TOKEN_EXPIRY_GUIDE.md](TOKEN_EXPIRY_GUIDE.md) | Session management | 10 min    |
| [THEME_GUIDE.md](THEME_GUIDE.md)               | Theme system       | 10 min    |
| [GIT_WORKFLOW.md](GIT_WORKFLOW.md)             | Git strategy       | 10 min    |
| [DEPLOYMENT.md](DEPLOYMENT.md)                 | Deployment guide   | 10 min    |
| [LOGGING_GUIDE.md](LOGGING_GUIDE.md)           | Logging patterns   | 5 min     |

---

**Last Updated**: June 23, 2026  
**Maintained By**: Nadaa  
**Next Review**: September 22, 2026

# Carrot Academy - Internal Dashboard

Ini merupakan dokumentasi resmi untuk project Internal Carrot Academy. Dokumen ini bertujuan sebagai panduan instalasi, pemahaman arsitektur, dan rencana pengembangan di masa depan.

## 1. Tentang Proyek

Project ini adalah sebuah *Single Page Application* (SPA) yang dibangun menggunakan React (Vite) dan Chakra UI. Tujuannya adalah untuk menyediakan dashboard internal bagi tim Carrot Academy untuk memonitor dan mengelola berbagai data operasional dari **5 divisi utama**: CSO, ESO, Finance, HRGA, Admin - mulai dari data siswa, jadwal, hingga logistik seperti pengiriman merchandise, asset management, dan recruitment.

**Fitur Utama**:
- **50+ pages** untuk CSO (Customer Support Officer)
- **15+ pages** untuk ESO (Education Support Officer)
- **16+ pages** untuk Finance (Keuangan - NEW)
- **16+ pages** untuk HRGA (HR & General Affairs - NEW)
- **RBAC** dengan 3 roles & 12 jabatan
- **Session Management** dengan auto-logout & productivity tracking
- **Dark/Light mode** dengan Chakra UI
- **Real-time monitoring** dengan React Query

## 2. Tech Stack Utama

Berikut adalah teknologi dan library utama yang menjadi tulang punggung aplikasi ini:

* **Framework**: [React](https://react.dev/) via [Vite](https://vitejs.dev/) - Untuk UI yang cepat dan modern.
* **Styling**:
    * [Chakra UI](https://chakra-ui.com/): Library komponen UI utama untuk layout, tombol, form, dll.
    * [Styled Components](https://styled-components.com/): Digunakan untuk komponen-komponen dengan style yang sangat spesifik dan custom.
    * [React Icons](https://react-icons.github.io/react-icons/): Untuk semua kebutuhan ikonografi.
* **Data Fetching & State Management**:
    * [TanStack Query (React Query)](https://tanstack.com/query/latest): Sebagai "manajer" utama untuk semua data dari server (*server state*). Meng-handle *fetching, caching, dan updating* data API.
    * [Axios](https://axios-http.com/): HTTP Client untuk melakukan panggilan HTTP (GET, POST) ke API.
    * **React Context API**: Digunakan khusus untuk state global yang jarang berubah, seperti data otentikasi user (`AuthContext`).
* **Routing**: [React Router DOM](https://reactrouter.com/) - Untuk navigasi antar halaman di dalam SPA.
* **Security**: 
    * **Token Expiry Management**: Auto-logout dengan session monitoring
    * **Role-Based Access Control (RBAC)**: Route & component level protection
    * **localStorage with Expiry**: Secure client-side storage
* **Utilities**:
    * [date-fns](https://date-fns.org/): Untuk semua manipulasi dan format tanggal & waktu.
    * [nanoid](https://github.com/ai/nanoid): Untuk membuat ID unik di sisi frontend.
* **Backend**: [Google Apps Script (GAS)](https://developers.google.com/apps-script) - Bertindak sebagai backend dan database (via Google Sheets) saat ini (Diharapkan bisa migrasi ke proper relational database untuk future improvements).

## 3. Instalasi & Menjalankan di Lokal

Untuk menjalankan project ini di mesin lokal, ikutin langkah-langkah berikut:

1.  **Clone Repository**
    ```bash
    git clone https://github.com/CarrotAcademy-Dev/webdev-v1.1.git
    cd [NAMA_FOLDER_PROJECT]
    ```

2.  **Install Dependencies**
    Pastikan Node.js (versi 16 ke atas) dan npm/yarn terinstall.
    ```bash
    npm install
    ```
    atau jika menggunakan yarn:
    ```bash
    yarn
    ```

3.  **Setup Environment Variables**
    Jika ada API Key atau konfigurasi sensitif lainnya di masa depan, buat file `.env` di *root project* dan isi sesuai kebutuhan.
    ```env
    VITE_NAMA_VARIABLE_RAHASIA=nilainyaDisini
    ```

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan dan bisa diakses di `http://localhost:5173` (atau port lain yang tersedia).

## 4. Arsitektur & Struktur Folder

Arsitektur project ini didesain agar scalable dan mudah di-maintain dengan menerapkan prinsip *Separation of Concerns* dengan **90+ routes** untuk 5 divisi operasional.

```
src/
|
|-- components/        # Komponen UI reusable (30+ components)
|   |-- InfoCard/
|   |-- Table/
|   |-- Navbar/
|   |-- Sidebar/
|   |-- SessionTimeout/
|   |-- ProtectedRoute/
|   `-- ... (Chakra UI + Styled Components)
|
|-- context/           # React Context untuk state global
|   |-- AuthContext.jsx  # User auth & session management
|   `-- SidebarContext.jsx
|
|-- features/          # API services per divisi
|   |-- auth/
|   |   `-- authApiService.jsx
|   |-- cso/
|   |   `-- csoApiService.jsx (100+ functions)
|   |-- eso/
|   |   `-- esoApiService.jsx
|   |-- finance/
|   |   `-- financeApiService.jsx
|   `-- hr/
|       |-- hrApiService.jsx
|       `-- assetApiServices.jsx
|
|-- pages/             # Full-page components (90+ pages)
|   |-- Staff/
|   |   |-- OverviewPage.jsx
|   |   |-- CSO/
|   |   |   |-- Bersama/  (30+ pages)
|   |   |   `-- Personal/ (20+ pages)
|   |   |-- ESO/
|   |   |   |-- Bersama/  (10+ pages)
|   |   |   `-- Personal/ (5+ pages)
|   |   |-- Finance/       # 16 pages
|   |   |   |-- Bersama/  (9 pages: Approval, Daftar Harga, etc)
|   |   |   `-- Personal/ (7 pages: Dashboard Pendapatan, etc)
|   |   `-- HRGA/          # 16 pages
|   |       |-- HRRecruitmen/ (7 pages: Dashboard, Candidates, etc)
|   |       `-- Asset/     (9 pages: Dashboard, Inventory, Maintenance, etc)
|   |-- Admin/
|   |-- Login.jsx
|   |-- ForgotPassword.jsx
|   |-- UpdatePassword.jsx
|   |-- ProfilePage.jsx
|   |-- SettingsPage.jsx
|   `-- AccessDenied/
|
|-- hooks/             # Custom React hooks
|   |-- useDebounce.js
|   |-- useLocalStorage.js
|   |-- usePagination.js
|   |-- useTaskSummary.js
|   |-- useLoadingState.js
|   `-- useTheme.js
|
|-- utils/             # Utility functions
|   |-- storage.js
|   |-- formatters.js
|   |-- errorHandler.js
|   |-- validation.js
|   |-- logger.js
|   |-- themeColors.js
|   `-- constants/
|       `-- accessControl.js (RBAC: 3 roles, 12 jabatan, 8 access groups)
|
|-- config/            # Configuration
|   |-- api.config.js (8 endpoints: Auth, CSO, ESO, Finance, HR, Asset)
|   `-- navigation.config.js (menu dengan RBAC filtering)
|
|-- App.jsx            # Main routing (90+ routes)
`-- main.jsx           # Entry point (QueryClient, Chakra, AuthProvider)
```

**Alur Data Utama (Pola Arsitektur):**

Data mengalir dari API Service → React Query → Page Component → UI Component:

```
API Service (/features/{division}/)
    ↓ (axios POST/GET dengan URLSearchParams)
Google Apps Script Backend
    ↓ (raw data dari Google Sheets)
React Query useQuery/useMutation
    ↓ (cached data + invalidation)
Page Component (/pages/)
    ↓ (data transformation, business logic)
UI Component (/components/)
    ↓ (render with props)
User Interface
```

**Alur Data Utama (Pola Arsitektur):**

1.  **`main.jsx`**: Membungkus seluruh aplikasi dengan *Provider* yang dibutuhkan (`QueryClientProvider`, `ChakraProvider`, `AuthProvider`).
2.  **`App.jsx`**: Mengatur semua rute halaman menggunakan `react-router-dom` dan melindungi rute privat dengan `ProtectedRoute`.
3.  **Komponen Halaman (`/pages`)**: Bertindak sebagai "Otak" atau *controller*.
    * Menggunakan *hook* `useQuery` dari React Query untuk memanggil fungsi dari *API Service*.
    * Melakukan transformasi data di dalam opsi `select` jika diperlukan.
    * Menggunakan *hook* `useMutation` untuk mendefinisikan aksi `POST`/`UPDATE`.
    * Menyiapkan *handler* (misal: `handleDoneClick`).
    * Merakit dan mengirim *props* ke komponen-komponen UI.
4.  **API Service (`/features/**`)**: Bertindak sebagai "Dapur".
    * Satu-satunya bagian yang berkomunikasi langsung dengan backend via `axios`.
    * Tugasnya hanya mengambil data mentah atau mengirim data. **Tidak boleh ada logika transformasi UI di sini.**
5.  **Komponen UI (`/components`)**: "Component yang bisa digunakan berulang-ulang"
    * Menerima data dan fungsi lewat `props`.
    * Tugasnya hanya menampilkan UI sesuai data yang diterima.
    * Jika ada interaksi, dia akan "lapor" ke atas dengan memanggil fungsi yang dikirim lewat `props` (misal: `onAction`).

## 5. Rencana Pengembangan (Future Roadmap)

Project ini dibangun dengan fondasi yang kuat, namun ada beberapa area yang bisa di-upgrade di masa depan untuk skalabilitas yang lebih baik.

### Tahap 1: Migrasi Backend dari Google Apps Script (GAS)

Saat ini, GAS berfungsi dengan baik sebagai *backend* sederhana. Namun, untuk fitur yang lebih kompleks, real-time, dan performa yang lebih tinggi, kita perlu migrasi.

* **Rencana**: Membangun *backend* baru menggunakan Node.js dengan framework Express.js atau NestJS.
* **Database**: Migrasi dari Google Sheets ke database yang lebih *robust* seperti PostgreSQL (untuk data relasional) atau MongoDB (untuk data fleksibel).
* **Keuntungan**:
    * Kontrol penuh atas API.
    * Performa jauh lebih cepat.
    * Tidak ada lagi masalah CORS yang rumit karena bisa di-setting penuh.
    * Kemampuan untuk membangun fitur real-time dengan WebSocket.

### Tahap 2: Implementasi State Management Lanjutan

Seiring aplikasi membesar, *state* di sisi UI (*client state*) juga akan makin kompleks.

* **Rencana**: Saat ini, kita hanya butuh `useState`. Jika ada satu halaman yang punya logika *state* sangat rumit, kita bisa adopsi `useReducer`. Jika ada state global yang perlu diakses dan diubah oleh banyak komponen (di luar *auth* dan data server), baru kita pertimbangkan Redux Toolkit.
* **Penting**: React Query akan tetap menjadi andalan kita untuk *server state*. Redux tidak akan kita gunakan untuk menggantikan React Query.

### Tahap 3: Otentikasi Profesional

* **Status**: Selesai - Full authentication system sudah diimplementasikan
* **Yang Sudah Ada**:
    * Auth API V2.0 dengan POST method (Feb 2026)
    * Auto-logout saat token expired (9 jam)
    * Session tracking dengan productive/idle time (Feb 2026)
    * Session monitoring dengan warning notification
    * Real-time session timer di Navbar
    * Manual session extension capability
    * Forgot password flow dengan email (Feb 2026)
    * Update password dengan password strength indicator (Feb 2026)
    * Auto-logout setelah password change (Feb 2026)
    * Orphaned session detection & recovery (Feb 2026)
* **Rencana Lanjutan**: 
    * Two-Factor Authentication (2FA) dengan email OTP
    * Social login (Google OAuth)
    * Biometric authentication untuk mobile
    * Password expiry reminder (90 hari)
* **Keuntungan**: Security layer lengkap dengan productivity monitoring dan self-service password management

## 6. Security & Access Control

Project ini sudah dilengkapi dengan sistem keamanan multi-layer untuk melindungi data operasional:

### Role-Based Access Control (RBAC)
* **3 Roles**: Staff, Admin, Super Admin
* **12 Jabatan**: CSO, ESO, Finance, HRGA, IT, Marcom, Mentor, Intern, Operation, EDU, SMS, OB
* **Route Protection**: Protected berdasarkan role dan jabatan
* **Menu Visibility**: Dynamic menu rendering sesuai permission
* **Access Groups**: ADMIN_ONLY, CSO_ONLY, ESO_ONLY, FINANCE_ONLY, HRGA_ONLY, dan kombinasinya
* **Dokumentasi**: [docs/RBAC_GUIDE.md](docs/RBAC_GUIDE.md)

### Token Expiry & Session Management
* **Auto-logout**: Token expired otomatis logout setelah 8 jam (480 menit)
* **Warning System**: 
  - Toast notification 15 menit sebelum expired
  - Modal dialog 10 menit sebelum expired
  - User dapat memperpanjang sesi atau logout
* **Session Extension**: User bisa perpanjang sesi manual (tambah 8 jam)
* **Real-time Badge**: Timer di Navbar dengan color coding
* **Dokumentasi**: [docs/TOKEN_EXPIRY_GUIDE.md](docs/TOKEN_EXPIRY_GUIDE.md)

### Productivity Tracking (Feb 2026)
* **Session Monitoring**: Real-time productive vs idle time tracking
* **Grace Period**: 30 menit tolerance untuk multitasking
* **Session Recovery**: Auto-restore session setelah browser refresh
* **Orphaned Detection**: Cleanup session yang tidak selesai dengan benar (9-hour threshold)
* **Backend Integration**: Productive/idle duration terkirim saat logout untuk analytics

### Password Management (Feb 2026)
* **Forgot Password**: Reset password via email dengan temporary password
* **Update Password**: Self-service password change dengan validasi
* **Password Strength**: Real-time indicator dengan 5 requirements
  - 8-20 karakter
  - 1+ uppercase letter
  - 1+ lowercase letter
  - 1+ number
  - 1+ special character
* **Auto-logout**: Force re-login setelah password berhasil diubah
* **Server Validation**: Backend validation untuk security

### Divisi Access Control (NEW - June 2026)
* **Finance Division**: Finance-specific pages & API endpoints
  - Finance_ONLY access untuk staff dengan jabatan Finance
  - Finance_OR_ADMIN untuk Admin juga bisa akses
  - 16 pages dengan dedicated API service
* **HRGA Division**: HR & Asset management pages
  - HRGA_ONLY access untuk staff dengan jabatan HRGA
  - HRGA_OR_ADMIN untuk Admin juga bisa akses
  - 16 pages dengan 2 dedicated API services (HR + Asset)

**Catatan Penting**: Client-side security adalah UX layer. Backend validation tetap WAJIB untuk security sesungguhnya.

## 7. Dokumentasi & Learning Path

Project ini memiliki dokumentasi lengkap yang terstruktur untuk memudahkan handover dan onboarding developer baru.

### START HERE - Handover Documentation

** [HANDOVER_DOCUMENTATION.md](HANDOVER_DOCUMENTATION.md)** - Comprehensive handover guide dengan:
- System Overview & Current State (fitur yang sudah selesai)
- Credentials & Endpoint Mapping (env vars, GAS endpoints, database structure)
- Pending Tasks & Next Steps (checklist untuk developer berikutnya)

**Mulai baca dari sini untuk quick understanding tentang project status dan apa yang perlu dikerjakan selanjutnya.**

---

### View All Documentation

**[Klik di sini untuk melihat SEMUA dokumentasi →](docs/)**

Semua dokumentasi teknis sudah terorganisir di folder `/docs/` dengan index, tabel lengkap, dan rekomendasi reading by role.

---

### Complete Documentation Guide

#### Essential Reading (HARUS BACA)
|                    Document                    |                      Purpose                | Read Time |
|------------------------------------------------|---------------------------------------------|-----------|
| [README.md](README.md)                         | Project overview, tech stack, arsitektur    | 15 min    |
| [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)       | Cheat sheet untuk developer                 | 5 min     |
| [docs/RBAC_GUIDE.md](docs/RBAC_GUIDE.md)                 | Role-Based Access Control sistem            | 15 min    |
| [docs/TOKEN_EXPIRY_GUIDE.md](docs/TOKEN_EXPIRY_GUIDE.md) | Session management & auto-logout            | 10 min    |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)             | Git branching strategy & commit conventions | 10 min    |

#### Technical Guides
|                        Document                      |              Purpose             |          For         |
|------------------------------------------------------|----------------------------------|----------------------|
| [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) | Utilities & features status      | Developer            |
| [docs/THEME_GUIDE.md](docs/THEME_GUIDE.md)                     | Dark/Light mode & theming system | Frontend Developer   |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                       | Vercel deployment process        | DevOps/DevOps-minded |
| [docs/LOGGING_GUIDE.md](docs/LOGGING_GUIDE.md)                 | Logging & debugging patterns     | Developer            |

#### Feature Guides (Optional)
|                               Document                         |             Purpose            | When Needed |
|----------------------------------------------------------------|--------------------------------|-------------|
| [docs/DASHBOARD_PROSPEKTIF_GUIDE.md](docs/DASHBOARD_PROSPEKTIF_GUIDE.md) | CSO Prospektif dashboard       | Working on CSO prospektif |
| [docs/DASHBOARD_REMINDER_GUIDE.md](docs/DASHBOARD_REMINDER_GUIDE.md)     | CSO Reminder dashboard         | Working on CSO reminder |
| [docs/APP_NAVIGATION_FLOW.md](docs/APP_NAVIGATION_FLOW.md)               | Navigation & routing structure | Understanding menu structure |

#### User Documentation
|                   Document               |              Purpose            |               For             |
|------------------------------------------|---------------------------------|-------------------------------|
| [docs/USER_STORIES.md](docs/USER_STORIES.md)       | User stories & workflows        | Business analyst, Stakeholder |
| [docs/USER_FLOW_GUIDE.md](docs/USER_FLOW_GUIDE.md) | Detailed user journey flows     | QA, Product Manager           |
| [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md)       | Known issues & planned features | Project tracking              |

---

### Recommended Reading by Role

**Frontend Developer (New to project)**:
1. README.md → [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) → [docs/RBAC_GUIDE.md](docs/RBAC_GUIDE.md) → [docs/TOKEN_EXPIRY_GUIDE.md](docs/TOKEN_EXPIRY_GUIDE.md) → [docs/THEME_GUIDE.md](docs/THEME_GUIDE.md) → [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

**Backend/GAS Developer**:
1. README.md → HANDOVER_DOCUMENTATION.md (fokus ke section 2) → [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

**QA/Tester**:
1. README.md → [docs/USER_STORIES.md](docs/USER_STORIES.md) → [docs/USER_FLOW_GUIDE.md](docs/USER_FLOW_GUIDE.md) → [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)

**DevOps/Deployment**:
1. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) → [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) → HANDOVER_DOCUMENTATION.md (section 2 - environment vars)

**Project Manager/Stakeholder**:
1. README.md → [docs/USER_STORIES.md](docs/USER_STORIES.md) → [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md)

**UI/UX Designer**:
1. [docs/THEME_GUIDE.md](docs/THEME_GUIDE.md) → [docs/APP_NAVIGATION_FLOW.md](docs/APP_NAVIGATION_FLOW.md) → [docs/DASHBOARD_PROSPEKTIF_GUIDE.md](docs/DASHBOARD_PROSPEKTIF_GUIDE.md)

---

### Handover Checklist

Sebelum mulai development, pastikan Anda sudah:
- [ ] Baca README.md & [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
- [ ] Pahami RBAC dari [docs/RBAC_GUIDE.md](docs/RBAC_GUIDE.md)
- [ ] Pahami session management dari [docs/TOKEN_EXPIRY_GUIDE.md](docs/TOKEN_EXPIRY_GUIDE.md)
- [ ] Setup local development environment
- [ ] Baca [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) untuk understand branching strategy
- [ ] Baca HANDOVER_DOCUMENTATION.md untuk know current status
- [ ] Siap untuk start development atau maintenance

## 8. Recent Updates & Features (February 2026)

### Authentication System V2.0
* **Auth API Migration**: Migrasi dari GET ke POST method untuk security
* **Device Tracking**: Track device yang digunakan untuk login
* **Nested Profile**: Response structure dengan nested `result.profile`

### Session Tracking & Productivity Monitoring
* **Real-time Tracking**: Monitor waktu produktif vs idle staff
* **Grace Period**: 30 menit tolerance untuk multitasking (blur window)
* **Session States**: Productive → Grace (30 min) → Idle
* **Window Events**: Focus/blur/visibility change tracking
* **Persistence**: Auto-save setiap 10 detik ke localStorage
* **Recovery**: Restore session setelah browser crash/refresh
* **Orphaned Detection**: Cleanup session yang tidak selesai (9 jam threshold)
* **Backend Logging**: Productive/idle duration otomatis ke database saat logout

### Password Management System
* **Forgot Password**: Self-service password reset via email
* **Update Password**: Protected route untuk change password
* **Password Strength Indicator**: Visual feedback dengan 5 requirements
  - 8-20 characters
  - Minimum 1 lowercase
  - Minimum 1 uppercase
  - Minimum 1 number
  - Minimum 1 special character
* **Validation**: Client-side dan server-side validation
* **Security**: Auto-logout setelah password berhasil diubah

### Settings Page
* **Profile Management**: 
  - Avatar display dengan initial nama
  - Edit nama lengkap (editable)
  - Email, Role, Jabatan (read-only dengan badges)
  - Form validation dan state management
* **Security Section**:
  - Quick access ke Update Password page
  - Login history viewer (tanggal, waktu, device, status)
  - Ready untuk backend integration
* **Display Preferences**:
  - Theme toggle (Light/Dark mode)
  - Integrated dengan Chakra UI useColorMode
  - Smooth transitions
* **UI/UX**: Responsive design, gradient themes, hover effects

### Bug Fixes & Improvements
* Fixed stale closure di session persistence (useRef pattern)
* Fixed session tidak restore setelah refresh
* Fixed false orphan detection untuk active sessions
* Fixed orphan threshold alignment (9 jam sesuai token expiry)
* Fixed extended session false-positive logout
* Enhanced error handling dengan detailed logging
* Updated CSS variables untuk dark/light mode support

---

Dokumentasi ini adalah dokumen hidup. Selalu perbarui seiring dengan perkembangan project.

Last update: 23 June 2026
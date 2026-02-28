# Carrot Academy - Internal Dashboard CSO

![Showcase](https://storage.googleapis.com/gemini-prod/images/5e5db08b-7d0c-48f4-aa90-0721284e2572)

Ini merupakan dokumentasi resmi untuk project Internal Carrot Academy. Dokumen ini bertujuan sebagai panduan instalasi, pemahaman arsitektur, dan rencana pengembangan di masa depan.

## 1. Tentang Proyek

Project ini adalah sebuah *Single Page Application* (SPA) yang dibangun menggunakan React (Vite) dan Chakra UI. Tujuannya adalah untuk menyediakan dashboard internal bagi tim Carrot Academy untuk memonitor dan mengelola berbagai data operasional, mulai dari data siswa, jadwal, hingga logistik seperti pengiriman merchandise dan lost & found.

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

Arsitektur project ini didesain agar scalable dan mudah di-maintain dengan menerapkan prinsip *Separation of Concerns*.

```
src/
|
|-- components/        # Komponen UI reusable (InfoCard, Table, Tabs)
|   |-- InfoCard/
|   |-- Table/
|   `-- ...
|
|-- context/           # React Context untuk state global (AuthContext)
|   `-- AuthContext.jsx
|
|-- features/          # Folder untuk fitur-fitur besar, dipisah per domain
|   |-- cso/
|   |   `-- csoApiService.js  # Kumpulan fungsi API khusus untuk fitur CSO
|   `-- divisiLainnya/
|       `-- divisiLainnya.js # Seterusnya kumpulan fungsi dikelompokkan per masing-masing divisi
|
|-- pages/             # Komponen yang merepresentasikan satu halaman penuh
|   |-- DailyStoryPage/
|   |   |-- index.jsx         # "Otak" halaman: state, data fetching (useQuery), handlers
|   |   `-- DailyStoryPage.styled.jsx
|   `-- LoginPage/
|       |-- index.jsx
|       `-- Login.Styled.jsx
|
|-- App.jsx            # Pusat routing aplikasi
`-- main.jsx           # Entry point, tempat setup semua Provider (QueryClient, Chakra, Auth)
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

* **Status**: ✅ Selesai - Full authentication system sudah diimplementasikan
* **Yang Sudah Ada**:
    * ✅ Auth API V2.0 dengan POST method (Feb 2026)
    * ✅ Auto-logout saat token expired (9 jam)
    * ✅ Session tracking dengan productive/idle time (Feb 2026)
    * ✅ Session monitoring dengan warning notification
    * ✅ Real-time session timer di Navbar
    * ✅ Manual session extension capability
    * ✅ Forgot password flow dengan email (Feb 2026)
    * ✅ Update password dengan password strength indicator (Feb 2026)
    * ✅ Auto-logout setelah password change (Feb 2026)
    * ✅ Orphaned session detection & recovery (Feb 2026)
* **Rencana Lanjutan**: 
    * Two-Factor Authentication (2FA) dengan email OTP
    * Social login (Google OAuth)
    * Biometric authentication untuk mobile
    * Password expiry reminder (90 hari)
* **Keuntungan**: Security layer lengkap dengan productivity monitoring dan self-service password management

## 6. Security & Access Control

Project ini sudah dilengkapi dengan sistem keamanan multi-layer:

### Role-Based Access Control (RBAC)
* **3 Roles**: Staff, Admin, Super Admin
* **12 Jabatan**: CSO, ESO, Finance, IT, Marcom, Mentor, dll.
* **Route Protection**: Protected berdasarkan role dan jabatan
* **Menu Visibility**: Dynamic menu rendering sesuai permission
* Dokumentasi lengkap: `RBAC_GUIDE.md`

### Token Expiry & Session Management
* **Auto-logout**: Token expired otomatis logout setelah 9 jam (540 menit)
* **Warning System**: Toast notification 15 menit sebelum expired
* **Session Extension**: User bisa perpanjang sesi manual
* **Real-time Badge**: Timer di Navbar dengan color coding
* Dokumentasi lengkap: `TOKEN_EXPIRY_GUIDE.md`

### Productivity Tracking (NEW - Feb 2026)
* **Session Monitoring**: Real-time productive vs idle time tracking
* **Grace Period**: 30 menit tolerance untuk multitasking
* **Session Recovery**: Auto-restore session setelah browser refresh
* **Orphaned Detection**: Cleanup session yang tidak selesai dengan benar
* **Backend Integration**: Productive/idle duration otomatis terkirim saat logout
* **Format**: HH:mm:ss untuk analytics dashboard

### Password Management (NEW - Feb 2026)
* **Forgot Password**: Reset password via email dengan temporary password
* **Update Password**: Self-service password change dengan validasi
* **Password Strength**: Real-time indicator dengan 5 requirements
* **Auto-logout**: Force re-login setelah password berhasil diubah
* **Validation**: Client-side dan server-side validation
* **Requirements**: 8-20 karakter, uppercase, lowercase, number, symbol

### Storage Security
* **Prefix isolation**: `carrot_academy_` prefix untuk semua keys
* **Expiry check**: Otomatis hapus expired data
* **Safe wrappers**: Error handling untuk semua localStorage operations
* **No sensitive data**: Password tidak pernah disimpan di client
* **Session persistence**: Encrypted session data dengan localStorage

**Catatan Penting**: Client-side security adalah UX layer. Backend validation tetap WAJIB untuk security sesungguhnya.

## 7. Dokumentasi & Learning Path

Project ini memiliki dokumentasi lengkap yang terstruktur. Untuk memahami project dengan baik, ikuti urutan baca dokumentasi berikut:

### Quick Start (Untuk Developer Baru)
1. **[README.md](README.md)** (dokumen ini) - Overview project, instalasi, dan arsitektur
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Cheat sheet utilities dan hooks
3. **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Status fitur dan utilities yang sudah dibuat

### Core Documentation (Developer)
4. **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Access control dan permission system
5. **[TOKEN_EXPIRY_GUIDE.md](TOKEN_EXPIRY_GUIDE.md)** - Session management dan token expiry
6. **[THEME_GUIDE.md](THEME_GUIDE.md)** - Dark/Light mode dan theming system

### Feature-Specific Guides
7. **[DASHBOARD_PROSPEKTIF_GUIDE.md](DASHBOARD_PROSPEKTIF_GUIDE.md)** - Dashboard Prospektif features
8. **[DASHBOARD_REMINDER_GUIDE.md](DASHBOARD_REMINDER_GUIDE.md)** - Dashboard Reminder & Janjian Temu

### Workflow & Process
9. **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Git branching strategy dan commit conventions
10. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment process dan environment setup
11. **[APP_NAVIGATION_FLOW.md](APP_NAVIGATION_FLOW.md)** - User navigation flows

### Planning & Stories
12. **[USER_STORIES.md](USER_STORIES.md)** - User stories dan requirements
13. **[USER_FLOW_GUIDE.md](USER_FLOW_GUIDE.md)** - Detailed user flow diagrams
14. **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Known issues dan planned improvements

### Theme Migration (Historical)
15. **[THEME_MIGRATION.md](THEME_MIGRATION.md)** - Migration dari Chakra v2 ke v3
16. **[THEME_UPDATE_SUMMARY.md](THEME_UPDATE_SUMMARY.md)** - Summary of theme changes

### Master Documentation Index
17. **[FLOW_DOCUMENTATION_INDEX.md](FLOW_DOCUMENTATION_INDEX.md)** - Complete documentation navigation guide

### Recommended Reading by Role

**Frontend Developer (New)**: 1 → 2 → 3 → 4 → 5 → 6 → 9  
**Backend Integration**: 4 → 5 → 11 → 9  
**UI/UX Designer**: 6 → 15 → 16 → 11  
**QA/Testing**: 3 → 7 → 8 → 11 → 14  
**Project Manager**: 1 → 3 → 12 → 13 → 14  
**DevOps**: 9 → 10

**Tips**: Gunakan [FLOW_DOCUMENTATION_INDEX.md](FLOW_DOCUMENTATION_INDEX.md) sebagai navigation guide untuk menjelajahi dokumentasi berdasarkan kebutuhan spesifik Anda.

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

Last update: 28 February 2026
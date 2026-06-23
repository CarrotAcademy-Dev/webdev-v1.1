# Application Navigation Flow

> **Peta navigasi lengkap aplikasi Carrot Academy Dashboard**  
> Panduan visual: halaman apa saja yang ada & bagaimana cara mengaksesnya
---

## Overview - Struktur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                    CARROT ACADEMY                        │
│                   Dashboard System                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │       LOGIN PAGE        │
              │     (Halaman Awal)      │
              └─────────────────────────┘
                            │
                            ↓ [Login Berhasil]
                            │
              ┌─────────────────────────┐
              │   DASHBOARD OVERVIEW    │
              │   (Halaman Utama)       │
              └─────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ↓           ↓           ↓
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │   HOME   │ │ MY TASKS │ │  ADMIN   │
         │  MENU    │ │   MENU   │ │   MENU   │
         └──────────┘ └──────────┘ └──────────┘
```

---

## Complete Navigation Map

### Level 0: Public Pages (Tidak Perlu Login)

```
┌──────────────────────────────────────────────────────┐
│  LOGIN PAGE                                          │
│  URL: /                                              │
│  ┌────────────────────────────────────────────────┐  │
│  │  • Form Email & Password                       │  │
│  │  • Button Login                                │  │
│  │  • Link Forgot Password (belum ditambahkan)    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Action: Klik LOGIN                                  │
│  Result: Redirect ke /home                           │
│          Error message jika gagal                    │
└──────────────────────────────────────────────────────┘

```

---

### Level 1: Main Dashboard (Semua User)

```
┌─────────────────────────────────────────────────────────┐
│  OVERVIEW PAGE (Dashboard Utama)                        │
│  URL: /home                                             │
│  Access: Semua user yang sudah login                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  TAMPILAN:                                        │  │
│  │  • Header: "Hallo, [Nama]!"                       │  │
│  │  • Info Card Profil                               │  │
│  │  • Clock In/Out hari ini                          │  │
│  │  • Attendance Streak                              │  │
│  │  • Task Summary (Assigned/Completed/On Progress)  │  │
│  │  • Grafik Tasks Completed                         │  │
│  │  • Kalender Absensi bulan ini                     │  │
│  │  • Widget Reminders                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Yang Bisa Diklik:                                      │
│  → Navbar Menu (Home, My Tasks, Admin, Profile)         │
│  → Kalender tanggal untuk detail absensi                │
│  → Reminder items                                       │
└─────────────────────────────────────────────────────────┘
```

---

### Level 2: Menu Categories

#### Menu 1: HOME (Semua User)

```
┌─────────────────────────────────────────────────────────┐
│  HOME MENU                                              │
│  Icon: 🏠                                               │
│  Access: Semua user                                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┌────────────────┌
        │                   │                   │                │
        ↓                   ↓                   ↓                ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  OVERVIEW    │   │  ATTENDANCE  │   │ KPI DETAILS  │   │LEAVE REQUEST │
│              │   │              │   │              │   │              │
│  URL: /home  │   │  URL: /att.. │   │ URL: /home/  │   │ URL: /leave..│
│              │   │              │   │      kpi     │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘                      
                                      
```

**Detail Menu HOME:**

1. **Overview** (`/home`)
   - Tampilan: Dashboard utama
   - Data: Task summary, attendance, reminders
   - Aksi: Lihat overview pekerjaan hari ini

2. **Attendance** (`/attendance`)
   - Tampilan: History absensi lengkap
   - Data: Clock in/out, status (Hadir/Izin/Sakit)
   - Aksi: Check detail absensi per hari

3. **KPI Details** (`/home/kpi`)
   - Tampilan: Detail KPI performance
   - Data: KPI metrics, achievement, progress
   - Aksi: Monitor pencapaian KPI

4. **Leave Request** (`/leave-request`)
   - Tampilan: Form & history cuti
   - Data: Pengajuan cuti, status approval
   - Aksi: Submit cuti baru, check status

---

#### Menu 2: MY TASKS

```
┌─────────────────────────────────────────────────────────┐
│  MY TASKS MENU                                          │
│  Icon: 💼                                               │
│  Access: Staff (CSO, ESO, Finance, HRGA) dan admin     │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────────────┐
                │                               │
         ┌──────┴──────┐              ┌────────┴────────┐
         │             │              │                 │
         ↓             ↓              ↓                 ↓
    [CSO]         [ESO]         [Finance]        [HRGA]
    Bersama       Bersama       Bersama          Bersama
    Personal      Personal      Personal         Personal
         │             │              │                 │
         ├─ Div Menu   ├─ Div Menu   ├─ Div Menu      ├─ Div Menu
         │             │              │                 │
```

**Access Control:**
- **CSO Menu**: Visible untuk jabatan CSO (atau Admin/Super Admin)
- **ESO Menu**: Visible untuk jabatan ESO (atau Admin/Super Admin)
- **Finance Menu**: ✨ NEW - Visible untuk jabatan Finance (atau Admin/Super Admin)
- **HRGA Menu**: ✨ NEW - Visible untuk jabatan HRGA (atau Admin/Super Admin)

---

##### MY TASKS → BERSAMA (Shared Tasks)

```
┌──────────────────────────────────────────────────────────────┐
│  BERSAMA MENU (15 halaman)                                   │
│  Access: Staff, Admin                                        │
└──────────────────────────────────────────────────────────────┘

1.  Statistik Prospektif
    URL: /my-tasks/statistik-prospektif
    │
    ├─ Tampilan: Statistik data calon siswa
    ├─ Data: Jumlah prospektif, conversion rate, trending
    └─ Aksi: Analisa data prospektif

2.  Rekap Jadwal Mentor
    URL: /my-tasks/rekap-jadwal-mentor
    │
    ├─ Tampilan: Tabel jadwal mengajar mentor
    ├─ Data: Nama mentor, jadwal, kelas
    └─ Aksi: Lihat & manage jadwal mentor

3.  Daftar Kelas Tersedia
    URL: /my-tasks/daftar-kelas-tersedia
    │
    ├─ Tampilan: List kelas yang available
    ├─ Data: Nama kelas, quota, jadwal
    └─ Aksi: Check ketersediaan kelas

4.  Daftar Kirim Merchandise
    URL: /my-tasks/daftar-kirim-merch
    │
    ├─ Tampilan: Daftar pengiriman merch ke siswa
    ├─ Data: Nama siswa, alamat, status pengiriman
    └─ Aksi: Track & update status pengiriman

5.  Daftar Siswa Trial
    URL: /my-tasks/daftar-siswa-trial
    │
    ├─ Tampilan: List siswa yang trial
    ├─ Data: Nama, kontak, jadwal trial
    └─ Aksi: Monitor & follow up siswa trial

6.  Daftar Offboarding
    URL: /my-tasks/daftar-offboarding
    │
    ├─ Tampilan: Daftar siswa yang keluar
    ├─ Data: Nama siswa, alasan keluar, tanggal
    └─ Aksi: Process offboarding siswa

7.  Daily Story
    URL: /my-tasks/daily-story
    │
    ├─ Tampilan: Input & list daily activities
    ├─ Data: Tanggal, aktivitas, notes
    └─ Aksi: Submit & view daily story

8.  Janji Temu
    URL: /my-tasks/janji-temu
    │
    ├─ Tampilan: Calendar & list janji temu
    ├─ Data: Tanggal, waktu, dengan siapa, tujuan
    └─ Aksi: Create & manage appointments

9.  Ticket External
    URL: /my-tasks/ticket-external
    │
    ├─ Tampilan: List tiket dari eksternal (parents/siswa)
    ├─ Data: Tiket number, issue, status, priority
    └─ Aksi: Handle & resolve tiket

10. Pendaftaran Lanjutan
    URL: /my-tasks/pendaftaran-lanjutan
    │
    ├─ Tampilan: Form lanjutan pendaftaran siswa
    ├─ Data: Data siswa, payment, dokumen
    └─ Aksi: Process pendaftaran lanjutan

11. Pendaftaran Fulltime Course
    URL: /my-tasks/pendaftaranfd-course
    │
    ├─ Tampilan: Pendaftaran program fulltime
    ├─ Data: Data siswa, program pilihan
    └─ Aksi: Daftarkan siswa ke FD course

12. Lost And Found
    URL: /my-tasks/lostnfound
    │
    ├─ Tampilan: List barang hilang/ketemu
    ├─ Data: Nama barang, lokasi, status
    └─ Aksi: Report & manage lost items

13. Prospektif Dari Marcom
    URL: /my-tasks/prospektif-dari-marcom
    │
    ├─ Tampilan: Data prospektif dari tim marketing
    ├─ Data: Nama, kontak, source, status
    └─ Aksi: Follow up prospektif dari marcom

14. Partnership
    URL: /my-tasks/partnership
    │
    ├─ Tampilan: Data kerjasama & partnership
    ├─ Data: Partner name, type, status, benefit
    └─ Aksi: Manage partnership data

15. Dashboard Siswa Aktif
    URL: /my-tasks/dashboard-siswa-aktif
    │
    ├─ Tampilan: Overview semua siswa aktif
    ├─ Data: Total siswa, per kelas, status payment
    └─ Aksi: Monitor siswa aktif
```

---

##### MY TASKS → PERSONAL (Individual Tasks)

```
┌──────────────────────────────────────────────────────────────┐
│  PERSONAL MENU (13 halaman)                                  │
│  Access: Staff, Admin                                        │
└──────────────────────────────────────────────────────────────┘

1.  Prospektif Form
    URL: /my-tasks/prospektif-form
    │
    ├─ Tampilan: Form input data prospektif baru
    ├─ Data: Nama, kontak, sumber, interest
    └─ Aksi: Input prospektif baru

2.  Dashboard Prospektif
    URL: /my-tasks/dashboard-prospektif
    │
    ├─ Tampilan: Overview prospektif yang di-handle CSO
    ├─ Data: List prospektif, status, next action
    └─ Aksi: Manage & follow up prospektif personal

3.  Dashboard Reminder
    URL: /my-tasks/dashboard-reminder
    │
    ├─ Tampilan: All reminders & to-do list
    ├─ Data: Task, deadline, priority, status
    └─ Aksi: Create & manage reminders

4.  Dashboard Daily
    URL: /my-tasks/dashboard-daily
    │
    ├─ Tampilan: Daily activities & achievements
    ├─ Data: Tasks completed, hours worked, notes
    └─ Aksi: Track daily productivity

5.  Dashboard Invoice
    URL: /my-tasks/dashboard-invoice
    │
    ├─ Tampilan: Invoice & payment tracking
    ├─ Data: Invoice number, amount, status, due date
    └─ Aksi: Monitor & follow up invoices

6.  Dashboard Portfolio
    URL: /my-tasks/dashboard-portfolio
    │
    ├─ Tampilan: Portfolio siswa & achievements
    ├─ Data: Karya siswa, progress, milestones
    └─ Aksi: Document & showcase student work

7.  FD Student Identity
    URL: /my-tasks/fd-student-identity
    │
    ├─ Tampilan: Data identitas siswa fulltime
    ├─ Data: Biodata, dokumen, emergency contact
    └─ Aksi: Manage student identity data

8.  Profil Siswa
    URL: /my-tasks/profil-siswa
    │
    ├─ Tampilan: Detail profil siswa lengkap
    ├─ Data: Personal info, kelas, payment, progress
    └─ Aksi: View & update student profile

9.  Create Ticketing
    URL: /my-tasks/create-ticketing
    │
    ├─ Tampilan: Form create tiket internal
    ├─ Data: Subject, category, priority, description
    └─ Aksi: Submit tiket baru ke tim lain

10. Ticketing Internal
    URL: /my-tasks/ticketing-internal
    │
    ├─ Tampilan: List semua tiket internal
    ├─ Data: Tiket dari/ke CSO, status, response
    └─ Aksi: Handle & respond tiket internal

11. Track Ticket From Me
    URL: /my-tasks/track-ticket-fme
    │
    ├─ Tampilan: Tracking tiket yang dibuat CSO
    ├─ Data: My tickets, status, response time
    └─ Aksi: Follow up tiket yang dibuat

12. Review Karyawan
    URL: /my-tasks/review-karyawan
    │
    ├─ Tampilan: Performance review karyawan
    ├─ Data: Rating, feedback, improvement area
    └─ Aksi: Submit review untuk karyawan

13. Dashboard Karyawan
    URL: /my-tasks/dashboard-karyawan
    │
    ├─ Tampilan: Rekap absensi & performance karyawan
    ├─ Data: Attendance, tardiness, overtime
    └─ Aksi: Monitor employee attendance
```

---

#### Menu 3: ADMIN (Admin & Super Admin Only)

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN MENU                                             │
│  Icon: 🛡️                                              │
│  Access: Admin, Super Admin, Staff                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
                ┌───────────────────────┐
                │   REGISTER USER       │
                │                       │
                │   URL: /admin/        │
                │        register-user  │
                └───────────────────────┘
```

**Detail Menu ADMIN:**

1. **Register User** (`/admin/register-user`)
   ```
   ┌──────────────────────────────────────────┐
   │  REGISTER USER PAGE                      │
   │  ┌────────────────────────────────────┐  │
   │  │  FORM FIELDS:                      │  │
   │  │  • Nama                            │  │
   │  │  • Email                           │  │
   │  │  • Password                        │  │
   │  │  • Jabatan (dropdown)              │  │
   │  │  • Role (dropdown)                 │  │
   │  │  • Status Aktif (checkbox)         │  │
   │  │                                    │  │
   │  │  [REGISTER USER BUTTON]            │  │
   │  └────────────────────────────────────┘  │
   │                                          │
   │  Action: Submit form                     │
   │  Result: User baru terdaftar             │
   │          Error jika data invalid         │
   └──────────────────────────────────────────┘
   ```

---

#### Menu 4: PROFILE (Semua User)

```
┌────────────────────────────────────────────────────────┐
│  PROFILE MENU                                          │
│  Icon: 👤                                              │
│  Access: Semua user                                    │
└────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ↓                   ↓                   ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   PROFILE    │   │   PAYMENT    │   │   SETTINGS   │
│              │   │              │   │              │
│ URL: /profile│   │ URL: /payment│   │URL: /settings│
└──────────────┘   └──────────────┘   └──────────────┘
```

**Detail Menu PROFILE:**

1. **Profile** (`/profile`)
   - Tampilan: Data profil user
   - Data: Foto, nama, email, jabatan, kontak
   - Aksi: Edit profil personal

2. **Payment** (`/payment`)
   - Tampilan: Payment history & info
   - Data: Salary, bonus, payment schedule
   - Aksi: View payment details

3. **Settings** (`/settings`)
   - Tampilan: App settings & preferences
   - Data: Theme, notification, language
   - Aksi: Customize app settings

---

#### MY TASKS → ESO (Education Support Officer)

```
┌──────────────────────────────────────────────────────────────┐
│  ESO MENU (15+ halaman)                                      │
│  Access: ESO staff, Admin                                    │
│  API Endpoint: VITE_API_ESO_BERSAMA_ENDPOINT                 │
│                VITE_API_ESO_PERSONAL_ENDPOINT                │
└──────────────────────────────────────────────────────────────┘

BERSAMA (Shared - 10+ pages):
├─ Ticketing External - Manage external support tickets
├─ Student Report - Laporan perkembangan siswa
├─ Artwork of the Month - Showcase karya siswa terbaik
├─ Kelengkapan Data - Data completion tracking
├─ Nomor Urut Sertifikat - Certificate number assignment
├─ Progress Report Monthly - Monthly student progress
├─ Daftar Offboarding - Student exit process
└─ ... & more

PERSONAL (Individual - 5+ pages):
├─ Dashboard FD (Foundation) - FD program dashboard
├─ Ticketing Internal - Internal support tickets
└─ ... & more
```

---

#### MY TASKS → FINANCE (Keuangan)

```
┌──────────────────────────────────────────────────────────────┐
│  FINANCE MENU (16 halaman)                                   │
│  Access: Finance staff, Admin                                │
│  API Endpoint: VITE_API_FINANCE_BERSAMA_ENDPOINT             │
│                VITE_API_FINANCE_PERSONAL_ENDPOINT            │
│  Jabatan: "Finance Accounting"                               │
│  Access Group: FINANCE_ONLY | FINANCE_OR_ADMIN              │
└──────────────────────────────────────────────────────────────┘

BERSAMA (Shared - 9 pages):
1.  Approval Pendaftaran
    URL: /my-tasks/finance-bersama/approval-pendaftaran
    Approve student registrations & payment

2.  Daftar Harga
    URL: /my-tasks/finance-bersama/daftar-harga
    Price list management

3.  Data BKM (Bank & Component Master)
    URL: /my-tasks/finance-bersama/data-bkm
    Bank account & component data

4.  Bukti Pembayaran
    URL: /my-tasks/finance-bersama/bukti-pembayaran
    Payment proof documentation

5.  Tagihan (Invoicing)
    URL: /my-tasks/finance-bersama/tagihan
    Invoice management & tracking

6.  Daftar Offboarding Finance
    URL: /my-tasks/finance-bersama/daftar-offboarding
    Financial offboarding process

7.  Pendaftaran Fulltime Course
    URL: /my-tasks/finance-bersama/pendaftaran-ft-course
    FTC student registration & fees

8.  Daftar Kirim Merchandise
    URL: /my-tasks/finance-bersama/daftar-kirim-merchandise
    Track merchandise delivery costs

9.  Ticketing External Finance
    URL: /my-tasks/finance-bersama/ticketing-external
    External finance support tickets

PERSONAL (Individual - 7 pages):
1.  Dashboard Pendapatan (Revenue Dashboard)
    URL: /my-tasks/finance-personal/dashboard-pendapatan
    Personal revenue & income tracking

2.  Daftar Harga Personal
    URL: /my-tasks/finance-personal/daftar-harga
    Personal price list access

3.  Ticketing Internal Finance
    URL: /my-tasks/finance-personal/ticketing-internal
    Internal finance tickets

4.  Track Ticket From Me
    URL: /my-tasks/finance-personal/track-ticket-from-me
    Track own submitted tickets

5.  Review Karyawan Finance
    URL: /my-tasks/finance-personal/review-karyawan
    Employee salary review

6.  Statistik Tagihan
    URL: /my-tasks/finance-personal/statistik-tagihan
    Invoice statistics & analytics

7.  Profile Siswa Finance
    URL: /my-tasks/finance-personal/profile-siswa
    Student financial profile
```

---

#### MY TASKS → HRGA (HR & General Affairs)

```
┌──────────────────────────────────────────────────────────────┐
│  HRGA MENU (16 halaman)                                      │
│  Access: HRGA staff, Admin                                   │
│  API Endpoint: VITE_HR_RECRUITMENT_ENDPOINT                  │
│                VITE_HRGA_ASSET_ENDPOINT                      │
│  Jabatan: "HR&GA Officer"                                    │
│  Access Group: HRGA_ONLY | HRGA_OR_ADMIN                    │
│  Sub-divisions: HR Recruitment + Asset Management           │
└──────────────────────────────────────────────────────────────┘

HR RECRUITMENT (7 pages):
1.  Dashboard Report
    URL: /my-tasks/hrga/hr-recruitment/dashboard-report
    Recruitment overview & metrics

2.  Human Resource Requests
    URL: /my-tasks/hrga/hr-recruitment/hr-requests
    Manage HR position requests

3.  Jam Kerja (Working Hours)
    URL: /my-tasks/hrga/hr-recruitment/jam-kerja
    Staff working hours tracking

4.  Tugas Interview
    URL: /my-tasks/hrga/hr-recruitment/tugas-interview
    Interview assignment & schedule

5.  Hasil Response Test Kandidat
    URL: /my-tasks/hrga/hr-recruitment/hasil-response-test
    Candidate test results

6.  Applicant Data
    URL: /my-tasks/hrga/hr-recruitment/applicant-data
    Applicant database & tracking

7.  Penilaian Kandidat (Candidate Assessment)
    URL: /my-tasks/hrga/hr-recruitment/penilaian-kandidat
    Assessment & evaluation form

ASSET MANAGEMENT (9 pages):
1.  Dashboard Asset
    URL: /my-tasks/hrga/asset/dashboard-asset
    Asset overview & KPI

2.  Asset Data / Asset Page
    URL: /my-tasks/hrga/asset/asset-data
    Asset inventory database

3.  Daily Asset Tracking
    URL: /my-tasks/hrga/asset/daily-asset
    Daily asset movements & updates

4.  Detail Barang (Item Details)
    URL: /my-tasks/hrga/asset/detail-barang
    Individual asset details & specs

5.  Maintenance
    URL: /my-tasks/hrga/asset/maintenance
    Maintenance records & scheduling

6.  Peminjaman Barang (Item Loan)
    URL: /my-tasks/hrga/asset/peminjaman-barang
    Track loaned items & returns

7.  Penyusutan (Depreciation)
    URL: /my-tasks/hrga/asset/penyusutan
    Asset depreciation calculation

8.  Services
    URL: /my-tasks/hrga/asset/services
    Asset service records

9.  Asset History
    URL: /my-tasks/hrga/asset/asset-history
    Complete asset transaction history
```

---

### Menu 3: ADMIN (Admin Only)

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN MENU                                             │
│  Icon: 🛡️                                               │
│  Access: Admin & Super Admin only                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────┐
│  ADMIN FEATURES:                                     │
│                                                      │
│  1. Register User                                    │
│     URL: /admin/register-user                        │
│     - Create new user accounts                       │
│     - Assign role & jabatan                          │
│     - Set active status                              │
│                                                      │
│  2. Can also access ALL CSO, ESO, Finance, HRGA     │
│     pages (Admin OR_ADMIN groups enabled)            │
│                                                      │
│  3. View full system for monitoring & oversight      │
│                                                      │
│  Note: Super Admin has same access as Admin          │
│        (both can see all divisi menus)               │
└──────────────────────────────────────────────────────┘
```

---

### Menu 4: PROFILE (Semua User)

```
┌─────────────────────────────────────────────────────┐
│  PROFILE MENU                                       │
│  Icon: 👤                                           │
│  Access: Semua user yang sudah login                │
└─────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ↓                  ↓                  ↓
    /profile            /settings          /logout
    (View Profil)      (Preferences)      (Logout)
```

#### Access Denied Page

```
┌─────────────────────────────────────────────────────────┐
│  ACCESS DENIED PAGE                                     │
│  URL: /access-denied                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Access Denied                                  │ │
│  │                                                    │ │
│  │  You don't have permission to access this page.    │ │
│  │                                                    │ │
│  │  Required: [Role/Jabatan yang dibutuhkan]          │ │
│  │  Your role: [Role/Jabatan user saat ini]           │ │
│  │                                                    │ │
│  │           [← Back to Home]                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Kapan muncul:                                          │
│  • User coba akses halaman CSO tapi bukan CSO/Admin     │
│  • User coba akses Admin menu tapi bukan Admin          │
│  • URL diketik manual tapi tidak punya akses            │
└─────────────────────────────────────────────────────────┘
```

#### Not Found Page

```
┌─────────────────────────────────────────────────────────┐
│  NOT FOUND PAGE (404)                                   │
│  URL: /* (halaman yang tidak ada)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Page Not Found                                    │ │
│  │                                                    │ │
│  │  The page you're looking for doesn't exist.        │ │
│  │                                                    │ │
│  │           [← Back to Home]                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Kapan muncul:                                          │
│  • User ketik URL yang salah/tidak exist                │
│  • Klik link yang broken                                │
└─────────────────────────────────────────────────────────┘
```

---

## User Journey - Navigasi Flow

### Journey 1: CSO Daily Workflow

```
START → Login
         ↓
      /home (Overview)
         ↓
      Klik icon 💼 (My Tasks)
         ↓
      Pilih "Dashboard Prospektif" (Personal)
         ↓
      View & manage prospektif data
         ↓
      Klik "Dashboard Reminder" (Personal)
         ↓
      Check & complete reminders
         ↓
      Klik "Statistik Prospektif" (Bersama)
         ↓
      Analisa data prospektif
         ↓
      Back to /home
         ↓
      Logout
END
```

---

### Journey 2: Admin Register New User

```
START → Login
         ↓
      /home (Overview)
         ↓
      Klik icon 🛡️ (Admin)
         ↓
      Pilih "Register User"
         ↓
      /admin/register-user
         ↓
      Isi form (Nama, Email, Password, Jabatan, Role)
         ↓
      Klik "REGISTER USER"
         ↓
     Success notification
         ↓
      Back to /home atau register user lain
         ↓
      Logout
END
```

---

### Journey 3: Finance Staff (Limited Access)

```
START → Login
         ↓
      /home (Overview)
         │
         ├─→ Klik "KPI Details" → /home/kpi
         │
         ├─→ Klik "Attendance" → /attendance
         │
         ├─→ Klik "Profile" → /profile
         │
         └─→ Coba akses /my-tasks/... (tidak ada di menu)
              ↓
              Type URL manual: /my-tasks/dashboard-prospektif
              ↓
              Redirect to /access-denied
              ↓
              Klik "Back to Home"
              ↓
              Return to /home
              ↓
              Logout
END
```

---

## Navigation Tree (Complete)

```
🥕 CARROT ACADEMY DASHBOARD
│
├─ / (Login) ────────────────────────────────────────────┐
│                                                        │
│                                                 [Login Success]
│                                                        │
└───────────────────────────────────────────────→ /home (Overview)
                                                         │
                    ┌────────────────────────────────────┼────────────────────────┐
                    │                                    │                        │
                    ↓                                    ↓                        ↓
              🏠 HOME MENU                        💼 MY TASKS MENU          🛡️ ADMIN MENU
              (Semua User)                           (CSO & Admin)             (Admin Only)
                    │                                    │                        │
         ┌──────────┼──────────┐───────────┐             │                        │
         │          │          │           │             │                        │
         ↓          ↓          ↓           ↓             ↓                        ↓
    /home     /attendance  /home/kpi  /leave-request    BERSAMA             /admin/register-user
    (Overview)              (KPI)                       PERSONAL
        
                                                         │
                                    ┌────────────────────┴────────────────────┐
                                    │                                         │
                                    ↓                                         ↓
                                BERSAMA (15)                             PERSONAL (13)
                                    │                                         │
                     ┌──────────────┼──────────────┐            ┌─────────────┼─────────────┐
                     │              │              │            │             │             │
                     ↓              ↓              ↓            ↓             ↓             ↓
                    Statistik    Rekap Jadwal   Daftar Kelas  Prospektif  Dashboard  Dashboard
                    Prospektif      Mentor       Tersedia        Form     Prospektif  Reminder
                     │              │              │            │             │             │
                     ↓              ↓              ↓            ↓             ↓             ↓
                    Daftar        Daftar         Daftar        Dashboard   Dashboard Dashboard
                    Kirim Merch   Siswa Trial   Offboarding     Daily      Invoice   Portfolio
                     │              │              │            │             │             │
                     ↓              ↓              ↓            ↓             ↓             ↓
                    Daily         Janji Temu    Ticket        FD Student   Profil    Create
                    Story                       External       Identity     Siswa    Ticketing
                     │              │              │            │             │             │
                     ↓              ↓              ↓            ↓             ↓             ↓
                    Pendaftaran    Pendaftaran   Lost N        Ticketing  Track Ticket Review
                    Lanjutan       FD Course     Found          Internal    From Me    Karyawan
                     │              │              │                              │
                     ↓              ↓              ↓                              ↓
                    Prospektif    Partnership  Dashboard                        Dashboard
                    dari Marcom              Siswa Aktif                        Karyawan


                            👤 PROFILE MENU
                              (Semua User)
                                    │
                         ┌──────────┼──────────┐
                         │          │          │
                         ↓          ↓          ↓
                    /profile   /payment   /settings


                          🚪 LOGOUT MENU
                          (Semua User)
                                │
                                ↓
                          Clear session
                                ↓
                          Redirect to /
```

---

## Click Flow - Apa yang Terjadi Saat Klik Menu

### Scenario A: User Klik Menu "Overview"

```
User di halaman manapun
    ↓
Klik icon 🏠 di Navbar
    ↓
Dropdown menu muncul:
    • Overview ←
    • Attendance
    • KPI Details
    • Leave Request
    ↓
Klik "Overview"
    ↓
[System Check]
    ✓ User logged in? → Yes
    ✓ Access allowed? → Yes (semua user)
    ↓
Navigate to /home
    ↓
[Page Loading]
    • Fetch user data
    • Fetch attendance data
    • Fetch task summary
    • Fetch reminders
    ↓
[Render Page]
    Dashboard Overview ditampilkan
```

---

### Scenario B: CSO Klik Menu "Dashboard Prospektif"

```
CSO user di halaman /home
    ↓
Klik icon 💼 (My Tasks) di Navbar
    ↓
Dropdown menu muncul:
    Bersama
        • Statistik Prospektif
        • Rekap Jadwal Mentor
        • ...
    Personal
        • Prospektif Form
        • Dashboard Prospektif ←
        • ...
    ↓
Klik "Dashboard Prospektif"
    ↓
[System Check]
    ✓ User logged in? → Yes (CSO)
    ✓ Check jabatan: "Customer Support Officer" → Yes
    ✓ Access allowed? → Yes (CSO_OR_ADMIN)
    ↓
Navigate to /my-tasks/dashboard-prospektif
    ↓
[Page Loading]
    • Fetch prospektif data
    • Fetch status & filters
    ↓
[Render Page]
    Dashboard Prospektif ditampilkan
    CSO bisa lihat & manage data prospektif
```

---

### Scenario C: Finance Staff Klik Menu CSO (Not Visible)

```
Finance user di halaman /home
    ↓
User TIDAK LIHAT menu Admin atau jabatan lain
    ↓
[Reason]
    • showCSOMenu = false
    • User jabatan: "Finance Accounting" ≠ CSO
    • User role: "staff" ≠ admin
    ↓
[Menu yang terlihat di Navbar]
    🏠 Home
    💼 My Tasks
    🛡️ Admin (HIDDEN)
    👤 Profile
    🚪 Logout
```

---

### Scenario D: Finance Staff Paksa Akses URL CSO

```
Finance user manually type URL
    ↓
Ketik di browser: /my-tasks/dashboard-prospektif
    ↓
[System Check - ProtectedRoute]
    ✓ User logged in? → Yes (Finance)
    ✗ Check jabatan: "Finance Accounting" → Not CSO
    ✗ Check role: "staff" → Not admin
    ✗ Access allowed? → NO
    ↓
[Redirect]
    Navigate to /access-denied
    ↓
[Render Page]
    Access Denied page ditampilkan
    • Message: "You don't have permission"
    • Required: CSO or Admin
    • Your role: Finance Staff
    • Button: [← Back to Home]
```

---

### Scenario E: Admin Klik "Register User"

```
Admin user di halaman /home
    ↓
Klik icon 🛡️ (Admin) di Navbar
    ↓
Dropdown menu muncul:
    Admin
        • Register User ←
    ↓
Klik "Register User"
    ↓
[System Check]
    ✓ User logged in? → Yes (Admin)
    ✓ Check role: "admin" → Yes
    ✓ Access allowed? → Yes (ADMIN_ONLY)
    ↓
Navigate to /admin/register-user
    ↓
[Render Page]
    Register User form ditampilkan
    • Form fields: Nama, Email, Password, Jabatan, Role, Status
    • Button: REGISTER USER
```

---

### Scenario F: User Klik "Logout"

```
User di halaman manapun
    ↓
Klik icon 🚪 (Logout) di Navbar
    ↓
[System Process]
    AuthContext.logout() called
    ↓
    Clear currentUser from state
    ↓
    Remove token from localStorage
    ↓
    Stop all session monitoring
    ↓
[Redirect]
    Navigate to / (Login page)
    ↓
[Render Page]
    Login page ditampilkan
    • User harus login ulang untuk akses lagi
```

---

## Back Button & Navigation

### Browser Back Button

```
User di halaman: /my-tasks/dashboard-prospektif
    ↓
Klik Back button di browser
    ↓
Navigate to: Previous page (misal: /home)
    ↓
[System Check]
    ✓ User still logged in? → Check token
    ✓ Token valid? → Yes
    ↓
[Render Page]
    Halaman sebelumnya ditampilkan
```

---

### Session Expired + Back Button

```
User di halaman: /my-tasks/dashboard-prospektif
    ↓
[8 jam kemudian - Session expired]
    Auto logout
    Redirect to /
    ↓
User klik Back button
    ↓
Try to navigate to: /my-tasks/dashboard-prospektif
    ↓
[System Check]
    ✗ User logged in? → NO (session expired)
    ↓
[Redirect]
    Navigate to / (Login page)
    ↓
[Message]
    Toast: "Your session has expired. Please login again."
```

---

## Mobile vs Desktop Navigation

### Desktop Navigation

```
┌─────────────────────────────────────────────────────┐
│  🥕 Logo    [🟢 8j]  [☀️]  🏠 💼 🛡️ 👤 🚪       │
└─────────────────────────────────────────────────────┘
       │         │        │    │   │  │   │  │
       │         │        │    │   │  │   │  └─ Logout
       │         │        │    │   │  │   └─ Profile
       │         │        │    │   │  └─ Admin
       │         │        │    │   └─ My Tasks
       │         │        │    └─ Home
       │         │        └─ Theme Toggle
       │         └─ Session Timer Badge
       └─ Brand Logo (klik → /home)

• Semua menu visible di top navbar
• Hover untuk dropdown submenu
• Klik langsung navigate
```

---

### Mobile Navigation

```
┌──────────────────────────────┐
│  🥕 Logo  [🟢 8j] [☀️] [≡]  │
└──────────────────────────────┘
                            │
                            └─ Hamburger Menu
                               │
                               ↓ Klik
                          ┌─────────────┐
                          │  DRAWER     │
                          │  MENU       │
                          │             │
                          │  🏠 Home    │
                          │  💼 My Tasks│
                          │  🛡️ Admin   │
                          │  👤 Profile │
                          │  🚪 Logout  │
                          └─────────────┘

• Menu tersembunyi di hamburger (≡)
• Klik hamburger → Drawer slide dari kanan
• Klik menu → Navigate & drawer close
• More touch-friendly untuk mobile
```

---

## Visual Feedback - Apa yang User Lihat

### Active Menu Indicator

```
User sedang di halaman: /my-tasks/dashboard-prospektif
                                ↓
Navbar di-highlight:
┌─────────────────────────────────────┐
│  🏠  💼  🛡️  👤  🚪               │
│       ↑                             │
│    ACTIVE (orange/highlighted)      │
└─────────────────────────────────────┘

• Icon 💼 (My Tasks) berwarna orange
• Menandakan user sedang di menu My Tasks
```

---

### Loading State

```
User klik menu "Dashboard Prospektif"
    ↓
[Page Transition]
    • Old page fadeout
    • Loading spinner muncul
    ┌──────────────────┐
    │                  │
    │   ⏳ Loading...  │
    │                  │
    └──────────────────┘
    • New page fadein
    ↓
[Page Rendered]
    Dashboard Prospektif ditampilkan dengan data
```

---

### Error State

```
User klik menu, tapi API error
    ↓
[Error Handling]
    • Error message toast muncul
    ┌────────────────────────────────┐
    │  Failed to load data           │
    │  Please try again later        │
    └────────────────────────────────┘
    • Page tetap di halaman sebelumnya
    • atau
    • Page ditampilkan dengan error state
```

---

## Summary - Yang Terjadi Saat Klik Menu

1. **Klik Menu di Navbar**
   - Dropdown muncul (jika ada submenu)
   - Atau langsung navigate (jika single menu)

2. **System Check**
   - Apakah user logged in?
   - Apakah user punya akses (role/jabatan)?

3. **Navigation**
   - Jika ✅ → Navigate ke halaman
   - Jika ❌ → Redirect ke /access-denied atau /login

4. **Page Loading**
   - Fetch data dari API
   - Show loading state

5. **Page Render**
   - Tampilkan halaman dengan data
   - Update active menu indicator

6. **User Interaction**
   - User bisa interact dengan halaman
   - Klik menu lain untuk navigate

---

## Quick Navigation Tips

### Keyboard Shortcuts (Future Enhancement)
```
Ctrl + H → Home
Ctrl + T → My Tasks (jika ada akses)
Ctrl + P → Profile
Ctrl + Q → Logout
```

### Breadcrumb (Future Enhancement)
```
Home > My Tasks > Personal > Dashboard Prospektif
  ↑       ↑          ↑              ↑
 Klik  Klik       Klik          Current
 /home /my-tasks  (filter)       Page
```

---

*Dokumentasi navigasi aplikasi lengkap dari login sampai logout*  
*Untuk flow session management, lihat USER_FLOW_GUIDE.md*  
*Untuk user stories, lihat USER_STORIES.md*

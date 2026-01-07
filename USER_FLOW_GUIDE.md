# User Flow Guide - Carrot Academy Dashboard

> **Panduan alur penggunaan sistem dari Login sampai Logout**  
> Dibuat untuk stakeholder non-technical agar mudah dipahami

---

## Ringkasan Sistem

Sistem Carrot Academy Dashboard adalah aplikasi web untuk mengelola aktivitas karyawan dengan fitur:
- Login & Logout dengan keamanan tinggi
- Dashboard untuk melihat overview pekerjaan
- Menu khusus sesuai posisi (CSO, Admin, dll)
- Session management otomatis (auto logout jika tidak aktif)
- Akses kontrol berdasarkan Role & Jabatan

---

## Flow Lengkap: Login sampai Logout

```
┌─────────────────────────────────────────────────────────────────┐
│                       START: User Akses Aplikasi                │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  1️.  HALAMAN LOGIN                                              │
│  ┌────────────────────────────────────────────────────┐         │
│  │  • User membuka aplikasi                           │         │
│  │  • Masukkan Email & Password                       │         │
│  │  • Klik tombol "LOGIN"                             │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                           Validasi Login
                                ↓
                  ┌─────────────┴─────────────┐
                  ↓                           ↓
               GAGAL                       BERHASIL
    ┌───────────────────────┐       ┌───────────────────────┐
    │ • Email/password salah│       │ • Data user disimpan  │
    │ • Tampil pesan error  │       │ • Token dibuat (9 jam)│
    │ • Tetap di halaman    │       │ • Redirect ke /home   │
    │   login               │       └───────────────────────┘
    └───────────────────────┘                  ↓
            ↓                                  ↓
        Coba lagi                              ↓
                                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  2️.  AUTENTIKASI & INISIALISASI SESSION                         │
│  ┌────────────────────────────────────────────────────┐         │
│  │  ✓ AuthContext menyimpan data user                 │         │
│  │  ✓ Token disimpan di localStorage (expiry 9 jam)   │         │
│  │  ✓ Session monitoring dimulai                      │         │
│  │  ✓ Timer session berjalan di background            │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  3️.  HALAMAN OVERVIEW (Dashboard Utama)                         │
│  ┌────────────────────────────────────────────────────┐         │
│  │  TAMPILAN:                                         │         │
│  │  • Navbar (dengan menu sesuai role/jabatan)        │         │
│  │  • Session Timer Badge (hijau/kuning/merah)        │         │
│  │  • Profil user & sapaan (Hallo, [Nama])            │         │
│  │  • Clock in/out hari ini                           │         │
│  │  • Attendance streak (berapa hari berturut-turut)  │         │
│  │  • Task summary (assigned/completed/on progress)   │         │
│  │  • Grafik tasks completed                          │         │
│  │  • Kalender absensi                                │         │
│  │  • Widget reminder                                 │         │
│  │                                                    │         │
│  │  AKSES KONTROL:                                    │         │
│  │  • Semua user yang login bisa akses Overview       │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  4️.  NAVIGASI MENU (Berdasarkan Role & Jabatan)                 │
│                                                                 │
│  MENU HOME (Semua User):                                        │
│  ├─ Overview                                                    │
│  ├─ Attendance                                                  │
│  ├─ KPI Details                                                 │
│  └─ Leave Request                                               │
│                                                                 │
│  MENU MY TASKS (Khusus CSO atau Admin):                         │
│  ├─ Bersama (Shared Tasks):                                     │
│  │  ├─ Statistik Prospektif                                     │
│  │  ├─ Rekap Jadwal Mentor                                      │
│  │  ├─ Daftar Kelas Tersedia                                    │
│  │  ├─ Daftar Kirim Merchandise                                 │
│  │  ├─ Daftar Siswa Trial                                       │
│  │  ├─ Daftar Offboarding                                       │
│  │  ├─ Daily Story                                              │
│  │  ├─ Janji Temu                                               │
│  │  ├─ Ticket External                                          │
│  │  ├─ Pendaftaran Lanjutan                                     │
│  │  ├─ Pendaftaran Fulltime Course                              │
│  │  ├─ Lost And Found                                           │
│  │  ├─ Prospektif Dari Marcom                                   │
│  │  ├─ Partnership                                              │
│  │  └─ Dashboard Siswa Aktif                                    │
│  │                                                              │
│  └─ Personal (Individual Tasks):                                │
│     ├─ Prospektif Form                                          │
│     ├─ Dashboard Prospektif                                     │
│     ├─ Dashboard Reminder                                       │
│     ├─ Dashboard Daily                                          │
│     ├─ Dashboard Invoice                                        │
│     ├─ Dashboard Portfolio                                      │
│     ├─ FD Student Identity                                      │
│     ├─ Profil Siswa                                             │
│     ├─ Create Ticketing                                         │
│     ├─ Ticketing Internal                                       │
│     ├─ Track Ticket From Me                                     │
│     ├─ Review Karyawan                                          │
│     └─ Dashboard Karyawan                                       │
│                                                                 │
│  MENU ADMIN (Khusus Admin/Super Admin):                         │
│  └─ Register User                                               │
│                                                                 │
│  MENU PROFILE (Semua User):                                     │
│  ├─ Profile                                                     │
│  ├─ Payment                                                     │
│  └─ Settings                                                    │
│                                                                 │
│  MENU LOGOUT (Semua User):                                      │
│  └─ Logout                                                      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  5️.  PROTEKSI AKSES HALAMAN                                     │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Setiap halaman dilindungi ProtectedRoute:         │         │
│  │                                                    │         │
│  │  Check: Apakah user sudah login?                   │         │
│  │     ├─ Belum → Redirect ke halaman Login           │         │
│  │     └─ Sudah → Lanjut ke check berikutnya          │         │
│  │                                                    │         │
│  │  Check: Apakah user punya akses?                   │         │
│  │     • Check Role (admin/super_admin/staff)         │         │
│  │     • Check Jabatan (CSO/ESO/Finance/dll)          │         │
│  │     ├─ Tidak → Redirect ke /access-denied          │         │
│  │     └─ Ya → Tampilkan halaman                      │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  6️.  SESSION MANAGEMENT (Berjalan di Background)                │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Session Timer:                                    │         │
│  │  • Default expiry: 9 jam sejak login               │         │
│  │  • Auto check setiap 5 menit                       │         │
│  │  • Update badge timer setiap 1 menit               │         │
│  │                                                    │         │
│  │  WARNING NOTIFICATIONS:                            │         │
│  │  • Sisa 15 menit → Toast notification              │         │
│  │  • Sisa 10 menit → Modal popup muncul              │         │
│  │                                                    │         │
│  │  VISUAL INDICATORS (Badge di Navbar):              │         │
│  │  • 🟢 Hijau: > 2 jam tersisa                       │         │
│  │  • 🟡 Kuning: 30 menit - 2 jam                     │         │
│  │  • 🟠 Orange: 10-30 menit                          │         │
│  │  • 🔴 Merah: < 10 menit (urgent!)                  │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  7️.  SKENARIO SESSION TIMEOUT                                   │
│                                                                 │
│  SISA 15 MENIT:                                                 │
│  ┌────────────────────────────────────────────────────┐         │
│  │  • Toast notification muncul                       │         │
│  │  • Pesan: "Sesi Akan Berakhir"                     │         │
│  │  • Info: Simpan pekerjaan Anda                     │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                 │
│  SISA 10 MENIT:                                                 │
│  ┌────────────────────────────────────────────────────┐         │
│  │  • Modal dialog muncul (tidak bisa ditutup)        │         │
│  │  • Countdown timer ditampilkan                     │         │
│  │  • User diberi 2 pilihan:                          │         │
│  │    ├─ [Perpanjang Sesi] → Extend 4 jam lagi        │         │
│  │    └─ [Logout Sekarang] → Keluar dari aplikasi     │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                 │
│  SISA 0 MENIT (EXPIRED):                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │  • Auto logout otomatis                            │         │
│  │  • Token dihapus dari storage                      │         │
│  │  • Redirect ke halaman Login                       │         │
│  │  • Toast: "Sesi Berakhir, login kembali"           │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  8️.  LOGOUT MANUAL                                              │
│  ┌────────────────────────────────────────────────────┐         │
│  │  User klik menu "Logout":                          │         │
│  │  • AuthContext.logout() dipanggil                  │         │
│  │  • User data dihapus dari state                    │         │
│  │  • Token dihapus dari localStorage                 │         │
│  │  • Redirect ke halaman Login                       │         │
│  │  • Session monitoring dihentikan                   │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      END: Kembali ke Login                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Journey Scenarios

### Skenario 1: CSO Login Normal
```
1. CSO buka aplikasi → Halaman Login
2. Input email & password → Klik LOGIN
3. Login berhasil → Redirect ke /home (Overview)
4. Lihat dashboard dengan info personal
5. Klik menu "My Tasks" → Lihat semua menu CSO
6. Bisa akses semua halaman CSO (Bersama & Personal)
7. Kerja sampai selesai → Klik Logout
8. Kembali ke halaman Login
```

### Skenario 2: Admin Login
```
1. Admin buka aplikasi → Halaman Login
2. Input email & password → Klik LOGIN
3. Login berhasil → Redirect ke /home
4. Lihat dashboard
5. Menu yang terlihat:
   - Home
   - My Tasks (CSO) (karena admin bisa akses semua)
   - Admin (khusus admin)
   - Profile
6. Bisa register user baru di menu Admin
7. Selesai → Logout
```

### Skenario 3: Session Timeout Warning
```
1. User login dan kerja seperti biasa
2. Setelah 8 jam 45 menit (sisa 15 menit):
   → Toast notification muncul
   → "Sesi Akan Berakhir dalam 15 menit"
3. Setelah 8 jam 50 menit (sisa 10 menit):
   → Modal dialog muncul
   → Tidak bisa ditutup
   → 2 pilihan: [Perpanjang] atau [Logout]
4. User klik "Perpanjang Sesi":
   → Session diperpanjang 4 jam lagi
   → Badge timer reset ke hijau
   → Modal ditutup
   → User bisa lanjut kerja
```

### Skenario 4: Auto Logout
```
1. User login tapi tidak ada aktivitas
2. Setelah warning 10 menit, user tidak respond
3. Session expired (9 jam):
   → Auto logout otomatis
   → Token dihapus
   → Redirect ke Login
   → Toast: "Sesi Berakhir"
4. User harus login ulang untuk lanjut
```

### Skenario 5: Akses Ditolak (Access Denied)
```
1. Staff (bukan CSO) login berhasil
2. Coba akses menu CSO (misalnya /my-tasks/dashboard-prospektif)
3. ProtectedRoute check:
   → User tidak punya jabatan CSO
   → User bukan Admin
4. Redirect otomatis ke /access-denied
5. Halaman error ditampilkan
6. User bisa kembali ke Home
```

---

## Visual Indicators

### Session Timer Badge (di Navbar)

```
┌──────────────────────────────────────────┐
│  🟢 9j 0m    │ Aman, masih banyak waktu  │
│  🟡 1j 30m   │ Sisa 1.5 jam              │
│  🟠 20m      │ Warning, segera expired   │
│  🔴 5m       │ Urgent! Akan logout       │
└──────────────────────────────────────────┘
```

### Session Timeout Modal

```
┌─────────────────────────────────────────┐
│  Sesi Akan Berakhir                     │
├─────────────────────────────────────────┤
│                                         │
│  Sesi login Anda akan berakhir dalam    │
│  5 menit.                               │
│                                         │
│  Untuk melanjutkan pekerjaan, silakan   │
│  perpanjang sesi. Atau logout jika      │
│  sudah selesai.                         │
│                                         │
│  Tips: Simpan pekerjaan Anda            │
│  terlebih dahulu untuk menghindari      │
│  kehilangan data.                       │
│                                         │
├─────────────────────────────────────────┤
│  [Logout Sekarang]  [Perpanjang Sesi]   │
└─────────────────────────────────────────┘
```

---

## Technical Flow (Behind the Scenes)

### 1. **Startup & Initialization**
```javascript
// main.jsx
1. App dimuat
2. QueryClientProvider → Setup API caching
3. AuthProvider → Initialize auth context
4. ColorModeScript → Setup theme
5. BrowserRouter → Enable routing
6. App.jsx → Render routes
```

### 2. **Login Process**
```javascript
// Login → AuthContext.login()
1. User submit form (email + password)
2. Fetch API ke backend
3. Validasi credentials
4. Jika berhasil:
   - Simpan user data ke state (currentUser)
   - Simpan ke localStorage dengan expiry 8 jam
   - Navigate ke /home
5. Jika gagal:
   - Tampilkan error message
   - Tetap di halaman login
```

### 3. **Route Protection**
```javascript
// ProtectedRoute Component
1. User akses halaman (misal: /my-tasks/dashboard-prospektif)
2. Check: Apakah currentUser ada?
   - Tidak → Redirect ke /
   - Ya → Lanjut check
3. Check: Apakah punya allowedRoles atau allowedJabatan?
   - Tidak memenuhi → Redirect ke /access-denied
   - Memenuhi → Render children (halaman)
```

### 4. **Session Monitoring Loop**
```javascript
// AuthContext.useEffect()
Setiap 5 menit:
1. Check token expiry via storage.getUser()
2. Jika token expired:
   - Toast notification
   - Logout otomatis
   - Redirect ke login
3. Jika token akan expired (<15 menit):
   - Toast warning
```

### 5. **Logout Process**
```javascript
// AuthContext.logout()
1. setCurrentUser(null)
2. storage.auth.logout() → Hapus dari localStorage
3. Stop all monitoring intervals
4. Router auto-redirect ke / (karena currentUser null)
```

---

## Data Flow Diagram

```
┌──────────────┐
│   Backend    │ (Google Apps Script API)
│   Database   │
└──────┬───────┘
       │
       │ GET/POST Request
       ↓
┌──────────────────────┐
│  API Services        │
│  - authApiService    │
│  - csoApiService     │
└──────┬───────────────┘
       │
       │ Response Data
       ↓
┌──────────────────────┐
│  React Query         │
│  (Caching Layer)     │
└──────┬───────────────┘
       │
       │ Cached/Fresh Data
       ↓
┌──────────────────────┐
│  Components          │
│  - Pages             │
│  - Widgets           │
└──────┬───────────────┘
       │
       │ Display
       ↓
┌──────────────────────┐
│   User Interface     │
│   (Browser)          │
└──────────────────────┘

┌──────────────────────┐
│  AuthContext         │ ←──┐
│  (Global State)      │    │ Read/Write
└──────┬───────────────┘    │
       │                    │
       ↓                    │
┌──────────────────────┐    │
│  localStorage        │ ───┘
│  (Persistent)        │
└──────────────────────┘
```

---

## 🎓 Glossary (Istilah Penting)

|       Istilah       |                      Penjelasan                    |                      Contoh               |
|---------------------|----------------------------------------------------|-------------------------------------------|
| **Role**            | Tingkat akses umum dalam sistem                    | admin, super_admin, staff                 |
| **Jabatan**         | Posisi spesifik karyawan                           | Customer Support Officer, Finance         |
| **Token**           | Kunci akses yang disimpan setelah login            | Data user + expiry time                   |
| **Session**         | Periode waktu user aktif sejak login               | 9 jam sejak login terakhir                |
| **Expiry**          | Waktu habis masa berlaku token                     | 9 jam setelah login                       |
| **Protected Route** | Halaman yang dilindungi akses kontrol              | Hanya CSO/Admin yang bisa akses           |
| **Context**         | Wadah data global yang bisa diakses semua komponen | AuthContext menyimpan currentUser         |
| **localStorage**    | Penyimpanan data di browser                        | Simpan token agar tidak perlu login terus |

---

## Support & Troubleshooting

### Masalah Umum & Solusi

#### 1. **Tidak bisa login**
- Check email & password benar
- Pastikan internet stabil
- Clear browser cache
- Coba browser lain

#### 2. **Sering auto logout**
- Session expired (8 jam habis)
- Perpanjang session sebelum habis
- Jangan tutup browser tiba-tiba

#### 3. **Menu tidak muncul**
- Check role & jabatan user
- Refresh halaman
- Logout & login ulang

#### 4. **Access Denied**
- User tidak punya hak akses ke halaman tersebut
- Hubungi admin untuk update role/jabatan

---

## Flow Summary Table

|       Tahap      |        Aksi User       |      Sistem Response     |            Hasil           |
|------------------|------------------------|--------------------------|----------------------------|
| **1. Login**     | Input email & password | Validasi ke backend      | Token disimpan 8 jam       |
| **2. Dashboard** | Otomatis setelah login | Load user data & widgets | Tampil overview            |
| **3. Navigasi**  | Klik menu              | Check akses permission   | Tampil halaman atau denied |
| **4. Session**   | User bekerja normal    | Monitor di background    | Timer countdown            |
| **5. Warning**   | Sisa 15 menit          | Toast notification       | User aware                 |
| **6. Urgent**    | Sisa 10 menit          | Modal popup              | User harus pilih           |
| **7. Extend**    | Klik perpanjang        | Update token expiry      | Session +24 jam            |
| **8. Expired**   | Session habis          | Auto logout              | Redirect login             |
| **9. Logout**    | Klik logout manual     | Clear all data           | Kembali ke login           |

---

## Best Practices untuk User

1. **Login di awal hari kerja**
   - Pastikan email & password benar
   - Check session timer di navbar

2. **Perpanjang session jika kerja lama**
   - Jangan tunggu sampai modal muncul
   - Perpanjang saat sisa 30-60 menit

3. **Logout saat selesai kerja**
   - Jangan biarkan session active terus
   - Klik logout untuk keamanan

4. **Simpan pekerjaan berkala**
   - Jangan tunggu sampai session timeout
   - Save/submit data setiap selesai task

5. **Perhatikan visual indicators**
   - Badge hijau = aman
   - Badge merah = segera perpanjang

---

**Catatan Penting:**
- Dokumentasi ini menjelaskan flow yang **sudah ada** dan **berjalan** di production
- Semua fitur sudah terimplementasi dan tested
- Update dokumentasi ini jika ada perubahan flow

---

*Dibuat oleh: Development Team*  
*Terakhir update: December 2024*  
*Versi: 1.0*

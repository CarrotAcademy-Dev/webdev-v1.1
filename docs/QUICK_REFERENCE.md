# Quick Reference - User Flow

> **Cheat sheet untuk memahami flow sistem dengan cepat**

---

## Flow Sederhana (3 Tahap Utama)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   LOGIN     │ ───→ │  BEKERJA    │ ───→ │   LOGOUT    │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
  Input email          Akses menu          Keluar sistem
  & password           sesuai role         (manual/auto)
```

---

## State Diagram User

```
         START
           ↓
    ┌─────────────┐
    │  Anonymous  │ (Belum login)
    │   Visitor   │
    └──────┬──────┘
           │ Login Success
           ↓
    ┌─────────────┐
    │ Authenticated│ (Sudah login)
    │     User    │
    └──────┬──────┘
           │
           ├─── Working ────────────────┐
           │                            │
           │   Session Active           │
           │   (Max 9 jam)              │
           │                            │
           ├─── Warning ────────────────┤
           │   (Sisa 15 menit)          │
           │   Toast notification       │
           │                            │
           ├─── Critical ───────────────┤
           │   (Sisa 10 menit)          │
           │   Modal muncul             │
           │                            │
           ├─ Extend?  ──┐              │
           │             │              │
           │   Yes ──────┼─ +8 jam      │
           │             │   Continue   │
           │             │              │
           │   No ───────┼─ Logout ─────┤
           │             │              │
           └─ Expired ───┴─ Auto Logout ┘
                         ↓
                  ┌─────────────┐
                  │  Anonymous  │
                  │   Visitor   │
                  └─────────────┘
                       END
```

---

## Access Control - Siapa Bisa Akses Apa?

### Matrix Sederhana

| Halaman        | CSO | Staff Lain | Admin |
|----------------|-----|------------|-------|
| Overview       | ✅ |     ✅     |   ✅  |
| KPI Details    | ✅ |     ✅     |   ✅  |
| My Tasks (CSO) | ✅ |     ❌     |   ✅  |
| Register User  | ❌ |     ❌     |   ✅  |

### Logika Akses

```
IF (user.jabatan === 'CSO' OR user.role === 'admin')
  → Bisa akses My Tasks
ELSE
  → Redirect ke Access Denied
```

---

## Timeline Session Management

```
0 menit      → Login berhasil, token dibuat (expiry 9 jam)
             
7j 45m       → Toast: "Sesi akan berakhir dalam 15 menit"
             
7j 50m       → Modal: Pilih [Perpanjang] atau [Logout]
             
8j 00m       → Auto logout (jika tidak diperpanjang)
```

---

## Visual Indicators Cheat Sheet

### Session Badge Colors

|    Color  |   Waktu Tersisa  |   Status  |
|-----------|------------------|-----------|
| 🟢 Hijau  | > 2 jam          | Aman      |
| 🟡 Kuning | 30 menit - 2 jam | Normal    |
| 🟠 Orange | 10 - 30 menit    | Perhatian |
| 🔴 Merah  | < 10 menit       | Urgent!   |

---

## User Actions & Expected Results

|               User Action           |                       Expected Result                        |
|-------------------------------------|--------------------------------------------------------------|
| Input email & password → Klik LOGIN | Redirect ke /home (dashboard)                                |
| Klik menu "Overview"                | Tampil dashboard dengan info KPI                             |
| Klik menu "My Tasks" (sebagai CSO)  | Tampil list semua tasks CSO                                  |
| Klik menu "My Tasks" (bukan CSO)    | Tidak muncul di navbar (hanya menampilkan Task yg relevan)   |
| Paksa akses URL CSO (bukan CSO)     | Redirect ke /access-denied                                   |
| Klik "Perpanjang Sesi" di modal     | Session +8 jam, modal tutup                                  |
| Tidak respond modal 10 menit        | Auto logout, redirect login                                  |
| Klik "Logout" di menu               | Clear data, kembali ke login                                 |

---

## Lifecycle Hooks (Technical)

```
App Start
  ↓
main.jsx: Setup Providers
  ↓
AuthProvider: Load user dari localStorage
  ↓
App.jsx: Setup Routes
  ↓
Login/Dashboard: Conditional render
  ↓
ProtectedRoute: Check auth & permission
  ↓
SessionTimeout: Monitor session
  ↓
Layout: Render Navbar + Content
  ↓
User Logout/Session Expired
  ↓
Back to Login
```

---

## Component Hierarchy

```
main.jsx
└── AuthProvider (Global State)
    └── BrowserRouter (Routing)
        └── App.jsx (Routes)
            ├── Login (Public)
            └── ProtectedRoute (Private)
                └── Layout
                    ├── Navbar
                    │   ├── Menu
                    │   ├── ThemeToggle
                    │   └── SessionBadge
                    ├── SessionTimeout (Modal)
                    ├── Content (Pages)
                    └── Footer
```

---

## Data Storage

|     Data    |       Location      | Expiry  |       Purpose      |
|-------------|---------------------|---------|--------------------|
| currentUser | AuthContext (State) |    -    | Runtime user data  |
| User token  | localStorage        |  8 jam  | Persistent login   |
| Theme       | localStorage        |    -    | Dark/light mode    |
| Query cache | React Query         | 5 menit | API response cache |

---

## Key Decisions Tree

### Login Flow
```
User submit form
  ↓
  Credentials valid?
  ├─ Yes → Save token → Redirect /home
  └─ No  → Show error → Stay at login
```

### Access Control
```
User akses halaman
  ↓
  Logged in?
  ├─ No  → Redirect to /
  └─ Yes → Check permission
            ├─ Has access → Show page
            └─ No access  → Redirect /access-denied
```

### Session Management
```
Every 5 minutes check:
  ↓
  Token expired?
  ├─ Yes → Auto logout
  └─ No  → Token expiring soon?
            ├─ Yes → Show warning
            └─ No  → Continue
```

---

## Important Files Map

```
src/
├── main.jsx                     ← Entry point
├── App.jsx                      ← Routes definition
├── context/
│   └── AuthContext.jsx          ← Auth logic & session
├── components/
│   ├── ProtectedRoute/          ← Access control
│   ├── SessionTimeout/          ← Session modal
│   ├── Navbar/                  ← Menu & timer badge
│   └── Login/                   ← Login form
├── utils/
│   ├── storage.js               ← localStorage wrapper
│   └── constants/
│       └── accessControl.js     ← Role & jabatan definitions
└── features/
    └── auth/
        └── authApiService.jsx   ← Login API call
```

---

## Error Scenarios

|        Scenario       |            Cause             |              Solution            |
|-----------------------|------------------------------|----------------------------------|
| "Sesi Berakhir"       | Token expired (8 jam)        | Login ulang                      |
| "Access Denied"       | User tidak punya permission  | Hubungi admin                    |
| "Login Failed"        | Wrong credentials            | Check email/password             |
| Auto logout tiba-tiba | Session expired tanpa notice | Perpanjang session sebelum habis |

---

## Quick Troubleshooting

```
PROBLEM: Tidak bisa login
→ Check: Email & password benar?
→ Check: Internet connection?
→ Try: Clear cache & refresh

PROBLEM: Menu tidak muncul
→ Check: Role & jabatan user
→ Try: Logout & login ulang

PROBLEM: Sering auto logout
→ Cause: Session expired (8 jam max)
→ Solution: Perpanjang session sebelum habis

PROBLEM: Access denied
→ Cause: User tidak punya hak akses
→ Solution: Hubungi admin untuk update permission
```

---

## Key Concepts

### 1. Authentication vs Authorization
- **Authentication** = "Who are you?" → Login process
- **Authorization** = "What can you do?" → Access control

### 2. Token Expiry
- Token = Kunci akses setelah login
- Expiry = Waktu habis masa berlaku
- Default = 9 jam sejak login
- Can extend = +8 jam lagi

### 3. Role vs Jabatan
- **Role** = Tingkat akses umum (admin/staff)
- **Jabatan** = Posisi spesifik (CSO/Finance/dll)
- Access = Role OR Jabatan (bisa salah satu)

---

## Performance Notes

- **Lazy Loading**: Halaman dimuat on-demand (lebih cepat)
- **React Query**: API response di-cache 5 menit
- **Session Check**: Setiap 5 menit (tidak berat)
- **Timer Update**: Setiap 1 menit (ringan)

---

## Checklist untuk Stakeholder

**Saat user login:**
- [ ] Dashboard overview muncul dengan benar
- [ ] Menu sesuai role/jabatan ditampilkan
- [ ] Session timer badge muncul di navbar
- [ ] Data user (nama, jabatan) tampil benar

**Saat user bekerja:**
- [ ] Navigasi menu smooth tanpa error
- [ ] Data loading dengan cepat
- [ ] Session timer countdown berjalan
- [ ] Toast warning muncul saat sisa 15 menit

**Saat session hampir habis:**
- [ ] Modal timeout muncul saat sisa 10 menit
- [ ] User bisa perpanjang atau logout
- [ ] Auto logout jika tidak respond

**Saat logout:**
- [ ] Data user terhapus
- [ ] Redirect ke login page
- [ ] Tidak bisa akses halaman protected lagi

---

*Quick reference ini melengkapi USER_FLOW_GUIDE.md*  
*Untuk detail lengkap, baca file USER_FLOW_GUIDE.md*

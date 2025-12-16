# 📖 User Story - Journey Flow Carrot Academy Dashboard

> **Cerita perjalanan user dari login sampai logout**  
> Dijelaskan dengan bahasa sederhana untuk non-technical stakeholder

---

## 👤 Meet Our Users

### Sari - Customer Support Officer (CSO)
- **Role**: Staff
- **Jabatan**: Customer Support Officer
- **Kebutuhan**: Akses ke semua menu CSO untuk mengelola data siswa

### Budi - Admin
- **Role**: Admin
- **Jabatan**: IT Developer
- **Kebutuhan**: Akses ke semua menu + bisa register user baru

### Ani - Finance Staff
- **Role**: Staff
- **Jabatan**: Finance Accounting
- **Kebutuhan**: Akses ke dashboard overview dan KPI

---

## 📚 Story 1: Sari's Daily Workflow (CSO Normal Day)

### 🌅 Pagi Hari - Login ke Sistem

**Waktu: 08:00 WIB**

```
Sari datang ke kantor, nyalakan laptop, buka browser
→ Ketik URL: carrotacademy.com
→ Muncul halaman login yang simpel dan clean
```

**Layar yang dilihat Sari:**
```
┌───────────────────────────────────────┐
│                                        │
│         🥕 CARROT ACADEMY              │
│                                        │
│     Welcome Back Team!                 │
│                                        │
│     Email: [sari@carrot.com    ]      │
│     Password: [••••••••••••    ]      │
│                                        │
│              [LOGIN →]                 │
│                                        │
└───────────────────────────────────────┘
```

**Sari's Action:**
1. Input email: `sari@carrot.com`
2. Input password: `Password123!`
3. Klik tombol **LOGIN**
4. Loading 2 detik...

**Result:**
✅ Login berhasil!  
✅ Redirect otomatis ke `/home`  
✅ Session dibuat untuk 8 jam  

---

### 🏠 Dashboard Overview - Sambutan Pagi

**Waktu: 08:01 WIB**

Sari melihat dashboard yang menampilkan:

```
┌─────────────────────────────────────────────────────────┐
│  🥕 Carrot Academy         [🟢 8j 0m]  [☀️ Theme] [≡]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Hallo, Sari! 👋                                        │
│  Customer Support Officer                               │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  👤 Profile │  │  🕐 Clock In │  │  ⭐ Points  │    │
│  │             │  │  08:00       │  │  50 pts     │    │
│  │  Sari       │  │  5 day       │  │  #1 place   │    │
│  │             │  │  streak!     │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  Task Summary - Today                                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────────┐          │
│  │ 📝 50 │ │ ✅ 2  │ │ 🔄 18 │ │ 📊 10%    │          │
│  │ Total │ │ Done  │ │ WIP   │ │ Complete  │          │
│  └───────┘ └───────┘ └───────┘ └───────────┘          │
│                                                          │
│  [Grafik Tasks Completed]                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Sari's Reaction:**
😊 "Wah, dashboard-nya bagus! Langsung keliatan ada 50 tasks hari ini"  
💭 "Masih ada 18 on progress, harus diselesaikan nih"

---

### 💼 Mulai Bekerja - Akses Menu CSO

**Waktu: 08:15 WIB**

Sari perlu check dashboard prospektif untuk follow up calon siswa.

**Sari's Action:**
1. Klik icon **💼** (briefcase) di navbar
2. Menu dropdown muncul:

```
┌────────────────────────────────┐
│  💼 My Tasks                    │
├────────────────────────────────┤
│  📂 Bersama (Shared)           │
│    • Statistik Prospektif      │
│    • Rekap Jadwal Mentor       │
│    • Daftar Kelas Tersedia     │
│    • Daftar Kirim Merch        │
│    • ...                       │
│                                │
│  👤 Personal                    │
│    • Dashboard Prospektif ←   │
│    • Dashboard Reminder        │
│    • Profil Siswa             │
│    • ...                       │
└────────────────────────────────┘
```

3. Klik **Dashboard Prospektif**

**System Check (Behind the Scenes):**
```
ProtectedRoute checking...
→ User logged in? ✅ Yes (Sari)
→ Check jabatan: "Customer Support Officer" ✅
→ Access allowed: CSO_OR_ADMIN ✅
→ Render page: DashboardProspektifPage
```

**Result:**
✅ Halaman Dashboard Prospektif terbuka  
✅ Sari bisa lihat semua data prospektif  
✅ Bisa filter, export, update status  

**Sari's Reaction:**
👍 "Perfect! Ada 10 prospektif baru yang perlu di-follow up"

---

### ⏰ Session Warning - Siang Hari

**Waktu: 15:45 WIB (sudah kerja 7 jam 45 menit)**

Sari masih fokus kerja, tiba-tiba muncul notifikasi:

```
┌────────────────────────────────────┐
│  ⏰ Notification                    │
├────────────────────────────────────┤
│  Sesi Akan Berakhir                │
│                                     │
│  Sesi login Anda akan berakhir     │
│  dalam 15 menit. Simpan pekerjaan  │
│  Anda.                              │
│                                     │
│              [OK]                   │
└────────────────────────────────────┘
```

**Sari's Reaction:**
😮 "Oh ya, hampir lupa! Masih 15 menit lagi"  
💭 "Selesaikan yang penting dulu, nanti perpanjang"

**Sari juga notice:**
Badge di navbar berubah: **[🟠 15m]** (dari hijau jadi orange)

---

### 🔔 Critical Warning - Harus Pilih!

**Waktu: 15:50 WIB (tinggal 10 menit)**

Modal muncul di tengah layar (tidak bisa ditutup):

```
┌─────────────────────────────────────────┐
│  ⏰ Sesi Akan Berakhir                   │
├─────────────────────────────────────────┤
│                                          │
│  Sesi login Anda akan berakhir dalam    │
│  10 menit.                               │
│                                          │
│  Untuk melanjutkan pekerjaan, silakan   │
│  perpanjang sesi. Atau logout jika      │
│  sudah selesai.                          │
│                                          │
│  💡 Tips: Simpan pekerjaan Anda          │
│  terlebih dahulu untuk menghindari       │
│  kehilangan data.                        │
│                                          │
├─────────────────────────────────────────┤
│  [Logout Sekarang]  [Perpanjang Sesi]   │
└─────────────────────────────────────────┘
```

**Sari's Action:**
1. Klik **Perpanjang Sesi**

**System Response:**
```
→ Token expiry di-update +24 jam
→ Modal ditutup
→ Toast success: "Sesi Diperpanjang 24 Jam"
→ Badge di navbar: [🟢 24j 0m]
```

**Sari's Reaction:**
😌 "Lega! Bisa lanjut kerja tanpa khawatir"

---

### 🏁 Selesai Kerja - Logout

**Waktu: 17:00 WIB**

Sari sudah selesai semua tasks hari ini.

**Sari's Action:**
1. Klik icon **🚪** (logout) di navbar
2. Confirm logout

**System Process:**
```
AuthContext.logout() called
→ Clear currentUser from state
→ Remove token from localStorage
→ Stop all session monitoring
→ Redirect to /
```

**Screen yang dilihat Sari:**
```
┌───────────────────────────────────────┐
│                                        │
│         🥕 CARROT ACADEMY              │
│                                        │
│     Welcome Back Team!                 │
│                                        │
│     Email: [                    ]      │
│     Password: [                 ]      │
│                                        │
│              [LOGIN →]                 │
│                                        │
└───────────────────────────────────────┘
```

**Sari's Reaction:**
✅ "Great! Besok tinggal login lagi"  
👋 "Selamat sore, sampai jumpa besok!"

---

## 📚 Story 2: Budi's Admin Task (Register New User)

### 🔐 Admin Login

**Waktu: 09:00 WIB**

Budi (Admin) login seperti biasa:

```
Login → Dashboard Overview
Badge: [🟢 8j 0m]
```

**Menu yang dilihat Budi:**
```
Navbar:
├─ 🏠 Home (sama seperti staff)
├─ 💼 My Tasks (bisa akses menu CSO juga!)
├─ 🛡️ Admin (khusus admin)
│   └─ Register User
├─ 👤 Profile
└─ 🚪 Logout
```

---

### 👥 Register User Baru

**Waktu: 09:15 WIB**

Ada karyawan baru (Deni) yang perlu dibuatkan akun.

**Budi's Action:**
1. Klik **🛡️ Admin** di navbar
2. Pilih **Register User**

**System Check:**
```
ProtectedRoute checking...
→ User logged in? ✅ Yes (Budi)
→ Check role: "admin" ✅
→ Access allowed: ADMIN_ONLY ✅
→ Render page: RegisterUserPage
```

**Form yang dilihat Budi:**
```
┌─────────────────────────────────────┐
│  Register New User                  │
├─────────────────────────────────────┤
│  Nama:        [Deni Pratama    ]   │
│  Email:       [deni@carrot.com ]   │
│  Password:    [••••••••••••    ]   │
│  Jabatan:     [Finance ▼]          │
│  Role:        [staff ▼]            │
│  Status:      [✓ Aktif]            │
│                                     │
│           [REGISTER USER]           │
└─────────────────────────────────────┘
```

**Budi's Action:**
1. Isi semua data Deni
2. Password: `SecurePass123!` (memenuhi syarat: huruf besar, kecil, angka, simbol)
3. Klik **REGISTER USER**

**System Response:**
```
→ Validasi password ✅
→ POST request ke backend
→ User created successfully
→ Toast: "User berhasil didaftarkan!"
```

**Budi's Reaction:**
✅ "Done! Deni sudah bisa login besok"  
📧 "Nanti kirim email ke Deni dengan credentials-nya"

---

## 📚 Story 3: Ani's Limited Access (Finance Staff)

### 🚫 Access Denied Scenario

**Waktu: 10:00 WIB**

Ani (Finance) login dan coba iseng akses menu CSO.

**Ani's Action:**
1. Login berhasil → Dashboard Overview
2. Notice: Tidak ada menu **💼 My Tasks** di navbar
3. Coba akses langsung via URL: `/my-tasks/dashboard-prospektif`

**System Check:**
```
ProtectedRoute checking...
→ User logged in? ✅ Yes (Ani)
→ Check jabatan: "Finance Accounting" ❌
→ Check role: "staff" ❌
→ Access allowed: CSO_OR_ADMIN ❌
→ Redirect to: /access-denied
```

**Screen yang dilihat Ani:**
```
┌─────────────────────────────────────┐
│         🚫 Access Denied             │
├─────────────────────────────────────┤
│                                      │
│  You don't have permission to        │
│  access this page.                   │
│                                      │
│  Required: CSO or Admin              │
│  Your role: Finance Staff            │
│                                      │
│         [← Back to Home]             │
│                                      │
└─────────────────────────────────────┘
```

**Ani's Reaction:**
🤔 "Oh iya, saya kan bukan CSO"  
👍 "Oke, balik ke dashboard saja"

**Ani's Action:**
Klik **Back to Home** → Kembali ke Overview

**Ani's Available Menu:**
```
Navbar:
├─ 🏠 Home
│   ├─ Overview ✅
│   ├─ Attendance ✅
│   ├─ KPI Details ✅
│   └─ Leave Request ✅
├─ 👤 Profile ✅
└─ 🚪 Logout ✅

(Tidak ada My Tasks, tidak ada Admin menu)
```

---

## 📚 Story 4: Auto Logout Scenario

### 😴 User Lupa Logout

**Character**: Rina (CSO)  
**Waktu**: 17:00 WIB

Rina selesai kerja tapi lupa logout, langsung pulang.

**Timeline:**

```
17:00 → Rina pulang (laptop masih on, browser masih buka)
17:10 → Session warning (Rina tidak di tempat)
17:15 → Modal timeout muncul (Rina tidak lihat)
17:25 → Session expired (8 jam sejak login)
```

**System Auto Process:**
```
CheckTokenExpiry() deteksi expired
→ Auto logout triggered
→ Clear all user data
→ Redirect to login
→ Toast (tapi tidak ada yang lihat): "Sesi Berakhir"
```

---

**Keesokan harinya - 08:00 WIB**

Rina buka laptop yang masih menyala.

**Screen yang dilihat Rina:**
```
┌───────────────────────────────────────┐
│                                        │
│         🥕 CARROT ACADEMY              │
│                                        │
│     Welcome Back Team!                 │
│                                        │
│     Email: [                    ]      │
│     Password: [                 ]      │
│                                        │
│              [LOGIN →]                 │
│                                        │
│  💡 Your session has expired.          │
│     Please login again.                │
└───────────────────────────────────────┘
```

**Rina's Reaction:**
💭 "Oh iya kemarin lupa logout"  
✅ "No problem, login lagi saja"

---

## 🎯 Key Takeaways untuk Stakeholder

### ✅ Yang Berjalan Otomatis (User Tidak Perlu Pikir)

1. **Session Monitoring**
   - Sistem auto-check setiap 5 menit
   - User tinggal lihat badge di navbar
   - Warning otomatis muncul sebelum expired

2. **Access Control**
   - Menu otomatis muncul sesuai role/jabatan
   - Tidak bisa paksa akses halaman yang tidak authorized
   - Redirect otomatis jika tidak punya permission

3. **Auto Logout**
   - Jika user lupa logout, sistem auto-logout setelah 8 jam
   - Data aman, tidak bisa diakses lagi tanpa login ulang

### 🎨 Visual Feedback yang Jelas

1. **Session Timer Badge**
   - 🟢 Hijau = Aman (> 2 jam)
   - 🟡 Kuning = Normal (30 menit - 2 jam)
   - 🟠 Orange = Perhatian (10-30 menit)
   - 🔴 Merah = Urgent (< 10 menit)

2. **Notifications**
   - Toast untuk info ringan
   - Modal untuk decision penting (logout/extend)

3. **Menu Visibility**
   - Hanya menu yang bisa diakses yang muncul
   - Tidak confuse user dengan menu yang tidak bisa dipakai

### 🔒 Security Features

1. **Token Expiry**
   - Default 8 jam (balance antara security & convenience)
   - Bisa diperpanjang +24 jam jika user masih aktif
   - Auto-clear jika expired

2. **Role-Based Access**
   - Multi-layer protection (frontend + backend)
   - Tidak bisa bypass dengan URL manipulation

3. **Session Management**
   - One session per login
   - Logout clear semua data
   - Tidak bisa akses tanpa login valid

---

## 📊 User Satisfaction Metrics

### What Users Love ❤️

✅ **Sari (CSO)**: "Dashboard-nya informatif, langsung tahu apa yang harus dikerjakan"  
✅ **Budi (Admin)**: "Register user baru cepat dan mudah"  
✅ **Ani (Finance)**: "Menu yang muncul sesuai dengan pekerjaan saya, tidak bingung"

### Pain Points Solved 🎯

❌ **Before**: User sering lupa logout → Data security risk  
✅ **After**: Auto logout setelah 8 jam → Aman

❌ **Before**: User bisa akses halaman yang tidak seharusnya  
✅ **After**: Access control ketat → Hanya bisa akses sesuai role/jabatan

❌ **Before**: Tidak tahu session kapan habis → Kaget tiba-tiba logout  
✅ **After**: Warning 15 menit & 10 menit sebelumnya → User prepared

---

## 🎓 Best Practices for Users

### 📌 DO's ✅

- ✅ Login di awal hari kerja
- ✅ Perhatikan session timer badge
- ✅ Perpanjang session jika masih lama kerjanya
- ✅ Simpan pekerjaan berkala (jangan tunggu session timeout)
- ✅ Logout manual saat selesai kerja

### 📌 DON'Ts ❌

- ❌ Jangan share password dengan orang lain
- ❌ Jangan tinggalkan laptop dalam keadaan login
- ❌ Jangan ignore warning notification
- ❌ Jangan paksa akses halaman yang tidak authorized

---

## 🎬 The End

**Summary:**
- 🔐 Login mudah & aman
- 📊 Dashboard informatif
- 💼 Menu sesuai role/jabatan
- ⏰ Session management otomatis
- 🔒 Security terjamin
- 🚪 Logout manual/auto

**Result:**
✅ User bekerja dengan efisien  
✅ Data aman & terlindungi  
✅ No confusion, clear access control  
✅ Happy users, happy stakeholders! 🎉

---

*Stories based on actual system implementation*  
*For detailed technical flow, refer to USER_FLOW_GUIDE.md*  
*For quick reference, check QUICK_REFERENCE.md*

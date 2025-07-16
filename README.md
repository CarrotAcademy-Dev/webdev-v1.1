# Carrot Academy - Internal Dashboard CSO

![Showcase](https://storage.googleapis.com/gemini-prod/images/5e5db08b-7d0c-48f4-aa90-0721284e2572)

Ini merupakan dokumentasi resmi untuk project Internal Carrot Academy. Dokumen ini bertujuan sebagai panduan instalasi, pemahaman arsitektur, dan rencana pengembangan di masa depan.

## 1. Tentang Proyek

Project ini adalah sebuah *Single Page Application* (SPA) yang dibangun menggunakan **React (Vite)** dan **Chakra UI**. Tujuannya adalah untuk menyediakan *dashboard* internal bagi tim Carrot Academy untuk memonitor dan mengelola berbagai data operasional, mulai dari data siswa, jadwal, hingga logistik seperti pengiriman *merchandise* dan *lost & found*.

## 2. Tech Stack Utama

Berikut adalah teknologi dan *library* utama yang menjadi tulang punggung aplikasi ini:

* **Framework**: [React](https://react.dev/) via [Vite](https://vitejs.dev/) - Untuk UI yang cepat dan modern.
* **Styling**:
    * [Chakra UI](https://chakra-ui.com/): Pustaka komponen UI utama untuk layout, tombol, form, dll.
    * [Styled Components](https://styled-components.com/): Digunakan untuk komponen-komponen dengan *style* yang sangat spesifik dan *custom*.
    * [React Icons](https://react-icons.github.io/react-icons/): Untuk semua kebutuhan ikonografi.
* **Data Fetching & State Management**:
    * [TanStack Query (React Query)](https://tanstack.com/query/latest): Sebagai "manajer" utama untuk semua data dari server (*server state*). Meng-handle *fetching, caching, dan updating* data API.
    * [Axios](https://axios-http.com/): "Kurir" untuk melakukan panggilan HTTP (GET, POST) ke API.
    * **React Context API**: Digunakan khusus untuk *state* global yang jarang berubah, seperti data otentikasi user (`AuthContext`).
* **Routing**: [React Router DOM](https://reactrouter.com/) - Untuk navigasi antar halaman di dalam SPA.
* **Utilities**:
    * [date-fns](https://date-fns.org/): Untuk semua manipulasi dan format tanggal & waktu.
    * [nanoid](https://github.com/ai/nanoid): Untuk membuat ID unik di sisi *frontend*.
* **Backend**: [Google Apps Script (GAS)](https://developers.google.com/apps-script) - Bertindak sebagai *backend* dan *database* (via Google Sheets) saat ini.

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

Arsitektur project ini didesain agar *scalable* dan mudah di-*maintain* dengan menerapkan prinsip *Separation of Concerns*.

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
    * Satu-satunya bagian yang "ngobrol" langsung dengan *backend* via `axios`.
    * Tugasnya hanya mengambil data mentah atau mengirim data. **Tidak boleh ada logika transformasi UI di sini.**
5.  **Komponen UI (`/components`)**: "Component yang bisa digunakan berulang-ulang"
    * Menerima data dan fungsi lewat `props`.
    * Tugasnya hanya menampilkan UI sesuai data yang diterima.
    * Jika ada interaksi, dia akan "lapor" ke atas dengan memanggil fungsi yang dikirim lewat `props` (misal: `onAction`).

## 5. Rencana Pengembangan (Future Roadmap)

Project ini dibangun dengan fondasi yang kuat, namun ada beberapa area yang bisa di-upgrade di masa depan untuk skalabilitas yang lebih baik.

### Tahap 1: Migrasi Backend dari Google Apps Script (GAS)

Saat ini, GAS berfungsi dengan baik sebagai *backend* sederhana. Namun, untuk fitur yang lebih kompleks, *real-time*, dan performa yang lebih tinggi, kita perlu migrasi.

* **Rencana**: Membangun *backend* baru menggunakan **Node.js** dengan framework **Express.js** atau **NestJS**.
* **Database**: Migrasi dari Google Sheets ke *database* yang lebih *robust* seperti **PostgreSQL** (untuk data relasional) atau **MongoDB** (untuk data fleksibel).
* **Keuntungan**:
    * Kontrol penuh atas API.
    * Performa jauh lebih cepat.
    * Tidak ada lagi masalah CORS yang rumit karena bisa di-setting penuh.
    * Kemampuan untuk membangun fitur *real-time* dengan WebSocket.

### Tahap 2: Implementasi State Management Lanjutan

Seiring aplikasi membesar, *state* di sisi UI (*client state*) juga akan makin kompleks.

* **Rencana**: Saat ini, kita hanya butuh `useState`. Jika ada satu halaman yang punya logika *state* sangat rumit, kita bisa adopsi **`useReducer`**. Jika ada **state global** yang perlu diakses dan diubah oleh BANYAK komponen (di luar *auth* dan data server), baru kita pertimbangkan **Redux Toolkit**.
* **Penting**: **React Query** akan tetap menjadi andalan kita untuk *server state*. Redux tidak akan kita gunakan untuk menggantikan React Query.

### Tahap 3: Otentikasi Profesional

* **Rencana**: Mengganti sistem login berbasis API custom dengan layanan otentikasi profesional seperti **Firebase Authentication**, **Auth0**, atau implementasi **JWT (JSON Web Token)** di *backend* baru kita.
* **Keuntungan**: Keamanan yang jauh lebih terjamin, fitur *social login* (Google, Facebook), *password reset*, dll.

Dokumentasi ini adalah dokumen hidup. Selalu perbarui seiring dengan perkembangan project.
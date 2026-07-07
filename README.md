# Undangan Pernikahan (Google Apps Script)

Proyek ini adalah sistem Undangan Pernikahan digital (E-Invitation) elegan yang berjalan secara gratis di atas infrastruktur **Google Apps Script (GAS)** dan **Google Spreadsheets**.

Aplikasi ini dilengkapi dengan Panel Admin eksklusif dan dinamis (Dashboard) yang memungkinkan pengantin untuk mengubah data undangan kapan saja (mengunggah galeri foto, peta denah, info mempelai, ucapan & daftar rekening untuk amplop digital) tanpa menyentuh kode sama sekali.

## 🌟 Fitur Utama (V5)

### 💻 Tampilan Undangan (Frontend)
- **Desain Modern & Responsif**: Tampilan sangat rapi dengan balutan gaya *Card Design* & *Floating Label*, responsif di HP (dengan navigasi *bottom-nav* layaknya aplikasi) dan di laptop/PC (dengan *Mega Menu*).
- **Penghitung Waktu Mundur (Countdown)**: Otomatis menghitung sisa waktu menuju hari H resepsi pernikahan.
- **Amplop Digital (Multiple Accounts)**: Tamu bisa melihat daftar rekening/e-wallet untuk *cashless gift*. Dilengkapi fitur deteksi ikon pintar (BCA, DANA, OVO, Gopay, dsb.) dan tombol **Salin Nomor Rekening**.
- **Denah Lokasi Interaktif**: Gambar peta denah dapat di-klik untuk diperbesar (*Lightbox/Modal view*) sehingga memudahkan tamu membaca jalan.
- **Pemutar Musik Latar (*Background Music*)**: Memutar lagu *mp3* otomatis untuk membangun nuansa pernikahan yang manis.
- **Buku Tamu / RSVP**: Para tamu dapat melakukan konfirmasi kehadiran beserta menyampaikan ucapan dan doa secara real-time.
- **Galeri Foto & Video**: Render *grid* cantik untuk kumpulan momen spesial. Gambar/Video disimpan langsung dari sinkronisasi Google Drive.

### 🛡️ Dashboard Admin
- **Sistem Login**: Akses dilindungi dengan *Username* dan *Password*.
- **UI Admin Dashboard Eksklusif**: Tampilan *Grid Card* berpadu dengan navigasi *Sidebar* dinamis (animasi *hover*) khusus untuk mengelola undangan dengan sangat ramah pengguna.
- **Form Floating Labels**: Desain form *input* yang sekelas dengan produk *startup* masa kini.
- **Manajemen Galeri**: Unggah, lihat pratinjau (preview), dan hapus foto/video. Fitur unggah telah dibekali dengan **Kompresi Gambar Otomatis** di sisi klien agar Google Drive tidak cepat penuh dan *website* termuat dengan sangat cepat.
- **Tabel Data RSVP**: Menampilkan rekap tamu yang menyatakan hadir, jumlah rombongan, serta ucapan yang mereka kirimkan.

---

## 🚀 Cara Instalasi (Langkah demi Langkah)

### 1. Buat Proyek Google Apps Script Baru
1. Buka [Google Apps Script](https://script.google.com/).
2. Klik **New Project** (Proyek Baru).
3. Beri nama proyek Anda (misal: "Undangan Budi & Ani").

### 2. Salin Kode (Deploy)
1. Salin isi file `Code.gs` ke editor teks Google Script.
2. Buat file HTML baru dengan masuk ke ikon `+` > `HTML`. Buat persis dengan nama-nama berikut dan masukkan masing-masing kode HTML-nya:
   - `Index.html` (Tampilan undangan)
   - `Style.html` (Styling undangan)
   - `Script.html` (Logika frontend undangan)
   - `Login.html` (Halaman otentikasi)
   - `Admin.html` (Halaman dashboard admin)
   - `AdminStyle.html` (Styling khusus untuk halaman admin)
   - `AdminScript.html` (Logika panel admin)

### 3. Deploy Web App
1. Klik tombol **Deploy** di pojok kanan atas, lalu pilih **New deployment**.
2. Pada ikon bergerigi (Select type), pilih **Web app**.
3. Isi deskripsi (opsional).
4. **Execute as**: Pilih `Me` (email Anda).
5. **Who has access**: Pilih `Anyone` (Siapa saja, agar tamu bisa mengaksesnya tanpa login Google).
6. Klik **Deploy** dan setujui izin akses (Authorize access) ke Google Spreadsheets dan Google Drive Anda.
7. Anda akan mendapatkan tautan / **URL Web App**.

### 4. Setup Database
1. Pertama kali Anda membuka tautan **URL Web App** dari proses *deploy* di atas, sistem secara otomatis akan membuatkan satu buah **Google Spreadsheet** baru di Google Drive Anda (biasanya bernama *Database_Undangan_Pernikahan*).
2. Temukan Spreadsheet tersebut di Google Drive Anda.
3. Buka Spreadsheet, lihat *sheet* **Users**. Pada baris kedua di *sheet* tersebut, atur **Username** dan **Password** Anda (Contoh: Username: `admin`, Password: `password123`).

---

## 📖 Panduan Penggunaan (Admin Panel)

1. **Akses Panel Admin**
   Buka *URL Web App* Anda, tambahkan parameter `?page=login` di belakang link tersebut.
   *(Contoh: `https://script.google.com/macros/s/.../exec?page=login`)*
2. **Pengaturan Umum & Jadwal**
   - Di tab **Pengaturan**, masukkan data mempelai dan acara.
   - Kolom **Waktu Akad & Resepsi** menggunakan input *datetime-local*.
   - Tombol "Tambah Rekening" dapat digunakan untuk mendaftarkan lebih dari satu bank atau dompet digital (BCA, Mandiri, OVO, dll). Ikon dompet (*wallet*) otomatis digunakan jika Anda menginput dompet digital.
3. **Mengganti Peta Denah & Musik**
   - **Upload Denah Lokasi**: Jika Anda mengunggah gambar denah baru, sistem akan memampatkannya dan menyimpannya ke Drive. Anda juga bisa mengisi URL peta Google Maps langsung.
   - **Lagu (MP3)**: Pastikan Anda menempelkan tautan lagu berformat langsung `.mp3`.
4. **Manajemen Galeri**
   Pindah ke tab **Galeri**, isi nama momen lalu tekan tombol unggah file gambar. Pemuatan (*loading*) akan dikompresi sehingga mungkin memakan waktu 2-4 detik, setelah itu media otomatis tampil ke undangan.
5. **Melihat RSVP / Buku Tamu**
   Pindah ke tab **Data RSVP** untuk membaca harapan dan rekap kehadiran dari semua teman dan keluarga Anda!

---

*Dikembangkan untuk memberikan solusi E-Invitation premium dan bebas biaya server bulanan!*
## ?? Changelog

### v8.4.3 (Bulletproof Google Drive Audio Proxy)
- **Drive Audio Data URI API**: Karena pengetatan restriksi CORS dan *third-party cookie* oleh Google Drive di tahun 2024, pemutaran audio secara langsung ( *direct streaming* ) sering kali ditolak *browser*. Oleh karena itu, skrip kini secara dinamis mengekstrak `fileId` dari *link* Drive dan menggunakan Google Apps Script API internal (`getAudioData`) untuk mengubah *file audio* tersebut menjadi data mentah Base64. Data ini kemudian diinjeksikan sebagai *Data URI* (`data:audio/mp3;base64,...`), menjamin pemutaran audio selalu berhasil 100% pada semua peramban modern.

### v8.4.1 (Bugfix Music Base64 Exceeds Cell Limit)
- **Fix Payload Overflow**: Menambahkan variabel `MusicFileBase64` ke daftar *exclude* di dalam fungsi iterasi penyimpanan `Code.gs` untuk mencegah *crash* akibat batasan 50.000 karakter per sel pada Google Sheets yang sebelumnya memicu *error CORS*.

### v8.3.0 (Security & Centralization Update)
- **Centralized API Config**: Memisahkan fungsi konfigurasi URL GAS dan fungsi *request* `fetch` ke dalam satu file tersendiri (`api.js`). Mempermudah *maintenance* ketika URL *deployment* GAS berubah di masa depan.
- **Frontend Security Layers**: Mengaplikasikan metode *Anti View-Source* (memblokir klik kanan, F12, dan Inspect Element shortcut) di `api.js`. 
- **Backend API Protection**: Menerapkan validasi *API Key* tersembunyi antara `api.js` dan `Code.gs` (menggunakan *hex-obfuscation*) yang secara otomatis menolak segala *request* ilegal yang ditembakkan dari luar aplikasi web asli.

### v8.0.0 (Major Architecture Shift - Github Pages Ready)
- **Architecture (Hybrid Frontend)**: Merombak arsitektur aplikasi menjadi dua mode deployment: Static Frontend untuk **GitHub Pages** dan Native Frontend untuk **Google Apps Script**. File-file HTML/CSS/JS diakar proyek sekarang 100% murni dan independen, sedangkan file *template* spesifik GAS dipindahkan ke dalam folder `GAPS/`.
- **Backend (REST API)**: Memperbarui logika `Code.gs` dengan dukungan layanan API via metode `doPost(e)`. Google Apps Script kini berperan sebagai *headless* API (didukung CORS) untuk berinteraksi (*fetch*) secara mulus dengan antarmuka yang di-*hosting* di luar server Google.

### v7.0.0 (Sidebar Revamp & Calendar Integration)
- **Modern Admin Sidebar**: Merombak gaya desain *Sidebar* Admin dari skema gelap/kaku menjadi gaya terang nan premium. Dilengkapi dengan gradasi penanda menu aktif dan *overlay backdrop* interaktif untuk responsibilitas *Mobile*.
- **API Error Handling**: Memperbaiki kelemahan *session* dan *Error: Unauthorized* yang bocor pada pemanggilan asinkron (*Google Apps Script*) ketika sedang mengunggah gambar amplop/media.
- **Folder Spesifik Ikon**: Semua *Custom Icon Bank/E-Wallet* kini terisolasi rapi pada Google Drive di lokasi: `Undangan Pernikahan > icon_amplop`.
- **Fitur "Simpan ke Kalender"**: Menambahkan tombol interaktif khusus di seksi "Waktu & Tempat" pada *Index*. Fitur ini merakit URL dinamis menggunakan *timestamps* untuk secara instan membuat jadwal pengingat (*event reminder*) acara pernikahan langsung di *Google Calendar* tamu undangan.

### v6.0.0
- **Database Auto-Patching**: Memperbaiki fungsi saveSettings pada Code.gs. Sistem kini memindai struktur JSON (*dictionary keys*); apabila ia mendeteksi variabel pengaturan yang belum terekam di dalam file Google Spreadsheet (contohnya BankAccounts), fungsi ini tak lagi mengabaikannya melainkan secara agresif membuat baris baru (*appendRow*), memastikan kompatibilitas penuh bagi pengguna basis data lama.
- **Hero & Greeting Section Enhancement**: Menginjeksi kaligrafi Bismillah dan kutipan romantis berbayang yang ditunjang oleh animasi *CSS Keyframes* pada area Kata Sambutan (*Greeting*), memberikan kesan religius yang mewah.
- **Modern Chat-Bubble RSVP**: Meninggalkan desain *list view* konvensional pada buku tamu/ucapan dan bermigrasi ke UI berkelas *bubble chat*. Sistem mengalkulasi *string* secara leksikal untuk mencetak *Avatar inisial*, label *badge* status kehadiran dengan palet warna dinamis, serta mendesain ulang *wrapper* pesan menjadi kotak dialog bergaya obrolan (*chat-bubbles*).
- **Navigation Update**: Menghapus baris Mega Menu (Topbar) seluruhnya dan memberlakukan *Bottom Navbar* eksklusif yang modern agar dapat ditampilkan dalam segala jenis ukuran layar secara persisten, memberikan antarmuka bergaya *Mobile App*.

### v5.0.0
- **Admin UX Revamp**: Mendesain ulang antarmuka panel *Admin Dashboard* menggunakan struktur *Sidebar* responsif berkelas atas. Mengatasi visual *bug* pada isian form bergaya *Floating Label*.
- **Dynamic Gift/Envelope**: Modifikasi arsitektur database untuk menyimpan data perbankan sebagai list dinamis. Di antarmuka admin, sebuah tombol + Tambah Rekening disediakan. Aplikasi kini secara logis mendeteksi jenis akun bank / dompet digital (*E-Wallet*) yang dimasukkan untuk disesuaikan secara otomatif menjadi ikon yang relevan di *Frontend*.
- **Index UI Fixes**: Memperbaiki masalah proporsional pada gambar lokasi peta *(map/denah)* dengan membingkainya dalam wadah berproperti *object-fit: contain*.

### v7.0.0
- **Estetika Adat Palembang**: Menyuntikkan warna Crimson dan Gold (emas) yang khas dengan bingkai dekoratif pada *Hero Section*. Mengubah gambar Bismillah menjadi teks kaligrafi Arab murni untuk ketajaman visual maksimal.
- **Floating Glassmorphism Navbar**: Mendesain ulang navigasi bawah (*bottom-nav*) menjadi gaya melayang (*floating*) dengan efek kaca (*blur*) modern ala aplikasi premium iOS.
- **Amplop Digital Interaktif**: Meringkas daftar rekening/amplop menjadi *Thumbnail Cards*. Jika diklik, rincian bank dan tombol "Salin Rekening" akan muncul melalui *Popup Modal* yang elegan.
- **Galeri Masonry Premium**: Meninggalkan format *grid* kaku dan beralih menggunakan susunan *CSS Columns (Masonry)* yang dinamis, rapi, dan estetis layaknya galeri pameran profesional.
- **Buku Tamu Scrollable & Bugfix**: Membungkus daftar ucapan (*wishes*) ke dalam kotak dengan baris gulir (*scroll*) khusus agar judul "*Ucapan dari Teman*" tetap persisten (*sticky*). Turut memperbaiki teks '*undefined*' pada label absensi tamu lama.

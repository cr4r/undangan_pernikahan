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
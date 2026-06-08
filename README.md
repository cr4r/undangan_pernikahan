# Website Undangan Pernikahan (Google Apps Script)

Proyek undangan pernikahan ini dibangun menggunakan Google Apps Script (GAS) dengan database terintegrasi menggunakan Google Spreadsheet.

## Fitur Utama
- **Desain Elegan Tema Palembang**: Menggunakan kombinasi warna Merah Tua, Emas, dan Krem.
- **Auto-Setup Database**: Spreadsheet untuk menyimpan pengaturan, galeri, dan RSVP akan otomatis terbuat saat pertama kali web diakses.
- **Admin Dashboard**: Panel admin yang terproteksi oleh sistem login (dari sheet Users) untuk mengubah detail acara, galeri foto/video, dan melihat daftar RSVP.
- **Countdown Timer**: Menghitung mundur menuju hari resepsi.
- **Background Music**: Autoplay lagu saat undangan dibuka.
- **Form RSVP Real-time**: Menyimpan ucapan tamu langsung ke Spreadsheet.

## Cara Instalasi & Deploy
1. Buat project baru di [Google Apps Script](https://script.google.com/).
2. Buat file-file yang ada di dalam repository ini (bisa menggunakan [clasp](https://github.com/google/clasp)).
3. Pastikan isi `Code.gs` sesuai.
4. Deploy sebagai Web App:
   - Pilih "Deploy" -> "New deployment"
   - Select type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
5. Buka URL Web App yang dihasilkan.
6. Untuk mengakses Admin Panel, tambahkan `?page=login` atau `?page=admin` di akhir URL. Login dengan username `admin` dan password `admin123`.

## Changelog
- **v1.0.0**: Inisialisasi rilis pertama.
  - Penambahan fitur otomatisasi Spreadsheet Database (Settings, Gallery, RSVP, Users).
  - Penambahan desain halaman web bertema tradisional Palembang (Maroon, Gold, Cream) yang sangat responsif.
  - Implementasi Countdown Timer, Audio Player, Lokasi Maps, dan Galeri.
  - Penambahan form RSVP yang langsung tercatat ke Google Spreadsheet.
  - Pembuatan Panel Admin interaktif dengan otentikasi login untuk mengelola seluruh data undangan tanpa harus membuka Spreadsheet.
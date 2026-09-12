# PRD — Lippo Plaza Baubau Digital Service Portal

**Version:** 1.0  
**Date:** 2026-09-11  
**Platform:** Google Apps Script Web App  
**Primary UI:** Mobile-first Web App  
**Primary purpose:** Digital service directory / launcher for Lippo Plaza Baubau tenant services.

---

## 1. Product Overview

Lippo Plaza Baubau Digital Service Portal adalah landing page mobile-first yang menjadi satu pintu akses (**"DIGITAL SERVICE PORTAL — One Portal · All Services"**) menuju berbagai form layanan yang sudah berjalan sebagai Google Apps Script Web App.

Portal ini **bukan pengganti form layanan**. Portal hanya menampilkan katalog layanan dan membuka URL layanan yang dipilih pada **new browser tab/window**.

Aplikasi juga menyediakan halaman admin tersembunyi untuk Management Mall agar dapat mengelola katalog layanan dan tampilan portal tanpa mengubah source code.

### Prinsip utama

1. Visual landing page mengikuti screenshot referensi secara sangat ketat.
2. Mobile adalah prioritas utama.
3. Desktop tetap responsive, tetapi tidak boleh mengorbankan komposisi mobile.
4. Semua service URL eksternal dikelola melalui konfigurasi/database Google Sheets.
5. Admin dapat CRUD layanan.
6. Layanan Internal Management tersedia di database tetapi default **nonaktif**.
7. Asset logo/background disimpan di Google Drive.
8. Ikon layanan menggunakan library ikon bawaan agar konsisten.
9. Link layanan dibuka di new tab.
10. UI harus tetap terlihat premium, bersih, modern, dan identik secara visual dengan referensi.

---

# 2. Visual Reference

Screenshot referensi utama:

`UI(1).png`

Screenshot tersebut menjadi **source of truth untuk visual landing page**.

Prioritas kemiripan:

### P0 — Wajib sangat mirip

- Header hero
- Foto gedung
- Gradient/overlay biru
- Logo/wordmark
- Typography
- Garis cyan
- Judul "DIGITAL SERVICE PORTAL"
- Subtitle "One Portal · All Services"
- Lekukan putih besar di bagian bawah hero
- Welcome banner
- Search box
- Section heading
- Service cards
- Icon cards
- Arrow chevron
- Footer
- Spacing, radius, shadow, dan proporsi mobile

### P1

- Hover/pressed states
- Search interaction
- Admin UI
- Empty states
- Loading states
- Toast/notification

### P2

- Animasi micro-interaction ringan
- Desktop optimization

**Jangan mengganti desain menjadi dashboard generik.**

---

# 3. Target User

## 3.1 Tenant

Tenant menggunakan portal untuk:

- mencari layanan
- membaca deskripsi singkat
- memilih layanan
- membuka form layanan

Tenant tidak perlu login ke portal.

## 3.2 Management Mall Admin

Admin dapat:

- login
- melihat dashboard
- menambah layanan
- mengedit layanan
- menghapus/nonaktifkan layanan
- mengatur kategori
- mengatur urutan layanan
- memilih ikon
- mengubah logo
- mengubah background
- mengaktifkan/nonaktifkan kategori Internal Management
- mengelola URL layanan

---

# 4. Information Architecture

## Public

`/exec`

Landing page:

1. Hero/Header
2. Welcome Banner
3. Search
4. Layanan Tenant
5. Layanan Umum
6. Layanan Internal Management — default hidden/inactive
7. Footer

## Admin

Admin page menggunakan route/parameter tersembunyi, misalnya:

`?page=admin`

atau mekanisme routing internal yang lebih aman.

Admin page tidak boleh memiliki tombol/link yang terlihat pada public landing page.

---

# 5. Landing Page Specification

## 5.1 Header / Hero

Header adalah elemen paling penting.

Gunakan screenshot referensi sebagai acuan visual utama.

### Konten

Top-left:

**LIPPO PLAZA**

**BAUBAU**

Kemudian:

**DIGITAL SERVICE PORTAL**

**One Portal · All Services**

### Visual

- Background berupa foto Lippo Plaza Baubau.
- Overlay biru menggunakan gradient/translucent layer.
- Foto tetap terlihat di sisi kanan.
- Area kiri memiliki dominasi warna biru.
- Header memiliki tinggi besar.
- Bagian bawah header memiliki **curved white wave** seperti screenshot.
- Lekukan tidak boleh diganti dengan border-radius biasa.
- Implementasikan menggunakan CSS pseudo-element, SVG, `clip-path`, mask, atau teknik setara yang menghasilkan bentuk visual sedekat mungkin dengan referensi.
- Pastikan curve responsif pada berbagai lebar mobile.
- Jangan menggunakan gambar curve yang blur/pixelated jika CSS/SVG dapat menghasilkan hasil lebih baik.

### Responsive

Pada mobile:

- Hero mempertahankan karakter screenshot.
- Text tidak keluar area.
- Gedung tetap terlihat di sisi kanan.
- Curve tetap halus.
- Tinggi hero proporsional.

---

# 6. Welcome Banner

Letaknya tepat setelah hero/curve.

Visual:

- rounded rectangle
- background light blue
- subtle decorative building/cloud illustration di kanan
- emoji/icon waving hand di kiri
- typography biru

Konten:

**Selamat Datang**

**Akses layanan digital**  
**Lippo Plaza Baubau**

Banner harus mengikuti screenshot.

Jika decorative illustration tidak tersedia, buat menggunakan CSS/simple SVG/icon asset yang ringan. Jangan membuat banner menjadi terlalu ramai.

---

# 7. Search

Search box besar:

Placeholder:

**Cari layanan...**

Visual:

- white/light background
- border subtle
- rounded corner
- search icon di kiri
- tinggi cukup besar untuk touch
- mobile friendly

### Behavior

Search harus mencari minimal berdasarkan:

- nama layanan
- deskripsi
- kategori

Search bersifat client-side setelah data layanan berhasil dimuat.

Jika tidak ada hasil:

**Layanan tidak ditemukan**

Tampilkan empty state yang rapi.

---

# 8. Service Categories

Urutan default:

1. **LAYANAN TENANT**
2. **LAYANAN UMUM**
3. **LAYANAN INTERNAL MANAGEMENT**

Category Internal Management default:

`active = false`

Jika false:

- kategori tidak ditampilkan di public portal
- service di bawahnya tidak ditampilkan
- data tetap ada
- admin tetap dapat mengaktifkannya

---

# 9. Service Card

Setiap layanan ditampilkan sebagai card horizontal.

Struktur:

`[ICON] [SERVICE NAME + DESCRIPTION] [CHEVRON]`

Visual:

- white background
- subtle blue/gray shadow
- rounded corners
- border sangat halus
- icon berada dalam rounded square
- service title bold
- description lebih kecil dan muted
- chevron di kanan
- touch target minimal sekitar 44px

### Interaction

Ketika card diklik:

`window.open(service.url, '_blank', 'noopener,noreferrer')`

Portal tetap terbuka.

Jangan embed service form menggunakan iframe.

---

# 10. Icon System

Gunakan **built-in icon library**.

Contoh mapping default:

| Service | Icon |
|---|---|
| Izin Masuk Barang | package/box |
| Izin Keluar Barang | truck |
| Izin Kerja | hard-hat / construction |
| Izin Promosi | megaphone |
| Keluhan, Kritik & Saran | message-circle / messages |
| Lainnya | file/document |
| Internal Management | building/shield/briefcase sesuai layanan |

Admin dapat memilih icon dari library melalui dropdown/icon picker.

Icon harus:

- tampil konsisten
- tidak menggunakan broken image
- memiliki fallback icon
- dapat dirender tanpa upload file
- memiliki ukuran konsisten
- mengikuti warna/background icon yang dikonfigurasi

Library icon dapat berupa Lucide Icons, Material Symbols, Font Awesome, atau library ringan setara yang kompatibel dengan Google Apps Script. Pilih satu library dan gunakan secara konsisten.

---

# 11. Default Services

## Layanan Tenant

### 1. Izin Masuk Barang Tenant Leasing

URL:

`https://script.google.com/macros/s/AKfycbzqDgpYbxZyWy3RRANA1Z1pblP-ahDxUtgKNXGK4jt0bb8mjd_FVdjAACt4DFpPMcna/exec`

Suggested description:

`Pengajuan izin masuk barang Tenant Leasing`

---

### 2. Izin Keluar Barang Tenant Leasing

URL:

`https://script.google.com/macros/s/AKfycbxd0DPC3jfkav057--CbkpHyjFuHUYoIJYTnq2B-AFAu0sjd7PjAA7aDBH9p9SZVWPMJg/exec`

Suggested description:

`Pengajuan izin keluar barang Tenant Leasing`

---

### 3. Izin Masuk Barang Casual Leasing

URL:

`https://script.google.com/macros/s/AKfycbx_auVcKfqJQ6AhI4g2yxPWsmfl7hJhoK5IGHUikTuyfFCXORIu5_IhbsRe8dbB9Rf/exec`

Suggested description:

`Pengajuan izin masuk barang Casual Leasing`

---

### 4. Izin Keluar Barang Casual Leasing

URL:

`https://script.google.com/macros/s/AKfycbyL-wjuQIgzHO843dlxZF6f1J9axFHZrVHuPmVTN7oZwWsUEYi3u-0-uFr4o-pJc012/exec`

Suggested description:

`Pengajuan izin keluar barang Casual Leasing`

---

### 5. Izin Promosi

URL:

`https://script.google.com/macros/s/AKfycbwSEOT4TwMYgmTMo6WjdRgcy4pzxDmp6IJ2Q9oOYLB74ERiY1PcstwPX33PnkR4pzus5g/exec`

Suggested description:

`Pengajuan promosi`

---

### 6. Izin Kerja

URL:

`https://script.google.com/macros/s/AKfycbxFVkE25KlALjgE20bnwHJ3vG3SWNRzN1Igc3JjnF9_o5Ib3RpJvlIwrO6ZPuW4GoAvYg/exec`

Suggested description:

`Fit Out / pekerjaan`

---

# 12. Layanan Umum

### Keluhan, Kritik & Saran

URL:

`https://script.google.com/macros/s/AKfycbxbEHuptki9BSsjIK9YuNAOCobj2JIzs2-o68Emp5SCYHgnSil2fGm3XctWVSHZuFjBZQ/exec`

Suggested description:

`Sampaikan keluhan, kritik dan saran`

---

# 13. Layanan Internal Management

Kategori dibuat sejak awal tetapi:

`active = false`

Belum perlu ada default service aktif.

Admin dapat:

- mengaktifkan kategori
- menambahkan service
- mengedit service
- menonaktifkan service

---

# 14. Admin Authentication

Metode:

**Username + Password**

Jangan menyimpan password plaintext di Google Sheet.

Recommended:

- username disimpan di sheet Admins
- password disimpan sebagai hash
- password comparison menggunakan hash yang sesuai dengan kemampuan Apps Script
- session menggunakan token/session state
- session memiliki expiry
- logout tersedia
- jangan menyimpan password di client-side JavaScript

### Default admin

Jangan hardcode password default ke source code.

Saat first deployment, sediakan setup mechanism atau konfigurasi awal yang memaksa admin membuat credential.

---

# 15. Admin Dashboard

Admin dashboard memiliki:

### Sidebar / navigation

- Dashboard
- Layanan
- Kategori
- Tampilan
- Admin Account / Security
- Logout

Pada mobile gunakan collapsible navigation/drawer.

---

# 16. Admin — Service Management

CRUD penuh.

Field:

- `id`
- `category_id`
- `name`
- `description`
- `url`
- `icon`
- `icon_background`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

Fitur:

- Add service
- Edit service
- Delete service
- Enable/disable
- Reorder
- Preview
- Validate URL
- Search service
- Filter by category

### Delete behavior

Lebih aman gunakan soft delete:

`is_active = false`

Jika hard delete disediakan, minta confirmation.

---

# 17. Admin — Category Management

Field:

- `id`
- `name`
- `description`
- `icon`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

Default:

| Category | Active |
|---|---|
| Layanan Tenant | TRUE |
| Layanan Umum | TRUE |
| Layanan Internal Management | FALSE |

Admin dapat:

- edit
- add
- deactivate
- reorder

---

# 18. Admin — Appearance Management

Admin dapat mengubah:

### Logo

- upload image
- simpan file di Google Drive
- simpan Drive file ID / public-access reference di Settings
- tampilkan preview
- replace logo

### Background

- upload image
- simpan di Google Drive
- simpan file ID/reference
- preview
- replace background

### Recommended asset rules

Logo:

- PNG/JPG/WebP
- transparent PNG preferred

Background:

- JPG/PNG/WebP
- recommended high resolution
- optimized file size

Portal harus memiliki fallback default asset apabila custom asset gagal dimuat.

---

# 19. Google Sheets Data Model

Gunakan satu Spreadsheet sebagai database/configuration.

Recommended sheets:

## `Settings`

| key | value | description |
|---|---|---|
| portal_name | Lippo Plaza Baubau | Portal name |
| tagline | One Portal · All Services | Hero subtitle |
| welcome_title | Selamat Datang | Welcome title |
| welcome_description | Akses layanan digital Lippo Plaza Baubau | Welcome description |
| logo_file_id | ... | Google Drive file ID |
| background_file_id | ... | Google Drive file ID |
| updated_at | ... | Last update |

## `Categories`

| id | name | description | icon | sort_order | is_active | created_at | updated_at |
|---|---|---|---|---:|---|---|---|

## `Services`

| id | category_id | name | description | url | icon | icon_background | sort_order | is_active | created_at | updated_at |
|---|---|---|---|---|---|---|---:|---|---|---|

## `Admins`

| id | username | password_hash | is_active | created_at | updated_at | last_login |
|---|---|---|---|---|---|---|

## `AuditLogs`

| id | timestamp | username | action | entity | entity_id | details |
|---|---|---|---|---|---|---|

Audit log minimal untuk:

- login
- logout
- add
- update
- deactivate/delete
- appearance update
- category activation

---

# 20. Apps Script Architecture

Recommended structure:

- `Code.gs`
- `Config.gs`
- `Database.gs`
- `Auth.gs`
- `Services.gs`
- `Categories.gs`
- `Assets.gs`
- `Audit.gs`
- `Utils.gs`
- `Index.html`
- `Admin.html`
- `Styles.html`
- `Scripts.html`

Jika Antigravity memilih struktur lain yang lebih maintainable, diperbolehkan selama separation of concerns tetap jelas.

### Server-side responsibilities

- spreadsheet read/write
- authentication
- hashing
- Drive upload
- settings
- service CRUD
- category CRUD
- audit logs
- data validation

### Client-side responsibilities

- rendering
- search
- interactions
- admin forms
- previews
- loading/error states

---

# 21. Security Requirements

P0.

1. Jangan expose password hash ke public landing page.
2. Jangan expose Admin sheet content kepada public.
3. Semua CRUD admin harus melalui server-side validation.
4. Validasi URL.
5. Escape/sanitize user-generated display content.
6. Jangan gunakan `eval`.
7. Jangan menyimpan credential di LocalStorage sebagai plaintext password.
8. Gunakan session token/expiry.
9. Logout harus invalidate session.
10. Audit perubahan penting.
11. Drive assets tidak boleh memberikan akses ke seluruh Drive.
12. Hanya file asset yang relevan yang diberikan akses sesuai kebutuhan.
13. Jangan menaruh secret API key di frontend.
14. Admin route tersembunyi bukan satu-satunya security mechanism; authentication tetap wajib.

---

# 22. Performance

Target:

- fast first paint
- minimalkan external dependencies
- compress/resize assets
- cache configuration jika aman
- hindari loading semua admin data pada public page
- public page hanya mengambil:
  - settings yang dibutuhkan
  - active categories
  - active services

---

# 23. UX States

Wajib tersedia:

- Loading
- Empty result
- Service unavailable
- Generic error
- Admin unauthorized
- Admin session expired
- Save success
- Save failed
- Delete confirmation
- Upload progress/status

Gunakan toast/snackbar yang sederhana.

---

# 24. Accessibility

- semantic HTML
- keyboard navigation
- visible focus state
- `aria-label` untuk icon-only controls
- sufficient contrast
- touch target minimal 44px
- alt text untuk logo/background jika relevan

---

# 25. Responsive Rules

Primary target:

- 360px
- 375px
- 390px
- 412px
- 430px

Secondary:

- tablet
- desktop

Desktop boleh menambah max-width/container, tetapi visual identity mobile harus tetap terjaga.

---

# 26. Footer

Mengikuti referensi.

Background:

deep blue gradient/shape.

Content:

**LIPPO PLAZA BAUBAU**

`© 2026 Lippo Plaza Baubau. All rights reserved.`

Footer berada di bawah seluruh content.

---

# 27. Default Visual Tokens

Gunakan CSS variables sehingga mudah dikembangkan:

```css
--brand-blue: #0054a6;
--brand-blue-dark: #003f82;
--brand-cyan: #20d7f3;
--text-primary: #123d78;
--text-secondary: #6880a3;
--surface: #ffffff;
--surface-soft: #eef8ff;
--border: #dce8f5;
--radius-card: 18px;
--radius-banner: 18px;
```

Nilai boleh disesuaikan setelah visual comparison dengan screenshot, tetapi jangan mengubah karakter warna brand.

---

# 28. Acceptance Criteria

## Landing page

- [ ] Visual sangat mendekati screenshot.
- [ ] Hero/photo/overlay sesuai.
- [ ] Curve putih bawah header sesuai.
- [ ] Welcome banner sesuai.
- [ ] Search berfungsi.
- [ ] Service card berfungsi.
- [ ] Icon tampil benar.
- [ ] Chevron tampil benar.
- [ ] Link service terbuka new tab.
- [ ] Internal Management tidak tampil default.
- [ ] Responsive pada 360–430px.
- [ ] Footer sesuai.

## Admin

- [ ] Admin page tidak terlihat dari landing page.
- [ ] Username/password login.
- [ ] Password tidak plaintext.
- [ ] Session expiry.
- [ ] Logout.
- [ ] CRUD service.
- [ ] CRUD category.
- [ ] Enable/disable.
- [ ] Reorder.
- [ ] Icon picker.
- [ ] Upload logo.
- [ ] Upload background.
- [ ] Preview asset.
- [ ] Internal Management dapat diaktifkan.
- [ ] Audit log perubahan penting.

## Database

- [ ] Google Sheets menjadi source of truth.
- [ ] Seed data otomatis tersedia.
- [ ] Tidak ada URL default yang typo.
- [ ] Semua URL service menggunakan HTTPS.

---

# 29. Seed Data Summary

### Layanan Tenant — active

1. Izin Masuk Barang Tenant Leasing
2. Izin Keluar Barang Tenant Leasing
3. Izin Masuk Barang Casual Leasing
4. Izin Keluar Barang Casual Leasing
5. Izin Promosi
6. Izin Kerja

### Layanan Umum — active

1. Keluhan, Kritik & Saran

### Layanan Internal Management

Category exists but inactive.

---

# 30. Development Priority

### Phase 1 — Foundation

- Apps Script project
- Spreadsheet database
- seed data
- public data API
- routing

### Phase 2 — Landing Page

- hero
- curve
- welcome banner
- search
- categories
- cards
- footer
- responsive

### Phase 3 — Admin

- login
- dashboard
- service CRUD
- category CRUD
- activation
- reorder

### Phase 4 — Appearance

- logo upload
- background upload
- Drive integration
- preview

### Phase 5 — Security & QA

- authentication hardening
- validation
- audit
- error handling
- responsive testing
- visual comparison

---

# 31. Definition of Done

Aplikasi dianggap selesai apabila:

1. Public portal dapat dibuka melalui Apps Script Web App.
2. Landing page secara visual sangat dekat dengan screenshot referensi.
3. Semua service URL default dapat dibuka.
4. Semua link dibuka di new tab.
5. Internal Management tetap tersembunyi.
6. Admin dapat login.
7. Admin dapat mengelola service/category.
8. Admin dapat mengaktifkan Internal Management.
9. Admin dapat upload logo/background ke Drive.
10. Perubahan admin tersimpan ke Google Sheets.
11. Tidak ada credential yang terekspos di public frontend.
12. Portal tetap usable pada mobile.
13. Tidak ada broken icons.
14. Tidak ada hardcoded service list yang menjadi satu-satunya source of truth.

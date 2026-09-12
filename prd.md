# PRD — DIGITAL SERVICE PORTAL
## Lippo Plaza Baubau

**Version:** 2.0
**Date:** 2026-09-12
**Platform:** Google Apps Script Web App
**Primary UI:** Mobile-first Web App

---

# 1. PRODUCT OVERVIEW

DIGITAL SERVICE PORTAL — One Portal · All Services adalah portal digital Lippo Plaza Baubau yang berfungsi sebagai satu pintu akses menuju berbagai layanan digital yang telah tersedia dalam bentuk Google Apps Script Web App.

Portal ini BUKAN pengganti form layanan.

Portal hanya:

1. Menampilkan katalog layanan.
2. Mengelompokkan layanan berdasarkan kategori.
3. Menampilkan nama dan deskripsi layanan.
4. Menyediakan pencarian layanan.
5. Membuka URL layanan yang dipilih pada browser tab/window baru.

Portal menggunakan Google Sheets sebagai source of truth untuk:

- Categories
- Services
- Settings
- Admins
- AuditLogs

Google Drive digunakan untuk menyimpan:

- Logo
- Background/hero image

---

# 2. PRODUCT PRINCIPLES

Prioritas pengembangan:

1. Mobile-first.
2. Visual harus mempertahankan identitas desain yang sudah ada.
3. Jangan melakukan redesign besar tanpa kebutuhan.
4. Database Google Sheets adalah source of truth.
5. Public portal mengambil data dinamis dari database.
6. Tidak boleh ada hardcoded service list sebagai satu-satunya source of truth.
7. Admin dapat mengelola service dan category.
8. Authentication admin wajib tetap aman.
9. Perubahan database harus langsung tercermin pada public portal.
10. Jangan melakukan perubahan terhadap workflow service eksternal.
11. Jangan mengubah aplikasi service yang dibuka oleh portal.
12. Jangan menggunakan iframe untuk service eksternal.

---

# 3. VISUAL SOURCE OF TRUTH

Screenshot referensi utama:

`UI(1).png`

Screenshot merupakan acuan utama untuk visual Public Portal.

Elemen visual yang harus dipertahankan:

- Hero
- Foto gedung
- Blue overlay/gradient
- Logo/wordmark
- Typography
- Cyan accent line
- DIGITAL SERVICE PORTAL
- One Portal · All Services
- White curved wave
- Welcome banner
- Search box
- Category heading
- Service cards
- Service icons
- Chevron
- Footer
- Radius
- Shadow
- Spacing
- Mobile composition

Jangan mengubah portal menjadi dashboard generik.

Jangan melakukan redesign total.

Perubahan UI hanya dilakukan jika diperlukan untuk:

- memenuhi requirement final
- memperbaiki bug
- memperbaiki responsive behavior
- memperbaiki usability

---

# 4. INFORMATION ARCHITECTURE

## PUBLIC PORTAL

Public route:

`/exec`

Struktur:

1. Hero
2. Welcome Banner
3. Search
4. LAYANAN TENANT
5. LAYANAN CASUAL LEASING
6. LAYANAN UMUM
7. LAYANAN INTERNAL
8. Footer

Semua kategori berada pada SATU halaman.

Public portal menggunakan vertical scrolling normal.

Tidak boleh:

- menyembunyikan kategori dengan `display:none`
- menggunakan tombol "Load More"
- menggunakan reveal button
- menggunakan pagination untuk kategori
- memerlukan interaksi tambahan untuk melihat kategori bawah

Pada initial viewport mobile, kategori yang secara natural terlihat adalah:

1. LAYANAN TENANT
2. LAYANAN CASUAL LEASING

LAYANAN UMUM dan LAYANAN INTERNAL berada di bawahnya dan dapat ditemukan dengan scrolling normal.

---

# 5. FINAL CATEGORY STRUCTURE

Public Portal memiliki tepat 4 kategori utama:

## 1. LAYANAN TENANT

ID:

`cat_tenant`

Status:

`is_active = TRUE`

Services:

1. Izin Masuk Barang Tenant
2. Izin Keluar Barang Tenant

---

## 2. LAYANAN CASUAL LEASING

ID:

`cat_casual`

Status:

`is_active = TRUE`

Services:

1. Izin Masuk Barang Casual Leasing
2. Izin Keluar Barang Casual Leasing

---

## 3. LAYANAN UMUM

ID:

`cat_umum`

Status:

`is_active = TRUE`

Services:

1. Izin Kerja
2. Izin Promosi
3. Keluhan, Kritik & Saran

---

## 4. LAYANAN INTERNAL

ID:

`cat_internal`

Status:

`is_active = TRUE`

Services:

1. Report MOD
2. Work Order

---

# 6. FINAL SERVICE MAPPING

Mapping wajib:

| Service | Category |
|---|---|
| Izin Masuk Barang Tenant | `cat_tenant` |
| Izin Keluar Barang Tenant | `cat_tenant` |
| Izin Masuk Barang Casual Leasing | `cat_casual` |
| Izin Keluar Barang Casual Leasing | `cat_casual` |
| Izin Kerja | `cat_umum` |
| Izin Promosi | `cat_umum` |
| Keluhan, Kritik & Saran | `cat_umum` |
| Report MOD | `cat_internal` |
| Work Order | `cat_internal` |

Total:

**9 active services**

---

# 7. LEGACY SERVICES

Service lama yang tidak termasuk dalam final structure tidak boleh otomatis dihapus.

Prioritas:

`is_active = FALSE`

Data lama tetap dipertahankan apabila masih diperlukan untuk audit/history.

Jangan melakukan hard delete terhadap data existing hanya untuk membersihkan portal.

---

# 8. DATABASE NORMALIZATION

Current database dapat mengandung duplicate category records.

Contoh:

`cat_tenant`

dapat muncul lebih dari satu kali.

Database harus dinormalisasi sehingga setiap logical category ID hanya memiliki satu active/current record.

Target:

| ID | Name | Active |
|---|---|---|
| cat_tenant | LAYANAN TENANT | TRUE |
| cat_casual | LAYANAN CASUAL LEASING | TRUE |
| cat_umum | LAYANAN UMUM | TRUE |
| cat_internal | LAYANAN INTERNAL | TRUE |

Rules:

1. Jangan membuat duplicate ID baru.
2. Jangan membuat duplicate category pada setiap `doGet()`.
3. Category ID harus unik secara logical.
4. Service harus memiliki satu category parent yang valid.
5. Service legacy yang tidak digunakan harus inactive.
6. Migration harus idempotent.
7. Migration tidak boleh menghapus data secara massal tanpa alasan.
8. Migration tidak boleh berjalan secara destructive setiap public page load.

Jika diperlukan, gunakan one-time database migration/normalization function.

---

# 9. CATEGORY DISPLAY RULE

Public API hanya boleh mengembalikan satu record untuk setiap logical category ID.

Jika ditemukan duplicate:

- pilih record current/valid sesuai migration rule
- jangan mengirim duplicate category ke frontend

Frontend juga harus memiliki defensive deduplication berdasarkan category ID.

Dengan demikian duplicate database tidak boleh menyebabkan:

- duplicate category section
- duplicate Tenant
- duplicate service rendering

---

# 10. SERVICE DISPLAY RULE

Service hanya ditampilkan jika:

```text
service.is_active = TRUE
AND
parent category.is_active = TRUE
AND
parent category exists
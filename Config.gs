/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Configuration & Constants
 * File: Config.gs
 */

const CONFIG = {
  // Application Metadata
  APP_NAME: 'Lippo Plaza Baubau — Digital Service Portal',
  APP_VERSION: '1.0.0',
  YEAR: '2026',

  // Google Sheets Database Names
  SHEET_NAMES: {
    SETTINGS: 'Settings',
    CATEGORIES: 'Categories',
    SERVICES: 'Services',
    ADMINS: 'Admins',
    AUDIT_LOGS: 'AuditLogs'
  },

  // Security Configuration
  AUTH: {
    SESSION_TIMEOUT_HOURS: 2,
    DEFAULT_SALT: 'LPB_PORTAL_SALT_2026_SECURE',
    TOKEN_PREFIX: 'lpb_sess_'
  },

  // Google Drive Asset Management
  ASSETS: {
    FOLDER_NAME: 'Lippo Plaza Baubau Portal Assets',
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024 // 5MB
  },

  // Controlled Lucide Icon Library Map
  ICONS: [
    { id: 'package', name: 'Package / Box', category: 'Logistik' },
    { id: 'truck', name: 'Delivery Truck', category: 'Logistik' },
    { id: 'hard-hat', name: 'Hard Hat / Worker', category: 'Operasional' },
    { id: 'megaphone', name: 'Megaphone / Promosi', category: 'Marketing' },
    { id: 'message-circle', name: 'Message Circle / Chat', category: 'Komunikasi' },
    { id: 'file-text', name: 'File Text / Dokumen', category: 'Umum' },
    { id: 'building-2', name: 'Building / Mall', category: 'Tenant' },
    { id: 'layout-grid', name: 'Grid / Layanan', category: 'Umum' },
    { id: 'briefcase', name: 'Briefcase / Bisnis', category: 'Management' },
    { id: 'shield', name: 'Shield / Keamanan', category: 'Management' },
    { id: 'bell', name: 'Bell / Notifikasi', category: 'Umum' },
    { id: 'phone', name: 'Phone / Kontak', category: 'Komunikasi' },
    { id: 'mail', name: 'Mail / Surat', category: 'Komunikasi' },
    { id: 'calendar', name: 'Calendar / Jadwal', category: 'Operasional' },
    { id: 'users', name: 'Users / Karyawan', category: 'Management' }
  ],

  // Default Icon Color Presets (matching the visual reference)
  COLOR_PRESETS: [
    { name: 'Royal Blue', value: '#1e88e5' },
    { name: 'Emerald Green', value: '#43a047' },
    { name: 'Safety Orange', value: '#fb8c00' },
    { name: 'Royal Purple', value: '#8e24aa' },
    { name: 'Cyan Teal', value: '#00acc1' },
    { name: 'Slate Gray', value: '#546e7a' },
    { name: 'Deep Navy', value: '#0054a6' },
    { name: 'Crimson Red', value: '#e53935' }
  ],

  // Default Portal Settings (stored in Settings sheet)
  DEFAULT_SETTINGS: [
    {
      key: 'portal_name',
      value: 'Lippo Plaza Baubau',
      description: 'Nama utama portal'
    },
    {
      key: 'tagline',
      value: 'One Portal · All Services',
      description: 'Tagline portal di bawah judul hero'
    },
    {
      key: 'welcome_title',
      value: 'Selamat Datang',
      description: 'Judul banner sambutan'
    },
    {
      key: 'welcome_description',
      value: 'Akses layanan digital Lippo Plaza Baubau',
      description: 'Deskripsi banner sambutan'
    },
    {
      key: 'logo_file_id',
      value: '',
      description: 'Google Drive File ID untuk logo portal'
    },
    {
      key: 'background_file_id',
      value: '',
      description: 'Google Drive File ID untuk hero background gedung'
    },
    {
      key: 'footer_title',
      value: 'LIPPO PLAZA BAUBAU',
      description: 'Teks judul di footer'
    },
    {
      key: 'footer_copyright',
      value: '© 2026 Lippo Plaza Baubau. All rights reserved.',
      description: 'Teks hak cipta di footer'
    },
    {
      key: 'asset_folder_id',
      value: '',
      description: 'Google Drive Folder ID penyimpanan aset'
    }
  ],

  // Seed Categories
  SEED_CATEGORIES: [
    {
      id: 'cat_tenant',
      name: 'LAYANAN TENANT',
      description: 'Layanan operasional Tenant Leasing & Casual Leasing',
      icon: 'building-2',
      sort_order: 1,
      is_active: true
    },
    {
      id: 'cat_umum',
      name: 'LAYANAN LAINNYA',
      description: 'Layanan kritik, saran, dan informasi umum',
      icon: 'layout-grid',
      sort_order: 2,
      is_active: true
    },
    {
      id: 'cat_internal',
      name: 'LAYANAN INTERNAL MANAGEMENT',
      description: 'Layanan internal pengelola mall',
      icon: 'shield',
      sort_order: 3,
      is_active: false // INACTIVE BY DEFAULT per requirements
    }
  ],

  // Seed Services
  SEED_SERVICES: [
    // Layanan Tenant
    {
      id: 'srv_tenant_in',
      category_id: 'cat_tenant',
      name: 'Izin Masuk Barang',
      description: 'Pengajuan barang masuk',
      url: 'https://script.google.com/macros/s/AKfycbzqDgpYbxZyWy3RRANA1Z1pblP-ahDxUtgKNXGK4jt0bb8mjd_FVdjAACt4DFpPMcna/exec',
      icon: 'package',
      icon_background: '#1e88e5',
      sort_order: 1,
      is_active: true
    },
    {
      id: 'srv_tenant_out',
      category_id: 'cat_tenant',
      name: 'Izin Keluar Barang',
      description: 'Pengajuan barang keluar',
      url: 'https://script.google.com/macros/s/AKfycbxd0DPC3jfkav057--CbkpHyjFuHUYoIJYTnq2B-AFAu0sjd7PjAA7aDBH9p9SZVWPMJg/exec',
      icon: 'truck',
      icon_background: '#43a047',
      sort_order: 2,
      is_active: true
    },
    {
      id: 'srv_work',
      category_id: 'cat_tenant',
      name: 'Izin Kerja',
      description: 'Fit Out / pekerjaan',
      url: 'https://script.google.com/macros/s/AKfycbxFVkE25KlALjgE20bnwHJ3vG3SWNRzN1Igc3JjnF9_o5Ib3RpJvlIwrO6ZPuW4GoAvYg/exec',
      icon: 'hard-hat',
      icon_background: '#fb8c00',
      sort_order: 3,
      is_active: true
    },
    {
      id: 'srv_promo',
      category_id: 'cat_tenant',
      name: 'Izin Promosi',
      description: 'Pengajuan promosi',
      url: 'https://script.google.com/macros/s/AKfycbwSEOT4TwMYgmTMo6WjdRgcy4pzxDmp6IJ2Q9oOYLB74ERiY1PcstwPX33PnkR4pzus5g/exec',
      icon: 'megaphone',
      icon_background: '#8e24aa',
      sort_order: 4,
      is_active: true
    },
    {
      id: 'srv_casual_in',
      category_id: 'cat_tenant',
      name: 'Izin Masuk Barang Casual Leasing',
      description: 'Pengajuan izin masuk barang Casual Leasing',
      url: 'https://script.google.com/macros/s/AKfycbx_auVcKfqJQ6AhI4g2yxPWsmfl7hJhoK5IGHUikTuyfFCXORIu5_IhbsRe8dbB9Rf/exec',
      icon: 'package',
      icon_background: '#1976d2',
      sort_order: 5,
      is_active: true
    },
    {
      id: 'srv_casual_out',
      category_id: 'cat_tenant',
      name: 'Izin Keluar Barang Casual Leasing',
      description: 'Pengajuan izin keluar barang Casual Leasing',
      url: 'https://script.google.com/macros/s/AKfycbyL-wjuQIgzHO843dlxZF6f1J9axFHZrVHuPmVTN7oZwWsUEYi3u-0-uFr4o-pJc012/exec',
      icon: 'truck',
      icon_background: '#2e7d32',
      sort_order: 6,
      is_active: true
    },

    // Layanan Umum
    {
      id: 'srv_feedback',
      category_id: 'cat_umum',
      name: 'Keluhan, Kritik & Saran',
      description: 'Sampaikan keluhan, kritik dan saran',
      url: 'https://script.google.com/macros/s/AKfycbxbEHuptki9BSsjIK9YuNAOCobj2JIzs2-o68Emp5SCYHgnSil2fGm3XctWVSHZuFjBZQ/exec',
      icon: 'message-circle',
      icon_background: '#00acc1',
      sort_order: 1,
      is_active: true
    },
    {
      id: 'srv_other',
      category_id: 'cat_umum',
      name: 'Lainnya',
      description: 'Layanan pendukung lainnya',
      url: 'https://script.google.com/macros/s/AKfycbxbEHuptki9BSsjIK9YuNAOCobj2JIzs2-o68Emp5SCYHgnSil2fGm3XctWVSHZuFjBZQ/exec',
      icon: 'file-text',
      icon_background: '#546e7a',
      sort_order: 2,
      is_active: true
    }
  ]
};

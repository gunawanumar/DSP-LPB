# Build test-portal.html and test-admin.html for local visual QA
$styles = Get-Content 'Styles.html' -Raw
$scripts = Get-Content 'Scripts.html' -Raw
$index = Get-Content 'Index.html' -Raw
$base64 = (Get-Content 'assets\hero-base64.txt' -Raw).Trim()

$portalHtml = $index.Replace("<?!= include('Styles'); ?>", $styles)
$portalHtml = $portalHtml.Replace("<?!= include('Scripts'); ?>", $scripts)
$portalHtml = $portalHtml.Replace('id="heroBgImg" class="hero-bg-img" src=""', 'id="heroBgImg" class="hero-bg-img" src="data:image/jpeg;base64,' + $base64 + '"')

$mockData = @"
<script>
window.MOCK_DATA = {
  success: true,
  data: {
    settings: {
      portal_name: 'Lippo Plaza Baubau',
      tagline: 'One Portal · All Services',
      welcome_title: 'Selamat Datang',
      welcome_description: 'Akses layanan digital Lippo Plaza Baubau',
      footer_title: 'LIPPO PLAZA BAUBAU',
      footer_copyright: '© 2026 Lippo Plaza Baubau. All rights reserved.'
    },
    categories: [
      { id: 'cat_tenant', name: 'LAYANAN TENANT', icon: 'building-2', sort_order: 1 },
      { id: 'cat_umum', name: 'LAYANAN LAINNYA', icon: 'layout-grid', sort_order: 2 }
    ],
    services: [
      {
        id: 'srv_1',
        category_id: 'cat_tenant',
        name: 'Izin Masuk Barang',
        description: 'Pengajuan barang masuk',
        url: 'https://script.google.com/macros/s/AKfycbzqDgpYbxZyWy3RRANA1Z1pblP-ahDxUtgKNXGK4jt0bb8mjd_FVdjAACt4DFpPMcna/exec',
        icon: 'package',
        icon_background: '#1e88e5',
        sort_order: 1
      },
      {
        id: 'srv_2',
        category_id: 'cat_tenant',
        name: 'Izin Keluar Barang',
        description: 'Pengajuan barang keluar',
        url: 'https://script.google.com/macros/s/AKfycbxd0DPC3jfkav057--CbkpHyjFuHUYoIJYTnq2B-AFAu0sjd7PjAA7aDBH9p9SZVWPMJg/exec',
        icon: 'truck',
        icon_background: '#43a047',
        sort_order: 2
      },
      {
        id: 'srv_3',
        category_id: 'cat_tenant',
        name: 'Izin Kerja',
        description: 'Fit Out / pekerjaan',
        url: 'https://script.google.com/macros/s/AKfycbxFVkE25KlALjgE20bnwHJ3vG3SWNRzN1Igc3JjnF9_o5Ib3RpJvlIwrO6ZPuW4GoAvYg/exec',
        icon: 'hard-hat',
        icon_background: '#fb8c00',
        sort_order: 3
      },
      {
        id: 'srv_4',
        category_id: 'cat_tenant',
        name: 'Izin Promosi',
        description: 'Pengajuan promosi',
        url: 'https://script.google.com/macros/s/AKfycbwSEOT4TwMYgmTMo6WjdRgcy4pzxDmp6IJ2Q9oOYLB74ERiY1PcstwPX33PnkR4pzus5g/exec',
        icon: 'megaphone',
        icon_background: '#8e24aa',
        sort_order: 4
      },
      {
        id: 'srv_5',
        category_id: 'cat_umum',
        name: 'Keluhan, Kritik & Saran',
        description: 'Sampaikan keluhan, kritik dan saran',
        url: 'https://script.google.com/macros/s/AKfycbxbEHuptki9BSsjIK9YuNAOCobj2JIzs2-o68Emp5SCYHgnSil2fGm3XctWVSHZuFjBZQ/exec',
        icon: 'message-circle',
        icon_background: '#00acc1',
        sort_order: 1
      },
      {
        id: 'srv_6',
        category_id: 'cat_umum',
        name: 'Lainnya',
        description: 'Layanan pendukung lainnya',
        url: '#',
        icon: 'file-text',
        icon_background: '#546e7a',
        sort_order: 2
      }
    ]
  }
};
</script>
"@

$portalHtml = $portalHtml.Replace('</head>', $mockData + "`n</head>")
[IO.File]::WriteAllText((Join-Path (Get-Location).Path 'test-portal.html'), $portalHtml, [System.Text.Encoding]::UTF8)
Write-Host "test-portal.html written successfully!"

# Build test-admin.html
$admStyles = Get-Content 'AdminStyles.html' -Raw
$admScripts = Get-Content 'AdminScripts.html' -Raw
$admin = Get-Content 'Admin.html' -Raw

$adminHtml = $admin.Replace("<?!= include('AdminStyles'); ?>", $admStyles)
$adminHtml = $adminHtml.Replace("<?!= include('AdminScripts'); ?>", $admScripts)
$adminHtml = $adminHtml.Replace('</head>', $mockData + "`n</head>")
[IO.File]::WriteAllText((Join-Path (Get-Location).Path 'test-admin.html'), $adminHtml, [System.Text.Encoding]::UTF8)
Write-Host "test-admin.html written successfully!"

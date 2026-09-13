/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Services Data & CRUD Layer
 * File: Services.gs
 */

const Services = {

  _isActive(value, defaultValue) {

    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;

    const normalized =
      String(value == null ? '' : value)
        .trim()
        .toUpperCase();

    if (
      normalized === 'TRUE' ||
      normalized === '1' ||
      normalized === 'YES'
    ) {
      return true;
    }

    if (
      normalized === 'FALSE' ||
      normalized === '0' ||
      normalized === 'NO'
    ) {
      return false;
    }

    return defaultValue;
  },

  _getCategory(categoryId, requireActive) {

    categoryId =
      String(categoryId || '').trim();

    if (!categoryId) return null;

    const categories =
      Database.getData(
        CONFIG.SHEET_NAMES.CATEGORIES
      ) || [];

    const category =
      categories.find(c =>
        String(c.id || '').trim() === categoryId
      );

    if (!category) return null;

    if (
      requireActive &&
      !this._isActive(category.is_active, false)
    ) {
      return null;
    }

    return category;
  },

  getPublicPortalData() {

    try {

      /* ============================================================
         1. SETTINGS
         ============================================================ */

      const rawSettings =
        Database.getData(
          CONFIG.SHEET_NAMES.SETTINGS
        ) || [];

      const settingsMap = {};

      rawSettings.forEach(s => {
        if (s.key) {
          settingsMap[s.key] = s.value;
        }
      });


      /* ============================================================
         2. ACTIVE CATEGORIES
         ============================================================ */

      const categories =
        Categories.getPublicCategories();

      const activeCatIds =
        new Set(
          categories.map(c =>
            String(c.id)
          )
        );


      /* ============================================================
         3. ACTIVE SERVICES
            Service harus:
            - aktif
            - memiliki category_id
            - category_id harus milik kategori aktif
         ============================================================ */

      const rawServices =
        Database.getData(
          CONFIG.SHEET_NAMES.SERVICES
        ) || [];

      const services =
        rawServices

          .filter(s => {

            const serviceId =
              String(s.id || '').trim();

            const categoryId =
              String(s.category_id || '').trim();

            return (
              serviceId &&
              this._isActive(
                s.is_active,
                false
              ) &&
              categoryId &&
              activeCatIds.has(categoryId)
            );
          })

          .sort((a, b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
          )

          .map(s => ({
            id:
              String(s.id || '').trim(),

            category_id:
              String(s.category_id || '').trim(),

            name:
              String(s.name || '').trim(),

            description:
              String(s.description || '').trim(),

            url:
              String(s.url || '').trim(),

            icon:
              String(s.icon || 'package').trim() ||
              'package',

            icon_background:
              String(
                s.icon_background || '#1e88e5'
              ).trim(),

            sort_order:
              Number(s.sort_order || 0)
          }))

          .filter(s =>
            s.id &&
            s.name &&
            s.category_id
          );


      /* ============================================================
         4. ASSET URL
         ============================================================ */

      let backgroundUrl = '';
      let logoUrl = '';

      if (settingsMap.background_file_id) {
        backgroundUrl =
          `https://drive.google.com/uc?export=view&id=${settingsMap.background_file_id}`;
      }

      if (settingsMap.logo_file_id) {
        logoUrl =
          `https://drive.google.com/uc?export=view&id=${settingsMap.logo_file_id}`;
      }


      /* ============================================================
         5. RESPONSE PUBLIC PORTAL
         ============================================================ */

      return Utils.response(
        true,
        {
          settings: {

            portal_name:
              settingsMap.portal_name ||
              'Lippo Plaza Baubau',

            tagline:
              settingsMap.tagline ||
              'One Portal · All Services',

            welcome_title:
              settingsMap.welcome_title ||
              'Selamat Datang',

            welcome_description:
              settingsMap.welcome_description ||
              'Akses layanan digital Lippo Plaza Baubau',

            footer_title:
              settingsMap.footer_title ||
              'LIPPO PLAZA BAUBAU',

            footer_copyright:
              settingsMap.footer_copyright ||
              '© 2026 Lippo Plaza Baubau. All rights reserved.',

            background_file_id:
              settingsMap.background_file_id || '',

            logo_file_id:
              settingsMap.logo_file_id || '',

            background_url:
              backgroundUrl,

            logo_url:
              logoUrl
          },

          categories:
            categories,

          services:
            services
        }
      );

    } catch (err) {

      return Utils.response(
        false,
        null,
        'Gagal memuat katalog layanan: ' +
        err.message
      );
    }
  },


  getAll(token) {

    const session =
      Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(
        false,
        null,
        'Unauthorized'
      );
    }

    const raw =
      Database.getData(
        CONFIG.SHEET_NAMES.SERVICES
      ) || [];

    const categories =
      Database.getData(
        CONFIG.SHEET_NAMES.CATEGORIES
      ) || [];

    const catMap = {};

    categories.forEach(c => {
      catMap[
        String(c.id || '').trim()
      ] =
        String(c.name || '').trim();
    });

    const list =
      raw

        .sort((a, b) =>
          Number(a.sort_order || 0) -
          Number(b.sort_order || 0)
        )

        .map(s => {

          const categoryId =
            String(
              s.category_id || ''
            ).trim();

          return {

            id:
              String(s.id || '').trim(),

            category_id:
              categoryId,

            category_name:
              catMap[categoryId] ||
              categoryId,

            name:
              String(s.name || '').trim(),

            description:
              String(s.description || '').trim(),

            url:
              String(s.url || '').trim(),

            icon:
              String(s.icon || 'package').trim() ||
              'package',

            icon_background:
              String(
                s.icon_background ||
                '#1e88e5'
              ).trim(),

            sort_order:
              Number(s.sort_order || 0),

            is_active:
              this._isActive(
                s.is_active,
                false
              ),

            created_at:
              Utils.formatDateTime(
                s.created_at
              ),

            updated_at:
              Utils.formatDateTime(
                s.updated_at
              )
          };
        })

        .filter(s => s.id);

    return Utils.response(
      true,
      list
    );
  },


  create(token, data) {

    const session =
      Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(
        false,
        null,
        'Unauthorized'
      );
    }

    data = data || {};

    const name =
      String(data.name || '').trim();

    const categoryId =
      String(
        data.category_id || ''
      ).trim();

    const url =
      String(data.url || '').trim();

    if (!name) {
      return Utils.response(
        false,
        null,
        'Nama layanan wajib diisi.'
      );
    }

    if (!categoryId) {
      return Utils.response(
        false,
        null,
        'Kategori layanan wajib dipilih.'
          );
          const categories =
      Database.getData(
        CONFIG.SHEET_NAMES.CATEGORIES
      );

    const category =
      categories.find(c =>
        String(c.id || '') === String(categoryId)
      );

    if (!category) {
      return Utils.response(
        false,
        null,
        'Kategori yang dipilih tidak ditemukan.'
      );
    }

    const categoryIsActive =
      category.is_active === true ||
      String(category.is_active).toUpperCase() === 'TRUE';

      if (!categoryIsActive) {
      return Utils.response(
        false,
        null,
        'Kategori yang dipilih sedang nonaktif.'
      );
    }
  }


    /* KUNCI RELASI CATEGORY -> SERVICE */
    if (!this._getCategory(categoryId, true)) {
      return Utils.response(
        false,
        null,
        'Kategori layanan tidak ditemukan atau sedang nonaktif.'
      );
    }

    if (!url) {
      return Utils.response(
        false,
        null,
        'URL formulir layanan wajib diisi.'
      );
    }

    if (
      url !== '#' &&
      !Utils.isValidHttpsUrl(url)
    ) {
      return Utils.response(
        false,
        null,
        'URL formulir harus menggunakan protokol HTTPS yang valid.'
      );
    }

    const sortOrder =
      Number(data.sort_order);

    const nowIso =
      new Date().toISOString();

    const newService = {

      id:
        String(
          data.id ||
          Utils.generateId('srv')
        ).trim(),

      category_id:
        categoryId,

      name:
        name,

      description:
        String(
          data.description || ''
        ).trim(),

      url:
        url,

      icon:
        String(
          data.icon || 'package'
        ).trim() || 'package',

      icon_background:
        String(
          data.icon_background ||
          '#1e88e5'
        ).trim(),

      sort_order:
        Number.isFinite(sortOrder) &&
        sortOrder > 0
          ? sortOrder
          : 99,

      is_active:
        this._isActive(
          data.is_active,
          true
        ),

      created_at:
        nowIso,

      updated_at:
        nowIso
    };

    Database.insert(
      CONFIG.SHEET_NAMES.SERVICES,
      newService
    );

    Audit.log(
      session.admin.username,
      'SERVICE_CREATE',
      'Services',
      newService.id,
      `Layanan dibuat: ${name}`
    );

    return Utils.response(
      true,
      newService
    );
  },


  update(token, id, data) {

    const session =
      Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(
        false,
        null,
        'Unauthorized'
      );
    }

    id =
      String(id || '').trim();

    if (!id) {
      return Utils.response(
        false,
        null,
        'ID layanan tidak valid.'
      );
    }

    data = data || {};

    const updates = {
      updated_at:
        new Date().toISOString()
    };


    if (data.name !== undefined) {

      const name =
        String(
          data.name || ''
        ).trim();

      if (!name) {
        return Utils.response(
          false,
          null,
          'Nama layanan wajib diisi.'
        );
      }

      updates.name = name;
    }


    if (data.category_id !== undefined) {

      const categoryId =
        String(
          data.category_id || ''
        ).trim();

      if (!categoryId) {
        return Utils.response(
          false,
          null,
          'Kategori layanan wajib dipilih.'
        );
      }

      if (
        !this._getCategory(
          categoryId,
          true
        )
      ) {
        return Utils.response(
          false,
          null,
          'Kategori layanan tidak ditemukan atau sedang nonaktif.'
        );
      }

      updates.category_id =
        categoryId;
    }


    if (data.description !== undefined) {

      updates.description =
        String(
          data.description || ''
        ).trim();
    }


    if (data.url !== undefined) {

      const url =
        String(
          data.url || ''
        ).trim();

      if (!url) {
        return Utils.response(
          false,
          null,
          'URL formulir layanan wajib diisi.'
        );
      }

      if (
        url !== '#' &&
        !Utils.isValidHttpsUrl(url)
      ) {
        return Utils.response(
          false,
          null,
          'URL formulir harus menggunakan protokol HTTPS yang valid.'
        );
      }

      updates.url = url;
    }


    if (data.icon !== undefined) {

      updates.icon =
        String(
          data.icon || 'package'
        ).trim() || 'package';
    }


    if (data.icon_background !== undefined) {

      updates.icon_background =
        String(
          data.icon_background ||
          '#1e88e5'
        ).trim();
    }


    if (data.sort_order !== undefined) {

      const sortOrder =
        Number(data.sort_order);

      if (
        !Number.isFinite(sortOrder) ||
        sortOrder < 1
      ) {
        return Utils.response(
          false,
          null,
          'Urutan layanan harus berupa angka minimal 1.'
        );
      }

      updates.sort_order =
        sortOrder;
    }


    if (data.is_active !== undefined) {

      updates.is_active =
        this._isActive(
          data.is_active,
          false
        );
    }


    const ok =
      Database.update(
        CONFIG.SHEET_NAMES.SERVICES,
        id,
        updates
      );

    if (!ok) {
      return Utils.response(
        false,
        null,
        'Layanan tidak ditemukan.'
      );
    }


    const action =
      updates.is_active === true
        ? 'SERVICE_ACTIVATE'
        : updates.is_active === false
          ? 'SERVICE_DEACTIVATE'
          : 'SERVICE_UPDATE';


    Audit.log(
      session.admin.username,
      action,
      'Services',
      id,
      `Layanan diperbarui: ${updates.name || id}`
    );


    return Utils.response(
      true,
      {
        id,
        ...updates
      }
    );
  },


  delete(token, id) {

    const session =
      Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(
        false,
        null,
        'Unauthorized'
      );
    }

    id =
      String(id || '').trim();

    if (!id) {
      return Utils.response(
        false,
        null,
        'ID layanan tidak valid.'
      );
    }

    const ok =
      Database.softDelete(
        CONFIG.SHEET_NAMES.SERVICES,
        id
      );

    if (!ok) {
      return Utils.response(
        false,
        null,
        'Layanan tidak ditemukan.'
      );
    }

    Audit.log(
      session.admin.username,
      'SERVICE_DELETE',
      'Services',
      id,
      'Layanan dinonaktifkan/dihapus'
    );

    return Utils.response(
      true,
      {
        message:
          'Layanan berhasil dinonaktifkan.'
      }
    );
  }
};
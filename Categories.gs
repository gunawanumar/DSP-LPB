/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Categories Service Layer
 * File: Categories.gs
 */

const Categories = {

  /**
   * Helper normalisasi boolean.
   * Menangani true / false / TRUE / FALSE / "true" / "false" / 1 / 0.
   */
  toBoolean(value, defaultValue = false) {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;

    const normalized = String(value || '').trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }

    return defaultValue;
  },


  /**
   * Ambil kategori aktif untuk Public Portal.
   */
  getPublicCategories() {
    const raw = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);

    return raw
      .filter(c => Categories.toBoolean(c.is_active, false))
      .sort((a, b) =>
        Number(a.sort_order || 0) -
        Number(b.sort_order || 0)
      )
      .map(c => ({
        id: String(c.id || ''),
        name: String(c.name || ''),
        description: String(c.description || ''),
        icon: String(c.icon || 'folder'),
        sort_order: Number(c.sort_order || 0)
      }));
  },


  /**
   * Ambil seluruh kategori untuk Admin Panel.
   *
   * CATATAN:
   * Tidak menggunakan Utils.formatDateTime() karena data timestamp
   * dapat berupa Date maupun String ISO dari Database.
   */
  getAll(token) {
    const session = Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized');
    }

    try {
      const raw = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);

      const list = raw
        .sort((a, b) =>
          Number(a.sort_order || 0) -
          Number(b.sort_order || 0)
        )
        .map(c => ({
          id: String(c.id || ''),
          name: String(c.name || ''),
          description: String(c.description || ''),
          icon: String(c.icon || 'folder'),
          sort_order: Number(c.sort_order || 0),
          is_active: Categories.toBoolean(c.is_active, true),

          // Tidak wajib untuk UI kategori.
          // Tetap dikirim sebagai string jika tersedia.
          created_at: c.created_at
            ? String(c.created_at)
            : '',

          updated_at: c.updated_at
            ? String(c.updated_at)
            : ''
        }));

      return Utils.response(true, list);

    } catch (err) {

      console.error(
        'Categories.getAll ERROR:',
        err && err.stack
          ? err.stack
          : err
      );

      return Utils.response(
        false,
        null,
        'Gagal membaca data kategori: ' +
        (err && err.message
          ? err.message
          : String(err))
      );
    }
  },


  /**
   * Buat kategori baru.
   */
  create(token, data) {
    const session = Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized');
    }

    try {
      data = data || {};

      const name = String(data.name || '').trim();

      if (!name) {
        return Utils.response(
          false,
          null,
          'Nama kategori wajib diisi.'
        );
      }

      const description =
        String(data.description || '').trim();

      const icon =
        String(data.icon || 'folder').trim();

      const sortOrder =
        Number(data.sort_order || 99);

      const isActive =
        data.is_active !== undefined
          ? Categories.toBoolean(data.is_active, true)
          : true;

      const nowIso =
        new Date().toISOString();

      const newCategory = {
        // ID dibuat server.
        id: Utils.generateId('cat'),

        name: name,
        description: description,
        icon: icon,
        sort_order: sortOrder,
        is_active: isActive,
        created_at: nowIso,
        updated_at: nowIso
      };

      Database.insert(
        CONFIG.SHEET_NAMES.CATEGORIES,
        newCategory
      );

      Audit.log(
        session.admin.username,
        'CATEGORY_CREATE',
        'Categories',
        newCategory.id,
        `Kategori dibuat: ${name}`
      );

      return Utils.response(
        true,
        newCategory
      );

    } catch (err) {

      console.error(
        'Categories.create ERROR:',
        err && err.stack
          ? err.stack
          : err
      );

      return Utils.response(
        false,
        null,
        'Gagal membuat kategori: ' +
        (err && err.message
          ? err.message
          : String(err))
      );
    }
  },


  /**
   * Update kategori.
   */
  update(token, id, data) {
    const session = Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized');
    }

    try {
      if (!id) {
        return Utils.response(
          false,
          null,
          'ID kategori tidak valid.'
        );
      }

      data = data || {};

      const updates = {
        updated_at: new Date().toISOString()
      };

      if (data.name !== undefined) {
        const name = String(data.name).trim();

        if (!name) {
          return Utils.response(
            false,
            null,
            'Nama kategori wajib diisi.'
          );
        }

        updates.name = name;
      }

      if (data.description !== undefined) {
        updates.description =
          String(data.description).trim();
      }

      if (data.icon !== undefined) {
        updates.icon =
          String(data.icon).trim() || 'folder';
      }

      if (data.sort_order !== undefined) {
        updates.sort_order =
          Number(data.sort_order || 0);
      }

      if (data.is_active !== undefined) {
        updates.is_active =
          Categories.toBoolean(data.is_active, true);
      }

      const ok = Database.update(
        CONFIG.SHEET_NAMES.CATEGORIES,
        id,
        updates
      );

      if (!ok) {
        return Utils.response(
          false,
          null,
          'Kategori tidak ditemukan.'
        );
      }

      const action =
        updates.is_active === true
          ? 'CATEGORY_ACTIVATE'
          : updates.is_active === false
            ? 'CATEGORY_DEACTIVATE'
            : 'CATEGORY_UPDATE';

      Audit.log(
        session.admin.username,
        action,
        'Categories',
        id,
        `Kategori diperbarui: ${updates.name || id}`
      );

      return Utils.response(
        true,
        {
          id: id,
          ...updates
        }
      );

    } catch (err) {

      console.error(
        'Categories.update ERROR:',
        err && err.stack
          ? err.stack
          : err
      );

      return Utils.response(
        false,
        null,
        'Gagal memperbarui kategori: ' +
        (err && err.message
          ? err.message
          : String(err))
      );
    }
  },


  /**
   * Soft delete / nonaktifkan kategori.
   *
   * Kategori yang masih mempunyai layanan aktif
   * tidak boleh dihapus.
   */
  delete(token, id) {
    const session = Auth.validateSession(token);

    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized');
    }

    try {
      if (!id) {
        return Utils.response(
          false,
          null,
          'ID kategori tidak valid.'
        );
      }

      const services =
        Database.getData(
          CONFIG.SHEET_NAMES.SERVICES
        );

      const activeAttached =
        services.filter(s =>
          String(s.category_id || '') === String(id) &&
          Categories.toBoolean(s.is_active, false)
        );

      if (activeAttached.length > 0) {
        return Utils.response(
          false,
          null,
          `Tidak dapat menghapus: Terdapat ${activeAttached.length} layanan aktif di bawah kategori ini.`
        );
      }

      const ok =
        Database.softDelete(
          CONFIG.SHEET_NAMES.CATEGORIES,
          id
        );

      if (!ok) {
        return Utils.response(
          false,
          null,
          'Kategori tidak ditemukan.'
        );
      }

      Audit.log(
        session.admin.username,
        'CATEGORY_DELETE',
        'Categories',
        id,
        'Kategori dinonaktifkan/dihapus'
      );

      return Utils.response(
        true,
        {
          message:
            'Kategori berhasil dinonaktifkan.'
        }
      );

    } catch (err) {

      console.error(
        'Categories.delete ERROR:',
        err && err.stack
          ? err.stack
          : err
      );

      return Utils.response(
        false,
        null,
        'Gagal menonaktifkan kategori: ' +
        (err && err.message
          ? err.message
          : String(err))
      );
    }
  }

};
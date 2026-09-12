/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Categories Service Layer
 * File: Categories.gs
 */

const Categories = {
  /**
   * Get active categories for public portal
   * @return {Array<Object>}
   */
  getPublicCategories() {
    const raw = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);
    return raw
      .filter(c => c.is_active === true || c.is_active === 'TRUE')
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon || 'folder',
        sort_order: Number(c.sort_order || 0)
      }));
  },

  /**
   * Get all categories for Admin Panel
   * @param {string} token
   * @return {Object}
   */
  getAll(token) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const raw = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);
    const list = raw
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon || 'folder',
        sort_order: Number(c.sort_order || 0),
        is_active: c.is_active === true || c.is_active === 'TRUE',
        created_at: Utils.formatDateTime(c.created_at),
        updated_at: Utils.formatDateTime(c.updated_at)
      }));

    return Utils.response(true, list);
  },

  /**
   * Create a new category
   * @param {string} token
   * @param {Object} data
   * @return {Object}
   */
  create(token, data) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const name = String(data.name || '').trim();
    if (!name) return Utils.response(false, null, 'Nama kategori wajib diisi.');

    const nowIso = new Date().toISOString();
    const newCategory = {
      id: data.id || Utils.generateId('cat'),
      name: name,
      description: String(data.description || '').trim(),
      icon: String(data.icon || 'folder').trim(),
      sort_order: Number(data.sort_order || 99),
      is_active: data.is_active !== undefined ? !!data.is_active : true,
      created_at: nowIso,
      updated_at: nowIso
    };

    Database.insert(CONFIG.SHEET_NAMES.CATEGORIES, newCategory);
    Audit.log(session.admin.username, 'CATEGORY_CREATE', 'Categories', newCategory.id, `Kategori dibuat: ${name}`);

    return Utils.response(true, newCategory);
  },

  /**
   * Update category
   * @param {string} token
   * @param {string} id
   * @param {Object} data
   * @return {Object}
   */
  update(token, id, data) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    if (!id) return Utils.response(false, null, 'ID kategori tidak valid.');

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updates.name = String(data.name).trim();
    if (data.description !== undefined) updates.description = String(data.description).trim();
    if (data.icon !== undefined) updates.icon = String(data.icon).trim();
    if (data.sort_order !== undefined) updates.sort_order = Number(data.sort_order);
    if (data.is_active !== undefined) updates.is_active = !!data.is_active;

    const ok = Database.update(CONFIG.SHEET_NAMES.CATEGORIES, id, updates);
    if (!ok) return Utils.response(false, null, 'Kategori tidak ditemukan.');

    const action = updates.is_active === true ? 'CATEGORY_ACTIVATE' :
                   updates.is_active === false ? 'CATEGORY_DEACTIVATE' : 'CATEGORY_UPDATE';
    Audit.log(session.admin.username, action, 'Categories', id, `Kategori diperbarui: ${updates.name || id}`);

    return Utils.response(true, { id, ...updates });
  },

  /**
   * Delete category (Soft delete)
   * @param {string} token
   * @param {string} id
   * @return {Object}
   */
  delete(token, id) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    // Check if services belong to this category
    const services = Database.getData(CONFIG.SHEET_NAMES.SERVICES);
    const activeAttached = services.filter(s => s.category_id === id && (s.is_active === true || s.is_active === 'TRUE'));
    if (activeAttached.length > 0) {
      return Utils.response(false, null, `Tidak dapat menghapus: Terdapat ${activeAttached.length} layanan aktif di bawah kategori ini.`);
    }

    const ok = Database.softDelete(CONFIG.SHEET_NAMES.CATEGORIES, id);
    if (!ok) return Utils.response(false, null, 'Kategori tidak ditemukan.');

    Audit.log(session.admin.username, 'CATEGORY_DELETE', 'Categories', id, 'Kategori dinonaktifkan/dihapus');
    return Utils.response(true, { message: 'Kategori berhasil dinonaktifkan.' });
  }
};

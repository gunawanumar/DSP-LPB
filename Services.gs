/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Services Data & CRUD Layer
 * File: Services.gs
 */

const Services = {
  /**
   * Safe public data loader for the public landing page
   * Returns only active categories, active services, and public settings
   * @return {Object}
   */
  getPublicPortalData() {
    try {
      // 1. Settings
      const rawSettings = Database.getData(CONFIG.SHEET_NAMES.SETTINGS);
      const settingsMap = {};
      rawSettings.forEach(s => {
        if (s.key) settingsMap[s.key] = s.value;
      });

      // 2. Active Categories
      const categories = Categories.getPublicCategories();
      const activeCatIds = new Set(categories.map(c => c.id));

      // 3. Active Services belonging to active categories
      const rawServices = Database.getData(CONFIG.SHEET_NAMES.SERVICES);
      const services = rawServices
        .filter(s => {
          const isActive = (s.is_active === true || s.is_active === 'TRUE');
          const isCatActive = activeCatIds.has(s.category_id);
          return isActive && isCatActive;
        })
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map(s => ({
          id: s.id,
          category_id: s.category_id,
          name: s.name,
          description: s.description,
          url: s.url,
          icon: s.icon || 'package',
          icon_background: s.icon_background || '#1e88e5',
          sort_order: Number(s.sort_order || 0)
        }));

      // Generate direct view URLs if Drive file IDs are present
      let backgroundUrl = '';
      let logoUrl = '';
      if (settingsMap.background_file_id) {
        backgroundUrl = `https://drive.google.com/uc?export=view&id=${settingsMap.background_file_id}`;
      }
      if (settingsMap.logo_file_id) {
        logoUrl = `https://drive.google.com/uc?export=view&id=${settingsMap.logo_file_id}`;
      }

      return Utils.response(true, {
        settings: {
          portal_name: settingsMap.portal_name || 'Lippo Plaza Baubau',
          tagline: settingsMap.tagline || 'One Portal · All Services',
          welcome_title: settingsMap.welcome_title || 'Selamat Datang',
          welcome_description: settingsMap.welcome_description || 'Akses layanan digital Lippo Plaza Baubau',
          footer_title: settingsMap.footer_title || 'LIPPO PLAZA BAUBAU',
          footer_copyright: settingsMap.footer_copyright || '© 2026 Lippo Plaza Baubau. All rights reserved.',
          background_file_id: settingsMap.background_file_id || '',
          logo_file_id: settingsMap.logo_file_id || '',
          background_url: backgroundUrl,
          logo_url: logoUrl
        },
        categories: categories,
        services: services
      });
    } catch (err) {
      return Utils.response(false, null, 'Gagal memuat katalog layanan: ' + err.message);
    }
  },

  /**
   * Get all services for Admin Panel
   * @param {string} token
   * @return {Object}
   */
  getAll(token) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const raw = Database.getData(CONFIG.SHEET_NAMES.SERVICES);
    const categories = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c.name; });

    const list = raw
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(s => ({
        id: s.id,
        category_id: s.category_id,
        category_name: catMap[s.category_id] || s.category_id,
        name: s.name,
        description: s.description,
        url: s.url,
        icon: s.icon || 'package',
        icon_background: s.icon_background || '#1e88e5',
        sort_order: Number(s.sort_order || 0),
        is_active: s.is_active === true || s.is_active === 'TRUE',
        created_at: Utils.formatDateTime(s.created_at),
        updated_at: Utils.formatDateTime(s.updated_at)
      }));

    return Utils.response(true, list);
  },

  /**
   * Create new service
   * @param {string} token
   * @param {Object} data
   * @return {Object}
   */
  create(token, data) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const name = String(data.name || '').trim();
    const categoryId = String(data.category_id || '').trim();
    const url = String(data.url || '').trim();

    if (!name) return Utils.response(false, null, 'Nama layanan wajib diisi.');
    if (!categoryId) return Utils.response(false, null, 'Kategori layanan wajib dipilih.');
    if (!url) return Utils.response(false, null, 'URL formulir layanan wajib diisi.');
    if (!Utils.isValidHttpsUrl(url)) {
      return Utils.response(false, null, 'URL formulir harus menggunakan protokol HTTPS yang valid.');
    }

    const nowIso = new Date().toISOString();
    const newService = {
      id: data.id || Utils.generateId('srv'),
      category_id: categoryId,
      name: name,
      description: String(data.description || '').trim(),
      url: url,
      icon: String(data.icon || 'package').trim(),
      icon_background: String(data.icon_background || '#1e88e5').trim(),
      sort_order: Number(data.sort_order || 99),
      is_active: data.is_active !== undefined ? !!data.is_active : true,
      created_at: nowIso,
      updated_at: nowIso
    };

    Database.insert(CONFIG.SHEET_NAMES.SERVICES, newService);
    Audit.log(session.admin.username, 'SERVICE_CREATE', 'Services', newService.id, `Layanan dibuat: ${name}`);

    return Utils.response(true, newService);
  },

  /**
   * Update service
   * @param {string} token
   * @param {string} id
   * @param {Object} data
   * @return {Object}
   */
  update(token, id, data) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    if (!id) return Utils.response(false, null, 'ID layanan tidak valid.');

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updates.name = String(data.name).trim();
    if (data.category_id !== undefined) updates.category_id = String(data.category_id).trim();
    if (data.description !== undefined) updates.description = String(data.description).trim();
    if (data.url !== undefined) {
      const url = String(data.url).trim();
      if (!Utils.isValidHttpsUrl(url)) {
        return Utils.response(false, null, 'URL formulir harus menggunakan protokol HTTPS yang valid.');
      }
      updates.url = url;
    }
    if (data.icon !== undefined) updates.icon = String(data.icon).trim();
    if (data.icon_background !== undefined) updates.icon_background = String(data.icon_background).trim();
    if (data.sort_order !== undefined) updates.sort_order = Number(data.sort_order);
    if (data.is_active !== undefined) updates.is_active = !!data.is_active;

    const ok = Database.update(CONFIG.SHEET_NAMES.SERVICES, id, updates);
    if (!ok) return Utils.response(false, null, 'Layanan tidak ditemukan.');

    const action = updates.is_active === true ? 'SERVICE_ACTIVATE' :
                   updates.is_active === false ? 'SERVICE_DEACTIVATE' : 'SERVICE_UPDATE';
    Audit.log(session.admin.username, action, 'Services', id, `Layanan diperbarui: ${updates.name || id}`);

    return Utils.response(true, { id, ...updates });
  },

  /**
   * Delete service (Soft delete)
   * @param {string} token
   * @param {string} id
   * @return {Object}
   */
  delete(token, id) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const ok = Database.softDelete(CONFIG.SHEET_NAMES.SERVICES, id);
    if (!ok) return Utils.response(false, null, 'Layanan tidak ditemukan.');

    Audit.log(session.admin.username, 'SERVICE_DELETE', 'Services', id, 'Layanan dinonaktifkan/dihapus');
    return Utils.response(true, { message: 'Layanan berhasil dinonaktifkan.' });
  }
};

/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Main Controller & Routing Engine
 * File: Code.gs
 */

/**
 * Handle HTTP GET Requests
 * Routes between Public Portal and Admin Panel
 * @param {Object} e
 * @return {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  e = e || { parameter: {} };
  const params = e.parameter || {};
  const isAdmin = params.page === 'admin' || params.admin !== undefined;

  // Auto-initialize database on first access if needed
  try {
    Database.initDatabase();
  } catch (err) {
    Logger.log('Auto init info: ' + err.message);
  }

  let template;
  let title;

  if (isAdmin) {
    template = HtmlService.createTemplateFromFile('Admin');
    title = 'Admin Panel — Lippo Plaza Baubau Digital Service Portal';
  } else {
    template = HtmlService.createTemplateFromFile('Index');
    title = 'Lippo Plaza Baubau — Digital Service Portal';
  }

  return template.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Modular template inclusion helper
 * Allows breaking HTML/CSS/JS into clean separate files
 * @param {string} filename
 * @return {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Manual setup execution function (runnable from Google Apps Script Editor)
 */
function initializePortalDatabase() {
  const res = Database.initDatabase();
  Logger.log('Inisialisasi Database Selesai: ' + JSON.stringify(res));
  return res;
}

/* ==========================================================================
   PUBLIC API ENDPOINTS (CALLED VIA google.script.run)
   ========================================================================== */

function apiGetPublicPortalData() {
  return Services.getPublicPortalData();
}

/* ==========================================================================
   ADMIN AUTHENTICATION & SESSION ENDPOINTS
   ========================================================================== */

function apiCheckFirstRun() {
  return Auth.checkFirstRun();
}

function apiSetupInitialAdmin(data) {
  return Auth.setupInitialAdmin(data);
}

function apiLogin(username, password) {
  return Auth.login(username, password);
}

function apiValidateSession(token) {
  return Auth.validateSession(token);
}

function apiLogout(token) {
  return Auth.logout(token);
}

function apiChangePassword(token, currentPassword, newPassword) {
  return Auth.changePassword(token, currentPassword, newPassword);
}

function apiGetAdmins(token) {
  return Auth.getAdmins(token);
}

/* ==========================================================================
   ADMIN DASHBOARD & KPI ENDPOINTS
   ========================================================================== */

function apiGetDashboardStats(token) {
  const session = Auth.validateSession(token);
  if (!session.valid) return Utils.response(false, null, 'Unauthorized');

  try {
    const services = Database.getData(CONFIG.SHEET_NAMES.SERVICES);
    const categories = Database.getData(CONFIG.SHEET_NAMES.CATEGORIES);

    const totalServices = services.length;
    const activeServices = services.filter(s => s.is_active === true || s.is_active === 'TRUE').length;
    const inactiveServices = totalServices - activeServices;

    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.is_active === true || c.is_active === 'TRUE').length;

    // Recent 5 services
    const recent = services.slice(-5).reverse().map(s => ({
      id: s.id,
      name: s.name,
      category_id: s.category_id,
      is_active: s.is_active === true || s.is_active === 'TRUE',
      created_at: Utils.formatDateTime(s.created_at)
    }));

    return Utils.response(true, {
      totalServices,
      activeServices,
      inactiveServices,
      totalCategories,
      activeCategories,
      recentServices: recent,
      systemStatus: {
        sheets: 'Terhubung',
        appsScript: 'Aktif',
        portal: 'Online',
        adminPanel: 'Online'
      }
    });
  } catch (err) {
    return Utils.response(false, null, 'Gagal memuat statistik dashboard: ' + err.message);
  }
}

/* ==========================================================================
   ADMIN SERVICE CRUD ENDPOINTS
   ========================================================================== */

function apiGetAllServices(token) {
  return Services.getAll(token);
}

function apiCreateService(token, data) {
  return Services.create(token, data);
}

function apiUpdateService(token, id, data) {
  return Services.update(token, id, data);
}

function apiDeleteService(token, id) {
  return Services.delete(token, id);
}

/* ==========================================================================
   ADMIN CATEGORY CRUD ENDPOINTS
   ========================================================================== */

function apiGetAllCategories(token) {
  return Categories.getAll(token);
}

function apiCreateCategory(token, data) {
  return Categories.create(token, data);
}

function apiUpdateCategory(token, id, data) {
  return Categories.update(token, id, data);
}

function apiDeleteCategory(token, id) {
  return Categories.delete(token, id);
}

/* ==========================================================================
   ADMIN APPEARANCE & MEDIA ENDPOINTS
   ========================================================================== */

function apiUploadAsset(token, data) {
  return Assets.uploadAsset(token, data);
}

function apiUpdateSettings(token, data) {
  return Assets.updateSettings(token, data);
}

function apiGetAuditLogs(token, limit) {
  return Audit.getLogs(token, limit);
}

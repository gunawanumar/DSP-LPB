/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Database Layer & Schema Engine
 * File: Database.gs
 */

const Database = {
  /**
   * Get the active spreadsheet. Supports both container-bound and standalone scripts.
   * If standalone and no ID is configured, creates a new spreadsheet and saves the ID.
   * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  getSpreadsheet() {
    try {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) return active;
    } catch (e) {
      // Not container-bound
    }

    const scriptProperties = PropertiesService.getScriptProperties();
    let sheetId = scriptProperties.getProperty('SPREADSHEET_ID');

    if (!sheetId) {
      // Auto-create spreadsheet if none configured
      const newSheet = SpreadsheetApp.create('Lippo Plaza Baubau — Portal Database');
      sheetId = newSheet.getId();
      scriptProperties.setProperty('SPREADSHEET_ID', sheetId);
      return newSheet;
    }

    return SpreadsheetApp.openById(sheetId);
  },

  /**
   * Get specific sheet by name
   * @param {string} sheetName
   * @return {GoogleAppsScript.Spreadsheet.Sheet}
   */
  getSheet(sheetName) {
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  },

  /**
   * Idempotent Database Initialization
   * Creates missing sheets, writes headers, seeds default categories, services, and settings.
   * Will NEVER duplicate existing records.
   * @return {Object}
   */
  initDatabase() {
    const ss = this.getSpreadsheet();
    const result = {
      initialized: true,
      sheetsCreated: [],
      recordsSeeded: { settings: 0, categories: 0, services: 0 }
    };

    // 1. Settings Sheet
    const settingsHeaders = ['key', 'value', 'description', 'updated_at'];
    this.ensureSheetWithHeaders(ss, CONFIG.SHEET_NAMES.SETTINGS, settingsHeaders);
    const currentSettings = this.getData(CONFIG.SHEET_NAMES.SETTINGS);
    const existingKeys = new Set(currentSettings.map(s => s.key));

    const settingsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SETTINGS);
    const nowIso = new Date().toISOString();
    CONFIG.DEFAULT_SETTINGS.forEach(setting => {
      if (!existingKeys.has(setting.key)) {
        settingsSheet.appendRow([setting.key, setting.value, setting.description, nowIso]);
        result.recordsSeeded.settings++;
      }
    });

    // 2. Categories Sheet
    const categoryHeaders = ['id', 'name', 'description', 'icon', 'sort_order', 'is_active', 'created_at', 'updated_at'];
    this.ensureSheetWithHeaders(ss, CONFIG.SHEET_NAMES.CATEGORIES, categoryHeaders);
    const currentCategories = this.getData(CONFIG.SHEET_NAMES.CATEGORIES);
    const existingCatIds = new Set(currentCategories.map(c => c.id));

    const catSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.CATEGORIES);
    CONFIG.SEED_CATEGORIES.forEach(cat => {
      if (!existingCatIds.has(cat.id)) {
        catSheet.appendRow([
          cat.id,
          cat.name,
          cat.description,
          cat.icon,
          cat.sort_order,
          cat.is_active,
          nowIso,
          nowIso
        ]);
        result.recordsSeeded.categories++;
      }
    });

    // 3. Services Sheet
    const serviceHeaders = ['id', 'category_id', 'name', 'description', 'url', 'icon', 'icon_background', 'sort_order', 'is_active', 'created_at', 'updated_at'];
    this.ensureSheetWithHeaders(ss, CONFIG.SHEET_NAMES.SERVICES, serviceHeaders);
    const currentServices = this.getData(CONFIG.SHEET_NAMES.SERVICES);
    const existingServiceIds = new Set(currentServices.map(s => s.id));

    const srvSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SERVICES);
    CONFIG.SEED_SERVICES.forEach(srv => {
      if (!existingServiceIds.has(srv.id)) {
        srvSheet.appendRow([
          srv.id,
          srv.category_id,
          srv.name,
          srv.description,
          srv.url,
          srv.icon,
          srv.icon_background,
          srv.sort_order,
          srv.is_active,
          nowIso,
          nowIso
        ]);
        result.recordsSeeded.services++;
      }
    });

    // 4. Admins Sheet
    const adminHeaders = ['id', 'username', 'password_hash', 'salt', 'name', 'role', 'is_active', 'created_at', 'updated_at', 'last_login'];
    this.ensureSheetWithHeaders(ss, CONFIG.SHEET_NAMES.ADMINS, adminHeaders);

    // 5. AuditLogs Sheet
    const auditHeaders = ['id', 'timestamp', 'username', 'action', 'entity', 'entity_id', 'details'];
    this.ensureSheetWithHeaders(ss, CONFIG.SHEET_NAMES.AUDIT_LOGS, auditHeaders);

    // Remove default Sheet1 if empty
    const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
    if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
      try { ss.deleteSheet(defaultSheet); } catch (e) {}
    }

    return result;
  },

  /**
   * Helper to ensure sheet exists with proper header row and styling
   */
  ensureSheetWithHeaders(ss, sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0054a6');
      headerRange.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    return sheet;
  },

  /**
   * Read all data from a sheet as an array of objects
   * @param {string} sheetName
   * @return {Array<Object>}
   */
  getData(sheetName) {
    const sheet = this.getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];

    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0].map(h => String(h).trim());
    const rows = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const obj = {};
      let hasData = false;
      headers.forEach((header, index) => {
        let val = row[index];
        if (val !== '' && val !== null && val !== undefined) hasData = true;
        obj[header] = val;
      });
      if (hasData) {
        obj._rowNumber = i + 1;
        rows.push(obj);
      }
    }
    return rows;
  },

  /**
   * Insert a new record into a sheet
   * @param {string} sheetName
   * @param {Object} data
   * @return {Object}
   */
  insert(sheetName, data) {
    const sheet = this.getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowValues = headers.map(header => {
      const val = data[header];
      return val !== undefined ? val : '';
    });
    sheet.appendRow(rowValues);
    data._rowNumber = sheet.getLastRow();
    return data;
  },

  /**
   * Update an existing record by its 'id' or specified key column
   * @param {string} sheetName
   * @param {string} idValue
   * @param {Object} updates
   * @param {string} idColumn
   * @return {boolean}
   */
  update(sheetName, idValue, updates, idColumn = 'id') {
    const sheet = this.getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return false;

    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0].map(h => String(h).trim());
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) return false;

    for (let r = 1; r < values.length; r++) {
      if (String(values[r][idIndex]) === String(idValue)) {
        const rowNumber = r + 1;
        headers.forEach((header, colIndex) => {
          if (updates[header] !== undefined) {
            sheet.getRange(rowNumber, colIndex + 1).setValue(updates[header]);
          }
        });
        return true;
      }
    }
    return false;
  },

  /**
   * Soft delete record (sets is_active = false)
   * @param {string} sheetName
   * @param {string} idValue
   * @return {boolean}
   */
  softDelete(sheetName, idValue) {
    return this.update(sheetName, idValue, {
      is_active: false,
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Hard delete record
   * @param {string} sheetName
   * @param {string} idValue
   * @param {string} idColumn
   * @return {boolean}
   */
  delete(sheetName, idValue, idColumn = 'id') {
    const sheet = this.getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;

    const values = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    const headers = values[0].map(h => String(h).trim());
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) return false;

    for (let r = 1; r < values.length; r++) {
      if (String(values[r][idIndex]) === String(idValue)) {
        sheet.deleteRow(r + 1);
        return true;
      }
    }
    return false;
  }
};

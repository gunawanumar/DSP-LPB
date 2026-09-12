/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Asset Management & Google Drive Integration
 * File: Assets.gs
 */

const Assets = {
  /**
   * Get or create dedicated Drive folder for portal assets
   * Avoids exposing other folders or personal files
   * @return {GoogleAppsScript.Drive.Folder}
   */
  getOrCreateFolder() {
    const rawSettings = Database.getData(CONFIG.SHEET_NAMES.SETTINGS);
    const folderSetting = rawSettings.find(s => s.key === 'asset_folder_id');
    let folderId = folderSetting ? folderSetting.value : '';

    if (folderId) {
      try {
        return DriveApp.getFolderById(folderId);
      } catch (e) {
        // Folder might have been deleted or inaccessible, re-create below
      }
    }

    // Check if folder exists by name
    const existing = DriveApp.getFoldersByName(CONFIG.ASSETS.FOLDER_NAME);
    if (existing.hasNext()) {
      const folder = existing.next();
      this.saveFolderId(folder.getId());
      return folder;
    }

    // Create new dedicated folder
    const folder = DriveApp.createFolder(CONFIG.ASSETS.FOLDER_NAME);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    this.saveFolderId(folder.getId());
    return folder;
  },

  /**
   * Save folder ID to Settings sheet
   */
  saveFolderId(folderId) {
    Database.update(CONFIG.SHEET_NAMES.SETTINGS, 'asset_folder_id', {
      value: folderId,
      updated_at: new Date().toISOString()
    }, 'key');
  },

  /**
   * Upload asset to Google Drive (Admin only)
   * @param {string} token
   * @param {Object} data - { base64Data, filename, mimeType, assetType: 'logo'|'background' }
   * @return {Object}
   */
  uploadAsset(token, data) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const assetType = String(data.assetType || '').trim().toLowerCase();
    if (assetType !== 'logo' && assetType !== 'background') {
      return Utils.response(false, null, 'Tipe aset tidak valid. Gunakan "logo" atau "background".');
    }

    const base64Data = data.base64Data;
    if (!base64Data) return Utils.response(false, null, 'Data file kosong.');

    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const decodedBytes = Utilities.base64Decode(cleanBase64);

    if (decodedBytes.length > CONFIG.ASSETS.MAX_FILE_SIZE_BYTES) {
      return Utils.response(false, null, 'Ukuran file melebihi batas maksimal 5 MB.');
    }

    const mimeType = data.mimeType || 'image/png';
    const filename = (data.filename || `${assetType}_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
      const blob = Utilities.newBlob(decodedBytes, mimeType, filename);
      const folder = this.getOrCreateFolder();
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileId = file.getId();
      const settingKey = assetType === 'logo' ? 'logo_file_id' : 'background_file_id';

      // Save to Settings
      Database.update(CONFIG.SHEET_NAMES.SETTINGS, settingKey, {
        value: fileId,
        updated_at: new Date().toISOString()
      }, 'key');

      Audit.log(session.admin.username, 'ASSET_UPLOAD', 'Settings', settingKey, `Upload ${assetType}: ${filename} (${fileId})`);

      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      return Utils.response(true, {
        fileId: fileId,
        directUrl: directUrl,
        assetType: assetType,
        filename: filename
      });
    } catch (err) {
      return Utils.response(false, null, 'Gagal mengunggah file ke Google Drive: ' + err.message);
    }
  },

  /**
   * Update Portal Settings (Text & metadata)
   * @param {string} token
   * @param {Object} settings
   * @return {Object}
   */
  updateSettings(token, settings) {
    const session = Auth.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const nowIso = new Date().toISOString();
    const allowedKeys = ['portal_name', 'tagline', 'welcome_title', 'welcome_description', 'footer_title', 'footer_copyright'];

    allowedKeys.forEach(key => {
      if (settings[key] !== undefined) {
        Database.update(CONFIG.SHEET_NAMES.SETTINGS, key, {
          value: String(settings[key]).trim(),
          updated_at: nowIso
        }, 'key');
      }
    });

    Audit.log(session.admin.username, 'SETTINGS_UPDATE', 'Settings', 'all', 'Pengaturan teks portal diperbarui');
    return Utils.response(true, { message: 'Pengaturan berhasil disimpan' });
  }
};

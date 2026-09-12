/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Authentication & Security Service
 * File: Auth.gs
 */

const Auth = {
  /**
   * Check if system is in first-run state (no admin accounts configured)
   * @return {Object}
   */
  checkFirstRun() {
    try {
      const admins = Database.getData(CONFIG.SHEET_NAMES.ADMINS);
      const activeAdmins = admins.filter(a => a.is_active === true || a.is_active === 'TRUE');
      return {
        isFirstRun: activeAdmins.length === 0,
        hasAdmins: admins.length > 0
      };
    } catch (e) {
      return { isFirstRun: true, hasAdmins: false };
    }
  },

  /**
   * One-time setup for the initial Super Admin account
   * Locked permanently once an admin exists.
   * @param {Object} data - { username, password, name }
   * @return {Object}
   */
  setupInitialAdmin(data) {
    const status = this.checkFirstRun();
    if (!status.isFirstRun) {
      return Utils.response(false, null, 'Inisialisasi akun admin sudah pernah dilakukan.');
    }

    const username = String(data.username || '').trim().toLowerCase();
    const password = String(data.password || '').trim();
    const name = String(data.name || '').trim() || 'Administrator';

    if (!username || username.length < 3) {
      return Utils.response(false, null, 'Username minimal 3 karakter.');
    }
    if (!password || password.length < 6) {
      return Utils.response(false, null, 'Kata sandi minimal 6 karakter.');
    }

    const salt = Utilities.getUuid().replace(/-/g, '');
    const passwordHash = Utils.hashPassword(password, salt);
    const nowIso = new Date().toISOString();

    const newAdmin = {
      id: Utils.generateId('adm'),
      username: username,
      password_hash: passwordHash,
      salt: salt,
      name: name,
      role: 'super_admin',
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso,
      last_login: nowIso
    };

    Database.insert(CONFIG.SHEET_NAMES.ADMINS, newAdmin);
    Audit.log(username, 'SETUP_INITIAL_ADMIN', 'Admins', newAdmin.id, 'Super Admin pertama berhasil didaftarkan');

    // Automatically create session
    const session = this.createSession(newAdmin);
    return Utils.response(true, {
      token: session.token,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });
  },

  /**
   * Authenticate admin user with username & password
   * @param {string} username
   * @param {string} password
   * @return {Object}
   */
  login(username, password) {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (!cleanUser || !cleanPass) {
      return Utils.response(false, null, 'Username dan kata sandi wajib diisi.');
    }

    const admins = Database.getData(CONFIG.SHEET_NAMES.ADMINS);
    const admin = admins.find(a =>
      String(a.username || '').trim().toLowerCase() === cleanUser &&
      (a.is_active === true || a.is_active === 'TRUE')
    );

    if (!admin) {
      Audit.log(cleanUser, 'LOGIN_FAILED', 'Admins', '', 'User tidak ditemukan atau nonaktif');
      return Utils.response(false, null, 'Username atau kata sandi tidak valid.');
    }

    const computedHash = Utils.hashPassword(cleanPass, admin.salt);
    if (computedHash !== admin.password_hash) {
      Audit.log(cleanUser, 'LOGIN_FAILED', 'Admins', admin.id, 'Hash kata sandi tidak cocok');
      return Utils.response(false, null, 'Username atau kata sandi tidak valid.');
    }

    // Update last login
    const nowIso = new Date().toISOString();
    Database.update(CONFIG.SHEET_NAMES.ADMINS, admin.id, {
      last_login: nowIso,
      updated_at: nowIso
    });

    const session = this.createSession(admin);
    Audit.log(admin.username, 'LOGIN_SUCCESS', 'Admins', admin.id, 'Login admin berhasil');

    return Utils.response(true, {
      token: session.token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name || 'Admin',
        role: admin.role || 'admin'
      }
    });
  },

  /**
   * Create session entry
   * @param {Object} admin
   * @return {Object}
   */
  createSession(admin) {
    const token = Utils.generateSessionToken();
    const now = Date.now();
    const expiryMs = now + (CONFIG.AUTH.SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);

    const sessionData = {
      token: token,
      adminId: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      createdAt: now,
      expiresAt: expiryMs
    };

    // Store in UserProperties or ScriptProperties for persistence across executions
    const props = PropertiesService.getScriptProperties();
    props.setProperty('sess_' + token, JSON.stringify(sessionData));

    return sessionData;
  },

  /**
   * Validate session token
   * @param {string} token
   * @return {Object}
   */
  validateSession(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token tidak ditemukan' };
    }

    const props = PropertiesService.getScriptProperties();
    const raw = props.getProperty('sess_' + token);
    if (!raw) {
      return { valid: false, error: 'Sesi tidak ditemukan atau telah kedaluwarsa' };
    }

    try {
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        props.deleteProperty('sess_' + token);
        return { valid: false, error: 'Sesi telah kedaluwarsa' };
      }
      return { valid: true, admin: session };
    } catch (e) {
      return { valid: false, error: 'Format sesi tidak valid' };
    }
  },

  /**
   * Invalidate session (logout)
   * @param {string} token
   * @return {Object}
   */
  logout(token) {
    if (token) {
      const validation = this.validateSession(token);
      const username = validation.valid ? validation.admin.username : 'unknown';
      const props = PropertiesService.getScriptProperties();
      props.deleteProperty('sess_' + token);
      Audit.log(username, 'LOGOUT', 'Admins', '', 'Sesi berhasil diakhiri');
    }
    return Utils.response(true, { message: 'Logout berhasil' });
  },

  /**
   * Change admin password
   * @param {string} token
   * @param {string} currentPassword
   * @param {string} newPassword
   * @return {Object}
   */
  changePassword(token, currentPassword, newPassword) {
    const session = this.validateSession(token);
    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized');
    }

    if (!newPassword || newPassword.length < 6) {
      return Utils.response(false, null, 'Kata sandi baru minimal 6 karakter');
    }

    const admins = Database.getData(CONFIG.SHEET_NAMES.ADMINS);
    const admin = admins.find(a => a.id === session.admin.adminId);
    if (!admin) {
      return Utils.response(false, null, 'User tidak ditemukan');
    }

    const currentHash = Utils.hashPassword(currentPassword, admin.salt);
    if (currentHash !== admin.password_hash) {
      return Utils.response(false, null, 'Kata sandi saat ini tidak sesuai');
    }

    const newSalt = Utilities.getUuid().replace(/-/g, '');
    const newHash = Utils.hashPassword(newPassword, newSalt);
    const nowIso = new Date().toISOString();

    Database.update(CONFIG.SHEET_NAMES.ADMINS, admin.id, {
      password_hash: newHash,
      salt: newSalt,
      updated_at: nowIso
    });

    Audit.log(admin.username, 'PASSWORD_CHANGE', 'Admins', admin.id, 'Kata sandi diperbarui');
    return Utils.response(true, { message: 'Kata sandi berhasil diperbarui' });
  },

  /**
   * Get all admins (Super Admin only)
   * @param {string} token
   * @return {Object}
   */
  getAdmins(token) {
    const session = this.validateSession(token);
    if (!session.valid) return Utils.response(false, null, 'Unauthorized');

    const admins = Database.getData(CONFIG.SHEET_NAMES.ADMINS);
    const safeList = admins.map(a => ({
      id: a.id,
      username: a.username,
      name: a.name,
      role: a.role,
      is_active: a.is_active === true || a.is_active === 'TRUE',
      last_login: Utils.formatDateTime(a.last_login),
      created_at: Utils.formatDateTime(a.created_at)
    }));

    return Utils.response(true, safeList);
  }
};

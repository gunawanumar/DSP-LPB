/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Utility & Helper Functions
 * File: Utils.gs
 */

const Utils = {
  /**
   * Validate that URL is a valid HTTPS string (or safe fragment)
   * @param {string} url
   * @return {boolean}
   */
  isValidHttpsUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '#' || trimmed.startsWith('#')) return true;
    try {
      return trimmed.startsWith('https://');
    } catch (e) {
      return false;
    }
  },

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} str
   * @return {string}
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Generate clean unique ID with prefix
   * @param {string} prefix
   * @return {string}
   */
  generateId(prefix = 'item') {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${prefix}_${timestamp}_${randomPart}`;
  },

  /**
   * Format ISO Date string to localized Indonesian representation
   * @param {Date|string} date
   * @return {string}
   */
  formatDateTime(date) {
    try {
      const d = date ? new Date(date) : new Date();
      return Utilities.formatDate(d, 'GMT+8', 'dd MMM yyyy HH:mm');
    } catch (e) {
      return String(date || '');
    }
  },

  /**
   * Compute SHA-256 hash of password with salt
   * @param {string} password
   * @param {string} salt
   * @return {string}
   */
  hashPassword(password, salt = CONFIG.AUTH.DEFAULT_SALT) {
    if (!password) return '';
    const raw = password + ':' + salt;
    const digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      raw,
      Utilities.Charset.UTF_8
    );
    return digest.map(byte => {
      const hex = (byte < 0 ? byte + 256 : byte).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  /**
   * Generate secure session token
   * @return {string}
   */
  generateSessionToken() {
    return CONFIG.AUTH.TOKEN_PREFIX + Utilities.getUuid().replace(/-/g, '');
  },

  /**
   * Standardized API Response
   * @param {boolean} success
   * @param {*} data
   * @param {string|null} error
   * @return {Object}
   */
  response(success, data = null, error = null) {
    return {
      success: !!success,
      data: data,
      error: error,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Safely get Web App URL
   * @return {string}
   */
  getWebAppUrl() {
    try {
      return ScriptApp.getService().getUrl();
    } catch (e) {
      return '';
    }
  }
};

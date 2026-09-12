/**
 * Lippo Plaza Baubau — Digital Service Portal
 * Audit Logging Service
 * File: Audit.gs
 */

const Audit = {
  /**
   * Record an action to the AuditLogs sheet
   * @param {string} username
   * @param {string} action
   * @param {string} entity
   * @param {string} entityId
   * @param {string|Object} details
   */
  log(username, action, entity, entityId = '', details = '') {
    try {
      const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
      const logEntry = {
        id: Utils.generateId('log'),
        timestamp: new Date().toISOString(),
        username: username || 'system',
        action: action,
        entity: entity,
        entity_id: String(entityId || ''),
        details: detailsStr
      };

      Database.insert(CONFIG.SHEET_NAMES.AUDIT_LOGS, logEntry);
    } catch (err) {
      Logger.log('Error writing audit log: ' + err.message);
    }
  },

  /**
   * Get recent audit logs (Admin only)
   * @param {string} sessionToken
   * @param {number} limit
   * @return {Object}
   */
  getLogs(sessionToken, limit = 50) {
    const session = Auth.validateSession(sessionToken);
    if (!session.valid) {
      return Utils.response(false, null, 'Unauthorized: Sesi tidak valid atau telah berakhir.');
    }

    try {
      const logs = Database.getData(CONFIG.SHEET_NAMES.AUDIT_LOGS);
      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const sliced = logs.slice(0, limit).map(item => ({
        id: item.id,
        timestamp: Utils.formatDateTime(item.timestamp),
        raw_timestamp: item.timestamp,
        username: item.username,
        action: item.action,
        entity: item.entity,
        entity_id: item.entity_id,
        details: item.details
      }));

      return Utils.response(true, sliced);
    } catch (err) {
      return Utils.response(false, null, 'Gagal memuat log audit: ' + err.message);
    }
  }
};

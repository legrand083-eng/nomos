import pool from './db';

/**
 * Email Engine - Template rendering and sending
 * NOMOΣ Phase 5
 */

/**
 * Replace template variables with actual values
 * @param {string} template - Template string with {variable} placeholders
 * @param {object} variables - Key-value pairs for replacement
 * @returns {string} - Rendered template
 */
export function renderTemplate(template, variables) {
  let rendered = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    rendered = rendered.replace(regex, value || '');
  }
  
  return rendered;
}

/**
 * Get email template by code
 * @param {string} code - Template code (e.g., 'RAPPEL_DEPOT_J5')
 * @returns {object|null} - Template object or null
 */
export async function getTemplate(code) {
  const [rows] = await pool.query(
    'SELECT * FROM email_templates WHERE code = ? AND is_active = TRUE LIMIT 1',
    [code]
  );
  
  return rows[0] || null;
}

/**
 * Send email notification
 * @param {object} params - Email parameters
 * @param {number} params.tenantId - Tenant ID
 * @param {string} params.templateCode - Template code
 * @param {string} params.destinataireEmail - Recipient email
 * @param {string} params.destinataireName - Recipient name
 * @param {object} params.variables - Template variables
 * @param {number} params.operationId - Operation ID (optional)
 * @param {number} params.lotId - Lot ID (optional)
 * @param {number} params.entrepriseId - Entreprise ID (optional)
 * @param {string} params.mode - Sending mode (email, ar24, rar, sms)
 * @returns {object} - Email log entry
 */
export async function sendEmail({
  tenantId,
  templateCode,
  destinataireEmail,
  destinataireName,
  variables,
  operationId = null,
  lotId = null,
  entrepriseId = null,
  mode = 'email'
}) {
  // Get template
  const template = await getTemplate(templateCode);
  
  if (!template) {
    throw new Error(`Template not found: ${templateCode}`);
  }
  
  // Render template
  const objet = renderTemplate(template.objet_template, variables);
  const contenu = renderTemplate(template.contenu_template, variables);
  
  // Create email log entry
  const [result] = await pool.query(
    `INSERT INTO email_log (
      tenant_id, template_id, operation_id, lot_id, entreprise_id,
      destinataire_email, destinataire_name, objet, contenu, mode, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      tenantId,
      template.id,
      operationId,
      lotId,
      entrepriseId,
      destinataireEmail,
      destinataireName,
      objet,
      contenu,
      mode
    ]
  );
  
  const emailLogId = result.insertId;
  
  // In production, this would trigger actual email sending via SMTP
  // For now, we just mark it as sent
  // TODO: Integrate with SMTP server on O2Switch
  
  try {
    // Simulate email sending
    // In production: await smtpClient.sendMail({ to, subject, text })
    
    await pool.query(
      `UPDATE email_log SET status = 'sent', sent_at = NOW() WHERE id = ?`,
      [emailLogId]
    );
    
    // Return the email log entry
    const [rows] = await pool.query(
      'SELECT * FROM email_log WHERE id = ?',
      [emailLogId]
    );
    
    return rows[0];
  } catch (error) {
    // Mark as failed
    await pool.query(
      `UPDATE email_log SET status = 'failed', error_message = ? WHERE id = ?`,
      [error.message, emailLogId]
    );
    
    throw error;
  }
}

/**
 * Send multiple emails (batch)
 * @param {array} emails - Array of email parameter objects
 * @returns {array} - Array of email log entries
 */
export async function sendBatch(emails) {
  const results = [];
  
  for (const emailParams of emails) {
    try {
      const result = await sendEmail(emailParams);
      results.push(result);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      results.push({ error: error.message, params: emailParams });
    }
  }
  
  return results;
}

/**
 * Get email log for an operation
 * @param {number} operationId - Operation ID
 * @param {number} limit - Max number of results
 * @returns {array} - Email log entries
 */
export async function getEmailLog(operationId, limit = 50) {
  const [rows] = await pool.query(
    `SELECT el.*, et.code as template_code, et.category
     FROM email_log el
     LEFT JOIN email_templates et ON el.template_id = et.id
     WHERE el.operation_id = ?
     ORDER BY el.created_at DESC
     LIMIT ?`,
    [operationId, limit]
  );
  
  return rows;
}

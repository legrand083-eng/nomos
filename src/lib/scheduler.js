import pool from './db';
import { sendEmail } from './email-engine';

/**
 * Scheduler - Automated notification triggers
 * NOMOΣ Phase 5
 * 
 * These functions are called by cron jobs on O2Switch
 */

/**
 * Check and send depot reminders (J-5, J-3, J-1)
 * Runs daily at 08:00
 */
export async function checkDepotReminders() {
  const results = [];
  
  // Get all active operations with their lots
  const [lots] = await pool.query(`
    SELECT 
      l.id as lot_id,
      l.numero as lot_numero,
      l.name as lot_name,
      l.entreprise_id,
      e.name as entreprise_name,
      e.email as entreprise_email,
      o.id as operation_id,
      o.name as operation_name,
      o.tenant_id,
      o.moe_name,
      o.depot_deadline_day
    FROM lots l
    JOIN entreprises e ON l.entreprise_id = e.id
    JOIN operations o ON l.operation_id = o.id
    WHERE l.status = 'en_cours'
      AND o.status = 'en_cours'
  `);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  for (const lot of lots) {
    // Calculate next deadline (e.g., 25th of current month)
    const deadlineDay = lot.depot_deadline_day || 25;
    const deadline = new Date(currentYear, currentMonth, deadlineDay);
    
    // If deadline has passed, use next month
    if (deadline < today) {
      deadline.setMonth(deadline.getMonth() + 1);
    }
    
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    // Check if situation already deposited for this month
    const [situations] = await pool.query(`
      SELECT id FROM situations
      WHERE lot_id = ?
        AND MONTH(created_at) = ?
        AND YEAR(created_at) = ?
      LIMIT 1
    `, [lot.lot_id, deadline.getMonth() + 1, deadline.getFullYear()]);
    
    if (situations.length > 0) {
      continue; // Already deposited
    }
    
    // Send reminders based on days until deadline
    let templateCode = null;
    
    if (daysUntilDeadline === 5) {
      templateCode = 'RAPPEL_DEPOT_J5';
    } else if (daysUntilDeadline === 3) {
      templateCode = 'RELANCE_DEPOT_J3';
    } else if (daysUntilDeadline === 1) {
      templateCode = 'RELANCE_DEPOT_J1';
    }
    
    if (templateCode) {
      try {
        const result = await sendEmail({
          tenantId: lot.tenant_id,
          templateCode,
          destinataireEmail: lot.entreprise_email,
          destinataireName: lot.entreprise_name,
          variables: {
            entreprise_name: lot.entreprise_name,
            deadline: deadline.toLocaleDateString('fr-FR'),
            mois: deadline.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            operation_name: lot.operation_name,
            lot_name: `${lot.lot_numero} — ${lot.lot_name}`,
            moe_name: lot.moe_name
          },
          operationId: lot.operation_id,
          lotId: lot.lot_id,
          entrepriseId: lot.entreprise_id
        });
        
        results.push({ lot: lot.lot_name, template: templateCode, status: 'sent' });
      } catch (error) {
        results.push({ lot: lot.lot_name, template: templateCode, status: 'failed', error: error.message });
      }
    }
  }
  
  return results;
}

/**
 * Check and send insurance expiry warnings (J-30, J-7)
 * Runs daily at 09:00
 */
export async function checkInsuranceExpiry() {
  const results = [];
  
  // Get all entreprises with insurance expiry dates
  const [entreprises] = await pool.query(`
    SELECT 
      e.id as entreprise_id,
      e.name as entreprise_name,
      e.email as entreprise_email,
      e.assurance_rc_date_fin,
      e.assurance_decennale_date_fin,
      o.id as operation_id,
      o.tenant_id,
      o.moe_name,
      l.id as lot_id,
      l.name as lot_name
    FROM entreprises e
    JOIN lots l ON e.id = l.entreprise_id
    JOIN operations o ON l.operation_id = o.id
    WHERE l.status = 'en_cours'
      AND o.status = 'en_cours'
  `);
  
  const today = new Date();
  
  for (const ent of entreprises) {
    // Check RC insurance
    if (ent.assurance_rc_date_fin) {
      const rcExpiry = new Date(ent.assurance_rc_date_fin);
      const daysUntilExpiry = Math.ceil((rcExpiry - today) / (1000 * 60 * 60 * 24));
      
      let templateCode = null;
      
      if (daysUntilExpiry === 30) {
        templateCode = 'ASSURANCE_J30';
      } else if (daysUntilExpiry === 7) {
        templateCode = 'ASSURANCE_J7';
      } else if (daysUntilExpiry <= 0) {
        templateCode = 'ASSURANCE_EXPIREE';
      }
      
      if (templateCode) {
        try {
          await sendEmail({
            tenantId: ent.tenant_id,
            templateCode,
            destinataireEmail: ent.entreprise_email,
            destinataireName: ent.entreprise_name,
            variables: {
              entreprise_name: ent.entreprise_name,
              type_assurance: 'RC Professionnelle',
              date: rcExpiry.toLocaleDateString('fr-FR'),
              moe_name: ent.moe_name
            },
            operationId: ent.operation_id,
            lotId: ent.lot_id,
            entrepriseId: ent.entreprise_id
          });
          
          results.push({ entreprise: ent.entreprise_name, type: 'RC', template: templateCode, status: 'sent' });
        } catch (error) {
          results.push({ entreprise: ent.entreprise_name, type: 'RC', template: templateCode, status: 'failed' });
        }
      }
    }
    
    // Check Décennale insurance (same logic)
    if (ent.assurance_decennale_date_fin) {
      const decExpiry = new Date(ent.assurance_decennale_date_fin);
      const daysUntilExpiry = Math.ceil((decExpiry - today) / (1000 * 60 * 60 * 24));
      
      let templateCode = null;
      
      if (daysUntilExpiry === 30) {
        templateCode = 'ASSURANCE_J30';
      } else if (daysUntilExpiry === 7) {
        templateCode = 'ASSURANCE_J7';
      } else if (daysUntilExpiry <= 0) {
        templateCode = 'ASSURANCE_EXPIREE';
      }
      
      if (templateCode) {
        try {
          await sendEmail({
            tenantId: ent.tenant_id,
            templateCode,
            destinataireEmail: ent.entreprise_email,
            destinataireName: ent.entreprise_name,
            variables: {
              entreprise_name: ent.entreprise_name,
              type_assurance: 'Décennale',
              date: decExpiry.toLocaleDateString('fr-FR'),
              moe_name: ent.moe_name
            },
            operationId: ent.operation_id,
            lotId: ent.lot_id,
            entrepriseId: ent.entreprise_id
          });
          
          results.push({ entreprise: ent.entreprise_name, type: 'Décennale', template: templateCode, status: 'sent' });
        } catch (error) {
          results.push({ entreprise: ent.entreprise_name, type: 'Décennale', template: templateCode, status: 'failed' });
        }
      }
    }
  }
  
  return results;
}

/**
 * Check and send caution expiry warnings (J-30, J-15, J-7)
 * Runs daily at 09:30
 */
export async function checkCautionExpiry() {
  const results = [];
  
  // Get all entreprises with caution expiry dates
  const [entreprises] = await pool.query(`
    SELECT 
      e.id as entreprise_id,
      e.name as entreprise_name,
      e.email as entreprise_email,
      e.caution_date_fin,
      o.id as operation_id,
      o.tenant_id,
      o.moe_name,
      l.id as lot_id
    FROM entreprises e
    JOIN lots l ON e.id = l.entreprise_id
    JOIN operations o ON l.operation_id = o.id
    WHERE l.status = 'en_cours'
      AND o.status = 'en_cours'
      AND e.caution_date_fin IS NOT NULL
  `);
  
  const today = new Date();
  
  for (const ent of entreprises) {
    const cautionExpiry = new Date(ent.caution_date_fin);
    const daysUntilExpiry = Math.ceil((cautionExpiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry === 30 || daysUntilExpiry === 15 || daysUntilExpiry === 7) {
      try {
        await sendEmail({
          tenantId: ent.tenant_id,
          templateCode: 'CAUTION_EXPIRATION',
          destinataireEmail: ent.entreprise_email,
          destinataireName: ent.entreprise_name,
          variables: {
            entreprise_name: ent.entreprise_name,
            date: cautionExpiry.toLocaleDateString('fr-FR'),
            moe_name: ent.moe_name
          },
          operationId: ent.operation_id,
          lotId: ent.lot_id,
          entrepriseId: ent.entreprise_id
        });
        
        results.push({ entreprise: ent.entreprise_name, days: daysUntilExpiry, status: 'sent' });
      } catch (error) {
        results.push({ entreprise: ent.entreprise_name, days: daysUntilExpiry, status: 'failed' });
      }
    }
  }
  
  return results;
}

/**
 * Send monthly recap of problematic pedigrees
 * Runs on 1st of each month at 08:00
 */
export async function checkMonthlyRecap() {
  const results = [];
  
  // Get all MOE users
  const [moeUsers] = await pool.query(`
    SELECT DISTINCT u.id, u.email, u.name, u.tenant_id
    FROM users u
    WHERE u.role = 'moe'
  `);
  
  for (const moe of moeUsers) {
    // Find problematic pedigrees
    const [pedigrees] = await pool.query(`
      SELECT 
        e.name as entreprise_name,
        l.name as lot_name,
        e.pedigree_completion
      FROM entreprises e
      JOIN lots l ON e.id = l.entreprise_id
      JOIN operations o ON l.operation_id = o.id
      WHERE o.tenant_id = ?
        AND l.status = 'en_cours'
        AND e.pedigree_completion < 100
      ORDER BY e.pedigree_completion ASC
    `, [moe.tenant_id]);
    
    if (pedigrees.length > 0) {
      const liste = pedigrees.map(p => 
        `- ${p.entreprise_name} (${p.lot_name}) : ${p.pedigree_completion}% complété`
      ).join('\n');
      
      try {
        await sendEmail({
          tenantId: moe.tenant_id,
          templateCode: 'RECAP_MENSUEL_PEDIGREE',
          destinataireEmail: moe.email,
          destinataireName: moe.name,
          variables: {
            moe_name: moe.name,
            liste_problemes: liste
          }
        });
        
        results.push({ moe: moe.name, count: pedigrees.length, status: 'sent' });
      } catch (error) {
        results.push({ moe: moe.name, count: pedigrees.length, status: 'failed' });
      }
    }
  }
  
  return results;
}

/**
 * Check and send RG liberation warnings (J-30)
 * Runs daily at 10:00
 */
export async function checkRGRelease() {
  const results = [];
  
  // Get all lots with upcoming RG release dates
  const [lots] = await pool.query(`
    SELECT 
      l.id as lot_id,
      l.name as lot_name,
      l.rg_liberation_date,
      l.montant_rg,
      e.name as entreprise_name,
      o.id as operation_id,
      o.tenant_id,
      o.moe_name
    FROM lots l
    JOIN entreprises e ON l.entreprise_id = e.id
    JOIN operations o ON l.operation_id = o.id
    WHERE l.status = 'termine'
      AND l.rg_liberation_date IS NOT NULL
      AND l.montant_rg > 0
  `);
  
  const today = new Date();
  
  for (const lot of lots) {
    const releaseDate = new Date(lot.rg_liberation_date);
    const daysUntilRelease = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRelease === 30) {
      try {
        await sendEmail({
          tenantId: lot.tenant_id,
          templateCode: 'LIBERATION_RG',
          destinataireEmail: lot.moe_name, // Send to MOE
          destinataireName: lot.moe_name,
          variables: {
            entreprise_name: lot.entreprise_name,
            lot_name: lot.lot_name,
            montant: lot.montant_rg.toLocaleString('fr-FR')
          },
          operationId: lot.operation_id,
          lotId: lot.lot_id
        });
        
        results.push({ lot: lot.lot_name, montant: lot.montant_rg, status: 'sent' });
      } catch (error) {
        results.push({ lot: lot.lot_name, montant: lot.montant_rg, status: 'failed' });
      }
    }
  }
  
  return results;
}

/**
 * Run all scheduled checks
 * This is the main entry point for the cron job
 */
export async function runAllChecks() {
  const results = {
    depotReminders: await checkDepotReminders(),
    insuranceExpiry: await checkInsuranceExpiry(),
    cautionExpiry: await checkCautionExpiry(),
    monthlyRecap: await checkMonthlyRecap(),
    rgRelease: await checkRGRelease()
  };
  
  return results;
}

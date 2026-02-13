import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import pool from '@/lib/db';

export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const entrepriseId = params.id;
    const tab = params.tab;
    const data = await req.json();

    // Verify entreprise belongs to tenant
    const [entreprises] = await pool.query(
      'SELECT id FROM entreprises WHERE id = ? AND tenant_id = ?',
      [entrepriseId, user.tenant_id]
    );

    if (entreprises.length === 0) {
      return NextResponse.json({ error: 'Entreprise not found' }, { status: 404 });
    }

    let updateFields = {};

    switch (tab) {
      case 'info':
        updateFields = {
          name: data.name,
          siret: data.siret,
          siren: data.siren,
          naf_code: data.naf_code,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          conducteur_travaux_name: data.conducteur_travaux_name,
          conducteur_travaux_email: data.conducteur_travaux_email,
          conducteur_travaux_phone: data.conducteur_travaux_phone
        };
        break;

      case 'assurances':
        updateFields = {
          assurance_rc_assureur: data.assurance_rc_assureur,
          assurance_rc_numero: data.assurance_rc_numero,
          assurance_rc_montant: data.assurance_rc_montant,
          assurance_rc_expire: data.assurance_rc_expire,
          assurance_decennale_assureur: data.assurance_decennale_assureur,
          assurance_decennale_numero: data.assurance_decennale_numero,
          assurance_decennale_activites: data.assurance_decennale_activites,
          assurance_decennale_expire: data.assurance_decennale_expire
        };
        break;

      case 'cautions':
        updateFields = {
          caution_type: data.caution_type,
          caution_organisme: data.caution_organisme,
          caution_montant: data.caution_montant,
          caution_date_fin: data.caution_date_fin
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid tab' }, { status: 400 });
    }

    // Build UPDATE query
    const fields = Object.keys(updateFields).filter(k => updateFields[k] !== undefined);
    const values = fields.map(k => updateFields[k]);
    
    if (fields.length > 0) {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      await pool.query(
        `UPDATE entreprises SET ${setClause} WHERE id = ? AND tenant_id = ?`,
        [...values, entrepriseId, user.tenant_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pedigree tab:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

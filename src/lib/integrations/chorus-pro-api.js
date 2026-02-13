/**
 * Chorus Pro API Integration
 * Dépôt de factures électroniques sur la plateforme Chorus Pro
 */

export class ChorusProAPI {
  constructor() {
    this.baseURL = 'https://chorus-pro.gouv.fr/api/v1';
    this.clientId = process.env.CHORUS_CLIENT_ID || '';
    this.clientSecret = process.env.CHORUS_CLIENT_SECRET || '';
    this.accessToken = null;
  }

  async authenticate() {
    try {
      const response = await fetch(`${this.baseURL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chorus Pro auth error: ${response.status}`);
      }
      
      const data = await response.json();
      this.accessToken = data.access_token;
      return { success: true };
    } catch (error) {
      console.error('Chorus Pro auth error:', error);
      return { success: false, error: error.message };
    }
  }

  async deposerFacture(facture) {
    if (!this.accessToken) {
      await this.authenticate();
    }
    
    try {
      const response = await fetch(`${this.baseURL}/factures`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero_facture: facture.numero,
          date_facture: facture.date,
          montant_ht: facture.montant_ht,
          montant_tva: facture.montant_tva,
          montant_ttc: facture.montant_ttc,
          siret_emetteur: facture.siret_emetteur,
          siret_destinataire: facture.siret_destinataire,
          lignes: facture.lignes,
          fichier_pdf: facture.fichier_pdf_base64
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chorus Pro deposit error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        facture_id: data.id,
        statut: data.statut,
        numero_depot: data.numero_depot
      };
    } catch (error) {
      console.error('Chorus Pro deposit error:', error);
      return { success: false, error: error.message };
    }
  }

  async getStatutFacture(facture_id) {
    if (!this.accessToken) {
      await this.authenticate();
    }
    
    try {
      const response = await fetch(`${this.baseURL}/factures/${facture_id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Chorus Pro status error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        statut: data.statut,
        date_depot: data.date_depot,
        date_validation: data.date_validation,
        motif_rejet: data.motif_rejet
      };
    } catch (error) {
      console.error('Chorus Pro status error:', error);
      return { success: false, error: error.message };
    }
  }
}

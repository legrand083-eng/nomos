/**
 * INSEE API Integration
 * Récupération données SIRET/SIREN depuis l'API INSEE
 */

export class InseeAPI {
  constructor() {
    this.baseURL = 'https://api.insee.fr/entreprises/sirene/V3';
    this.token = process.env.INSEE_API_TOKEN || '';
  }

  async getSiret(siret) {
    try {
      const response = await fetch(`${this.baseURL}/siret/${siret}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`INSEE API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: {
          siret: data.etablissement.siret,
          siren: data.etablissement.siren,
          denomination: data.etablissement.uniteLegale?.denominationUniteLegale,
          adresse: `${data.etablissement.adresseEtablissement.numeroVoieEtablissement} ${data.etablissement.adresseEtablissement.typeVoieEtablissement} ${data.etablissement.adresseEtablissement.libelleVoieEtablissement}`,
          codePostal: data.etablissement.adresseEtablissement.codePostalEtablissement,
          ville: data.etablissement.adresseEtablissement.libelleCommuneEtablissement,
          activite: data.etablissement.uniteLegale?.activitePrincipaleUniteLegale
        }
      };
    } catch (error) {
      console.error('INSEE API error:', error);
      return { success: false, error: error.message };
    }
  }

  async searchEntreprise(query) {
    try {
      const response = await fetch(`${this.baseURL}/siret?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`INSEE API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        results: data.etablissements.map(e => ({
          siret: e.siret,
          denomination: e.uniteLegale?.denominationUniteLegale,
          ville: e.adresseEtablissement.libelleCommuneEtablissement
        }))
      };
    } catch (error) {
      console.error('INSEE API search error:', error);
      return { success: false, error: error.message };
    }
  }
}

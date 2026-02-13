/**
 * Indices BT/TP API Integration
 * Récupération automatique des indices INSEE pour la révision de prix
 */

export class IndicesAPI {
  constructor() {
    this.baseURL = 'https://api.insee.fr/series/BDM/V1';
    this.token = process.env.INSEE_API_TOKEN || '';
  }

  async getIndice(code, date) {
    try {
      const response = await fetch(`${this.baseURL}/data/SERIES_BDM/${code}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Indices API error: ${response.status}`);
      }
      
      const data = await response.json();
      const observation = data.Obs.find(obs => obs.TIME_PERIOD === date);
      
      return {
        success: true,
        code: code,
        date: date,
        valeur: observation ? parseFloat(observation.OBS_VALUE) : null
      };
    } catch (error) {
      console.error('Indices API error:', error);
      return { success: false, error: error.message };
    }
  }

  async getIndicesBT(annee, mois) {
    const codes = [
      'BT01', 'BT02', 'BT03', 'BT04', 'BT05', 'BT06', 'BT07',
      'BT08', 'BT09', 'BT10', 'BT11', 'BT12', 'BT13', 'BT14'
    ];
    
    const date = `${annee}-${String(mois).padStart(2, '0')}`;
    const results = [];
    
    for (const code of codes) {
      const result = await this.getIndice(code, date);
      if (result.success) {
        results.push(result);
      }
    }
    
    return {
      success: true,
      date: date,
      indices: results
    };
  }

  async getIndicesTP(annee, mois) {
    const codes = [
      'TP01', 'TP02', 'TP03', 'TP04', 'TP05', 'TP06',
      'TP07', 'TP08', 'TP09', 'TP10', 'TP11', 'TP12'
    ];
    
    const date = `${annee}-${String(mois).padStart(2, '0')}`;
    const results = [];
    
    for (const code of codes) {
      const result = await this.getIndice(code, date);
      if (result.success) {
        results.push(result);
      }
    }
    
    return {
      success: true,
      date: date,
      indices: results
    };
  }
}

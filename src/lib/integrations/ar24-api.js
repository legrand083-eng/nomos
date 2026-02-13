/**
 * AR24 API Integration
 * Envoi de courriers électroniques avec accusé de réception (RAR)
 */

export class AR24API {
  constructor() {
    this.baseURL = 'https://api.ar24.fr/v2';
    this.apiKey = process.env.AR24_API_KEY || '';
  }

  async sendRAR(params) {
    const { destinataire, objet, contenu, pieces_jointes = [] } = params;
    
    try {
      const formData = new FormData();
      formData.append('destinataire_nom', destinataire.nom);
      formData.append('destinataire_email', destinataire.email);
      formData.append('objet', objet);
      formData.append('contenu', contenu);
      
      pieces_jointes.forEach((piece, index) => {
        formData.append(`piece_${index}`, piece);
      });
      
      const response = await fetch(`${this.baseURL}/courriers`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`AR24 API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        courrier_id: data.id,
        statut: data.statut,
        tracking_url: data.tracking_url
      };
    } catch (error) {
      console.error('AR24 API error:', error);
      return { success: false, error: error.message };
    }
  }

  async getStatut(courrier_id) {
    try {
      const response = await fetch(`${this.baseURL}/courriers/${courrier_id}`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`AR24 API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        statut: data.statut,
        date_envoi: data.date_envoi,
        date_reception: data.date_reception,
        date_ouverture: data.date_ouverture
      };
    } catch (error) {
      console.error('AR24 API status error:', error);
      return { success: false, error: error.message };
    }
  }
}

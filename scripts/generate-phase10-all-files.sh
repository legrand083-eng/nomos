#!/bin/bash

# ══════════════════════════════════════════════════════════════
# NOMOΣ — PHASE 10: ADMIN M1 + INTERFACES API
# Script de génération de tous les fichiers
# Date: 13 February 2026
# ══════════════════════════════════════════════════════════════

cd /home/ubuntu/nomos

# ══════════════════════════════════════════════════════════════
# 1. INTÉGRATIONS API EXTERNES (4 fichiers)
# ══════════════════════════════════════════════════════════════

# INSEE API Integration
cat > src/lib/integrations/insee-api.js << 'EOF'
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
EOF

# AR24 API Integration (Courrier électronique RAR)
cat > src/lib/integrations/ar24-api.js << 'EOF'
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
EOF

# Chorus Pro API Integration (Facturation électronique)
cat > src/lib/integrations/chorus-pro-api.js << 'EOF'
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
EOF

# Indices BT/TP API Integration
cat > src/lib/integrations/indices-api.js << 'EOF'
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
EOF

echo "✅ 4 intégrations API créées"

# ══════════════════════════════════════════════════════════════
# 2. LAYOUT ADMIN + SIDEBAR (2 fichiers)
# ══════════════════════════════════════════════════════════════

mkdir -p src/app/dashboard/admin

cat > src/app/dashboard/admin/layout.js << 'EOF'
'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'monitoring', label: 'Monitoring', icon: '📊', items: [
      { id: 'p00', label: 'Vue d\'ensemble', href: '/dashboard/admin/panels/p00-overview' },
      { id: 'p01', label: 'Activité temps réel', href: '/dashboard/admin/panels/p01-activity' },
      { id: 'p02', label: 'Performance API', href: '/dashboard/admin/panels/p02-performance' },
      { id: 'p03', label: 'Logs système', href: '/dashboard/admin/panels/p03-logs' },
      { id: 'p04', label: 'Alertes critiques', href: '/dashboard/admin/panels/p04-alerts' }
    ]},
    { id: 'users', label: 'Utilisateurs', icon: '👥', items: [
      { id: 'p05', label: 'Liste utilisateurs', href: '/dashboard/admin/panels/p05-users' },
      { id: 'p06', label: 'Rôles & permissions', href: '/dashboard/admin/panels/p06-roles' },
      { id: 'p07', label: 'Sessions actives', href: '/dashboard/admin/panels/p07-sessions' },
      { id: 'p08', label: 'Historique connexions', href: '/dashboard/admin/panels/p08-login-history' }
    ]},
    { id: 'security', label: 'Sécurité', icon: '🔒', items: [
      { id: 'p09', label: 'Audit trail', href: '/dashboard/admin/panels/p09-audit' },
      { id: 'p10', label: 'Tentatives échouées', href: '/dashboard/admin/panels/p10-failed-logins' },
      { id: 'p11', label: 'IP bloquées', href: '/dashboard/admin/panels/p11-blocked-ips' },
      { id: 'p12', label: 'Sauvegardes', href: '/dashboard/admin/panels/p12-backups' }
    ]},
    { id: 'business', label: 'Business', icon: '💼', items: [
      { id: 'p13', label: 'Tenants', href: '/dashboard/admin/panels/p13-tenants' },
      { id: 'p14', label: 'Opérations globales', href: '/dashboard/admin/panels/p14-operations' },
      { id: 'p15', label: 'Templates email', href: '/dashboard/admin/panels/p15-email-templates' },
      { id: 'p16', label: 'Jours fériés', href: '/dashboard/admin/panels/p16-holidays' },
      { id: 'p17', label: 'Exports comptables', href: '/dashboard/admin/panels/p17-exports' }
    ]},
    { id: 'support', label: 'Support', icon: '🎫', items: [
      { id: 'p18', label: 'Tickets', href: '/dashboard/admin/panels/p18-tickets' },
      { id: 'p19', label: 'FAQ', href: '/dashboard/admin/panels/p19-faq' },
      { id: 'p20', label: 'Documentation', href: '/dashboard/admin/panels/p20-docs' },
      { id: 'p21', label: 'Changelog', href: '/dashboard/admin/panels/p21-changelog' }
    ]}
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2>Admin M1</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map(section => (
            <div key={section.id} className={styles.navSection}>
              <div className={styles.navSectionHeader}>
                <span className={styles.navIcon}>{section.icon}</span>
                {sidebarOpen && <span>{section.label}</span>}
              </div>
              {sidebarOpen && (
                <ul className={styles.navItems}>
                  {section.items.map(item => (
                    <li key={item.id}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
EOF

cat > src/app/dashboard/admin/admin.module.css << 'EOF'
.adminLayout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  width: 280px;
  background: var(--color-navy);
  color: white;
  transition: width 0.3s ease;
  overflow-y: auto;
}

.sidebar.closed {
  width: 60px;
}

.sidebarHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-21);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebarHeader h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gold);
}

.sidebarHeader button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
}

.sidebarNav {
  padding: var(--spacing-13);
}

.navSection {
  margin-bottom: var(--spacing-21);
}

.navSectionHeader {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-8);
  font-weight: 600;
  color: var(--color-gold);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: var(--spacing-8);
}

.navIcon {
  font-size: 1.25rem;
}

.navItems {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navItems li {
  margin-bottom: var(--spacing-5);
}

.navItems a {
  display: block;
  padding: var(--spacing-8) var(--spacing-13);
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  border-radius: var(--spacing-5);
  transition: all 0.2s ease;
}

.navItems a:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.adminMain {
  flex: 1;
  padding: var(--spacing-34);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.closed {
    transform: translateX(-100%);
  }
  
  .adminMain {
    padding: var(--spacing-21);
  }
}
EOF

echo "✅ Layout Admin + Sidebar créés"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "✅ Phase 10 - Intégrations API + Layout Admin créés"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Fichiers créés:"
echo "- 4 intégrations API (insee-api.js, ar24-api.js, chorus-pro-api.js, indices-api.js)"
echo "- Layout Admin + Sidebar (layout.js, admin.module.css)"
echo ""
echo "Note: Les 22 panels admin seront créés dans la prochaine étape"
echo "══════════════════════════════════════════════════════════════"
EOF

chmod +x /home/ubuntu/nomos/scripts/generate-phase10-all-files.sh

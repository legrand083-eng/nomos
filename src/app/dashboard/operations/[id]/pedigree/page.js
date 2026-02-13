'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './pedigree.module.css';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PercentInput from '@/components/ui/PercentInput';
import DateInput from '@/components/ui/DateInput';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import SiretInput from '@/components/ui/SiretInput';
import FileUpload from '@/components/ui/FileUpload';
import SectionProgress from '@/components/ui/SectionProgress';

const SECTIONS = [
  { id: 'a', title: 'A — Identification', questions: 9 },
  { id: 'b', title: 'B — Juridique', questions: 5 },
  { id: 'c', title: 'C — Intervenants', questions: 15 },
  { id: 'd', title: 'D — Planning', questions: 14 },
  { id: 'e', title: 'E — Financier', questions: 28 },
  { id: 'f', title: 'F — Entreprises', questions: 12 }
];

export default function PedigreePage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id;

  const [activeTab, setActiveTab] = useState('a');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pedigree, setPedigree] = useState(null);
  const [formData, setFormData] = useState({});
  const [intervenants, setIntervenants] = useState([]);
  const [jalons, setJalons] = useState([]);
  const [lots, setLots] = useState([]);

  useEffect(() => {
    fetchPedigree();
  }, [operationId]);

  const fetchPedigree = async () => {
    try {
      const res = await fetch(`/api/operations/${operationId}/pedigree`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setPedigree(data);
        setFormData(data.operation);
        setIntervenants(data.intervenants || []);
        setJalons(data.jalons || []);
        setLots(data.lots || []);
      }
    } catch (error) {
      console.error('Error fetching pedigree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/operations/${operationId}/pedigree/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchPedigree(); // Refresh to get updated completion
        alert('Section sauvegardée avec succès');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIntervenant = async (newIntervenant) => {
    try {
      const res = await fetch(`/api/operations/${operationId}/intervenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newIntervenant)
      });
      if (res.ok) {
        await fetchPedigree();
      }
    } catch (error) {
      console.error('Error adding intervenant:', error);
    }
  };

  const handleDeleteIntervenant = async (intervenantId) => {
    if (!confirm('Supprimer cet intervenant ?')) return;
    try {
      const res = await fetch(`/api/operations/${operationId}/intervenants/${intervenantId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchPedigree();
      }
    } catch (error) {
      console.error('Error deleting intervenant:', error);
    }
  };

  const handleAddJalon = async (newJalon) => {
    try {
      const res = await fetch(`/api/operations/${operationId}/jalons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newJalon)
      });
      if (res.ok) {
        await fetchPedigree();
      }
    } catch (error) {
      console.error('Error adding jalon:', error);
    }
  };

  const handleDeleteJalon = async (jalonId) => {
    if (!confirm('Supprimer ce jalon ?')) return;
    try {
      const res = await fetch(`/api/operations/${operationId}/jalons/${jalonId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchPedigree();
      }
    } catch (error) {
      console.error('Error deleting jalon:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement du pedigree...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← Retour
          </button>
          <h1 className={styles.title}>Pedigree Opération</h1>
          <span className={styles.operationCode}>{formData.code}</span>
        </div>
        <div className={styles.headerRight}>
          <SectionProgress percentage={formData.pedigree_completion || 0} />
          <span className={styles.completionText}>
            {formData.pedigree_completion || 0}% complété
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            className={`${styles.tab} ${activeTab === section.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(section.id)}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'a' && (
          <SectionA
            formData={formData}
            onChange={handleFieldChange}
            onSave={() => handleSaveSection('a')}
            saving={saving}
          />
        )}
        {activeTab === 'b' && (
          <SectionB
            formData={formData}
            onChange={handleFieldChange}
            onSave={() => handleSaveSection('b')}
            saving={saving}
          />
        )}
        {activeTab === 'c' && (
          <SectionC
            intervenants={intervenants}
            onAdd={handleAddIntervenant}
            onDelete={handleDeleteIntervenant}
          />
        )}
        {activeTab === 'd' && (
          <SectionD
            formData={formData}
            jalons={jalons}
            onChange={handleFieldChange}
            onSave={() => handleSaveSection('d')}
            onAddJalon={handleAddJalon}
            onDeleteJalon={handleDeleteJalon}
            saving={saving}
          />
        )}
        {activeTab === 'e' && (
          <SectionE
            formData={formData}
            onChange={handleFieldChange}
            onSave={() => handleSaveSection('e')}
            saving={saving}
          />
        )}
        {activeTab === 'f' && (
          <SectionF
            lots={lots}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION A — IDENTIFICATION
// ═══════════════════════════════════════════════════════════

function SectionA({ formData, onChange, onSave, saving }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section A — Identification de l'opération</h2>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Type d'opération *</label>
          <select
            value={formData.operation_type || 'public'}
            onChange={(e) => onChange('operation_type', e.target.value)}
            className={styles.select}
          >
            <option value="public">Marché public</option>
            <option value="private">Marché privé</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Type de marché *</label>
          <select
            value={formData.market_type || 'travaux'}
            onChange={(e) => onChange('market_type', e.target.value)}
            className={styles.select}
          >
            <option value="travaux">Travaux</option>
            <option value="moe">Maîtrise d'œuvre</option>
            <option value="mixte">Mixte</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Forme de marché *</label>
          <select
            value={formData.market_form || 'ordinaire'}
            onChange={(e) => onChange('market_form', e.target.value)}
            className={styles.select}
          >
            <option value="ordinaire">Ordinaire</option>
            <option value="befa">BEFA</option>
            <option value="cpi">CPI</option>
            <option value="vefa">VEFA</option>
            <option value="conception_realisation">Conception-Réalisation</option>
            <option value="ppp">PPP</option>
            <option value="concession">Concession</option>
          </select>
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Description de l'opération *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className={styles.textarea}
            rows="3"
            placeholder="Ex: 31 logements locatifs sociaux — Résidence Les Vespins"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Département *</label>
          <input
            type="text"
            value={formData.department || ''}
            onChange={(e) => onChange('department', e.target.value)}
            className={styles.input}
            placeholder="06"
            maxLength="5"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Région *</label>
          <input
            type="text"
            value={formData.region || ''}
            onChange={(e) => onChange('region', e.target.value)}
            className={styles.input}
            placeholder="Provence-Alpes-Côte d'Azur"
          />
        </div>

        <CurrencyInput
          label="Budget HT *"
          value={formData.budget_ht}
          onChange={(val) => onChange('budget_ht', val)}
        />

        <CurrencyInput
          label="Budget TTC *"
          value={formData.budget_ttc}
          onChange={(val) => onChange('budget_ttc', val)}
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre de lots *</label>
          <input
            type="number"
            value={formData.nb_lots || ''}
            onChange={(e) => onChange('nb_lots', parseInt(e.target.value))}
            className={styles.input}
            min="0"
          />
        </div>
      </div>

      <div className={styles.sectionFooter}>
        <button onClick={onSave} disabled={saving} className={styles.saveButton}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder Section A'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION B — JURIDIQUE
// ═══════════════════════════════════════════════════════════

function SectionB({ formData, onChange, onSave, saving }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section B — Cadre juridique</h2>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Référentiel contractuel *</label>
          <select
            value={formData.referentiel || 'ccag_2021'}
            onChange={(e) => onChange('referentiel', e.target.value)}
            className={styles.select}
          >
            <option value="ccag_2021">CCAG Travaux 2021</option>
            <option value="ccag_2009">CCAG Travaux 2009</option>
            <option value="nf_p03_001">NF P03-001</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <FileUpload
            label="CCAP (Cahier des Clauses Administratives Particulières)"
            onUpload={(file) => {
              onChange('ccap_uploaded', true);
              onChange('ccap_file_path', file.name);
            }}
            currentFile={formData.ccap_file_path}
          />
        </div>

        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
          <ToggleSwitch
            label="Dérogations au CCAG ?"
            checked={formData.has_derogations || false}
            onChange={(val) => onChange('has_derogations', val)}
          />
        </div>

        {formData.has_derogations && (
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Liste des dérogations *</label>
            <textarea
              value={formData.derogations_ccag || ''}
              onChange={(e) => onChange('derogations_ccag', e.target.value)}
              className={styles.textarea}
              rows="5"
              placeholder="Ex: Art. 14.1 — Délai de paiement porté à 45 jours"
            />
          </div>
        )}
      </div>

      <div className={styles.sectionFooter}>
        <button onClick={onSave} disabled={saving} className={styles.saveButton}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder Section B'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION C — INTERVENANTS
// ═══════════════════════════════════════════════════════════

function SectionC({ intervenants, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'moe',
    is_mandataire: false,
    signe_certificats: false
  });

  const TYPES = [
    { value: 'moa', label: 'Maître d\'ouvrage' },
    { value: 'moa_delegue', label: 'MOA déléguée' },
    { value: 'moe', label: 'Maître d\'œuvre' },
    { value: 'opc', label: 'OPC' },
    { value: 'architecte', label: 'Architecte' },
    { value: 'bet_structure', label: 'BET Structure' },
    { value: 'bet_fluides', label: 'BET Fluides' },
    { value: 'bet_ssi', label: 'BET SSI' },
    { value: 'bet_vrd', label: 'BET VRD' },
    { value: 'bet_espaces_verts', label: 'BET Espaces verts' },
    { value: 'csps', label: 'CSPS' },
    { value: 'controleur_technique', label: 'Contrôleur technique' },
    { value: 'autre', label: 'Autre' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      type: 'moe',
      is_mandataire: false,
      signe_certificats: false
    });
    setShowForm(false);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section C — Intervenants</h2>
      
      <div className={styles.tableHeader}>
        <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
          + Ajouter un intervenant
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.intervenantForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={styles.select}
                required
              >
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nom *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <SiretInput
              label="SIRET"
              value={formData.siret || ''}
              onChange={(val) => setFormData({ ...formData, siret: val })}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Direction — Nom</label>
              <input
                type="text"
                value={formData.contact_direction_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_direction_name: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Direction — Email</label>
              <input
                type="email"
                value={formData.contact_direction_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_direction_email: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Technique — Nom</label>
              <input
                type="text"
                value={formData.contact_technique_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_technique_name: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Technique — Email</label>
              <input
                type="email"
                value={formData.contact_technique_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_technique_email: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <ToggleSwitch
                label="Mandataire ?"
                checked={formData.is_mandataire}
                onChange={(val) => setFormData({ ...formData, is_mandataire: val })}
              />
            </div>

            <div className={styles.formGroup}>
              <ToggleSwitch
                label="Signe les certificats ?"
                checked={formData.signe_certificats}
                onChange={(val) => setFormData({ ...formData, signe_certificats: val })}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
              Annuler
            </button>
            <button type="submit" className={styles.saveButton}>
              Ajouter
            </button>
          </div>
        </form>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Nom</th>
            <th>SIRET</th>
            <th>Contact Direction</th>
            <th>Contact Technique</th>
            <th>Mandataire</th>
            <th>Signe</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {intervenants.map(intervenant => (
            <tr key={intervenant.id}>
              <td>{intervenant.type}</td>
              <td>{intervenant.name}</td>
              <td className={styles.mono}>{intervenant.siret}</td>
              <td>
                {intervenant.contact_direction_name}
                {intervenant.contact_direction_email && (
                  <><br /><span className={styles.email}>{intervenant.contact_direction_email}</span></>
                )}
              </td>
              <td>
                {intervenant.contact_technique_name}
                {intervenant.contact_technique_email && (
                  <><br /><span className={styles.email}>{intervenant.contact_technique_email}</span></>
                )}
              </td>
              <td>{intervenant.is_mandataire ? '✓' : '—'}</td>
              <td>{intervenant.signe_certificats ? '✓' : '—'}</td>
              <td>
                <button
                  onClick={() => onDelete(intervenant.id)}
                  className={styles.deleteButton}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {intervenants.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          Aucun intervenant enregistré. Cliquez sur "Ajouter un intervenant" pour commencer.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION D — PLANNING
// ═══════════════════════════════════════════════════════════

function SectionD({ formData, jalons, onChange, onSave, onAddJalon, onDeleteJalon, saving }) {
  const [showJalonForm, setShowJalonForm] = useState(false);
  const [jalonFormData, setJalonFormData] = useState({
    type: 'jalon_intermediaire',
    penalite_applicable: true,
    status: 'a_venir'
  });

  const handleJalonSubmit = (e) => {
    e.preventDefault();
    onAddJalon(jalonFormData);
    setJalonFormData({
      type: 'jalon_intermediaire',
      penalite_applicable: true,
      status: 'a_venir'
    });
    setShowJalonForm(false);
  };

  // Calculate date_fin_prevue based on date_os1 + duree_globale_mois
  useEffect(() => {
    if (formData.date_os1 && formData.duree_globale_mois) {
      const os1 = new Date(formData.date_os1);
      const dateFin = new Date(os1);
      dateFin.setMonth(dateFin.getMonth() + parseInt(formData.duree_globale_mois));
      onChange('date_fin_prevue', dateFin.toISOString().split('T')[0]);
    }
  }, [formData.date_os1, formData.duree_globale_mois]);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section D — Planning</h2>
      
      <div className={styles.formGrid}>
        <DateInput
          label="Date OS1 (Ordre de Service n°1) *"
          value={formData.date_os1}
          onChange={(val) => onChange('date_os1', val)}
        />

        <DateInput
          label="Date OS2 (si applicable)"
          value={formData.date_os2}
          onChange={(val) => onChange('date_os2', val)}
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Durée globale (mois) *</label>
          <input
            type="number"
            value={formData.duree_globale_mois || ''}
            onChange={(e) => onChange('duree_globale_mois', parseInt(e.target.value))}
            className={styles.input}
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Durée préparation (jours)</label>
          <input
            type="number"
            value={formData.duree_preparation_jours || ''}
            onChange={(e) => onChange('duree_preparation_jours', parseInt(e.target.value))}
            className={styles.input}
            min="0"
          />
        </div>

        <DateInput
          label="Date fin prévue (calculée)"
          value={formData.date_fin_prevue}
          onChange={(val) => onChange('date_fin_prevue', val)}
          disabled
        />

        <DateInput
          label="Congés annuels — Début"
          value={formData.conges_annuels_debut}
          onChange={(val) => onChange('conges_annuels_debut', val)}
        />

        <DateInput
          label="Congés annuels — Fin"
          value={formData.conges_annuels_fin}
          onChange={(val) => onChange('conges_annuels_fin', val)}
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Intempéries (jours prévus)</label>
          <input
            type="number"
            value={formData.intemperies_jours_prevus || ''}
            onChange={(e) => onChange('intemperies_jours_prevus', parseInt(e.target.value))}
            className={styles.input}
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Jour réunion chantier *</label>
          <select
            value={formData.jour_reunion_chantier || 'mardi'}
            onChange={(e) => onChange('jour_reunion_chantier', e.target.value)}
            className={styles.select}
          >
            <option value="lundi">Lundi</option>
            <option value="mardi">Mardi</option>
            <option value="mercredi">Mercredi</option>
            <option value="jeudi">Jeudi</option>
            <option value="vendredi">Vendredi</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Fréquence réunion *</label>
          <select
            value={formData.frequence_reunion || 'hebdomadaire'}
            onChange={(e) => onChange('frequence_reunion', e.target.value)}
            className={styles.select}
          >
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="bimensuelle">Bimensuelle</option>
            <option value="mensuelle">Mensuelle</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Date limite situation (jour du mois) *</label>
          <input
            type="number"
            value={formData.date_limite_situation || 25}
            onChange={(e) => onChange('date_limite_situation', parseInt(e.target.value))}
            className={styles.input}
            min="1"
            max="31"
          />
        </div>
      </div>

      <div className={styles.sectionFooter}>
        <button onClick={onSave} disabled={saving} className={styles.saveButton}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder Section D'}
        </button>
      </div>

      <h3 className={styles.subsectionTitle}>Jalons de l'opération</h3>

      <div className={styles.tableHeader}>
        <button onClick={() => setShowJalonForm(!showJalonForm)} className={styles.addButton}>
          + Ajouter un jalon
        </button>
      </div>

      {showJalonForm && (
        <form onSubmit={handleJalonSubmit} className={styles.jalonForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom du jalon *</label>
              <input
                type="text"
                value={jalonFormData.name || ''}
                onChange={(e) => setJalonFormData({ ...jalonFormData, name: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <DateInput
              label="Date prévue *"
              value={jalonFormData.date_prevue}
              onChange={(val) => setJalonFormData({ ...jalonFormData, date_prevue: val })}
              required
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Type *</label>
              <select
                value={jalonFormData.type}
                onChange={(e) => setJalonFormData({ ...jalonFormData, type: e.target.value })}
                className={styles.select}
                required
              >
                <option value="demarrage">Démarrage</option>
                <option value="jalon_intermediaire">Jalon intermédiaire</option>
                <option value="reception_partielle">Réception partielle</option>
                <option value="reception_definitive">Réception définitive</option>
                <option value="dgd">DGD</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <ToggleSwitch
                label="Pénalité applicable ?"
                checked={jalonFormData.penalite_applicable}
                onChange={(val) => setJalonFormData({ ...jalonFormData, penalite_applicable: val })}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowJalonForm(false)} className={styles.cancelButton}>
              Annuler
            </button>
            <button type="submit" className={styles.saveButton}>
              Ajouter
            </button>
          </div>
        </form>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Date prévue</th>
            <th>Type</th>
            <th>Pénalité</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jalons.map(jalon => (
            <tr key={jalon.id}>
              <td>{jalon.name}</td>
              <td className={styles.mono}>{new Date(jalon.date_prevue).toLocaleDateString('fr-FR')}</td>
              <td>{jalon.type}</td>
              <td>{jalon.penalite_applicable ? '✓' : '—'}</td>
              <td>
                <span className={`${styles.status} ${styles['status_' + jalon.status]}`}>
                  {jalon.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => onDeleteJalon(jalon.id)}
                  className={styles.deleteButton}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {jalons.length === 0 && !showJalonForm && (
        <div className={styles.emptyState}>
          Aucun jalon enregistré. Cliquez sur "Ajouter un jalon" pour commencer.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION E — FINANCIER
// ═══════════════════════════════════════════════════════════

function SectionE({ formData, onChange, onSave, saving }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section E — Clauses financières</h2>
      
      <h3 className={styles.subsectionTitle}>Retenue de Garantie</h3>
      <div className={styles.formGrid}>
        <PercentInput
          label="Taux RG *"
          value={formData.rg_rate}
          onChange={(val) => onChange('rg_rate', val)}
          max={10}
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Mode RG *</label>
          <select
            value={formData.rg_mode || 'retenue'}
            onChange={(e) => onChange('rg_mode', e.target.value)}
            className={styles.select}
          >
            <option value="retenue">Retenue</option>
            <option value="caution">Caution bancaire</option>
            <option value="garantie_premiere_demande">Garantie à première demande</option>
          </select>
        </div>
      </div>

      <h3 className={styles.subsectionTitle}>Avance Forfaitaire</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <ToggleSwitch
            label="Avance forfaitaire ?"
            checked={formData.avance_forfaitaire || false}
            onChange={(val) => onChange('avance_forfaitaire', val)}
          />
        </div>

        {formData.avance_forfaitaire && (
          <>
            <PercentInput
              label="Taux avance *"
              value={formData.avance_forfaitaire_rate}
              onChange={(val) => onChange('avance_forfaitaire_rate', val)}
              max={20}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Base de calcul *</label>
              <select
                value={formData.avance_forfaitaire_base || 'ttc'}
                onChange={(e) => onChange('avance_forfaitaire_base', e.target.value)}
                className={styles.select}
              >
                <option value="ht">HT</option>
                <option value="ttc">TTC</option>
              </select>
            </div>

            <PercentInput
              label="Début remboursement (%) *"
              value={formData.avance_remb_debut}
              onChange={(val) => onChange('avance_remb_debut', val)}
            />

            <PercentInput
              label="Fin remboursement (%) *"
              value={formData.avance_remb_fin}
              onChange={(val) => onChange('avance_remb_fin', val)}
            />
          </>
        )}
      </div>

      <h3 className={styles.subsectionTitle}>Avance sur Approvisionnements</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <ToggleSwitch
            label="Avance sur approvisionnements ?"
            checked={formData.avance_appro || false}
            onChange={(val) => onChange('avance_appro', val)}
          />
        </div>

        {formData.avance_appro && (
          <PercentInput
            label="Taux avance appro *"
            value={formData.avance_appro_rate}
            onChange={(val) => onChange('avance_appro_rate', val)}
            max={80}
          />
        )}
      </div>

      <h3 className={styles.subsectionTitle}>Prorata</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mode prorata *</label>
          <select
            value={formData.prorata_mode || 'forfaitaire'}
            onChange={(e) => onChange('prorata_mode', e.target.value)}
            className={styles.select}
          >
            <option value="forfaitaire">Forfaitaire</option>
            <option value="reel">Réel</option>
            <option value="sans">Sans prorata</option>
          </select>
        </div>

        {formData.prorata_mode !== 'sans' && (
          <>
            <PercentInput
              label="Taux prorata *"
              value={formData.prorata_rate}
              onChange={(val) => onChange('prorata_rate', val)}
              max={5}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Gestionnaire prorata</label>
              <input
                type="text"
                value={formData.prorata_gestionnaire || ''}
                onChange={(e) => onChange('prorata_gestionnaire', e.target.value)}
                className={styles.input}
                placeholder="Ex: Azur BTP Group (lot 03)"
              />
            </div>
          </>
        )}
      </div>

      <h3 className={styles.subsectionTitle}>Révision de Prix</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <ToggleSwitch
            label="Révision de prix ?"
            checked={formData.revision_prix || false}
            onChange={(val) => onChange('revision_prix', val)}
          />
        </div>

        {formData.revision_prix && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Type de révision *</label>
            <select
              value={formData.revision_type || 'revisable'}
              onChange={(e) => onChange('revision_type', e.target.value)}
              className={styles.select}
            >
              <option value="ferme">Ferme</option>
              <option value="revisable">Révisable</option>
              <option value="actualisable">Actualisable</option>
            </select>
          </div>
        )}
      </div>

      <h3 className={styles.subsectionTitle}>Pénalités de Retard</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mode de calcul *</label>
          <select
            value={formData.penalite_retard_mode || 'par_jour'}
            onChange={(e) => onChange('penalite_retard_mode', e.target.value)}
            className={styles.select}
          >
            <option value="par_jour">Par jour</option>
            <option value="par_semaine">Par semaine</option>
            <option value="forfait">Forfait</option>
          </select>
        </div>

        <CurrencyInput
          label="Montant pénalité *"
          value={formData.penalite_retard_montant}
          onChange={(val) => onChange('penalite_retard_montant', val)}
        />

        <PercentInput
          label="Plafond pénalités (%) *"
          value={formData.penalite_plafond_rate}
          onChange={(val) => onChange('penalite_plafond_rate', val)}
          max={20}
        />

        <CurrencyInput
          label="Pénalité absence réunion *"
          value={formData.penalite_absence_reunion}
          onChange={(val) => onChange('penalite_absence_reunion', val)}
        />
      </div>

      <h3 className={styles.subsectionTitle}>Insertion Sociale</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <ToggleSwitch
            label="Clause d'insertion sociale ?"
            checked={formData.insertion_sociale || false}
            onChange={(val) => onChange('insertion_sociale', val)}
          />
        </div>

        {formData.insertion_sociale && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Heures prévues *</label>
            <input
              type="number"
              value={formData.insertion_heures_prevues || ''}
              onChange={(e) => onChange('insertion_heures_prevues', parseInt(e.target.value))}
              className={styles.input}
              min="0"
            />
          </div>
        )}
      </div>

      <div className={styles.sectionFooter}>
        <button onClick={onSave} disabled={saving} className={styles.saveButton}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder Section E'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION F — ENTREPRISES
// ═══════════════════════════════════════════════════════════

function SectionF({ lots }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Section F — Lots & Entreprises</h2>
      
      <p className={styles.infoText}>
        Cette section affiche les lots de l'opération et leurs entreprises associées.
        Les informations détaillées des entreprises (assurances, cautions, etc.) sont gérées 
        dans le module "Entreprises" du dashboard.
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Lot</th>
            <th>Description</th>
            <th>Montant HT</th>
            <th>Durée (mois)</th>
            <th>Entreprise</th>
            <th>SIRET</th>
            <th>Indice</th>
          </tr>
        </thead>
        <tbody>
          {lots.map(lot => (
            <tr key={lot.id}>
              <td className={styles.mono}>{lot.number}</td>
              <td>{lot.description || lot.name}</td>
              <td className={styles.currency}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(lot.montant_ht || 0)}
              </td>
              <td>{lot.duree_mois || '—'}</td>
              <td>{lot.entreprise_name || '—'}</td>
              <td className={styles.mono}>{lot.entreprise_siret || '—'}</td>
              <td className={styles.mono}>{lot.revision_indice_reference || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {lots.length === 0 && (
        <div className={styles.emptyState}>
          Aucun lot enregistré pour cette opération.
        </div>
      )}
    </div>
  );
}

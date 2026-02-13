'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SectionProgress from '@/components/ui/SectionProgress';
import SiretInput from '@/components/ui/SiretInput';
import DocumentCard from '@/components/ui/DocumentCard';
import InsuranceCard from '@/components/ui/InsuranceCard';
import CurrencyInput from '@/components/ui/CurrencyInput';
import DateInput from '@/components/ui/DateInput';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import styles from './pedigree.module.css';

export default function PedigreeEntreprisePage() {
  const params = useParams();
  const router = useRouter();
  const entrepriseId = params.entrepriseId;

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [sousTraitants, setSousTraitants] = useState([]);

  const tabs = [
    { id: 'info', label: 'Informations', icon: '📋' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'assurances', label: 'Assurances', icon: '🛡️' },
    { id: 'cautions', label: 'Cautions', icon: '💰' },
    { id: 'st', label: 'Sous-traitants', icon: '👷' },
    { id: 'params', label: 'Paramètres', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchPedigree();
  }, []);

  const fetchPedigree = async () => {
    try {
      const res = await fetch(`/api/entreprises/${entrepriseId}/pedigree`);
      const json = await res.json();
      setData(json.entreprise || {});
      setDocuments(json.documents || []);
      setSousTraitants(json.sousTraitants || []);
    } catch (error) {
      console.error('Error fetching pedigree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/entreprises/${entrepriseId}/pedigree/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert('Enregistré avec succès');
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('entreprise_id', entrepriseId);
    formData.append('operation_id', data.operation_id || '');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      await fetchPedigree();
    } else {
      throw new Error('Upload failed');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Confirmer la suppression ?')) return;

    await fetch(`/api/entreprises/${entrepriseId}/documents/${docId}`, {
      method: 'DELETE'
    });

    await fetchPedigree();
  };

  const getDocumentByType = (type) => {
    return documents.find(d => d.type === type);
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedigree Entreprise</h1>
          <p className={styles.subtitle}>{data.name}</p>
        </div>
        <SectionProgress completion={data.pedigree_completion || 0} />
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* TAB: INFO */}
        {activeTab === 'info' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Informations générales</h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Raison sociale *</label>
                <input
                  type="text"
                  value={data.name || ''}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <SiretInput
                label="SIRET *"
                value={data.siret}
                onChange={(val) => setData({ ...data, siret: val })}
              />

              <div className={styles.formGroup}>
                <label className={styles.label}>Code NAF</label>
                <input
                  type="text"
                  value={data.naf_code || ''}
                  onChange={(e) => setData({ ...data, naf_code: e.target.value })}
                  className={styles.input}
                  placeholder="Ex: 4399C"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Adresse *</label>
                <input
                  type="text"
                  value={data.address || ''}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ville *</label>
                <input
                  type="text"
                  value={data.city || ''}
                  onChange={(e) => setData({ ...data, city: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Code postal *</label>
                <input
                  type="text"
                  value={data.postal_code || ''}
                  onChange={(e) => setData({ ...data, postal_code: e.target.value })}
                  className={styles.input}
                  maxLength={5}
                />
              </div>
            </div>

            <h3 className={styles.subsectionTitle}>Contact principal</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom complet *</label>
                <input
                  type="text"
                  value={data.contact_name || ''}
                  onChange={(e) => setData({ ...data, contact_name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  value={data.contact_email || ''}
                  onChange={(e) => setData({ ...data, contact_email: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Téléphone *</label>
                <input
                  type="tel"
                  value={data.contact_phone || ''}
                  onChange={(e) => setData({ ...data, contact_phone: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>

            <h3 className={styles.subsectionTitle}>Conducteur de travaux</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom complet</label>
                <input
                  type="text"
                  value={data.conducteur_travaux_name || ''}
                  onChange={(e) => setData({ ...data, conducteur_travaux_name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={data.conducteur_travaux_email || ''}
                  onChange={(e) => setData({ ...data, conducteur_travaux_email: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Téléphone</label>
                <input
                  type="tel"
                  value={data.conducteur_travaux_phone || ''}
                  onChange={(e) => setData({ ...data, conducteur_travaux_phone: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* TAB: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Documents obligatoires</h2>
            
            <div className={styles.documentsGrid}>
              <DocumentCard
                type="kbis"
                title="KBIS (< 3 mois)"
                document={getDocumentByType('kbis')}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                required
              />

              <DocumentCard
                type="rib"
                title="RIB"
                document={getDocumentByType('rib')}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                required
              />

              <DocumentCard
                type="dpgf"
                title="DPGF signé"
                document={getDocumentByType('dpgf')}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                required
              />

              <DocumentCard
                type="acte_engagement"
                title="Acte d'engagement signé"
                document={getDocumentByType('acte_engagement')}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                required
              />

              <DocumentCard
                type="ccap_lot"
                title="CCAP du lot"
                document={getDocumentByType('ccap_lot')}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
              />
            </div>
          </div>
        )}

        {/* TAB: ASSURANCES */}
        {activeTab === 'assurances' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Assurances obligatoires</h2>

            <InsuranceCard
              type="rc"
              title="Assurance Responsabilité Civile Professionnelle"
              data={{
                assureur: data.assurance_rc_assureur,
                numero: data.assurance_rc_numero,
                montant: data.assurance_rc_montant,
                expire: data.assurance_rc_expire
              }}
              document={getDocumentByType('assurance_rc')}
              onChange={(newData) => setData({
                ...data,
                assurance_rc_assureur: newData.assureur,
                assurance_rc_numero: newData.numero,
                assurance_rc_montant: newData.montant,
                assurance_rc_expire: newData.expire
              })}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
            />

            <InsuranceCard
              type="decennale"
              title="Assurance Décennale"
              data={{
                assureur: data.assurance_decennale_assureur,
                numero: data.assurance_decennale_numero,
                activites: data.assurance_decennale_activites,
                expire: data.assurance_decennale_expire
              }}
              document={getDocumentByType('assurance_decennale')}
              onChange={(newData) => setData({
                ...data,
                assurance_decennale_assureur: newData.assureur,
                assurance_decennale_numero: newData.numero,
                assurance_decennale_activites: newData.activites,
                assurance_decennale_expire: newData.expire
              })}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
            />

            <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* TAB: CAUTIONS */}
        {activeTab === 'cautions' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Caution de garantie</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Type de caution *</label>
                <select
                  value={data.caution_type || ''}
                  onChange={(e) => setData({ ...data, caution_type: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Sélectionner...</option>
                  <option value="retenue_garantie">Retenue de garantie (5%)</option>
                  <option value="caution_bancaire">Caution bancaire</option>
                  <option value="caution_assurance">Caution d'assurance</option>
                </select>
              </div>

              {data.caution_type && data.caution_type !== 'retenue_garantie' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Organisme émetteur *</label>
                    <input
                      type="text"
                      value={data.caution_organisme || ''}
                      onChange={(e) => setData({ ...data, caution_organisme: e.target.value })}
                      className={styles.input}
                      placeholder="Ex: BNP Paribas, AXA..."
                    />
                  </div>

                  <CurrencyInput
                    label="Montant de la caution *"
                    value={data.caution_montant}
                    onChange={(val) => setData({ ...data, caution_montant: val })}
                  />

                  <DateInput
                    label="Date de fin de validité *"
                    value={data.caution_date_fin}
                    onChange={(val) => setData({ ...data, caution_date_fin: val })}
                  />

                  <div className={styles.documentSection}>
                    <DocumentCard
                      type="caution"
                      title="Attestation de caution"
                      document={getDocumentByType('caution')}
                      onUpload={handleUploadDocument}
                      onDelete={handleDeleteDocument}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* TAB: SOUS-TRAITANTS */}
        {activeTab === 'st' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sous-traitants déclarés</h2>

            {sousTraitants.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aucun sous-traitant déclaré pour le moment.</p>
              </div>
            ) : (
              <div className={styles.stList}>
                {sousTraitants.map(st => (
                  <div key={st.id} className={styles.stCard}>
                    <div className={styles.stInfo}>
                      <h4>{st.name}</h4>
                      <p>SIRET: {st.siret}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className={styles.secondaryButton}>
              Demander l'agrément d'un nouveau sous-traitant
            </button>
          </div>
        )}

        {/* TAB: PARAMETRES */}
        {activeTab === 'params' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Paramètres du compte</h2>

            <h3 className={styles.subsectionTitle}>Changer le mot de passe</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mot de passe actuel</label>
                <input type="password" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nouveau mot de passe</label>
                <input type="password" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmer le mot de passe</label>
                <input type="password" className={styles.input} />
              </div>
            </div>

            <button className={styles.saveButton}>
              Modifier le mot de passe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

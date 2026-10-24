import React, { useState, useEffect } from 'react';
import Chat from './Chat';

function Dashboard({ onLogout }) {
  const [role, setRole] = useState('');
  const [nom, setNom] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [nonLus, setNonLus] = useState({});
  const [resultatsExcel, setResultatsExcel] = useState([]);
  
  // IA
  const [formData, setFormData] = useState({ csr: 95.5, debit_mbps: 13.8, latence_ms: 32.5, disponibilite_pct: 99.2 });
  const [resultatIA, setResultatIA] = useState(null);
  
  // Données
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [plaintes, setPlaintes] = useState([]);
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState([]);
  
  // Formulaires
  const [nouvellePub, setNouvellePub] = useState({ titre: '', contenu: '', type_offre: 'Internet' });
  const [plainteForm, setPlainteForm] = useState({ operateur_id: 2, categorie: 'Internet mobile', description: '', note: 5, region: '' });
  const [messageSucces, setMessageSucces] = useState('');

  // Chat
  const [chatContactId, setChatContactId] = useState(null);
  const [chatContactNom, setChatContactNom] = useState('');

  const getHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  // Récupérer les messages non lus pour les badges
  const fetchNonLus = async () => {
    try {
      const res = await fetch('http://localhost:8000/chat/non-lus', { headers: getHeaders() });
      if (res.ok) setNonLus(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('http://localhost:8000/artec/import-excel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setResultatsExcel(data.resultats || []);
        alert(data.message);
      } else {
        alert("Erreur lors de l'import. Vérifiez le format du fichier.");
      }
    } catch (e) {
      alert("Erreur de connexion au serveur.");
    }
  };  

  useEffect(() => {
    const userRole = localStorage.getItem('role') || 'visiteur';
    const userName = localStorage.getItem('nom') || 'Visiteur';
    setRole(userRole);
    setNom(userName);
    
    if (userRole === 'admin') setActiveTab('admin_users');
    else if (userRole === 'artec') setActiveTab('artec_plaintes');
    else if (userRole === 'operateur') setActiveTab('op_publications');
    else setActiveTab('visiteur_offres');

    if (userRole === 'admin') fetchAdminUsers();
    if (userRole === 'artec') { fetchArtecPlaintes(); fetchOperateurs(); }
    if (userRole === 'visiteur' || userRole === 'operateur') {
      fetchPublications();
      if (userRole === 'visiteur') fetchStats();
    }

    fetchNonLus();
    const interval = setInterval(fetchNonLus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminUsers = async () => { try { const res = await fetch('http://localhost:8000/admin/utilisateurs', { headers: getHeaders() }); if (res.ok) setUtilisateurs(await res.json()); } catch (e) {} };
  const fetchArtecPlaintes = async () => { try { const res = await fetch('http://localhost:8000/artec/plaintes', { headers: getHeaders() }); if (res.ok) setPlaintes(await res.json()); } catch (e) {} };
  const fetchPublications = async () => { try { const res = await fetch('http://localhost:8000/visiteur/publications'); if (res.ok) setPublications(await res.json()); } catch (e) {} };
  const fetchStats = async () => { try { const res = await fetch('http://localhost:8000/visiteur/statistiques'); if (res.ok) setStats(await res.json()); } catch (e) {} };
  const fetchOperateurs = async () => { try { const res = await fetch('http://localhost:8000/artec/operateurs', { headers: getHeaders() }); if (res.ok) setUtilisateurs(await res.json()); } catch (e) {} };

  const handleIAPredict = async (e) => {
    e.preventDefault();
    try { const res = await fetch('http://localhost:8000/predict', { method: 'POST', headers: getHeaders(), body: JSON.stringify(formData) }); if (res.ok) setResultatIA(await res.json()); } catch (e) {}
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try { const res = await fetch(`http://localhost:8000/admin/utilisateur/${id}/statut?actif=${!currentStatus}`, { method: 'PUT', headers: getHeaders() }); if (res.ok) fetchAdminUsers(); } catch (e) {}
  };

  const handleCreerPublication = async (e) => {
    e.preventDefault();
    try { const res = await fetch('http://localhost:8000/operateur/publication', { method: 'POST', headers: getHeaders(), body: JSON.stringify(nouvellePub) }); if (res.ok) { alert("Publication créée !"); setNouvellePub({ titre: '', contenu: '', type_offre: 'Internet' }); fetchPublications(); } } catch (e) {}
  };

  const handleDeposerPlainte = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/visiteur/plainte', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plainteForm) });
      if (res.ok) { setMessageSucces("Plainte déposée avec succès !"); setPlainteForm({ operateur_id: 2, categorie: 'Internet mobile', description: '', note: 5, region: '' }); setTimeout(() => setMessageSucces(''), 5000); }
    } catch (e) {}
  };

  const ouvrirChat = (id, nomContact) => {
    setChatContactId(id);
    setChatContactNom(nomContact);
    setActiveTab('chat');
    setTimeout(fetchNonLus, 500); // Rafraîchir les badges après ouverture
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 p-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">🏛️ ARTEC Platform</h1>
          <p className="text-sm text-slate-400">Bonjour, <span className="text-blue-400 font-semibold">{nom}</span> ({role})</p>
        </div>
        
        <div className="flex gap-2 items-center flex-wrap">
          {/* Menu ARTEC */}
          {role === 'artec' && (
            <>
              <button onClick={() => setActiveTab('artec_plaintes')} className={`px-4 py-2 rounded-lg ${activeTab === 'artec_plaintes' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>📋 Plaintes</button>
              <button onClick={() => setActiveTab('artec_ia')} className={`px-4 py-2 rounded-lg ${activeTab === 'artec_ia' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>🧠 IA</button>
              <button onClick={() => { setActiveTab('chat'); setChatContactId(null); setChatContactNom(''); }} className={`px-4 py-2 rounded-lg ${activeTab === 'chat' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>💬 Chat</button>
            </>
          )}

          {/* Menu Opérateur */}
          {role === 'operateur' && (
            <>
              <button onClick={() => setActiveTab('op_publications')} className={`px-4 py-2 rounded-lg ${activeTab === 'op_publications' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>📱 Mes offres</button>
              
              {/* BOUTON CHAT AVEC BADGE */}
              <button onClick={() => { ouvrirChat(1, 'ARTEC'); }} className={`relative px-4 py-2 rounded-lg ${activeTab === 'chat' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                💬 Chat avec l'ARTEC
                {nonLus[1] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {nonLus[1]}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Menu VISITEUR */}
          {role === 'visiteur' && (
            <>
              <button onClick={() => setActiveTab('visiteur_offres')} className={`px-4 py-2 rounded-lg ${activeTab === 'visiteur_offres' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>📱 Offres</button>
              <button onClick={() => setActiveTab('visiteur_stats')} className={`px-4 py-2 rounded-lg ${activeTab === 'visiteur_stats' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>📊 Statistiques</button>
              <button onClick={() => setActiveTab('visiteur_plainte')} className={`px-4 py-2 rounded-lg ${activeTab === 'visiteur_plainte' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>📝 Déposer plainte</button>
            </>
          )}

          <button onClick={onLogout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold ml-4">Quitter</button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        
        {/* ADMIN */}
        {role === 'admin' && activeTab === 'admin_users' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Gestion des Utilisateurs</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-600"><th className="p-2">Nom</th><th className="p-2">Email</th><th className="p-2">Rôle</th><th className="p-2">Statut</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {utilisateurs.map(u => (
                  <tr key={u.id} className="border-b border-slate-700">
                    <td className="p-2">{u.nom}</td><td className="p-2">{u.email}</td><td className="p-2 uppercase text-xs">{u.role}</td>
                    <td className="p-2">{u.est_actif ? <span className="text-green-400">Actif</span> : <span className="text-red-400">Bloqué</span>}</td>
                    <td className="p-2"><button onClick={() => toggleUserStatus(u.id, u.est_actif)} className={`px-3 py-1 rounded text-sm ${u.est_actif ? 'bg-red-600' : 'bg-green-600'}`}>{u.est_actif ? 'Désactiver' : 'Activer'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ARTEC : IA */}
        {role === 'artec' && activeTab === 'artec_ia' && (
          <div className="space-y-8">
            {/* Formulaire IA manuel */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Prédiction QoS (IA manuelle)</h2>
              <form onSubmit={handleIAPredict} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-slate-400">CSR (%)</label><input type="number" step="0.1" value={formData.csr} onChange={e => setFormData({...formData, csr: parseFloat(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg" /></div>
                  <div><label className="text-sm text-slate-400">Débit (Mbps)</label><input type="number" step="0.1" value={formData.debit_mbps} onChange={e => setFormData({...formData, debit_mbps: parseFloat(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg" /></div>
                  <div><label className="text-sm text-slate-400">Latence (ms)</label><input type="number" step="0.1" value={formData.latence_ms} onChange={e => setFormData({...formData, latence_ms: parseFloat(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg" /></div>
                  <div><label className="text-sm text-slate-400">Disponibilité (%)</label><input type="number" step="0.1" value={formData.disponibilite_pct} onChange={e => setFormData({...formData, disponibilite_pct: parseFloat(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg" /></div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold">Analyser</button>
              </form>
              {resultatIA && <div className="mt-6 text-center bg-slate-700 p-4 rounded-lg"><div className="text-5xl font-bold text-green-400">{resultatIA.score_qos}</div><div className="text-slate-400 mt-2">{resultatIA.interpretation}</div></div>}
            </div>

            {/* Import Excel */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-4">📂 Import de données Excel/CSV</h2>
              <p className="text-sm text-slate-400 mb-4">
                Uploadez un fichier contenant les colonnes : <code>csr</code>, <code>debit_mbps</code>, <code>latence_ms</code>, <code>disponibilite_pct</code>.
              </p>
              
              <input 
                type="file" 
                accept=".csv, .xlsx" 
                onChange={handleUploadExcel}
                className="w-full bg-slate-700 p-3 rounded-lg border border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />

              {resultatsExcel.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-green-400 mb-2">Résultats de l'analyse ({resultatsExcel.length} lignes)</h3>
                  <div className="max-h-60 overflow-y-auto bg-slate-900 rounded-lg p-2">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="border-b border-slate-700"><th className="p-2">Ligne</th><th className="p-2">Score QoS</th><th className="p-2">Interprétation</th></tr></thead>
                      <tbody>
                        {resultatsExcel.map((r, i) => (
                          <tr key={i} className="border-b border-slate-800"><td className="p-2">#{i + 1}</td><td className="p-2 font-bold text-blue-400">{r.score_qos}</td><td className="p-2">{r.interpretation}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ARTEC : Plaintes */}
        {role === 'artec' && activeTab === 'artec_plaintes' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Plaintes des Visiteurs</h2>
            {plaintes.length === 0 ? <p className="text-slate-400">Aucune plainte pour l'instant.</p> : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-slate-600"><th className="p-2">Opérateur</th><th className="p-2">Catégorie</th><th className="p-2">Description</th><th className="p-2">Note</th><th className="p-2">Statut</th></tr></thead>
                <tbody>{plaintes.map(p => (<tr key={p.id} className="border-b border-slate-700"><td className="p-2 font-bold text-blue-400">Op. {p.operateur_id}</td><td className="p-2">{p.categorie}</td><td className="p-2 text-sm">{p.description}</td><td className="p-2">{p.note}/10</td><td className="p-2 text-yellow-400">{p.statut}</td></tr>))}</tbody>
              </table>
            )}
          </div>
        )}

        {/* ARTEC : Chat (liste des opérateurs) */}
        {role === 'artec' && activeTab === 'chat' && !chatContactId && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Choisir un opérateur pour discuter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {utilisateurs.filter(u => u.role === 'operateur').map(op => (
                <button key={op.id} onClick={() => ouvrirChat(op.id, op.nom)} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg border border-slate-600 text-left relative">
                  <h3 className="font-bold text-blue-400">{op.nom}</h3>
                  <p className="text-sm text-slate-400 mt-1">Cliquez pour discuter</p>
                  {nonLus[op.id] > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {nonLus[op.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OPÉRATEUR : Publications */}
        {role === 'operateur' && activeTab === 'op_publications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Créer une offre</h2>
              <form onSubmit={handleCreerPublication} className="space-y-4">
                <div><label className="text-sm text-slate-400">Titre</label><input type="text" required value={nouvellePub.titre} onChange={e => setNouvellePub({...nouvellePub, titre: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1" /></div>
                <div><label className="text-sm text-slate-400">Type</label><select value={nouvellePub.type_offre} onChange={e => setNouvellePub({...nouvellePub, type_offre: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1"><option>Internet</option><option>Appels</option><option>SMS</option><option>Forfait</option></select></div>
                <div><label className="text-sm text-slate-400">Description</label><textarea required rows="4" value={nouvellePub.contenu} onChange={e => setNouvellePub({...nouvellePub, contenu: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1"></textarea></div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold">Publier</button>
              </form>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Mes offres</h2>
              <div className="space-y-4">{publications.map((p, i) => (<div key={i} className="bg-slate-700 p-4 rounded-lg border border-slate-600"><div className="text-xs text-blue-400 uppercase font-bold">{p.type}</div><h3 className="text-lg font-bold mt-1">{p.titre}</h3><p className="text-sm text-slate-300 mt-2">{p.contenu}</p></div>))}</div>
            </div>
          </div>
        )}

        {/* CHAT : Affichage de la conversation */}
        {activeTab === 'chat' && chatContactId && (
          <div className="max-w-3xl mx-auto">
            <Chat contactId={chatContactId} contactNom={chatContactNom} onClose={() => setActiveTab(role === 'artec' ? 'artec_plaintes' : 'op_publications')} />
          </div>
        )}

        {/* VISITEUR : Offres */}
        {role === 'visiteur' && activeTab === 'visiteur_offres' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Offres des Opérateurs</h2>
            {publications.length === 0 ? <p className="text-slate-400">Aucune offre disponible.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publications.map((p, i) => (<div key={i} className="bg-slate-700 p-4 rounded-lg border border-slate-600"><div className="text-xs text-blue-400 uppercase font-bold">{p.operateur}</div><h3 className="text-lg font-bold mt-1">{p.titre}</h3><p className="text-sm text-slate-300 mt-2">{p.contenu}</p><div className="mt-3 text-xs bg-slate-800 inline-block px-2 py-1 rounded">{p.type}</div></div>))}
              </div>
            )}
          </div>
        )}

        {/* VISITEUR : Stats */}
        {role === 'visiteur' && activeTab === 'visiteur_stats' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Statistiques Publiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-slate-700 p-4 rounded-lg border border-slate-600 text-center">
                  <h3 className="text-lg font-bold text-blue-400">{s.operateur}</h3>
                  <p className="text-3xl font-bold mt-2 text-white">{s.note_moyenne} <span className="text-sm text-slate-400">/10</span></p>
                  <p className="text-xs text-slate-400 mt-1">{s.nombre_plaintes} plainte(s)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISITEUR : Plainte */}
        {role === 'visiteur' && activeTab === 'visiteur_plainte' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Déposer une plainte</h2>
            {messageSucces && <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded-lg mb-4 text-sm text-center">{messageSucces}</div>}
            <form onSubmit={handleDeposerPlainte} className="space-y-4">
              <div><label className="text-sm text-slate-400">Opérateur concerné</label>
                <select value={plainteForm.operateur_id} onChange={e => setPlainteForm({...plainteForm, operateur_id: parseInt(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg mt-1">
                  <option value={2}>Orange Madagascar</option><option value={3}>Yas Madagascar</option><option value={4}>Airtel Madagascar</option>
                </select>
              </div>
              <div><label className="text-sm text-slate-400">Catégorie</label>
                <select value={plainteForm.categorie} onChange={e => setPlainteForm({...plainteForm, categorie: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1">
                  <option>Appels téléphoniques</option><option>SMS</option><option>Internet mobile</option><option>Couverture réseau</option><option>Prix et facturation</option><option>Service client</option>
                </select>
              </div>
              <div><label className="text-sm text-slate-400">Description</label><textarea required rows="3" value={plainteForm.description} onChange={e => setPlainteForm({...plainteForm, description: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1" placeholder="Décrivez votre problème..."></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-slate-400">Note (0 à 10)</label><input type="number" min="0" max="10" value={plainteForm.note} onChange={e => setPlainteForm({...plainteForm, note: parseInt(e.target.value)})} className="w-full bg-slate-700 p-3 rounded-lg mt-1" /></div>
                <div><label className="text-sm text-slate-400">Région (optionnel)</label><input type="text" value={plainteForm.region} onChange={e => setPlainteForm({...plainteForm, region: e.target.value})} className="w-full bg-slate-700 p-3 rounded-lg mt-1" placeholder="Ex: Antananarivo" /></div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold">Envoyer ma plainte</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default Dashboard;
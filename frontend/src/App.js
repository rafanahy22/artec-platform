import React, { useState, useEffect } from 'react';

// --- COMPOSANT DE CONNEXION ---
function Login({ onLogin, onVisiteur }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: motDePasse })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erreur de connexion');
      onLogin(data.utilisateur);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏛️ ARTEC Platform</h1>
          <p className="text-slate-400">Connectez-vous à votre espace</p>
        </div>
        {erreur && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm">{erreur}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Mot de passe</label>
            <input type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 outline-none transition" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 mt-4">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={onVisiteur} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
            Vous êtes un visiteur ? Donnez votre avis ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANT ESPACE VISITEUR ---
function EspaceVisiteur({ onRetour }) {
  const [formData, setFormData] = useState({ operateur_nom: "Orange", note: 8, commentaire: "", service: "Internet", region: "Antananarivo" });
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/avis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (response.ok) { setSucces(true); setTimeout(() => setSucces(false), 3000); }
    } catch (err) { alert("Erreur"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">🌐 Espace Visiteur</h1>
          <button onClick={onRetour} className="text-slate-400 hover:text-white transition text-sm">Retour</button>
        </div>
        {succes && <div className="bg-green-900/50 text-green-300 p-3 rounded-lg mb-4 text-center">Merci ! Avis enregistré.</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Opérateur</label>
              <select value={formData.operateur_nom} onChange={(e) => setFormData({...formData, operateur_nom: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 outline-none">
                <option value="Orange">Orange</option><option value="Yas">Yas</option><option value="Airtel">Airtel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Service</label>
              <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 outline-none">
                <option value="Appels">Appels</option><option value="SMS">SMS</option><option value="Internet">Internet</option><option value="Facturation">Facturation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Note : {formData.note}/10</label>
            <input type="range" min="0" max="10" value={formData.note} onChange={(e) => setFormData({...formData, note: parseInt(e.target.value)})} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Commentaire</label>
            <textarea required value={formData.commentaire} onChange={(e) => setFormData({...formData, commentaire: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 outline-none h-20 resize-none"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">Envoyer</button>
        </form>
      </div>
    </div>
  );
}

// --- COMPOSANT DASHBOARD COMPLET ---
function Dashboard({ utilisateur, onLogout }) {
  const [onglet, setOnglet] = useState('ia');
  const [formData, setFormData] = useState({ csr: 95.5, debit_mbps: 13.8, latence_ms: 32.5, disponibilite_pct: 99.2 });
  const [resultat, setResultat] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (onglet === 'stats') {
      fetch('http://127.0.0.1:8000/statistiques')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.log(err));
    }
  }, [onglet]);

  const handleIA = async (e) => {
    e.preventDefault(); setLoadingIA(true); setResultat(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await response.json(); setResultat(data);
    } catch (err) { alert("Erreur API"); } finally { setLoadingIA(false); }
  };

  const getScoreColor = (score) => score <= 40 ? 'text-red-500' : score <= 60 ? 'text-orange-500' : score <= 80 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">🏛️ ARTEC Platform</h1>
          <p className="text-sm text-slate-400">Bonjour, <span className="text-blue-400 font-semibold">{utilisateur.nom}</span> ({utilisateur.role})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOnglet('ia')} className={`px-4 py-2 rounded-lg transition ${onglet === 'ia' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>🤖 IA</button>
          <button onClick={() => setOnglet('stats')} className={`px-4 py-2 rounded-lg transition ${onglet === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>📊 Stats</button>
          <button onClick={() => setOnglet('import')} className={`px-4 py-2 rounded-lg transition ${onglet === 'import' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>📁 Import</button>
          <button onClick={() => setOnglet('chat')} className={`px-4 py-2 rounded-lg transition ${onglet === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>💬 Chat</button>
          <button onClick={onLogout} className="ml-2 md:ml-4 bg-red-600/20 text-red-400 hover:bg-red-600/40 px-4 py-2 rounded-lg transition">Quitter</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 min-h-[500px]">
        {onglet === 'ia' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">🧠 Prédiction QoS</h2>
              <form onSubmit={handleIA} className="space-y-3">
                {Object.keys(formData).map((key) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-300 mb-1 capitalize">{key.replace('_', ' ')}</label>
                    <input type="number" step="0.1" name={key} value={formData[key]} onChange={(e) => setFormData({...formData, [key]: parseFloat(e.target.value)})}
                      className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:border-blue-500 outline-none" />
                  </div>
                ))}
                <button type="submit" disabled={loadingIA} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-4">
                  {loadingIA ? "Analyse..." : "Analyser"}
                </button>
              </form>
            </div>
            <div className="flex flex-col justify-center items-center bg-slate-700/50 rounded-xl p-6 border border-slate-600">
              {resultat ? (
                <div className="text-center w-full">
                  <div className={`text-6xl font-bold ${getScoreColor(resultat.score_qos)} mb-2`}>{resultat.score_qos}</div>
                  <div className="text-slate-400 text-sm mb-6">/ 100</div>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 inline-block w-full">
                    <p className={`text-lg font-semibold ${getScoreColor(resultat.score_qos)}`}>{resultat.interpretation}</p>
                  </div>
                </div>
              ) : <p className="text-slate-400">Lancez l'analyse.</p>}
            </div>
          </div>
        )}

        {onglet === 'stats' && (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6">📊 Satisfaction des opérateurs</h2>
            {stats.length === 0 ? <p className="text-slate-400">Aucun avis pour le moment.</p> : (
              <div className="space-y-6">
                {stats.map(s => (
                  <div key={s.operateur}>
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span className="font-bold">{s.operateur}</span>
                      <span>{s.moyenne} / 10 ({s.total_avis} avis)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                      <div className={`h-4 rounded-full ${s.moyenne >= 7 ? 'bg-green-500' : s.moyenne >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                           style={{ width: `${(s.moyenne / 10) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet === 'import' && (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center min-h-[400px]">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-10 hover:border-blue-500 transition cursor-pointer bg-slate-800/50">
              <p className="text-4xl mb-4">📁</p>
              <p className="text-white font-bold mb-2">Glissez votre fichier CSV ici</p>
              <p className="text-slate-400 text-sm">ou cliquez pour parcourir</p>
            </div>
          </div>
        )}

        {onglet === 'chat' && (
          <div className="p-8 flex flex-col h-[500px]">
            <h2 className="text-xl font-semibold text-white mb-4">💬 Messagerie ARTEC ↔ Opérateur</h2>
            <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700">
              <div className="bg-slate-700 text-white p-3 rounded-lg w-max max-w-md mb-2">Bonjour, nous avons reçu votre plainte concernant la latence.</div>
              <div className="bg-blue-600 text-white p-3 rounded-lg w-max max-w-md mb-2 ml-auto">Bonjour, nous sommes en train de vérifier nos antennes.</div>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Écrivez un message..." className="flex-1 bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 outline-none" />
              <button className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-500 transition">Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [modeVisiteur, setModeVisiteur] = useState(false);

  return (
    <>
      {modeVisiteur ? <EspaceVisiteur onRetour={() => setModeVisiteur(false)} /> 
      : !utilisateur ? <Login onLogin={setUtilisateur} onVisiteur={() => setModeVisiteur(true)} /> 
      : <Dashboard utilisateur={utilisateur} onLogout={() => setUtilisateur(null)} />}
    </>
  );
}

export default App;
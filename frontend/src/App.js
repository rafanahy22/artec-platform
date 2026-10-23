import React, { useState } from 'react';

// --- COMPOSANT DE CONNEXION ---
function Login({ onLogin }) {
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
      
      onLogin(data.utilisateur); // On envoie les infos au parent (App)
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
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Mot de passe</label>
            <input type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 mt-6">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-slate-500">
          Pas encore de compte ? Contactez l'ARTEC.
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANT DASHBOARD (Ton ancien App) ---
function Dashboard({ utilisateur, onLogout }) {
  const [formData, setFormData] = useState({ csr: 95.5, debit_mbps: 13.8, latence_ms: 32.5, disponibilite_pct: 99.2 });
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultat(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResultat(data);
    } catch (err) {
      alert("Erreur API");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= 40) return 'text-red-500';
    if (score <= 60) return 'text-orange-500';
    if (score <= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Barre de navigation */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white">🏛️ ARTEC Platform</h1>
          <p className="text-sm text-slate-400">Connecté en tant que : <span className="text-blue-400 font-semibold">{utilisateur.nom}</span> ({utilisateur.role})</p>
        </div>
        <button onClick={onLogout} className="bg-red-600/20 text-red-400 hover:bg-red-600/40 px-4 py-2 rounded-lg transition">
          Déconnexion
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Tableau de bord IA</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">📊 Indicateurs QoS</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-slate-300 mb-1 capitalize">{key.replace('_', ' ')}</label>
                  <input type="number" step="0.1" name={key} value={formData[key]} onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 mt-4">
                {loading ? "Analyse..." : "🧠 Analyser"}
              </button>
            </form>
          </div>
          {/* Résultat */}
          <div className="flex flex-col justify-center items-center bg-slate-700/50 rounded-xl p-6 border border-slate-600">
            <h3 className="text-xl font-semibold text-white mb-6">Résultat</h3>
            {!resultat && !loading && <p className="text-slate-400 text-center">Lancez l'analyse.</p>}
            {loading && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>}
            {resultat && (
              <div className="text-center w-full">
                <div className={`text-6xl font-bold ${getScoreColor(resultat.score_qos)} mb-2`}>{resultat.score_qos}</div>
                <div className="text-slate-400 text-sm mb-6">/ 100</div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 inline-block w-full">
                  <p className="text-slate-300 text-sm mb-1">Interprétation</p>
                  <p className={`text-lg font-semibold ${getScoreColor(resultat.score_qos)}`}>{resultat.interpretation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANT PRINCIPAL (App) ---
function App() {
  const [utilisateur, setUtilisateur] = useState(null); // null = non connecté

  return (
    <>
      {!utilisateur ? (
        <Login onLogin={setUtilisateur} />
      ) : (
        <Dashboard utilisateur={utilisateur} onLogout={() => setUtilisateur(null)} />
      )}
    </>
  );
}

export default App;
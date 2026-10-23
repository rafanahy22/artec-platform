import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    csr: 95.5,
    debit_mbps: 13.8,
    latence_ms: 32.5,
    disponibilite_pct: 99.2
  });
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    setResultat(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      setResultat(data);
    } catch (err) {
      setErreur("Impossible de contacter l'API. Vérifiez que le backend Python est lancé (uvicorn).");
    } finally {
      setLoading(false);
    }
  };

  // Couleur en fonction du score
  const getScoreColor = (score) => {
    if (score <= 40) return 'text-red-500';
    if (score <= 60) return 'text-orange-500';
    if (score <= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white tracking-wide">🏛️ ARTEC Platform</h1>
          <p className="text-blue-100 mt-2">Plateforme intelligente de régulation des télécommunications</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Formulaire */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              📊 Indicateurs QoS
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">CSR (%)</label>
                <input type="number" step="0.1" name="csr" value={formData.csr} onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Débit moyen (Mbps)</label>
                <input type="number" step="0.1" name="debit_mbps" value={formData.debit_mbps} onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Latence moyenne (ms)</label>
                <input type="number" step="0.1" name="latence_ms" value={formData.latence_ms} onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Disponibilité (%)</label>
                <input type="number" step="0.1" name="disponibilite_pct" value={formData.disponibilite_pct} onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 mt-4">
                {loading ? "Analyse en cours..." : "🧠 Analyser avec l'IA"}
              </button>
            </form>
          </div>

          {/* Résultat */}
          <div className="flex flex-col justify-center items-center bg-slate-700/50 rounded-xl p-6 border border-slate-600">
            <h2 className="text-xl font-semibold text-white mb-6">Résultat</h2>
            
            {!resultat && !erreur && !loading && (
              <p className="text-slate-400 text-center">Remplissez le formulaire et lancez l'analyse.</p>
            )}

            {loading && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            )}

            {erreur && (
              <p className="text-red-400 text-center text-sm bg-red-900/30 p-4 rounded-lg border border-red-800">{erreur}</p>
            )}

            {resultat && (
              <div className="text-center w-full animate-fade-in">
                <div className={`text-6xl font-bold ${getScoreColor(resultat.score_qos)} mb-2`}>
                  {resultat.score_qos}
                </div>
                <div className="text-slate-400 text-sm mb-6">/ 100</div>
                
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 inline-block w-full">
                  <p className="text-slate-300 text-sm mb-1">Interprétation</p>
                  <p className={`text-lg font-semibold ${getScoreColor(resultat.score_qos)}`}>
                    {resultat.interpretation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
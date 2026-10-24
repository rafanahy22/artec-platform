import React, { useState } from 'react';

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
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', motDePasse);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!response.ok) throw new Error('Email ou mot de passe incorrect');

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('nom', data.nom);
      onLogin(data.access_token, data.role);

    } catch (err) {
      setErreur("Erreur de connexion. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">🏛️ ARTEC Platform</h1>
          <p className="text-slate-400 mt-2">Connectez-vous à votre espace</p>
        </div>

        {erreur && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="admin@artec.mg" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Mot de passe</label>
            <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 mt-2">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* 🔓 BOUTON VISITEUR SANS COMPTE */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button onClick={onVisiteur}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            🌐 Continuer en tant que Visiteur
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">Accès public sans inscription</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
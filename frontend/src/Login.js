import React, { useState } from 'react';

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
      // FastAPI utilise le format "form-data" pour le login (OAuth2)
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', motDePasse);

      // CORRECTION ICI : localhost au lieu de 127.0.0.1
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const data = await response.json();
      // On sauvegarde le token dans le navigateur
      localStorage.setItem('token', data.access_token);
      onLogin(data.access_token); // On prévient App.js que la connexion est réussie

    } catch (err) {
      setErreur(err.message);
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
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="admin@artec.mg"
              required 
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={motDePasse} 
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
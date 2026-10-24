import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [modeVisiteur, setModeVisiteur] = useState(false);

  const handleLogin = (nouveauToken) => setToken(nouveauToken);
  
  const handleVisiteur = () => {
    localStorage.setItem('role', 'visiteur');
    localStorage.setItem('nom', 'Visiteur');
    setModeVisiteur(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('nom');
    setToken(null);
    setModeVisiteur(false);
  };

  return (
    <>
      {token || modeVisiteur ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} onVisiteur={handleVisiteur} />
      )}
    </>
  );
}

export default App;
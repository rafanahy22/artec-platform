import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (nouveauToken) => {
    setToken(nouveauToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <>
      {token ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
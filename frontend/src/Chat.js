import React, { useState, useEffect, useRef } from 'react';

function Chat({ contactId, contactNom, onClose }) {
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Charger l'historique des messages
  const chargerMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/chat/historique/${contactId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) { console.error(e); }
  };

  // Marquer les messages comme lus
  const marquerCommeLu = async () => {
    try {
      await fetch(`http://localhost:8000/chat/marquer-lu/${contactId}`, {
        method: 'PUT',
        headers: getHeaders()
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    chargerMessages();
    marquerCommeLu(); // On marque comme lu dès qu'on ouvre le chat
    
    // Rafraîchir les messages toutes les 3 secondes
    const interval = setInterval(chargerMessages, 3000);
    return () => clearInterval(interval);
  }, [contactId]);

  // Faire défiler vers le bas quand un nouveau message arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoyer un message
  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat/envoyer', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ destinataire_id: contactId, contenu: nouveauMessage })
      });
      if (res.ok) {
        setNouveauMessage('');
        chargerMessages();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[600px]">
      {/* En-tête */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
        <h3 className="font-bold text-white">💬 Discussion avec {contactNom}</h3>
        {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-500 text-center text-sm mt-10">Aucun message. Commencez la discussion !</p>
        )}
        {messages.map((msg, i) => {
          const estMoi = msg.expediteur_id !== contactId;
          return (
            <div key={i} className={`flex ${estMoi ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${estMoi ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}>
                <p className="text-sm">{msg.contenu}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.date_envoi).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={envoyerMessage} className="p-4 border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={nouveauMessage} 
          onChange={(e) => setNouveauMessage(e.target.value)}
          placeholder="Écrivez un message..."
          className="flex-1 bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-lg disabled:opacity-50">
          Envoyer
        </button>
      </form>
    </div>
  );
}

export default Chat;
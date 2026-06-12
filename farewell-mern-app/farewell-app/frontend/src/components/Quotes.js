import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Quotes.css';

const DEFAULT_QUOTES = [
  { _id: 'd1', text: 'You have been my friend. That in itself is a tremendous thing.', author: 'E.B. White' },
  { _id: 'd2', text: 'How lucky I am to have something that makes saying goodbye so hard.', author: 'A.A. Milne' },
  { _id: 'd3', text: "Don't cry because it's over. Smile because it happened.", author: 'Dr. Seuss' },
  { _id: 'd4', text: "The best is yet to come — and won't that be fine?", author: 'Frank Sinatra' },
  { _id: 'd5', text: "We didn't realize we were making memories, we just knew we were having fun.", author: 'Winnie the Pooh' },
  { _id: 'd6', text: 'College is not the best years of your life — they are the foundation of it.', author: 'Unknown' },
];

export default function Quotes({ refresh }) {
  const [quotes, setQuotes]   = useState([]);
  const [newText, setNewText] = useState('');
  const [newAuth, setNewAuth] = useState('');
  const { isAdmin }           = useAuth();

  const fetchQuotes = async () => {
    try {
      const { data } = await api.get('/quotes');
      setQuotes(data.length ? data : DEFAULT_QUOTES);
    } catch {
      setQuotes(DEFAULT_QUOTES);
    }
  };

  useEffect(() => { fetchQuotes(); }, [refresh]);

  const addQuote = async () => {
    if (!newText.trim()) return;
    await api.post('/quotes', { text: newText, author: newAuth || 'Anonymous' });
    setNewText('');
    setNewAuth('');
    fetchQuotes();
  };

  const deleteQuote = async (id) => {
    if (!window.confirm('Delete quote?')) return;
    await api.delete(`/quotes/${id}`);
    fetchQuotes();
  };

  return (
    <section id="quotes" className="section quotes-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">words that stay</span>
          <h2 className="section-title">Beautiful Lines</h2>
          <p className="section-desc">Some feelings are better borrowed than invented.</p>
        </div>

        {isAdmin && (
          <div className="quote-add-form">
            <textarea
              placeholder="Type a quote or beautiful line…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
            />
            <input
              type="text"
              placeholder="Author (optional)"
              value={newAuth}
              onChange={(e) => setNewAuth(e.target.value)}
            />
            <button onClick={addQuote}>Add Quote +</button>
          </div>
        )}

        <div className="quotes-wall">
          {quotes.map((q, i) => (
            <div key={q._id} className="quote-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="quote-mark">"</div>
              <p className="quote-text">{q.text}</p>
              <span className="quote-author">— {q.author}</span>
              {isAdmin && !q._id.startsWith('d') && (
                <button className="quote-delete" onClick={() => deleteQuote(q._id)}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

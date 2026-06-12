import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Videos.css';

export default function Videos({ refresh }) {
  const [videos, setVideos] = useState([]);
  const [toast, setToast]   = useState('');
  const { isAdmin }         = useAuth();

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/media');
      setVideos(data.filter((m) => m.type === 'video'));
    } catch { /* */ }
  };

  useEffect(() => { fetchVideos(); }, [refresh]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this video?')) return;
    setVideos((prev) => prev.filter((v) => v._id !== id));
    try {
      await api.delete(`/media/${id}`);
      showToast('Video deleted.');
    } catch {
      showToast('❌ Delete failed — are you logged in as admin?');
      fetchVideos();
    }
  };

  return (
    <section id="videos" className="section">
      {toast && <div className="video-toast">{toast}</div>}

      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">moving pictures</span>
          <h2 className="section-title">Videos Together</h2>
          <p className="section-desc">The ones that move — literally and emotionally.</p>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <span>🎬</span>
            <p>{isAdmin ? 'Upload your first video using the panel →' : 'Videos coming soon…'}</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((vid) => (
              <div key={vid._id} className="video-card">
                <div className="video-wrapper">
                  <video controls preload="metadata" playsInline>
                    <source src={vid.url} />
                    Your browser doesn't support video.
                  </video>
                </div>
                <div className="video-footer">
                  {vid.caption && <p className="video-caption">{vid.caption}</p>}
                  {isAdmin && (
                    <button
                      className="video-delete"
                      onClick={(e) => handleDelete(e, vid._id)}
                      title="Delete video"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

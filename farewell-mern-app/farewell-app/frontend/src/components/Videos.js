import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Videos.css';

export default function Videos({ refresh }) {
  const [videos, setVideos] = useState([]);
  const { isAdmin }         = useAuth();
  const sectionRef          = useRef();

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/media');
      setVideos(data.filter((m) => m.type === 'video'));
    } catch {/* */ }
  };

  useEffect(() => { fetchVideos(); }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    await api.delete(`/media/${id}`);
    fetchVideos();
  };

  return (
    <section id="videos" className="section" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">moving pictures</span>
          <h2 className="section-title">Videos Together</h2>
          <p className="section-desc">The ones that move — literally and emotionally.</p>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <span>🎬</span>
            <p>{isAdmin ? 'Upload your first video using the admin panel ↓' : 'Videos coming soon…'}</p>
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
                {vid.caption && <p className="video-caption">{vid.caption}</p>}
                {isAdmin && (
                  <button className="video-delete" onClick={() => handleDelete(vid._id)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

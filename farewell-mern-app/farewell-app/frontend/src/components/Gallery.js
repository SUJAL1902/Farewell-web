import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Gallery.css';

export default function Gallery({ refresh }) {
  const [images, setImages]     = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const { isAdmin }             = useAuth();
  const sectionRef              = useRef();

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/media');
      setImages(data.filter((m) => m.type === 'image'));
    } catch {/* handled */ }
  };

  useEffect(() => { fetchImages(); }, [refresh]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.gallery-item').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [images]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    await api.delete(`/media/${id}`);
    fetchImages();
  };

  return (
    <section id="gallery" className="section" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">moments captured</span>
          <h2 className="section-title">Our Gallery</h2>
          <p className="section-desc">Every frame holds a laugh we never want to forget.</p>
        </div>

        {images.length === 0 ? (
          <div className="empty-state">
            <span>📷</span>
            <p>{isAdmin ? 'Upload your first photo using the admin panel ↓' : 'Photos coming soon…'}</p>
          </div>
        ) : (
          <div className="masonry">
            {images.map((img, i) => (
              <div
                key={img._id}
                className="gallery-item"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Memory'}
                  loading="lazy"
                  onClick={() => setLightbox(img)}
                />
                {img.caption && <div className="gallery-caption">{img.caption}</div>}
                {isAdmin && (
                  <button className="delete-btn" onClick={() => handleDelete(img._id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.url} alt={lightbox.caption || ''} onClick={(e) => e.stopPropagation()} />
          {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
        </div>
      )}
    </section>
  );
}

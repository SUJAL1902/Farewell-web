import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Gallery.css';

export default function Gallery({ refresh }) {
  const [images, setImages]     = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [toast, setToast]       = useState('');
  const { isAdmin }             = useAuth();

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/media');
      setImages(data.filter((m) => m.type === 'image'));
    } catch { /* handled */ }
  };

  useEffect(() => { fetchImages(); }, [refresh]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo?')) return;
    setImages((prev) => prev.filter((img) => img._id !== id));
    if (lightbox?._id === id) setLightbox(null);
    try {
      await api.delete(`/media/${id}`);
      showToast('Photo deleted.');
    } catch {
      showToast('❌ Delete failed — are you logged in as admin?');
      fetchImages();
    }
  };

  const openLightbox = (img, idx) => { setLightbox(img); setLightboxIdx(idx); };

  const prevImage = (e) => {
    e.stopPropagation();
    const i = (lightboxIdx - 1 + images.length) % images.length;
    setLightbox(images[i]);
    setLightboxIdx(i);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const i = (lightboxIdx + 1) % images.length;
    setLightbox(images[i]);
    setLightboxIdx(i);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prevImage(e);
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, lightboxIdx]);

  // Duplicate items for seamless infinite loop
  const loopItems = images.length > 0 ? [...images, ...images] : [];

  return (
    <section id="gallery" className="section gallery-section">
      {toast && <div className="gallery-toast">{toast}</div>}

      {/* Section Header */}
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">moments captured</span>
          <h2 className="section-title">Our Gallery</h2>
          <p className="section-desc">Every frame holds a laugh we never want to forget.</p>
        </div>
      </div>

      {/* Filmstrip */}
      {images.length === 0 ? (
        <div className="container">
          <div className="empty-state">
            <span>📷</span>
            <p>{isAdmin ? 'Upload your first photo using the panel →' : 'Photos coming soon…'}</p>
          </div>
        </div>
      ) : (
        <div className="filmstrip-outer">
          {/* Soft fade edges */}
          <div className="filmstrip-fade filmstrip-fade--left" />
          <div className="filmstrip-fade filmstrip-fade--right" />

          <div className="film-track" style={{ '--count': images.length }}>
            {loopItems.map((img, i) => (
              <div
                key={`${img._id}-${i}`}
                className="film-card"
                onClick={() => openLightbox(img, i % images.length)}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Memory'}
                  loading="lazy"
                  draggable={false}
                />
                <div className="film-overlay">
                  <span className="film-zoom">⊕</span>
                  {img.caption && <p className="film-caption">{img.caption}</p>}
                </div>
                {isAdmin && i < images.length && (
                  <button
                    className="film-delete"
                    onClick={(e) => handleDelete(e, img._id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>

          {images.length > 1 && (
            <>
              <button className="lightbox-nav lightbox-prev" onClick={prevImage}>‹</button>
              <button className="lightbox-nav lightbox-next" onClick={nextImage}>›</button>
            </>
          )}

          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || ''} />
            {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
          </div>

          <span className="lightbox-counter">{lightboxIdx + 1} / {images.length}</span>
        </div>
      )}
    </section>
  );
}

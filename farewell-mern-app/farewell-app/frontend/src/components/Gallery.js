import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Gallery.css';

export default function Gallery({ refresh }) {
  const [images, setImages]     = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [toast, setToast]       = useState('');
  const { isAdmin }             = useAuth();
  const sectionRef              = useRef();

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/media');
      setImages(data.filter((m) => m.type === 'image'));
    } catch { /* handled */ }
  };

  useEffect(() => { fetchImages(); }, [refresh]);

  // Intersection observer for scroll-reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll('.bento-item').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [images]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo?')) return;
    // Optimistic removal
    setImages((prev) => prev.filter((img) => img._id !== id));
    if (lightbox?._id === id) setLightbox(null);
    try {
      await api.delete(`/media/${id}`);
      showToast('Photo deleted.');
    } catch (err) {
      showToast('❌ Delete failed — are you logged in as admin?');
      fetchImages(); // revert on error
    }
  };

  const openLightbox = (img, idx) => { setLightbox(img); setLightboxIdx(idx); };
  const prevImage = (e) => { e.stopPropagation(); const i = (lightboxIdx - 1 + images.length) % images.length; setLightbox(images[i]); setLightboxIdx(i); };
  const nextImage = (e) => { e.stopPropagation(); const i = (lightboxIdx + 1) % images.length; setLightbox(images[i]); setLightboxIdx(i); };

  // keyboard nav
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

  return (
    <section id="gallery" className="section" ref={sectionRef}>
      {/* Toast */}
      {toast && <div className="gallery-toast">{toast}</div>}

      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">moments captured</span>
          <h2 className="section-title">Our Gallery</h2>
          <p className="section-desc">Every frame holds a laugh we never want to forget.</p>
        </div>

        {images.length === 0 ? (
          <div className="empty-state">
            <span>📷</span>
            <p>{isAdmin ? 'Upload your first photo using the panel →' : 'Photos coming soon…'}</p>
          </div>
        ) : (
          <div className="bento-grid">
            {images.map((img, i) => (
              <div
                key={img._id}
                className={`bento-item ${i === 0 ? 'bento-item--featured' : ''}`}
                onClick={() => openLightbox(img, i)}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Memory'}
                  loading="lazy"
                />
                <div className="bento-overlay">
                  {img.caption && <p className="bento-caption">{img.caption}</p>}
                  {isAdmin && (
                    <button
                      className="bento-delete"
                      onClick={(e) => handleDelete(e, img._id)}
                      title="Delete photo"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

          <img
            src={lightbox.url}
            alt={lightbox.caption || ''}
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
          <span className="lightbox-counter">{lightboxIdx + 1} / {images.length}</span>
        </div>
      )}
    </section>
  );
}

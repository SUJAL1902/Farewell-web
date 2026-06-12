import React, { useState, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
import './AdminPanel.css';

export default function AdminPanel({ onUpload }) {
  const { isAdmin }             = useAuth();
  const [open, setOpen]         = useState(false);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [caption, setCaption]   = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast]       = useState({ msg: '', type: '' });
  const [dragging, setDragging] = useState(false);
  const fileInputRef            = useRef();

  if (!isAdmin) return null;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const processFile = (f) => {
    if (!f) return;
    const isVid = f.type.startsWith('video');
    const limit = isVid ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    const limitLabel = isVid ? `${MAX_VIDEO_MB} MB` : `${MAX_IMAGE_MB} MB`;
    if (f.size > limit) {
      showToast(`❌ File too large. Max ${limitLabel} for ${isVid ? 'videos' : 'images'}.`, 'error');
      return;
    }
    setFile(f);
    const type = isVid ? 'video' : 'image';
    setMediaType(type);
    const url = URL.createObjectURL(f);
    setPreview({ url, type });
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return showToast('Please select a file first.', 'error');
    setUploading(true);
    setProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('caption', caption);

      await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      showToast('✅ Uploaded successfully!');
      setFile(null);
      setPreview(null);
      setCaption('');
      setProgress(0);
      setMediaType('');
      onUpload();
    } catch {
      showToast('❌ Upload failed. Check file type or size.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* FAB */}
      <button
        className={`admin-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((p) => !p)}
        title="Admin Upload Panel"
      >
        {open ? (
          <svg className="fab-icon fab-icon--close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg className="fab-icon fab-icon--upload" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && <div className="admin-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <aside className={`admin-drawer ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="admin-drawer-header">
          <div>
            <h3 className="admin-drawer-title">Upload Media</h3>
            <p className="admin-drawer-sub">Images max 10 MB · Videos max 50 MB</p>
          </div>
          <button className="admin-drawer-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="drop-preview">
              {preview.type === 'image' ? (
                <img src={preview.url} alt="preview" className="preview-img" />
              ) : (
                <video src={preview.url} className="preview-video" muted />
              )}
              <div className="preview-info">
                <span className={`media-badge ${mediaType}`}>
                  {mediaType === 'video' ? '🎬 Video' : '📷 Image'}
                </span>
                <span className="preview-name">{file?.name}</span>
                <span className="preview-size">
                  {file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                </span>
              </div>
              <button className="preview-clear" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="drop-placeholder">
              <div className="drop-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="drop-text">Drag & drop or <span>browse</span></p>
              <p className="drop-hint">Images max {MAX_IMAGE_MB} MB · Videos max {MAX_VIDEO_MB} MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            hidden
          />
        </div>

        {/* Caption */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="caption-input">
            Caption <span className="admin-label-opt">(optional)</span>
          </label>
          <input
            id="caption-input"
            type="text"
            className="admin-input"
            placeholder="Add a caption for this memory…"
            value={caption}
            maxLength={120}
            onChange={(e) => setCaption(e.target.value)}
          />
          <span className="admin-charcount">{caption.length}/120</span>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
            <span className="upload-progress-label">{progress}%</span>
          </div>
        )}

        {/* Toast */}
        {toast.msg && (
          <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
        )}

        {/* Actions */}
        <div className="admin-actions">
          <button className="admin-cancel-btn" onClick={clearFile} disabled={!file || uploading}>
            Clear
          </button>
          <button
            className="admin-upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? `Uploading… ${progress}%` : '↑ Upload'}
          </button>
        </div>
      </aside>
    </>
  );
}

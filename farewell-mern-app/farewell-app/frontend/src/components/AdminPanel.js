import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

export default function AdminPanel({ onUpload }) {
  const { isAdmin }         = useAuth();
  const [open, setOpen]     = useState(false);
  const [file, setFile]     = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]       = useState('');

  if (!isAdmin) return null;

  const handleUpload = async () => {
    if (!file) return setMsg('Please select a file first.');
    setUploading(true);
    setMsg('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('caption', caption);
      await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('✅ Uploaded successfully!');
      setFile(null);
      setCaption('');
      onUpload();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Upload failed. Check file type/size.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* FAB trigger */}
      <button className="admin-fab" onClick={() => setOpen((p) => !p)} title="Admin Panel">
        {open ? '✕' : '⚙'}
      </button>

      {/* Panel */}
      <div className={`admin-panel ${open ? 'open' : ''}`}>
        <h3 className="admin-panel-title">Admin Upload</h3>
        <p className="admin-panel-sub">Images & videos (max 100 MB each)</p>

        <label className="file-label">
          {file ? file.name : 'Choose file…'}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => { setFile(e.target.files[0]); setMsg(''); }}
            hidden
          />
        </label>

        <input
          type="text"
          className="admin-input"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {msg && <p className="admin-msg">{msg}</p>}

        <button className="admin-upload-btn" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload ↑'}
        </button>
      </div>
    </>
  );
}

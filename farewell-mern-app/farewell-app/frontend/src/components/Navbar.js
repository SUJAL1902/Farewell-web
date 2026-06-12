import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',    href: '#hero' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Videos',  href: '#videos' },
  { label: 'Quotes',  href: '#quotes' },
];

export default function Navbar() {
  const { logout, isAdmin } = useAuth();
  const navigate            = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">
        <span className="nav-brand">Batch '22–'26 <span>✦</span></span>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
          {isAdmin && <li className="admin-badge">Admin</li>}
          <li>
            <button className="logout-btn" onClick={handleLogout}>Leave</button>
          </li>
        </ul>

        <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen((p) => !p)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

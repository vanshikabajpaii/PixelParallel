import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { href: '#hero',       label: 'Home' },
  { href: '#simd',       label: 'SIMD Concepts' },
  { href: '#simulator',  label: 'Simulator' },
  { href: '#advantages', label: 'Advantages' },
  { href: '#conclusion', label: 'Conclusion' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleLink(e, href) {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <a href="#hero" className="navbar-logo" onClick={e => handleLink(e, '#hero')}>
          <span className="logo-icon">▣</span>
          <span className="logo-text">
            <span className="logo-pixel">Pixel</span>
            <span className="logo-parallel">Parallel</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="navbar-links">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={e => handleLink(e, href)}>{label}</a>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={e => handleLink(e, href)}>{label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

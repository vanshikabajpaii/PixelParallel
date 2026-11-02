import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo-icon">▣</span>
          <span>
            <span className="logo-pixel">Pixel</span>
            <span className="logo-parallel">Parallel</span>
          </span>
        </div>
        <p className="footer-tagline">
          One Instruction. Multiple Pixels. Parallel Processing.
        </p>
        <p className="footer-note">
          An educational SIMD simulation built with React + Vite + HTML Canvas API.
          <br />
          No actual CPU SIMD instructions are executed — this is a pedagogical model.
        </p>
        <p className="footer-credit">
          Computer Organization &amp; Architecture · Undergraduate Activity · {year}
        </p>
      </div>
    </footer>
  );
}

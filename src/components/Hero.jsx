import './Hero.css';

function PixelGrid() {
  // 8x6 decorative pixel grid representing parallel processing
  const rows = 6;
  const cols = 8;
  const groups = [
    [0,1,2,3],   // group 0 - blue
    [4,5,6,7],   // group 1 - cyan
    [8,9,10,11], // group 2 - purple
  ];

  function getGroupColor(idx) {
    if (groups[0].includes(idx)) return 'blue';
    if (groups[1].includes(idx)) return 'cyan';
    if (groups[2].includes(idx)) return 'purple';
    return 'dim';
  }

  return (
    <div className="pixel-grid-hero">
      {Array.from({ length: rows * cols }, (_, i) => (
        <div key={i} className={`pixel-cell-hero ${getGroupColor(i % (cols))}`}
          style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
      ))}
    </div>
  );
}

function VectorDiagram() {
  const lanes = [
    { id: 'P1', val: 10 }, { id: 'P2', val: 20 },
    { id: 'P3', val: 30 }, { id: 'P4', val: 40 },
  ];

  return (
    <div className="vector-diagram">
      <div className="vector-label">Input Vector</div>
      <div className="vector-lanes">
        {lanes.map(l => (
          <div key={l.id} className="vector-lane">
            <div className="lane-id">{l.id}</div>
            <div className="lane-val">{l.val}</div>
          </div>
        ))}
      </div>
      <div className="vector-instruction">▼ ADD 5 (Single Instruction)</div>
      <div className="vector-lanes output">
        {lanes.map(l => (
          <div key={l.id} className="vector-lane out">
            <div className="lane-id">{l.id}</div>
            <div className="lane-val">{l.val + 5}</div>
          </div>
        ))}
      </div>
      <div className="vector-label">Output Vector</div>
    </div>
  );
}

export default function Hero() {
  function scrollTo(id) {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg-grid" aria-hidden="true" />
      <div className="container hero-inner">
        {/* Text column */}
        <div className="hero-text fade-in">
          <div className="badge badge-cyan" style={{ marginBottom: '1.25rem' }}>
            Computer Architecture · SIMD
          </div>
          <h1 className="hero-heading">
            Understanding SIMD<br />
            Through <span className="gradient-text">Image Processing</span>
          </h1>
          <p className="hero-tagline">
            One Instruction. Multiple Pixels. Parallel Processing.
          </p>
          <p className="hero-desc">
            SIMD — <strong>Single Instruction, Multiple Data</strong> — is a class of parallel
            computation where one instruction operates on multiple data elements simultaneously.
            Image processing is a perfect illustration: millions of pixels often need the same
            operation applied at once.
          </p>
          <p className="hero-desc">
            PixelParallel lets you interactively compare <em>sequential</em> pixel-by-pixel
            processing against <em>SIMD-style vectorized</em> processing, helping you see exactly
            how instruction-count reduction works in practice.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => scrollTo('#simulator')}>
              ▶ Open Simulator
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('#simd')}>
              Learn SIMD Concepts
            </button>
          </div>
        </div>

        {/* Visual column */}
        <div className="hero-visual fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="hero-card">
            <div className="hero-card-header">
              <span className="badge badge-cyan">SIMD Vector Processing</span>
            </div>
            <PixelGrid />
            <VectorDiagram />
            <p className="hero-visual-caption">
              One instruction applied to all four lanes simultaneously
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

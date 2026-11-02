import './Conclusion.css';

const LEARNING_OUTCOMES = [
  { icon: '🔑', text: 'Understand what SIMD means and how it differs from scalar and multi-core processing.' },
  { icon: '🛤️', text: 'Explain vector lanes and how one instruction can simultaneously process multiple data elements.' },
  { icon: '🖼️', text: 'Describe why image processing is an ideal candidate for SIMD vectorisation.' },
  { icon: '📉', text: 'Calculate and interpret instruction-count reduction using the SIMD instruction count formula.' },
  { icon: '⚡', text: 'Explain SIMD operation and its advantages for data-intensive tasks.' },
];

export default function Conclusion() {
  function scrollToSimulator() {
    document.querySelector('#simulator')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="conclusion" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Summary</div>
          <h2>Conclusion</h2>
        </div>

        {/* Main conclusion paragraph */}
        <div className="conclusion-block card card-accent">
          <div className="conclusion-icon">🏁</div>
          <p className="conclusion-text">
            SIMD architecture improves the efficiency of data-intensive tasks by applying a{' '}
            <strong>single instruction</strong> to <strong>multiple data elements</strong> simultaneously.
            Image processing is an excellent example because millions of pixels often require identical
            operations. By comparing sequential and vectorized processing, we can understand how SIMD{' '}
            <strong>reduces instruction overhead</strong> and enables efficient{' '}
            <strong>data-parallel computation</strong>.
          </p>
        </div>

        {/* Learning outcomes */}
        <div className="lo-section" style={{ marginTop: '2.5rem' }}>
          <div className="lo-header">
            <span className="badge badge-purple">Expected Learning Outcome</span>
            <h3>What You Should Now Be Able to Explain</h3>
          </div>
          <div className="lo-list">
            {LEARNING_OUTCOMES.map((item, i) => (
              <div key={i} className="lo-item card">
                <span className="lo-icon">{item.icon}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key formula recap */}
        <div className="formula-recap card" style={{ marginTop: '2rem' }}>
          <h3>Key Formula Recap</h3>
          <div className="formula-grid">
            <FormulaBox
              title="Sequential Instructions"
              formula="N"
              desc="Each of N pixels needs its own instruction."
              color="blue"
            />
            <FormulaBox
              title="SIMD Instructions"
              formula="⌈ N / W ⌉"
              desc="N pixels grouped into vectors of width W. Ceiling handles partial last group."
              color="cyan"
            />
            <FormulaBox
              title="Instruction Reduction"
              formula="(N − ⌈N/W⌉) / N × 100%"
              desc="Percentage reduction in instruction count due to vectorisation."
              color="green"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="conclusion-cta">
          <p>Ready to explore it interactively?</p>
          <button className="btn btn-primary btn-lg" onClick={scrollToSimulator}>
            ▶ Back to Simulator
          </button>
        </div>
      </div>
    </section>
  );
}

function FormulaBox({ title, formula, desc, color }) {
  return (
    <div className={`formula-box accent-${color}`}>
      <div className="formula-title">{title}</div>
      <div className={`formula-expr ${color}`}>{formula}</div>
      <p className="formula-desc">{desc}</p>
    </div>
  );
}

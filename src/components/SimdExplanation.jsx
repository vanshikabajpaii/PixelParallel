import './SimdExplanation.css';

/* ---- Sub-components ---- */

function ConceptCard({ icon, title, description, accent = 'blue' }) {
  return (
    <div className={`concept-card card accent-${accent}`}>
      <div className="concept-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function VectorLaneDiagram() {
  const inputs  = [10, 20, 30, 40];
  const outputs = [15, 25, 35, 45];

  return (
    <div className="lane-diagram">
      <div className="lane-diagram-title">SIMD: ADD 5 applied to all 4 lanes simultaneously</div>

      {/* Input */}
      <div className="ld-row">
        <div className="ld-label">Input</div>
        <div className="ld-lanes">
          {inputs.map((v, i) => (
            <div key={i} className="ld-lane input">
              <div className="ld-lane-name">Lane {i + 1}</div>
              <div className="ld-lane-val">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Instruction */}
      <div className="ld-row instruction-row">
        <div className="ld-label">Instr</div>
        <div className="ld-instruction">
          <span className="instr-arrow">↓</span>
          <span className="instr-text">ADD 5</span>
          <span className="instr-arrow">↓</span>
          <span className="instr-text">ADD 5</span>
          <span className="instr-arrow">↓</span>
          <span className="instr-text">ADD 5</span>
          <span className="instr-arrow">↓</span>
          <span className="instr-text">ADD 5</span>
        </div>
      </div>

      {/* Output */}
      <div className="ld-row">
        <div className="ld-label">Output</div>
        <div className="ld-lanes">
          {outputs.map((v, i) => (
            <div key={i} className="ld-lane output">
              <div className="ld-lane-name">Lane {i + 1}</div>
              <div className="ld-lane-val">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ld-note">
        1 instruction → 4 data elements processed → 4× reduction in instruction count
      </div>
    </div>
  );
}

function ScalarVsSimd() {
  return (
    <div className="scalar-simd-compare">
      {/* Scalar */}
      <div className="compare-col">
        <div className="compare-header scalar">
          <span>🔢</span> Scalar (Sequential)
        </div>
        <div className="compare-steps">
          {[10, 20, 30, 40].map((v, i) => (
            <div key={i} className="scalar-step">
              <span className="step-instr">ADD 5</span>
              <span className="step-arrow">→</span>
              <span className="step-data">{v}</span>
              <span className="step-arrow">→</span>
              <span className="step-result">{v + 5}</span>
            </div>
          ))}
          <div className="compare-count">4 instructions</div>
        </div>
      </div>

      <div className="compare-vs">VS</div>

      {/* SIMD */}
      <div className="compare-col">
        <div className="compare-header simd">
          <span>⚡</span> SIMD (Vectorized)
        </div>
        <div className="compare-steps">
          <div className="simd-step">
            <span className="step-instr">VADD 5</span>
            <span className="step-arrow">→</span>
            <div className="simd-data-group">
              {[10, 20, 30, 40].map((v, i) => (
                <span key={i} className="simd-lane">[{v}]</span>
              ))}
            </div>
            <span className="step-arrow">→</span>
            <div className="simd-data-group">
              {[15, 25, 35, 45].map((v, i) => (
                <span key={i} className="simd-lane out">[{v}]</span>
              ))}
            </div>
          </div>
          <div className="compare-count highlight">1 instruction</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Component ---- */

const CONCEPTS = [
  {
    icon: '🔤',
    title: 'Single Instruction',
    description: 'One instruction is fetched, decoded, and dispatched by the CPU — not one per data element.',
    accent: 'blue',
  },
  {
    icon: '📦',
    title: 'Multiple Data',
    description: 'That one instruction operates on several data elements at the same time using vector registers.',
    accent: 'cyan',
  },
  {
    icon: '🗂️',
    title: 'Vector Registers',
    description: 'Wide registers (e.g., 128-bit XMM, 256-bit YMM) that store multiple values packed together.',
    accent: 'purple',
  },
  {
    icon: '🛤️',
    title: 'Vector Lanes',
    description: 'Individual slots within a vector register. A 128-bit register can hold four 32-bit values — four lanes.',
    accent: 'blue',
  },
  {
    icon: '⚡',
    title: 'Data-Level Parallelism',
    description: 'Independent data elements processed simultaneously without needing multiple CPU cores.',
    accent: 'cyan',
  },
  {
    icon: '🏗️',
    title: 'Different from Multi-core',
    description: 'SIMD is intra-core parallelism using vector units — distinct from spawning threads across CPU cores.',
    accent: 'purple',
  },
];

export default function SimdExplanation() {
  return (
    <section id="simd" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Core Concepts</div>
          <h2>Understanding SIMD Architecture</h2>
          <p>
            <strong>S</strong>ingle <strong>I</strong>nstruction, <strong>M</strong>ultiple{' '}
            <strong>D</strong>ata — how one instruction can simultaneously process many pixels.
          </p>
        </div>

        {/* Concept cards */}
        <div className="grid-3 concepts-grid">
          {CONCEPTS.map(c => (
            <ConceptCard key={c.title} {...c} />
          ))}
        </div>

        {/* Visual lane diagram */}
        <div style={{ marginTop: '3rem' }}>
          <VectorLaneDiagram />
        </div>

        {/* Scalar vs SIMD comparison */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3>Scalar vs. SIMD Processing</h3>
            <p>The same ADD 5 operation on four values — sequential vs. vectorized.</p>
          </div>
          <ScalarVsSimd />
        </div>

        {/* Clarification note */}
        <div className="info-box" style={{ marginTop: '2rem' }}>
          <strong style={{ color: '#58a6ff' }}>📌 Important clarification:</strong>{' '}
          SIMD uses <em>vector instructions</em> (such as Intel SSE/AVX or ARM NEON) that operate
          within a <em>single CPU core</em>. This is fundamentally different from multi-core
          parallelism, where separate cores each execute their own instruction stream. SIMD
          exploits <em>data-level parallelism</em>; multi-core exploits <em>task-level parallelism</em>.
        </div>
      </div>
    </section>
  );
}

import './ComparisonDashboard.css';
import { calculateMetrics, formatNumber } from '../utils/performanceCalculator';

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="cmp-bar-track">
      <div className="cmp-bar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="cmp-bar-val">{formatNumber(value)}</span>
    </div>
  );
}

/**
 * ComparisonDashboard
 *
 * Props:
 *   totalPixels   {number}
 *   vectorWidth   {number}
 *   seqProgress   {number} 0-100
 *   simdProgress  {number} 0-100
 *   seqDone       {boolean}
 *   simdDone      {boolean}
 */
export default function ComparisonDashboard({
  totalPixels = 0,
  vectorWidth = 4,
  seqProgress = 0,
  simdProgress = 0,
}) {
  if (!totalPixels) {
    return (
      <div className="cmp-empty card">
        <span>📊</span>
        <p>Load an image to see the comparison dashboard</p>
      </div>
    );
  }

  const m = calculateMetrics(totalPixels, vectorWidth);

  return (
    <div className="cmp-dashboard">
      {/* Header row */}
      <div className="cmp-header-row">
        <div className="cmp-col-label" />
        <div className="cmp-col-head sequential">🔢 Sequential</div>
        <div className="cmp-col-head simd">⚡ SIMD</div>
      </div>

      {/* Rows */}
      <CmpRow label="Approach">
        <span className="cmp-text">One pixel at a time</span>
        <span className="cmp-text">
          {vectorWidth} pixels per vector instruction
        </span>
      </CmpRow>

      <CmpRow label="Total Pixels">
        <span className="cmp-mono">{formatNumber(m.totalPixels)}</span>
        <span className="cmp-mono">{formatNumber(m.totalPixels)}</span>
      </CmpRow>

      <CmpRow label="Vector Width">
        <span className="cmp-mono dim">N/A</span>
        <span className="cmp-mono cyan">{m.vectorWidth}</span>
      </CmpRow>

      <CmpRow label="Instruction Count">
        <div className="cmp-instr-col">
          <span className="cmp-mono blue">{formatNumber(m.sequentialInstructions)}</span>
          <Bar value={m.sequentialInstructions} max={m.sequentialInstructions} color="var(--blue-dark)" />
        </div>
        <div className="cmp-instr-col">
          <span className="cmp-mono cyan">{formatNumber(m.simdInstructions)}</span>
          <Bar value={m.simdInstructions} max={m.sequentialInstructions} color="var(--cyan-dark)" />
        </div>
      </CmpRow>

      <CmpRow label="Progress">
        <div className="cmp-progress-col">
          <div className="progress-bar-track">
            <div className="progress-bar-fill blue" style={{ width: `${seqProgress}%` }} />
          </div>
          <span className="cmp-pct blue">{Math.round(seqProgress)}%</span>
        </div>
        <div className="cmp-progress-col">
          <div className="progress-bar-track">
            <div className="progress-bar-fill cyan" style={{ width: `${simdProgress}%` }} />
          </div>
          <span className="cmp-pct cyan">{Math.round(simdProgress)}%</span>
        </div>
      </CmpRow>

      {/* Summary box */}
      <div className="cmp-summary">
        <div className="cmp-summary-stat">
          <span className="stat-label">Instruction Reduction</span>
          <span className="stat-value green">{m.instructionReduction}%</span>
        </div>
        <div className="cmp-summary-stat">
          <span className="stat-label">Theoretical Speedup</span>
          <span className="stat-value cyan">{m.speedupFactor}×</span>
        </div>
        <div className="cmp-summary-stat">
          <span className="stat-label">Partial Last Vector</span>
          <span className="stat-value yellow">
            {m.remainingPixels > 0 ? `${m.remainingPixels} px` : 'None (exact fit)'}
          </span>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="cmp-formula info-box">
        <strong style={{ color: '#58a6ff' }}>Formula:</strong>
        {' '}Sequential = N = {formatNumber(m.sequentialInstructions)}{' '}
        &nbsp;|&nbsp;
        SIMD = ⌈N / W⌉ = ⌈{formatNumber(m.totalPixels)} / {m.vectorWidth}⌉ = {formatNumber(m.simdInstructions)}
        <br />
        Reduction = ({formatNumber(m.sequentialInstructions)} − {formatNumber(m.simdInstructions)}) / {formatNumber(m.sequentialInstructions)} × 100
        {' '}= <strong style={{ color: '#3fb950' }}>{m.instructionReduction}%</strong>
      </div>

      <div className="cmp-disclaimer info-box cyan" style={{ marginTop: '0.75rem' }}>
        ⚠️ <strong>Note:</strong> Instruction-count reduction ≠ actual execution-time speedup.
        Real performance depends on hardware vector unit width, memory bandwidth,
        instruction latency, cache effects, and software implementation quality.
        This simulation uses a simplified educational model.
      </div>
    </div>
  );
}

function CmpRow({ label, children }) {
  const cols = Array.isArray(children) ? children : [children];
  return (
    <div className="cmp-row">
      <div className="cmp-col-label">{label}</div>
      {cols.map((c, i) => (
        <div key={i} className={`cmp-col-val ${i === 0 ? 'sequential' : 'simd'}`}>{c}</div>
      ))}
    </div>
  );
}

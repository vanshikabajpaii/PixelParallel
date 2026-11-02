import { useState, useRef, useCallback, useEffect } from 'react';
import './ImageSimulator.css';
import ImageUploader from './ImageUploader';
import PixelGrid from './PixelGrid';
import ComparisonDashboard from './ComparisonDashboard';
import { processImage, processPixel, getPixel, renderImageData } from '../utils/imageProcessing';
import { createSequentialSimulation, createSIMDSimulation } from '../utils/simulationEngine';

/* ---- Operation config ---- */
const OPERATIONS = [
  { id: 'brightness', label: 'Brightness Adjustment', icon: '☀️' },
  { id: 'grayscale',  label: 'Grayscale Conversion',  icon: '⬛' },
  { id: 'invert',     label: 'Color Inversion',        icon: '🔄' },
];

const VECTOR_WIDTHS = [4, 8, 16];

/* ---- Helper: render ImageData to canvas ---- */
function putOnCanvas(canvas, imageData) {
  if (!canvas || !imageData) return;
  canvas.width  = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d').putImageData(imageData, 0, 0);
}

/* ===================================================================
   Main ImageSimulator component
   =================================================================== */
export default function ImageSimulator() {
  // --- Image state ---
  const [imageData,    setImageData]    = useState(null);
  const [processedImg, setProcessedImg] = useState(null); // full processed result for display

  // --- Controls ---
  const [operation,   setOperation]   = useState('brightness');
  const [brightness,  setBrightness]  = useState(50);
  const [vectorWidth, setVectorWidth] = useState(4);
  const [mode,        setMode]        = useState('sequential'); // 'sequential' | 'simd'

  // --- Simulation state ---
  const [simState, setSimState] = useState('idle'); // idle | running | paused | done
  const [seqStats, setSeqStats] = useState(null);
  const [simdStats, setSimdStats] = useState(null);
  const [seqProgress,  setSeqProgress]  = useState(0);
  const [simdProgress, setSimdProgress] = useState(0);

  // --- Pixel grid state ---
  const [gridCurrentPixel, setGridCurrentPixel] = useState(0);
  const [gridVectorStart,  setGridVectorStart]  = useState(0);
  const [gridVectorEnd,    setGridVectorEnd]    = useState(0);
  const [liveImageData,    setLiveImageData]    = useState(null); // partially-processed view

  // --- Canvas refs ---
  const origCanvasRef      = useRef(null);
  const processedCanvasRef = useRef(null);

  // --- Simulation engine ref ---
  const simulationRef = useRef(null);

  // --- Derive params from state ---
  const params = { brightness };

  // When image is loaded, draw it on the original canvas
  const handleImageLoaded = useCallback(({ imageData: data }) => {
    setImageData(data);
    setProcessedImg(null);
    setSimState('idle');
    setSeqStats(null);
    setSimdStats(null);
    setSeqProgress(0);
    setSimdProgress(0);
    setLiveImageData(null);
    if (simulationRef.current) {
      simulationRef.current.reset();
      simulationRef.current = null;
    }
  }, []);

  // Draw original image whenever imageData changes
  useEffect(() => {
    if (imageData && origCanvasRef.current) {
      putOnCanvas(origCanvasRef.current, imageData);
    }
  }, [imageData]);

  // Draw processed image when it changes
  useEffect(() => {
    if (processedImg && processedCanvasRef.current) {
      putOnCanvas(processedCanvasRef.current, processedImg);
    }
  }, [processedImg]);

  // Apply the full image transformation immediately (preview)
  function applyFullTransform() {
    if (!imageData) return;
    const result = processImage(imageData, operation, params);
    setProcessedImg(result);
    putOnCanvas(processedCanvasRef.current, result);
  }

  // --- Sequential simulation ---
  function startSequential() {
    if (!imageData) return;
    if (simulationRef.current) { simulationRef.current.reset(); }

    const totalPixels = imageData.width * imageData.height;
    // Start with copy of original for progressive render
    const liveData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width, imageData.height
    );

    const sim = createSequentialSimulation(imageData, operation, params, {
      onStep(info) {
        // Update live pixel data for processed pixels
        for (let pi = info.currentPixel; pi < info.batchEnd; pi++) {
          const before = getPixel(imageData, pi);
          const after  = processPixel(before, operation, params);
          const i4 = pi * 4;
          liveData.data[i4]     = after.r;
          liveData.data[i4 + 1] = after.g;
          liveData.data[i4 + 2] = after.b;
          liveData.data[i4 + 3] = after.a;
        }

        // Update processed canvas
        if (processedCanvasRef.current) putOnCanvas(processedCanvasRef.current, liveData);

        const currentPx = getPixel(imageData, info.currentPixel);
        const processedPx = processPixel(currentPx, operation, params);

        setGridCurrentPixel(info.currentPixel);
        setLiveImageData(new ImageData(
          new Uint8ClampedArray(liveData.data), liveData.width, liveData.height
        ));
        setSeqProgress(info.progress);
        setSeqStats({
          currentPixel: info.currentPixel + 1,
          totalPixels,
          progress: info.progress,
          before: currentPx,
          after: processedPx,
          operation,
          params,
        });
      },
      onComplete() {
        setSimState('done');
        setSeqProgress(100);
        setProcessedImg(liveData);
      },
    });

    simulationRef.current = sim;
    setMode('sequential');
    setSimState('running');
    setSeqStats(null);
    setSeqProgress(0);
    setLiveImageData(null);
    sim.start();
  }

  // --- SIMD simulation ---
  function startSIMD() {
    if (!imageData) return;
    if (simulationRef.current) { simulationRef.current.reset(); }

    const totalPixels = imageData.width * imageData.height;
    const liveData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width, imageData.height
    );

    const sim = createSIMDSimulation(imageData, operation, params, vectorWidth, {
      onStep(info) {
        // Process all pixels in the current batch
        for (let pi = info.activeStart; pi < info.activeEnd; pi++) {
          const before = getPixel(imageData, pi);
          const after  = processPixel(before, operation, params);
          const i4 = pi * 4;
          liveData.data[i4]     = after.r;
          liveData.data[i4 + 1] = after.g;
          liveData.data[i4 + 2] = after.b;
          liveData.data[i4 + 3] = after.a;
        }

        if (processedCanvasRef.current) putOnCanvas(processedCanvasRef.current, liveData);

        setGridVectorStart(info.activeStart);
        setGridVectorEnd(info.activeEnd);
        setLiveImageData(new ImageData(
          new Uint8ClampedArray(liveData.data), liveData.width, liveData.height
        ));
        setSimdProgress(info.progress);
        setSimdStats({
          currentVector: info.currentVector + 1,
          totalVectors: info.totalVectors,
          vectorWidth,
          activeLanes: info.activeLanes,
          pixelsProcessed: info.pixelsProcessed,
          totalPixels,
          progress: info.progress,
          operation,
        });
      },
      onComplete() {
        setSimState('done');
        setSimdProgress(100);
        setProcessedImg(liveData);
      },
    });

    simulationRef.current = sim;
    setMode('simd');
    setSimState('running');
    setSimdStats(null);
    setSimdProgress(0);
    setLiveImageData(null);
    sim.start();
  }

  function handlePause() {
    simulationRef.current?.pause();
    setSimState('paused');
  }

  function handleResume() {
    simulationRef.current?.resume();
    setSimState('running');
  }

  function handleReset() {
    if (simulationRef.current) {
      simulationRef.current.reset();
      simulationRef.current = null;
    }
    setSimState('idle');
    setSeqStats(null);
    setSimdStats(null);
    setSeqProgress(0);
    setSimdProgress(0);
    setLiveImageData(null);
    setGridCurrentPixel(0);
    setGridVectorStart(0);
    setGridVectorEnd(0);
    setProcessedImg(null);
    // Restore original on processed canvas
    if (processedCanvasRef.current) {
      const ctx = processedCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, processedCanvasRef.current.width, processedCanvasRef.current.height);
    }
  }

  const isRunning  = simState === 'running';
  const isPaused   = simState === 'paused';
  const isActive   = isRunning || isPaused;
  const totalPx    = imageData ? imageData.width * imageData.height : 0;

  return (
    <section id="simulator" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Interactive Demo</div>
          <h2>Image Processing Simulator</h2>
          <p>
            Upload an image (or use the sample), choose an operation, then run
            Sequential or SIMD mode to see how pixels are processed differently.
          </p>
        </div>

        {/* ── Row 1: Upload + Controls ── */}
        <div className="sim-layout">
          {/* Left: Upload */}
          <div className="card sim-upload-card">
            <h3 className="sim-card-title">1. Load Image</h3>
            <ImageUploader onImageLoaded={handleImageLoaded} />
          </div>

          {/* Right: Controls */}
          <div className="card sim-controls-card">
            <h3 className="sim-card-title">2. Configure</h3>

            {/* Operation selector */}
            <div className="ctrl-group">
              <label className="ctrl-label">Operation</label>
              <div className="op-buttons">
                {OPERATIONS.map(op => (
                  <button
                    key={op.id}
                    className={`btn btn-sm op-btn${operation === op.id ? ' active' : ''}`}
                    onClick={() => !isActive && setOperation(op.id)}
                    disabled={isActive}
                  >
                    {op.icon} {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness slider */}
            {operation === 'brightness' && (
              <div className="ctrl-group">
                <label className="ctrl-label">
                  Brightness offset: <span className="ctrl-val">{brightness > 0 ? '+' : ''}{brightness}</span>
                </label>
                <input
                  type="range"
                  min="-255" max="255" step="5"
                  value={brightness}
                  onChange={e => !isActive && setBrightness(Number(e.target.value))}
                  disabled={isActive}
                />
              </div>
            )}

            {/* Operation formula */}
            <div className="op-formula info-box">
              {operation === 'brightness' && (
                <code>NewValue = min(255, OldValue + {brightness})</code>
              )}
              {operation === 'grayscale' && (
                <code>Gray = 0.299R + 0.587G + 0.114B</code>
              )}
              {operation === 'invert' && (
                <code>NewValue = 255 − OldValue</code>
              )}
            </div>

            {/* Quick preview button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={applyFullTransform}
              disabled={!imageData || isActive}
            >
              👁 Preview Result
            </button>

            <hr className="divider" />

            {/* Vector width */}
            <div className="ctrl-group">
              <label className="ctrl-label">SIMD Vector Width</label>
              <div className="vector-width-btns">
                {VECTOR_WIDTHS.map(w => (
                  <button
                    key={w}
                    className={`btn btn-sm vw-btn${vectorWidth === w ? ' active' : ''}`}
                    onClick={() => !isActive && setVectorWidth(w)}
                    disabled={isActive}
                  >
                    {w} lanes
                  </button>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* 3. Simulation buttons */}
            <h3 className="sim-card-title">3. Run Simulation</h3>
            <div className="sim-action-row">
              <button
                className="btn btn-primary"
                onClick={startSequential}
                disabled={!imageData || isRunning}
              >
                🔢 Sequential
              </button>
              <button
                className="btn btn-cyan"
                onClick={startSIMD}
                disabled={!imageData || isRunning}
              >
                ⚡ SIMD
              </button>
              {isRunning && (
                <button className="btn btn-secondary" onClick={handlePause}>⏸ Pause</button>
              )}
              {isPaused && (
                <button className="btn btn-secondary" onClick={handleResume}>▶ Resume</button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={handleReset}
                disabled={!isActive && simState === 'idle'}
              >
                ↺ Reset
              </button>
            </div>

            {/* State badge */}
            <div className="sim-state-row">
              <span className={`badge ${
                simState === 'running' ? 'badge-cyan' :
                simState === 'paused'  ? 'badge-yellow' :
                simState === 'done'    ? 'badge-green' :
                'badge-blue'
              }`}>
                {simState === 'running' ? '● Running' :
                 simState === 'paused'  ? '⏸ Paused' :
                 simState === 'done'    ? '✓ Complete' :
                 '○ Idle'}
              </span>
              <span className="sim-mode-label">
                Mode: <strong>{mode === 'sequential' ? '🔢 Sequential' : '⚡ SIMD'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Image previews ── */}
        {imageData && (
          <div className="sim-canvas-row grid-2" style={{ marginTop: '1.5rem' }}>
            <div className="card canvas-card">
              <div className="canvas-card-header">
                <span className="canvas-label">Original</span>
                <span className="badge badge-blue">{imageData.width}×{imageData.height}</span>
              </div>
              <canvas ref={origCanvasRef} className="sim-canvas" />
            </div>
            <div className="card canvas-card">
              <div className="canvas-card-header">
                <span className="canvas-label">Processed</span>
                {simState === 'running' && <span className="badge badge-cyan pulse">Processing…</span>}
                {simState === 'done'    && <span className="badge badge-green">Done</span>}
              </div>
              <canvas ref={processedCanvasRef} className="sim-canvas" />
              {!processedImg && simState === 'idle' && (
                <div className="canvas-placeholder">Run simulation or click Preview</div>
              )}
            </div>
          </div>
        )}

        {/* ── Row 3: Sequential stats panel ── */}
        {seqStats && mode === 'sequential' && (
          <div className="card sim-stats-card fade-in" style={{ marginTop: '1.5rem' }}>
            <h3 className="sim-card-title">🔢 Sequential Processing</h3>
            <p className="sim-mode-desc">
              Sequential processing applies the operation to individual pixels one after another.
              Each pixel requires its own instruction cycle.
            </p>
            <div className="stats-grid grid-4">
              <div className="stat-box">
                <div className="stat-label">Current Pixel</div>
                <div className="stat-value blue">{seqStats.currentPixel.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Pixels</div>
                <div className="stat-value">{seqStats.totalPixels.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Remaining</div>
                <div className="stat-value yellow">
                  {(seqStats.totalPixels - seqStats.currentPixel).toLocaleString()}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Progress</div>
                <div className="stat-value cyan">{Math.round(seqStats.progress)}%</div>
              </div>
            </div>
            <div className="progress-bar-track" style={{ marginTop: '0.75rem' }}>
              <div className="progress-bar-fill blue" style={{ width: `${seqStats.progress}%` }} />
            </div>

            {/* Before / after pixel values */}
            <div className="pixel-vals-row" style={{ marginTop: '1rem' }}>
              <PixelValueBox label="Before" pixel={seqStats.before} />
              <div className="pixel-arrow">→ {OPERATIONS.find(o => o.id === operation)?.label} →</div>
              <PixelValueBox label="After" pixel={seqStats.after} accent />
            </div>
          </div>
        )}

        {/* ── Row 3: SIMD stats panel ── */}
        {simdStats && mode === 'simd' && (
          <div className="card sim-stats-card fade-in" style={{ marginTop: '1.5rem' }}>
            <h3 className="sim-card-title">⚡ SIMD Processing</h3>
            <p className="sim-mode-desc">
              SIMD applies one instruction to multiple data elements simultaneously using vector processing.
              {simdStats.activeLanes < vectorWidth && (
                <> The last vector group has only <strong>{simdStats.activeLanes}</strong> active lanes (partial vector handled correctly).</>
              )}
            </p>
            <div className="stats-grid grid-4">
              <div className="stat-box">
                <div className="stat-label">Vector #</div>
                <div className="stat-value cyan">{simdStats.currentVector.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Vectors</div>
                <div className="stat-value">{simdStats.totalVectors.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Pixels / Instr</div>
                <div className="stat-value purple">{simdStats.activeLanes}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Processed</div>
                <div className="stat-value green">{simdStats.pixelsProcessed.toLocaleString()}</div>
              </div>
            </div>
            <div className="progress-bar-track" style={{ marginTop: '0.75rem' }}>
              <div className="progress-bar-fill cyan" style={{ width: `${simdStats.progress}%` }} />
            </div>

            {/* Active lanes visualization */}
            <div className="lanes-vis" style={{ marginTop: '1rem' }}>
              <div className="lanes-label">Active Vector Lanes</div>
              <div className="lanes-row">
                {Array.from({ length: vectorWidth }, (_, i) => (
                  <div key={i}
                    className={`lane-box${i < simdStats.activeLanes ? ' active' : ' inactive'}`}
                  >
                    <span className="lane-box-id">L{i + 1}</span>
                    <span className="lane-box-status">
                      {i < simdStats.activeLanes ? '●' : '○'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="lanes-note">
                {simdStats.activeLanes} of {vectorWidth} lanes active in current vector
              </div>
            </div>
          </div>
        )}

        {/* ── Row 4: Pixel Grid ── */}
        {imageData && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 className="sim-card-title">Pixel Visualization Grid</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              A magnified view of image pixels.
              {mode === 'sequential'
                ? ' Orange = current pixel being processed.'
                : ' Cyan = active SIMD vector lane group.'}
            </p>
            <PixelGrid
              imageData={imageData}
              mode={isActive || simState === 'done' ? mode : 'idle'}
              currentPixel={gridCurrentPixel}
              vectorStart={gridVectorStart}
              vectorEnd={gridVectorEnd}
              processedData={liveImageData}
            />
          </div>
        )}

        {/* ── Row 5: Comparison Dashboard ── */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="sim-card-title">📊 Sequential vs SIMD Comparison</h3>
          <ComparisonDashboard
            totalPixels={totalPx}
            vectorWidth={vectorWidth}
            seqProgress={seqProgress}
            simdProgress={simdProgress}
          />
        </div>
      </div>
    </section>
  );
}

/* ---- Pixel value display box ---- */
function PixelValueBox({ label, pixel, accent = false }) {
  if (!pixel) return null;
  const swatchColor = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
  return (
    <div className={`pv-box${accent ? ' accent' : ''}`}>
      <div className="pv-label">{label}</div>
      <div className="pv-swatch" style={{ background: swatchColor }} />
      <div className="pv-vals">
        <span>R: <strong>{pixel.r}</strong></span>
        <span>G: <strong>{pixel.g}</strong></span>
        <span>B: <strong>{pixel.b}</strong></span>
      </div>
    </div>
  );
}

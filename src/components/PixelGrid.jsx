import { useRef, useEffect } from 'react';
import './PixelGrid.css';

/**
 * PixelGrid – visual pixel grid drawn on a Canvas element.
 * Shows a small window of pixels from the actual image, highlighting
 * the currently active pixels based on simulation mode.
 *
 * Props:
 *   imageData       {ImageData}  - Source image data
 *   mode            {string}     - 'sequential' | 'simd' | 'idle'
 *   currentPixel    {number}     - In sequential mode: index of current pixel
 *   vectorStart     {number}     - In SIMD mode: first pixel of active vector
 *   vectorEnd       {number}     - In SIMD mode: one past last pixel of active vector
 *   progress        {number}     - 0-100 progress percentage
 *   processedData   {ImageData}  - Processed image data so far (for output preview)
 */
export default function PixelGrid({
  imageData,
  mode = 'idle',
  currentPixel = 0,
  vectorStart = 0,
  vectorEnd = 0,
  processedData = null,
}) {
  const canvasRef = useRef(null);
  const GRID_COLS = 16; // number of pixels shown per row
  const GRID_ROWS = 10;
  const CELL_SIZE = 24; // pixels per cell

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const totalPixels = imageData.width * imageData.height;

    // Determine the window of pixels to show:
    // Center the window around the currently active pixel.
    const windowSize = GRID_COLS * GRID_ROWS;
    let windowStart = 0;

    if (mode === 'sequential') {
      windowStart = Math.max(0, currentPixel - Math.floor(windowSize / 2));
    } else if (mode === 'simd') {
      windowStart = Math.max(0, vectorStart - GRID_COLS * 2);
    }
    // Clamp so we don't go past the end
    windowStart = Math.min(windowStart, Math.max(0, totalPixels - windowSize));
    windowStart = Math.max(0, windowStart);

    canvas.width  = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const pixelIdx = windowStart + row * GRID_COLS + col;
        if (pixelIdx >= totalPixels) break;

        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        const dataIdx = pixelIdx * 4;
        const src = imageData.data;

        // Determine if this pixel is active
        const isActive = (
          mode === 'sequential'
            ? pixelIdx >= currentPixel && pixelIdx < currentPixel + 1
            : mode === 'simd'
            ? pixelIdx >= vectorStart && pixelIdx < vectorEnd
            : false
        );

        const isProcessed = pixelIdx < currentPixel || (mode === 'simd' && pixelIdx < vectorStart);

        // Draw cell background (raw color from image)
        ctx.fillStyle = `rgb(${src[dataIdx]},${src[dataIdx+1]},${src[dataIdx+2]})`;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Overlay: highlight active pixels
        if (isActive && mode === 'sequential') {
          // Bright cyan outline + yellow fill overlay
          ctx.fillStyle = 'rgba(210, 153, 34, 0.55)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#f0883e';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        } else if (isActive && mode === 'simd') {
          // All lanes in the vector group get a cyan overlay
          ctx.fillStyle = 'rgba(57, 208, 216, 0.45)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#39d0d8';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        } else if (isProcessed && processedData) {
          // Show processed color with a subtle green tint
          const pi4 = pixelIdx * 4;
          const pd = processedData.data;
          ctx.fillStyle = `rgb(${pd[pi4]},${pd[pi4+1]},${pd[pi4+2]})`;
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.fillStyle = 'rgba(63, 185, 80, 0.18)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Grid line
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }, [imageData, mode, currentPixel, vectorStart, vectorEnd, processedData]);

  if (!imageData) {
    return (
      <div className="pixel-grid-placeholder">
        <span>🖼️</span>
        <p>Load an image to see the pixel grid</p>
      </div>
    );
  }

  return (
    <div className="pixel-grid-wrapper">
      <div className="pixel-grid-legend">
        {mode === 'sequential' && (
          <>
            <LegendItem color="#f0883e" label="Current pixel" />
            <LegendItem color="#3fb950" label="Processed" />
            <LegendItem color="var(--bg-secondary)" label="Pending" />
          </>
        )}
        {mode === 'simd' && (
          <>
            <LegendItem color="#39d0d8" label="Active vector group" />
            <LegendItem color="#3fb950" label="Processed" />
            <LegendItem color="var(--bg-secondary)" label="Pending" />
          </>
        )}
        {mode === 'idle' && <span className="legend-text">Run simulation to see pixel processing</span>}
      </div>
      <div className="pixel-grid-canvas-wrapper">
        <canvas ref={canvasRef} className="pixel-grid-canvas" />
      </div>
      <p className="pixel-grid-caption">
        Showing {GRID_COLS}×{GRID_ROWS} pixel window · Each cell = 1 pixel
        {mode === 'simd' && ' · Cyan = active vector lanes'}
      </p>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="legend-item">
      <span className="legend-swatch" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

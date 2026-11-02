/**
 * simulationEngine.js
 * Educational simulation engine for sequential and SIMD processing.
 * Drives step-by-step animations to illustrate both processing modes.
 * NOTE: This is a JavaScript simulation — not native CPU SIMD instructions.
 */

/**
 * Create a sequential simulation runner.
 * Processes pixels one at a time, calling onStep for each pixel.
 *
 * @param {ImageData} imageData - Source image data
 * @param {string} operation - Processing operation name
 * @param {object} params - Operation parameters
 * @param {object} callbacks
 *   onStep(info)  - Called each animation frame with progress info
 *   onComplete()  - Called when all pixels are processed
 * @returns {{ start, pause, resume, reset }}
 */
export function createSequentialSimulation(imageData, operation, params, callbacks) {
  const totalPixels = imageData.width * imageData.height;
  let currentPixel = 0;
  let rafId = null;
  let paused = false;
  let running = false;
  // How many pixels to advance per animation frame (controls speed)
  const PIXELS_PER_FRAME = Math.max(1, Math.floor(totalPixels / 300));

  function tick() {
    if (paused || !running) return;

    const batchEnd = Math.min(currentPixel + PIXELS_PER_FRAME, totalPixels);

    callbacks.onStep({
      currentPixel,
      batchEnd,
      totalPixels,
      progress: (batchEnd / totalPixels) * 100,
      operation,
      params,
    });

    currentPixel = batchEnd;

    if (currentPixel >= totalPixels) {
      running = false;
      callbacks.onComplete?.();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      currentPixel = 0;
      paused = false;
      running = true;
      rafId = requestAnimationFrame(tick);
    },
    pause() {
      paused = true;
      if (rafId) cancelAnimationFrame(rafId);
    },
    resume() {
      if (!running) return;
      paused = false;
      rafId = requestAnimationFrame(tick);
    },
    reset() {
      paused = false;
      running = false;
      currentPixel = 0;
      if (rafId) cancelAnimationFrame(rafId);
    },
    get isPaused() { return paused; },
    get isRunning() { return running; },
  };
}

/**
 * Create a SIMD simulation runner.
 * Processes pixels in groups (vectors) of `vectorWidth`, calling onStep per vector.
 *
 * @param {ImageData} imageData - Source image data
 * @param {string} operation - Processing operation name
 * @param {object} params - Operation parameters
 * @param {number} vectorWidth - Number of pixels per SIMD vector
 * @param {object} callbacks
 *   onStep(info)  - Called each animation frame
 *   onComplete()  - Called when all vectors are processed
 * @returns {{ start, pause, resume, reset }}
 */
export function createSIMDSimulation(imageData, operation, params, vectorWidth, callbacks) {
  const totalPixels = imageData.width * imageData.height;
  const totalVectors = Math.ceil(totalPixels / vectorWidth);
  let currentVector = 0;
  let rafId = null;
  let paused = false;
  let running = false;
  // How many vectors to advance per animation frame
  const VECTORS_PER_FRAME = Math.max(1, Math.floor(totalVectors / 150));

  function tick() {
    if (paused || !running) return;

    const batchEnd = Math.min(currentVector + VECTORS_PER_FRAME, totalVectors);
    const pixelsProcessed = Math.min(batchEnd * vectorWidth, totalPixels);

    // Determine active lanes for the current vector
    const activeStart = currentVector * vectorWidth;
    const activeEnd = Math.min(activeStart + vectorWidth, totalPixels);
    const activeLanes = activeEnd - activeStart;

    callbacks.onStep({
      currentVector,
      batchEnd,
      totalVectors,
      vectorWidth,
      activeLanes,
      activeStart,
      activeEnd,
      pixelsProcessed,
      totalPixels,
      progress: (pixelsProcessed / totalPixels) * 100,
      operation,
      params,
    });

    currentVector = batchEnd;

    if (currentVector >= totalVectors) {
      running = false;
      callbacks.onComplete?.();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      currentVector = 0;
      paused = false;
      running = true;
      rafId = requestAnimationFrame(tick);
    },
    pause() {
      paused = true;
      if (rafId) cancelAnimationFrame(rafId);
    },
    resume() {
      if (!running) return;
      paused = false;
      rafId = requestAnimationFrame(tick);
    },
    reset() {
      paused = false;
      running = false;
      currentVector = 0;
      if (rafId) cancelAnimationFrame(rafId);
    },
    get isPaused() { return paused; },
    get isRunning() { return running; },
    get totalVectors() { return totalVectors; },
  };
}

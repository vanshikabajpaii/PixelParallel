/**
 * imageProcessing.js
 * Core image-processing utilities using Canvas ImageData.
 * These functions perform ACTUAL pixel transformations on real image data.
 */

/**
 * Apply brightness adjustment to ImageData.
 * Formula: NewValue = min(255, OldValue + brightness)
 * @param {ImageData} imageData - Source ImageData object
 * @param {number} brightness - Brightness offset (-255 to 255)
 * @returns {ImageData} New ImageData with brightness applied
 */
export function applyBrightness(imageData, brightness) {
  const src = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i]     = Math.min(255, Math.max(0, src[i]     + brightness)); // R
    dst[i + 1] = Math.min(255, Math.max(0, src[i + 1] + brightness)); // G
    dst[i + 2] = Math.min(255, Math.max(0, src[i + 2] + brightness)); // B
    dst[i + 3] = src[i + 3]; // Alpha unchanged
  }

  return output;
}

/**
 * Convert ImageData to grayscale.
 * Formula: Gray = 0.299R + 0.587G + 0.114B
 * @param {ImageData} imageData - Source ImageData object
 * @returns {ImageData} New ImageData in grayscale
 */
export function applyGrayscale(imageData) {
  const src = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    const gray = Math.round(0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]);
    dst[i]     = gray; // R
    dst[i + 1] = gray; // G
    dst[i + 2] = gray; // B
    dst[i + 3] = src[i + 3]; // Alpha unchanged
  }

  return output;
}

/**
 * Invert ImageData colors.
 * Formula: NewValue = 255 - OldValue
 * @param {ImageData} imageData - Source ImageData object
 * @returns {ImageData} New ImageData with inverted colors
 */
export function applyInvert(imageData) {
  const src = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i]     = 255 - src[i];     // R
    dst[i + 1] = 255 - src[i + 1]; // G
    dst[i + 2] = 255 - src[i + 2]; // B
    dst[i + 3] = src[i + 3];        // Alpha unchanged
  }

  return output;
}

/**
 * Dispatch to the correct operation based on name.
 * @param {ImageData} imageData
 * @param {string} operation - 'brightness' | 'grayscale' | 'invert'
 * @param {object} params - Operation-specific parameters
 * @returns {ImageData}
 */
export function processImage(imageData, operation, params = {}) {
  switch (operation) {
    case 'brightness':
      return applyBrightness(imageData, params.brightness ?? 50);
    case 'grayscale':
      return applyGrayscale(imageData);
    case 'invert':
      return applyInvert(imageData);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Load an image URL into a canvas and return its ImageData.
 * @param {string} src - Image URL or data URL
 * @param {number} maxWidth - Maximum canvas width
 * @param {number} maxHeight - Maximum canvas height
 * @returns {Promise<{imageData: ImageData, canvas: HTMLCanvasElement}>}
 */
export function loadImageData(src, maxWidth = 400, maxHeight = 300) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Scale image to fit within maxWidth x maxHeight
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(maxWidth / w, maxHeight / h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      resolve({ imageData, canvas, width: w, height: h });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Render ImageData onto an existing canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {ImageData} imageData
 */
export function renderImageData(canvas, imageData) {
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Get the pixel value at index `pixelIndex` from ImageData.
 * @param {ImageData} imageData
 * @param {number} pixelIndex - 0-based pixel index
 * @returns {{ r, g, b, a }}
 */
export function getPixel(imageData, pixelIndex) {
  const i = pixelIndex * 4;
  return {
    r: imageData.data[i],
    g: imageData.data[i + 1],
    b: imageData.data[i + 2],
    a: imageData.data[i + 3],
  };
}

/**
 * Apply one operation to a single pixel's RGBA values.
 * Used by the simulator to show per-pixel before/after values.
 * @param {{ r, g, b, a }} pixel
 * @param {string} operation
 * @param {object} params
 * @returns {{ r, g, b, a }}
 */
export function processPixel(pixel, operation, params = {}) {
  switch (operation) {
    case 'brightness': {
      const br = params.brightness ?? 50;
      return {
        r: Math.min(255, Math.max(0, pixel.r + br)),
        g: Math.min(255, Math.max(0, pixel.g + br)),
        b: Math.min(255, Math.max(0, pixel.b + br)),
        a: pixel.a,
      };
    }
    case 'grayscale': {
      const gray = Math.round(0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b);
      return { r: gray, g: gray, b: gray, a: pixel.a };
    }
    case 'invert':
      return {
        r: 255 - pixel.r,
        g: 255 - pixel.g,
        b: 255 - pixel.b,
        a: pixel.a,
      };
    default:
      return pixel;
  }
}

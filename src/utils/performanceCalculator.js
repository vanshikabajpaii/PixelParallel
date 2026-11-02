/**
 * performanceCalculator.js
 * Calculates theoretical instruction counts for sequential vs SIMD processing.
 * These are educational simulations — not actual CPU measurements.
 */

/**
 * Calculate instruction counts and reduction percentage.
 * @param {number} totalPixels - Total number of pixels in the image
 * @param {number} vectorWidth - Number of pixels per SIMD vector (4, 8, or 16)
 * @returns {object} Calculation results
 */
export function calculateMetrics(totalPixels, vectorWidth) {
  const sequentialInstructions = totalPixels;
  const simdInstructions = Math.ceil(totalPixels / vectorWidth);
  const instructionReduction =
    ((sequentialInstructions - simdInstructions) / sequentialInstructions) * 100;
  const speedupFactor = sequentialInstructions / simdInstructions;

  return {
    totalPixels,
    vectorWidth,
    sequentialInstructions,
    simdInstructions,
    instructionReduction: Math.round(instructionReduction * 10) / 10,
    speedupFactor: Math.round(speedupFactor * 100) / 100,
    // How many full vectors fit, and how many pixels are in the last partial vector
    fullVectors: Math.floor(totalPixels / vectorWidth),
    remainingPixels: totalPixels % vectorWidth,
  };
}

/**
 * Format a large number with commas for readability.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return n.toLocaleString();
}

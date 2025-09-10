/**
 * Calculates the Euclidean distance between two points (x1, y1) and (x2, y2)
 * Useful for checking distances on the mini-map or for hit detection.
 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Returns a random integer between min and max (inclusive)
 * Useful for random spawn points, ammo drops, power-ups, etc.
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Clamps a value between a minimum and maximum
 * Useful for ensuring player stats (like health or ammo) stay within bounds.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Converts a percentage (0-100) to pixel value based on a dimension
 */
export const percentToPixel = (percent: number, dimension: number): number => {
  return (percent / 100) * dimension;
};

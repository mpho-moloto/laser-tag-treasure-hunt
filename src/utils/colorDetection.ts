/**
 * Detects the dominant color from a video element (e.g., player's shirt).
 * Returns the color in HEX format.
 */
export const getDominantColor = (video: HTMLVideoElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Set canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Sample center area of the frame
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sampleSize = 50;

      const imageData = ctx.getImageData(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize
      ).data;

      let r = 0, g = 0, b = 0;
      const count = imageData.length / 4;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;

      resolve(hex);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Calculates the Euclidean distance between two HEX colors.
 * Used to ensure unique player colors.
 */
export const colorDistance = (color1: string, color2: string): number => {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
      Math.pow(g2 - g1, 2) +
      Math.pow(b2 - b1, 2)
  );
};

/**
 * Checks if a color is unique among existing player colors.
 * @param color - the new color to check
 * @param existingColors - array of existing HEX colors
 * @param threshold - minimum Euclidean distance to consider unique
 */
export const isColorUnique = (
  color: string,
  existingColors: string[],
  threshold = 50
): boolean => {
  return !existingColors.some((existing) => colorDistance(color, existing) < threshold);
};


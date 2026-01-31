
/**
 * Calculates the shortest angular distance between two angles in degrees [0, 180].
 */
export const calculateAngularError = (userAngle: number, correctAngle: number): number => {
  let diff = Math.abs(userAngle - correctAngle);
  // Ensure we are comparing within the 360 circle
  diff = diff % 360;
  // If difference is greater than 180, take the shorter path
  if (diff > 180) {
    diff = 360 - diff;
  }
  return Number(diff.toFixed(2));
};

/**
 * Calculates the angle from the center of a circle to a point (x, y).
 * 0 degrees is the top (12 o'clock).
 */
export const getAngleFromPoint = (x: number, y: number, cx: number, cy: number): number => {
  const dx = x - cx;
  const dy = y - cy;
  // atan2 returns angle in radians from X axis.
  // We want 0 degrees at North (-Y axis).
  let theta = Math.atan2(dy, dx); 
  let angle = (theta * 180) / Math.PI + 90;
  
  if (angle < 0) {
    angle += 360;
  }
  
  return angle % 360;
};

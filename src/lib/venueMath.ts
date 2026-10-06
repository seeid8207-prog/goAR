export function normalizeAngle(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function shortestAngle(fromDeg: number, toDeg: number) {
  let d = normalizeAngle(toDeg) - normalizeAngle(fromDeg);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function distanceMeters(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

export function bearingDeg(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  return normalizeAngle(Math.atan2(dx, dy) * 180 / Math.PI);
}

export function turnInstruction(delta: number) {
  const a = Math.abs(delta);
  if (a < 12) return 'Continue straight';
  if (a > 165) return 'Turn around';
  if (a < 45) return delta > 0 ? 'Bear right' : 'Bear left';
  if (a < 135) return delta > 0 ? 'Turn right' : 'Turn left';
  return delta > 0 ? 'Turn sharply right' : 'Turn sharply left';
}

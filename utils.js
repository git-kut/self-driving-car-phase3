// Linear interpolation, often abbreviated as "lerp," is a method used to find a
// value between two given values (a and b) based on a third parameter (t) that
// represents a proportion or a fraction of the distance between a and b.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }
  return null;
}

export function polygonIntersect(pol1, pol2) {
  for (let i = 0; i < pol1.length; i++) {
    for (let j = 0; j < pol2.length; j++) {
      const touch = getIntersection(
        pol1[i],
        pol1[(i + 1) % pol1.length],
        // pol[i] and pol[i + 1] forms one line but pol1[(i + 1) % pol1.length] covers two important problems
        // 1. with pol1[(i + 1) % pol1.length], you will do the circulation aka meet line 1 with line 4
        // 2. prevent the error where i reaches pol1.length - boundary issue
        pol2[j],
        pol2[(j + 1) % pol2.length]
      );
      if (touch) {
        return true;
      }
    }
  }
  return false;
}

export function getRGBA(value) {
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value < 0 ? 255 : 0;
  return "rgba(" + R + ", " + G + ", " + B + ", " + alpha + ")";
}

export function getRandomColor() {
  const hue = Math.random() * 360;
  return "hsl(" + hue + ", 90%, 40%)";
}

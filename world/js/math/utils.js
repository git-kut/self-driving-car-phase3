import Point from "../primitives/point.js";

export function distance(point1, point2) {
  return Math.hypot(point1.x - point2.x, point1.y - point2.y);
}

export function getNearestPoint(
  coordinates,
  points,
  threshold = Number.MAX_SAFE_INTEGER
) {
  let minDistance = Number.MAX_SAFE_INTEGER;
  let nearest = null;

  for (const point of points) {
    const dist = distance(point, coordinates);
    if (dist < minDistance && dist < threshold) {
      minDistance = dist;
      nearest = point;
    }
  }
  return nearest;
}

export function getNearestSegment(
  coordinates,
  segments,
  threshold = Number.MAX_SAFE_INTEGER
) {
  let minDistance = Number.MAX_SAFE_INTEGER;
  let nearest = null;

  for (const segment of segments) {
    const dist = segment.distanceToPoint(coordinates);
    if (dist < minDistance && dist < threshold) {
      minDistance = dist;
      nearest = segment;
    }
  }
  return nearest;
}

export function add(p1, p2) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

export function subtract(p1, p2) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

export function scale(p1, scaler) {
  return new Point(p1.x * scaler, p1.y * scaler);
}

export function average(p1, p2) {
  return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

export function translate(location, angle, offset) {
  return new Point(
    location.x + Math.cos(angle) * offset,
    location.y + Math.sin(angle) * offset
  );
}

export function angle(point) {
  return Math.atan2(point.y, point.x);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerp2D(p1, p2, t) {
  return new Point(lerp(p1.x, p2.x, t), lerp(p1.y, p2.y, t));
}

export function invLerp(a, b, v) {
  return (v - a) / (b - a);
}

export function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
  const eps = 0.001;
  if (Math.abs(bottom) > eps) {
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

export function getRandomColor() {
  const hue = Math.random() * 360;
  return "hsl(" + hue + ", 90%, 40%)";
}

export function normalize(point) {
  return scale(point, 1 / magnitude(point));
}

export function magnitude(point) {
  return Math.hypot(point.x, point.y);
}

export function dot(p1, p2) {
  return p1.x * p2.x + p1.y * p2.y;
}

export function getFake3D(point, viewPoint, height) {
  const direction = normalize(subtract(point, viewPoint));
  const dist = distance(point, viewPoint);
  const scaler = Math.atan(dist / 300) / (Math.PI / 2);
  return add(point, scale(direction, height * scaler));
}

export function perpendicular(point) {
  return new Point(-point.y, point.x);
}

export function degreeToRadius(degree) {
  return (degree * Math.PI) / 180;
}

import {
  distance,
  subtract,
  normalize,
  scale,
  dot,
  add,
  magnitude,
} from "../math/utils.js";

class Segment {
  constructor(p1, p2, isOneWay = false) {
    this.p1 = p1;
    this.p2 = p2;
    this.isOneWay = isOneWay;
  }

  draw(ctx, { width = 2, color = "black", dash = [], cap = "butt" } = {}) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = cap;
    if (this.isOneWay) {
      dash = [4, 4];
    }
    ctx.setLineDash(dash);
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  equals(segment) {
    return (
      (this.p1.equals(segment.p1) && this.p2.equals(segment.p2)) ||
      (this.p1.equals(segment.p2) && this.p2.equals(segment.p1))
    );
  }

  length() {
    return distance(this.p1, this.p2);
  }

  directionVector() {
    return normalize(subtract(this.p2, this.p1));
  }

  distanceToPoint(point) {
    const projection = this.projectPoint(point);
    if (projection.offset > 0 && projection.offset < 1) {
      return distance(point, projection.point);
    }
    const distanceToP1 = distance(point, this.p1);
    const distanceToP2 = distance(point, this.p2);
    return Math.min(distanceToP1, distanceToP2);
  }

  projectPoint(point) {
    const a = subtract(point, this.p1);
    const b = subtract(this.p2, this.p1);
    const normB = normalize(b);
    const scaler = dot(a, normB);
    const proj = {
      point: add(this.p1, scale(normB, scaler)),
      offset: scaler / magnitude(b),
    };
    return proj;
  }
}

export default Segment;

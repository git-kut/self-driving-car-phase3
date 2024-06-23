import {
  add,
  subtract,
  scale,
  lerp,
  lerp2D,
  translate,
  distance,
  normalize,
  getFake3D,
} from "../math/utils.js";
import Polygon from "../primitives/polygon.js";
import Segment from "../primitives/segment.js";

class Tree {
  constructor(point, size, height = 200) {
    this.point = point;
    this.size = size;
    this.height = height;

    this.base = this.#generateLevel(point, size);
  }

  draw(ctx, viewPoint) {
    const top = getFake3D(this.point, viewPoint, this.height);
    const levelCount = 7;
    for (let level = 0; level < levelCount; level++) {
      const t = level / (levelCount - 1);
      const point = lerp2D(this.point, top, t);
      const color = "rgba(30," + lerp(50, 200, t) + ", 70)";
      const size = lerp(this.size, 40, t);
      const polygon = this.#generateLevel(point, size);
      polygon.draw(ctx, { fill: color, stroke: "rgba(0, 0, 0, 0)" });
    }

    new Segment(this.point, top).draw(ctx);
  }

  #generateLevel(point, size) {
    const points = [];
    const radius = size / 2;

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
      const pseudoRandom = Math.cos(((angle + this.point.x) * size) / 15) ** 2;
      const noisyRadius = radius * lerp(0.5, 1, pseudoRandom);
      points.push(translate(point, angle, noisyRadius));
    }
    return new Polygon(points);
  }
}

export default Tree;

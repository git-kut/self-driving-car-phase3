import { angle, subtract, translate } from "../math/utils.js";
import Polygon from "./polygon.js";
import Segment from "./segment.js";

class Envelope {
  constructor(skeleton, width, roundness = 1) {
    if (skeleton) {
      this.skeleton = skeleton;
      this.polygon = this.#generatePolygon(width, roundness);
    }
  }

  draw(ctx, options) {
    this.polygon.draw(ctx, options);
  }

  static load(info) {
    const envelope = new Envelope();
    envelope.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
    envelope.polygon = Polygon.load(info.polygon);
    return envelope;
  }

  #generatePolygon(width, roundness) {
    const { p1, p2 } = this.skeleton;
    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alphaClock = alpha + Math.PI / 2;
    const alphaCounterClock = alpha - Math.PI / 2;

    const points = [];
    const step = Math.PI / Math.max(1, roundness);
    const eps = step / 2;
    for (let i = alphaCounterClock; i <= alphaClock + eps; i += step) {
      points.push(translate(p1, i, radius));
    }

    for (let i = alphaCounterClock; i <= alphaClock + eps; i += step) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }
}

export default Envelope;

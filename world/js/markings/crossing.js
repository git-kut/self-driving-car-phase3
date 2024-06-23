import { scale, perpendicular, add, translate, angle } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";

class Crossing {
  constructor(center, direction, width, height) {
    this.center = center;
    this.direction = direction;
    this.width = width;
    this.height = height;

    this.support = new Segment(
      translate(center, angle(direction), height / 2),
      translate(center, angle(direction), -height / 2)
    );

    this.polygon = new Envelope(this.support, width, 0).polygon;

    this.border = this.polygon.segments[2];
    this.type = "crossing";
  }

  draw(ctx) {
    const perp = perpendicular(this.direction);
    const line = new Segment(
      add(this.center, scale(perp, this.width / 2)),
      add(this.center, scale(perp, -this.width / 2))
    );
    line.draw(ctx, { width: this.height, color: "white", dash: [11, 11] });
  }
}

export default Crossing;

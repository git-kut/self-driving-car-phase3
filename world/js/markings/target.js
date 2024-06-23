import { angle, translate } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";

class Target {
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
    this.type = "target";
  }

  draw(ctx) {
    this.center.draw(ctx, { color: "red", size: 30 });
    this.center.draw(ctx, { color: "white", size: 20 });
    this.center.draw(ctx, { color: "red", size: 10 });
  }
}

export default Target;

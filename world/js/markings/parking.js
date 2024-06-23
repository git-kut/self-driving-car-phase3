import { angle, translate } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";

class Parking {
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
    this.borders = [this.polygon.segments[2], this.polygon.segments[0]];
    this.type = "parking";
  }

  draw(ctx) {
    for (const border of this.borders) {
      border.draw(ctx, { width: 5, color: "white" });
    }
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.direction) + Math.PI);

    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.fillText("P", 0, 3);

    ctx.restore();
  }
}

export default Parking;

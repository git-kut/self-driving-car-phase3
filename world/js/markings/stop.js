import { angle, translate } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";

class Stop {
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
    this.type = "stop";
  }

  draw(ctx) {
    this.border.draw(ctx, { width: 5, color: "white" });
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.direction) - Math.PI / 2);
    ctx.scale(1, 3);
    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 15px Arial";
    ctx.fillText("STOP", 0, 1);

    ctx.restore();
  }
}

export default Stop;

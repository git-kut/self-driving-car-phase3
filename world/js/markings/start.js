import { angle, translate } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";

class Start {
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
    this.img = new Image();
    this.img.src = "car.png";
    this.type = "start";
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.direction) - Math.PI / 2);

    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);

    ctx.restore();
  }
}

export default Start;

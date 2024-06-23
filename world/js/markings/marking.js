import { angle, translate } from "../math/utils.js";
import Segment from "../primitives/segment.js";
import Envelope from "../primitives/envelope.js";
import Crossing from "./crossing.js";
import Point from "../primitives/point.js";
import Light from "./light.js";
import Parking from "./parking.js";
import Start from "./start.js";
import Stop from "./stop.js";
import Target from "./target.js";
import Yield from "./yield.js";

class Marking {
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
    this.type = "marking";

    this.support = new Segment(
      translate(center, angle(direction), height / 2),
      translate(center, angle(direction), -height / 2)
    );

    this.polygon = new Envelope(this.support, width, 0).polygon;
  }

  draw(ctx) {
    this.polygon.draw(ctx);
  }

  static load(info) {
    const point = new Point(info.center.x, info.center.y);
    const direction = new Point(info.direction.x, info.direction.y);
    switch (info.type) {
      case "crossing":
        return new Crossing(point, direction, info.width, info.height);
      case "light":
        return new Light(point, direction, info.width, info.height);
      case "parking":
        return new Parking(point, direction, info.width, info.height);
      case "start":
        return new Start(point, direction, info.width, info.height);
      case "stop":
        return new Stop(point, direction, info.width, info.height);
      case "target":
        return new Target(point, direction, info.width, info.height);
      case "yield":
        return new Yield(point, direction, info.width, info.height);
    }
  }
}

export default Marking;

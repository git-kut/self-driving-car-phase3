import { scale, lerp2D, perpendicular, add } from "../math/utils.js";
import Marking from "./marking.js";
import Segment from "../primitives/segment.js";

class Light extends Marking {
  constructor(center, direction, width, height) {
    super(center, direction, width, 18);
    this.state = "green";

    this.border = this.polygon.segments[0];
    this.type = "light";
  }

  draw(ctx) {
    const perp = perpendicular(this.direction);
    const line = new Segment(
      add(this.center, scale(perp, this.width / 2)),
      add(this.center, scale(perp, -this.width / 2))
    );

    const greenLight = lerp2D(line.p1, line.p2, 0.25);
    const yellowLight = lerp2D(line.p1, line.p2, 0.5);
    const redLight = lerp2D(line.p1, line.p2, 0.75);

    new Segment(greenLight, redLight).draw(ctx, {
      width: this.height,
      cap: "round",
    });

    greenLight.draw(ctx, { color: "#060", size: 10 });
    yellowLight.draw(ctx, { color: "#660", size: 10 });
    redLight.draw(ctx, { color: "#600", size: 10 });

    switch (this.state) {
      case "green":
        greenLight.draw(ctx, { color: "#0F0", size: 10 });
        break;
      case "yellow":
        yellowLight.draw(ctx, { color: "#FF0", size: 10 });
        break;
      case "red":
        redLight.draw(ctx, { color: "#F00", size: 10 });
        break;
    }
  }
}

export default Light;

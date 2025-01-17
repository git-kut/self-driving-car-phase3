import Polygon from "../primitives/polygon.js";
import { add, average, getFake3D, scale, subtract } from "../math/utils.js";
import Viewport from "../viewport.js";

class Building {
  constructor(polygon, height = 200) {
    this.base = polygon;
    this.height = height;
  }

  draw(ctx, viewPoint) {
    const top = this.base.points.map((point) =>
      getFake3D(point, viewPoint, this.height * 0.6)
    );
    const ceiling = new Polygon(top);
    const sides = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const nextI = (i + 1) % this.base.points.length;
      const polygon = new Polygon([
        this.base.points[i],
        this.base.points[nextI],
        top[nextI],
        top[i],
      ]);
      sides.push(polygon);
    }
    sides.sort(
      (a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint)
    );

    const baseMidPoints = [
      average(this.base.points[0], this.base.points[1]),
      average(this.base.points[2], this.base.points[3]),
    ];

    const topMidPoints = baseMidPoints.map((point) =>
      getFake3D(point, viewPoint, this.height)
    );

    const roofPolys = [
      new Polygon([
        ceiling.points[0],
        ceiling.points[3],
        topMidPoints[1],
        topMidPoints[0],
      ]),
      new Polygon([
        ceiling.points[2],
        ceiling.points[1],
        topMidPoints[0],
        topMidPoints[1],
      ]),
    ];

    roofPolys.sort(
      (a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint)
    );

    this.base.draw(ctx, {
      fill: "white",
      stroke: "rgba(0, 0, 0, 0.2)",
      lineWidth: 20,
    });
    for (const side of sides) {
      side.draw(ctx, { fill: "white", stroke: "#AAA" });
    }
    ceiling.draw(ctx, { fill: "white", stroke: "white", linewidth: 8 });

    if (this.base.points.length == 5) {
      for (const polygon of roofPolys) {
        polygon.draw(ctx, {
          fill: "#D44",
          stroke: "#C44",
          linewidth: 8,
          join: "round",
        });
      }
    }
  }

  static load(info) {
    return new Building(Polygon.load(info.base), info.height);
  }
}

export default Building;

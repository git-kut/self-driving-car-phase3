import { scale } from "./world/js/math/utils.js";
import Point from "./world/js/primitives/point.js";

class MiniMap {
  constructor(canvas, graph, size) {
    this.canvas = canvas;
    this.graph = graph;
    this.size = size;

    this.ctx = canvas.getContext("2d");
  }

  update(viewPoint) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.size / 2,
      0,
      360
    );
    this.ctx.fillStyle = "rgb(70, 70, 70)";
    this.ctx.fill();
    const scaler = 0.05;
    const scaledViewPoint = scale(viewPoint, -scaler);
    this.ctx.save();
    this.ctx.translate(
      scaledViewPoint.x + this.size / 2,
      scaledViewPoint.y + this.size / 2
    );
    this.ctx.scale(scaler, scaler);
    for (const segment of this.graph.segments) {
      segment.draw(this.ctx, { width: 3 / scaler, color: "white" });
    }
    this.ctx.restore();
    new Point(this.size / 2, this.size / 2).draw(this.ctx, {
      color: "blue",
      outline: true,
    });
  }
}
export default MiniMap;

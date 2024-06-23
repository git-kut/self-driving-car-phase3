import Point from "./primitives/point.js";
import { subtract, add, scale } from "./math/utils.js";

class Viewport {
  constructor(canvas, zoom = 1, offset = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.zoom = zoom;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = offset ? offset : scale(this.center, -1);
    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.#addEventListeners();
  }

  getOffset() {
    return add(this.offset, this.drag.offset);
  }

  getMouse(event, subtractDragOffset = false) {
    const point = new Point(
      (event.offsetX - this.center.x) * this.zoom - this.offset.x,
      (event.offsetY - this.center.y) * this.zoom - this.offset.y
    );

    return subtractDragOffset ? subtract(point, this.drag.offset) : point;
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  #addEventListeners() {
    this.canvas.addEventListener(
      "mousewheel",
      this.#handleMouseWheel.bind(this)
    );
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
  }

  #handleMouseWheel(event) {
    const direction = Math.sign(event.deltaY);
    const scale = 0.1;
    this.zoom += direction * scale;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
  }

  #handleMouseUp(event) {
    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }

  #handleMouseDown(evt) {
    if (evt.button == 1) {
      // middle button
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
    }
  }

  #handleMouseMove(evt) {
    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }
}

export default Viewport;

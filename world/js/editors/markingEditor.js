import { getNearestSegment } from "../math/utils.js";

class MarkingEditor {
  constructor(viewport, world, targetSegments) {
    this.viewport = viewport;
    this.world = world;
    this.targetSegments = targetSegments;

    this.canvas = viewport.canvas;
    this.ctx = this.canvas.getContext("2d");

    this.mouseCoordinates = null;
    this.intent = null;

    this.markings = world.markings;
  }

  // tbc
  createMarking(center, direction) {
    return center;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.selected = false;
    this.hovered = false;
  }

  #addEventListeners() {
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundContextMenu = (event) => event.preventDefault();

    this.canvas.addEventListener("mousemove", this.boundMouseMove);

    this.canvas.addEventListener("mousedown", this.boundMouseDown);

    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);

    this.canvas.removeEventListener("mousedown", this.boundMouseDown);

    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(event) {
    this.mouseCoordinates = this.viewport.getMouse(event, true);
    const segment = getNearestSegment(
      this.mouseCoordinates,
      this.targetSegments,
      15 * this.viewport.zoom
    );
    if (segment) {
      const proj = segment.projectPoint(this.mouseCoordinates);
      if (proj.offset >= 0 && proj.offset <= 1) {
        this.intent = this.createMarking(proj.point, segment.directionVector());
      } else {
        this.intent = null;
      }
    } else {
      this.intent = null;
    }
  }

  #handleMouseDown(event) {
    if (event.button == 0) {
      if (this.intent) {
        this.markings.push(this.intent);
        this.intent = null;
      }
    }

    if (event.button == 2) {
      for (let i = 0; i < this.markings.length; i++) {
        const polygon = this.markings[i].polygon;
        console.log(polygon);
        if (polygon.containsPoint(this.mouseCoordinates)) {
          this.markings.splice(i, 1);
          return;
        }
      }
    }
  }

  display() {
    if (this.intent) {
      this.intent.draw(this.ctx);
    }
  }
}

export default MarkingEditor;

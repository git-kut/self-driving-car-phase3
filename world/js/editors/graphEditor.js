import Point from "../primitives/point.js";
import { getNearestPoint } from "../math/utils.js";
import Segment from "../primitives/segment.js";

class GraphEditor {
  constructor(viewport, graph, world) {
    this.viewport = viewport;
    this.world = world;
    this.canvas = viewport.canvas;
    this.graph = graph;
    this.selected = null;
    this.hovered = null;
    this.dragging = false;
    this.ctx = this.canvas.getContext("2d");
    this.mouseCoordinates = null;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.selected = false;
    this.hovered = false;
    this.dragging = false;
  }

  #addEventListeners() {
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseUp = () => (this.dragging = false);
    this.boundContextMenu = (event) => event.preventDefault();

    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);

    window.addEventListener("keydown", (event) => {
      if (event.key == "s") {
        this.start = this.mouseCoordinates;
      }

      if (event.key == "t") {
        this.target = this.mouseCoordinates;
      }

      if (this.start && this.target) {
        this.world.generateCorridor(this.start, this.target);
      }
    });
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(event) {
    this.mouseCoordinates = this.viewport.getMouse(event, true);
    this.hovered = getNearestPoint(
      this.mouseCoordinates,
      this.graph.points,
      15 * this.viewport.zoom
    );
    if (this.dragging == true) {
      this.selected.x = this.mouseCoordinates.x;
      this.selected.y = this.mouseCoordinates.y;
    }
  }

  #handleMouseDown(event) {
    // right click point removal
    if (event.button == 2) {
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }
    // left click point
    if (event.button == 0) {
      if (this.hovered) {
        this.#select(this.hovered);
        this.dragging = true;
        return;
      }
      this.graph.addPoint(this.mouseCoordinates);
      console.log(this.graph.points);
      this.#select(this.mouseCoordinates);
      this.hovered = this.mouseCoordinates;
    }
  }

  #select(point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  #removePoint(point) {
    this.graph.removePoint(point);
    this.hovered = null;
    if (this.selected == point) {
      this.selected = null;
    }
  }

  display() {
    this.graph.draw(this.ctx);
    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered ? this.hovered : this.mouseCoordinates;
      new Segment(this.selected, intent).draw(this.ctx, { dash: [6, 3] });
      this.selected.draw(this.ctx, { outline: true });
    }

    /* if (this.start && this.target) {
      const path = this.graph.getShortestPath(this.start, this.target);
      for (const point of path) {
        point.draw(this.ctx, {
          size: 50,
          color: "rgba(0, 0, 255, 0.3)",
        });
        if (point.previous) {
          new Segment(point, point.previous).draw(this.ctx, {
            width: 20,
            color: "rgba(0, 0, 0, 0.3)",
          });
        }
      }
    } */
  }

  remove() {
    this.graph.dispose();
    this.hovered = null;
    this.selected = null;
  }
}

export default GraphEditor;

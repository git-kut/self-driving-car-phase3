import Crossing from "../markings/crossing.js";
import MarkingEditor from "./markingEditor.js";

class CrossingEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.graph.segments);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Crossing(
      center,
      direction,
      this.world.roadWidth,
      this.world.roadWidth / 2
    );
  }
}

export default CrossingEditor;

import Yield from "../markings/yield.js";
import MarkingEditor from "./markingEditor.js";

class YieldEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Yield(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default YieldEditor;

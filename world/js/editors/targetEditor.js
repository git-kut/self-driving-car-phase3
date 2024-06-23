import Target from "../markings/target.js";
import MarkingEditor from "./markingEditor.js";

class TargetEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Target(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default TargetEditor;

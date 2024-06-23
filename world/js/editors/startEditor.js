import MarkingEditor from "./markingEditor.js";
import Start from "../markings/start.js";

class StartEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Start(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default StartEditor;

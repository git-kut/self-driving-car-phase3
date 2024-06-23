import Stop from "../markings/stop.js";
import MarkingEditor from "./markingEditor.js";

class StopEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Stop(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default StopEditor;

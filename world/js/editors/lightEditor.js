import MarkingEditor from "./markingEditor.js";
import Light from "../markings/light.js";

class LightEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Light(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default LightEditor;

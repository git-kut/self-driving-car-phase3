import Parking from "../markings/parking.js";
import MarkingEditor from "./markingEditor.js";

class ParkingEditor extends MarkingEditor {
  constructor(viewport, world) {
    super(viewport, world, world.laneGuides);
    this.world = world;
  }

  createMarking(center, direction) {
    return new Parking(
      center,
      direction,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}

export default ParkingEditor;

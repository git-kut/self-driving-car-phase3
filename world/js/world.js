import {
  add,
  scale,
  getNearestPoint,
  lerp,
  distance,
  getNearestSegment,
} from "./math/utils.js";
import Envelope from "./primitives/envelope.js";
import Polygon from "./primitives/polygon.js";
import Segment from "./primitives/segment.js";
import Point from "./primitives/point.js";
import Tree from "./items/tree.js";
import Building from "./items/building.js";
import Light from "./markings/light.js";
import Graph from "./math/graph.js";
import Marking from "./markings/marking.js";
import Start from "./markings/start.js";

class World {
  constructor(
    graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinLength = 150,
    spacing = 50,
    treeSize = 160
  ) {
    this.graph = graph;
    this.roadRoundness = roadRoundness;
    this.roadWidth = roadWidth;
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.envolopes = [];
    this.roadBorders = [];
    this.buildings = [];
    this.trees = [];
    this.laneGuides = [];
    this.markings = [];
    this.frameCount = 0;
    this.cars = [];
    this.bestCar = null;
    this.generate();
  }

  draw(ctx, viewPoint, showStartMark = true, renderRadius = 1000) {
    this.#updateLight();

    for (const envelope of this.envolopes) {
      envelope.draw(ctx, { fill: "#BBB", lineWidth: 15, stroke: "#BBB" });
    }

    for (const marking of this.markings) {
      if (!(marking instanceof Start) || showStartMark) {
        marking.draw(ctx);
      }
    }

    for (const segment of this.graph.segments) {
      segment.draw(ctx, { color: "white", width: 8, dash: [10, 10] });
    }

    for (const seg of this.roadBorders) {
      seg.draw(ctx, { color: "white", width: 4 });
    }

    if (this.corridor) {
      for (const seg of this.corridor) {
        seg.draw(ctx, { color: "red", width: 4 });
      }
    }

    ctx.globalAlpha = 0.2;
    for (const car of this.cars) {
      car.draw(ctx);
    }

    ctx.globalAlpha = 1;
    if (this.bestCar) {
      this.bestCar.draw(ctx, true);
    }

    const items = [...this.buildings, ...this.trees].filter(
      (item) => item.base.distanceToPoint(viewPoint) < renderRadius
    );
    items.sort(
      (a, b) =>
        b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
    );

    for (const item of items) {
      item.draw(ctx, viewPoint);
    }
  }

  static load(info) {
    const world = new World(new Graph());
    world.graph = Graph.load(info.graph);
    world.roadRoundness = info.roadRoundness;
    world.roadWidth = info.roadWidth;
    world.buildingWidth = info.buildingWidth;
    world.buildingMinLength = info.buildingMinLength;
    world.spacing = info.spacing;
    world.treeSize = info.treeSize;
    world.envolopes = info.envolopes.map((envelope) => Envelope.load(envelope));
    world.roadBorders = info.roadBorders.map(
      (border) => new Segment(border.p1, border.p2)
    );
    world.buildings = info.buildings.map((envelope) => Building.load(envelope));
    world.trees = info.trees.map((tree) => new Tree(tree.point, info.treeSize));
    world.laneGuides = info.laneGuides.map(
      (guide) => new Segment(guide.p1, guide.p2)
    );
    world.markings = info.markings.map((marking) => Marking.load(marking));
    world.zoom = info.zoom;
    world.offset = info.offset;

    return world;
  }

  #updateLight() {
    const lights = this.markings.filter((marking) => marking instanceof Light);
    const controlCenters = [];
    for (const light of lights) {
      const point = getNearestPoint(light.center, this.#getIntersections());

      let controlCenter = controlCenters.find((contCenter) =>
        contCenter.equals(point)
      );

      if (!controlCenter) {
        controlCenter = new Point(point.x, point.y);
        controlCenter.lights = [light]; // Corrected typo
        controlCenters.push(controlCenter); // Corrected array push method
      } else {
        controlCenter.lights.push(light);
      }
    }

    const greenDuration = 2;
    const yellowDuration = 1;

    for (const center of controlCenters) {
      center.ticks = center.lights.length * (greenDuration + yellowDuration);
    }

    const tick = Math.floor(this.frameCount / 60);

    for (const center of controlCenters) {
      const cTick = tick % center.ticks;
      const greenYellowIndex = Math.floor(
        cTick / (greenDuration + yellowDuration)
      );
      const greenYellowState =
        cTick % (greenDuration + yellowDuration) < greenDuration
          ? "green"
          : "yellow";

      console.log(
        `Center: ${center}, Tick: ${cTick}, GreenYellowIndex: ${greenYellowIndex}, State: ${greenYellowState}`
      );

      for (let i = 0; i < center.lights.length; i++) {
        if (i == greenYellowIndex) {
          center.lights[i].state = greenYellowState;
        } else {
          center.lights[i].state = "red"; // Corrected assignment operator
        }
      }
    }

    this.frameCount++;
  }

  #getIntersections() {
    const intersections = [];
    for (const point of this.graph.points) {
      let degree = 0;
      for (const segment of this.graph.segments) {
        if (segment.p1 == point || segment.p2 == point) {
          degree++;
        }
      }
      if (degree > 2) {
        intersections.push(point);
      }
    }
    return intersections;
  }

  generate() {
    this.envolopes.length = 0;
    for (const segment of this.graph.segments) {
      this.envolopes.push(
        new Envelope(segment, this.roadWidth, this.roadRoundness)
      );
    }

    this.roadBorders = Polygon.union(
      this.envolopes.map((envelope) => envelope.polygon)
    );

    this.buildings = this.#generateBuildings();

    this.trees = this.#generateTrees();

    this.laneGuides.length = 0;
    this.laneGuides.push(...this.#generateLaneGuides());
  }

  #generateLaneGuides() {
    const tempEnvelopes = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(
        new Envelope(segment, this.roadWidth / 2, this.roadRoundness)
      );
    }

    const segments = Polygon.union(
      tempEnvelopes.map((envelope) => envelope.polygon)
    );
    return segments;
  }

  #generateBuildings() {
    const tempEnvelopes = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness
        )
      );
    }
    const guides = Polygon.union(
      tempEnvelopes.map((envelope) => envelope.polygon)
    );

    for (let i = 0; i < guides.length; i++) {
      const segment = guides[i];
      if (segment.length() < this.buildingMinLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports = [];
    for (let segment of guides) {
      const length = segment.length() + this.spacing;
      const buildingCount = Math.floor(
        length / (this.buildingMinLength + this.spacing)
      );
      const buildingLength = length / buildingCount - this.spacing;

      const direction = segment.directionVector();

      let q1 = segment.p1;
      let q2 = add(q1, scale(direction, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i <= buildingCount; i++) {
        q1 = add(q2, scale(direction, this.spacing));
        q2 = add(q1, scale(direction, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }
    const bases = [];
    for (const segment of supports) {
      bases.push(new Envelope(segment, this.buildingWidth).polygon);
    }
    const eps = 0.001;
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPolygon(bases[j]) ||
          bases[i].distanceToPolygon(bases[j]) < this.spacing - eps
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases.map((base) => new Building(base));
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders.map((segment) => [segment.p1, segment.p2]).flat(),
      ...this.buildings.map((building) => building.base.points).flat(),
    ];
    const left = Math.min(...points.map((point) => point.x));
    const right = Math.max(...points.map((point) => point.x));
    const top = Math.min(...points.map((point) => point.y));
    const bottom = Math.max(...points.map((point) => point.y));

    const collidablePolygons = [
      ...this.buildings.map((building) => building.base),
      ...this.envolopes.map((envelope) => envelope.polygon),
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const point = new Point(
        lerp(left, right, Math.random()),
        lerp(top, bottom, Math.random())
      );

      let keep = true;
      for (const polygon of collidablePolygons) {
        if (
          polygon.containsPoint(point) ||
          polygon.distanceToPoint(point) < this.treeSize / 2
        ) {
          keep = false;
          break;
        }
      }

      if (keep) {
        for (const tree of trees) {
          if (distance(tree.point, point) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }

      if (keep) {
        let somethingIsClose = false;
        for (const polygon of collidablePolygons) {
          if (polygon.distanceToPoint(point) < this.treeSize * 2) {
            somethingIsClose = true;
            break;
          }
        }
        keep = somethingIsClose;
      }

      if (keep) {
        trees.push(new Tree(point, this.treeSize));
        tryCount = 0;
      }
      tryCount++;
    }
    return trees;
  }

  generateCorridor(start, target) {
    const startSegment = getNearestSegment(start, this.graph.segments);
    const finalSegment = getNearestSegment(target, this.graph.segments);

    const { point: projectedStart } = startSegment.projectPoint(start);
    const { point: projectedTarget } = finalSegment.projectPoint(target);

    this.graph.points.push(projectedStart);
    this.graph.points.push(projectedTarget);

    const tempSegments = [
      new Segment(startSegment.p1, projectedStart),
      new Segment(projectedStart, startSegment.p2),
      new Segment(finalSegment.p1, projectedTarget),
      new Segment(projectedTarget, finalSegment.p2),
    ];

    if (startSegment.equals(finalSegment)) {
      tempSegments.push(new Segment(projectedStart, projectedTarget));
    }

    this.graph.segments = this.graph.segments.concat(tempSegments);

    const path = this.graph.getShortestPath(projectedStart, projectedTarget);

    this.graph.removePoint(projectedStart);
    this.graph.removePoint(projectedTarget);

    const segments = [];
    for (let i = 1; i < path.length; i++) {
      segments.push(new Segment(path[i - 1], path[i]));
    }
    const tempEnvelopes = segments.map(
      (segment) => new Envelope(segment, this.roadWidth, this.roadRoundness)
    );

    const union = Polygon.union(
      tempEnvelopes.map((envelope) => envelope.polygon)
    );

    this.corridor = union;
  }
}

export default World;

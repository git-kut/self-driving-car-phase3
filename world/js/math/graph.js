import Point from "../primitives/point.js";
import Segment from "../primitives/segment.js";

class Graph {
  constructor(points = [], segments = []) {
    this.points = points;
    this.segments = segments;
  }

  static load(info) {
    const points = info.points.map((point) => new Point(point.x, point.y));
    const segments = info.segments.map(
      (index) =>
        new Segment(
          points.find((point) => point.equals(index.p1)),
          points.find((point) => point.equals(index.p2)),
          index.oneWay
        )
    );

    return new Graph(points, segments);
  }

  draw(ctx) {
    for (const segment of this.segments) {
      segment.draw(ctx);
    }
    for (const point of this.points) {
      point.draw(ctx);
    }
  }

  hash() {
    return JSON.stringify(this);
  }

  addPoint(point) {
    this.points.push(point);
  }

  addSegment(segment) {
    this.segments.push(segment);
    // console.log(this.segments);
  }

  removeSegment(segment) {
    this.segments.splice(this.segments.indexOf(segment), 1);
  }

  removePoint(point) {
    const segments = this.getSegmentWithPoint(point);
    for (const segment of segments) {
      this.removeSegment(segment);
    }
    this.points.splice(this.points.indexOf(point), 1);
  }

  containsPoint(point) {
    return this.points.find((p) => p.equals(point));
  }

  tryAddPoint(point) {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  containsSegment(segment) {
    return this.segments.find((seg) => seg.equals(segment));
  }

  getSegmentWithPoint(point) {
    const segments = [];
    for (const segment of this.segments) {
      if (Object.values(segment).includes(point)) {
        segments.push(segment);
      }
    }
    return segments;
  }

  getSegmentsLeavingFromPoint(point) {
    const segments = [];
    for (const segment of this.segments) {
      if (segment.oneWay) {
        if (segment.p1.equals(point)) {
          segments.push(segment);
        }
      } else {
        if (Object.values(segment).includes(point)) {
          segments.push(segment);
        }
      }
    }
    return segments;
  }

  tryAddSegment(segment) {
    if (!this.containsSegment(segment)) {
      this.addSegment(segment);
      return true;
    }
    return false;
  }

  dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  getShortestPath(start, target) {
    for (const point of this.points) {
      point.distance = Number.MAX_SAFE_INTEGER;
      point.visited = false;
    }
    let currentPoint = start;
    currentPoint.distance = 0;

    while (!target.visited) {
      const segs = this.getSegmentsLeavingFromPoint(currentPoint);
      for (const segment of segs) {
        const otherPoint = segment.p1.equals(currentPoint)
          ? segment.p2
          : segment.p1;
        if (currentPoint.distance + segment.length() < otherPoint.distance) {
          otherPoint.distance = currentPoint.distance + segment.length();
          otherPoint.previous = currentPoint;
          console.log();
        }
      }
      currentPoint.visited = true;
      const unvisited = this.points.filter((point) => point.visited == false);
      const distances = unvisited.map((point) => point.distance);
      currentPoint = unvisited.find(
        (point) => point.distance == Math.min(...distances)
      );
    }
    const path = [];
    currentPoint = target;
    while (currentPoint) {
      path.unshift(currentPoint);
      currentPoint = currentPoint.previous;
    }

    for (const point of this.points) {
      delete point.distance;
      delete point.visited;
      delete point.previous;
    }

    return path;
  }
}
export default Graph;

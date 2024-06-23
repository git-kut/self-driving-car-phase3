import Segment from "./segment.js";
import Point from "./point.js";
import { getIntersection, getRandomColor, average } from "../math/utils.js";

class Polygon {
  constructor(points) {
    this.points = points;
    this.segments = [];
    for (let i = 1; i <= points.length; i++) {
      this.segments.push(new Segment(points[i - 1], points[i % points.length]));
    }
  }

  draw(
    ctx,
    {
      stroke = "blue",
      linewidth = 2,
      fill = "rgba(0, 0, 255, 0.3)",
      join = "miter",
    } = {}
  ) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.linewidth = linewidth;
    ctx.lineJoin = join;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  static load(info) {
    return new Polygon(info.points.map((point) => new Point(point.x, point.y)));
  }

  static multiBreak(polygons) {
    for (let i = 0; i < polygons.length - 1; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  static union(polys) {
    Polygon.multiBreak(polys);
    const segmentsToKeep = [];
    for (let i = 0; i < polys.length; i++) {
      for (const segment of polys[i].segments) {
        let keep = true;
        for (let j = 0; j < polys.length; j++) {
          if (i != j) {
            if (polys[j].containsSegment(segment)) {
              keep = false;
              this.break;
            }
          }
        }
        if (keep) {
          segmentsToKeep.push(segment);
        }
      }
    }
    return segmentsToKeep;
  }

  distanceToPoint(point) {
    return Math.min(
      ...this.segments.map((segment) => segment.distanceToPoint(point))
    );
  }

  distanceToPolygon(polygon) {
    return Math.min(
      ...this.points.map((point) => polygon.distanceToPoint(point))
    );
  }

  intersectsPolygon(polygon) {
    for (let segment of this.segments) {
      for (let polysegment of polygon.segments) {
        if (
          getIntersection(
            segment.p1,
            segment.p2,
            polysegment.p1,
            polysegment.p2
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  containsSegment(segment) {
    const midpoint = average(segment.p1, segment.p2);
    return this.containsPoint(midpoint);
  }

  containsPoint(point) {
    const outerPoint = new Point(-2000, -2000);
    let intersectionCount = 0;
    for (const segment of this.segments) {
      const intersect = getIntersection(
        outerPoint,
        point,
        segment.p1,
        segment.p2
      );
      if (intersect) {
        intersectionCount++;
      }
    }
    return intersectionCount % 2 == 1;
  }

  static break(polygon1, polygon2) {
    const segments1 = polygon1.segments;
    const segments2 = polygon2.segments;

    for (let i = 0; i < segments1.length; i++) {
      for (let j = 0; j < segments2.length; j++) {
        const intersection = getIntersection(
          segments1[i].p1,
          segments1[i].p2,
          segments2[j].p1,
          segments2[j].p2
        );

        if (
          intersection &&
          intersection.offset != 1 &&
          intersection.offset != 0
        ) {
          const point = new Point(intersection.x, intersection.y);
          let reference = segments1[i].p2;
          segments1[i].p2 = point;
          segments1.splice(i + 1, 0, new Segment(point, reference));
          reference = segments2[j].p2;
          segments2[j].p2 = point;
          segments2.splice(j + 1, 0, new Segment(point, reference));
        }
      }
    }
  }

  drawSegments(ctx) {
    for (const segment of this.segments) {
      segment.draw(ctx, { color: getRandomColor(), width: 5 });
    }
  }
}

export default Polygon;

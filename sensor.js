import { lerp, getIntersection } from "./utils.js";
import Light from "./world/js/markings/light.js";
import Stop from "./world/js/markings/stop.js";
import Point from "./world/js/primitives/point.js";

class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 155;
    this.raySpread = Math.PI / 4; // 90 degree angle
    this.rayOffset = 0;
    this.rays = [];
    this.readings = [];
  }

  update(roadBorders, traffic, markings) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(
        this.#getReading(this.rays[i], roadBorders, traffic, markings)
      );
    }
  }

  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) +
        this.car.angle +
        this.rayOffset;
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  #getReading(ray, roadBorders, traffic, markings) {
    let touches = [];

    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      if (touch) {
        touches.push(touch);
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      const pol = traffic[i].polygon;
      for (let j = 0; j < pol.length; j++) {
        const touch = getIntersection(
          ray[0],
          ray[1],
          pol[j],
          pol[(j + 1) % pol.length]
        );
        if (touch) {
          touches.push(touch);
        }
      }
    }
    /* 
    const stopMarking = markings.filter((marking) => marking instanceof Stop);
    for (let i = 0; i < stopMarking.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        stopMarking[i].border.p1,
        stopMarking[i].border.p2
      );
      if (touch) {
        touches.push(touch);
      }
    }

    const trafficLightMarking = markings.filter(
      (marking) => marking instanceof Light
    );
    for (let i = 0; i < trafficLightMarking.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        trafficLightMarking[i].border.p1,
        trafficLightMarking[i].border.p2
      );
      if (touch && trafficLightMarking[i].state !== "green") {
        console.log(trafficLightMarking[i].state);
        touches.push(touch);
      }
    }
    */
    if (touches.length == 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset == minOffset);
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i];
      }
      /* // Ray
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Collision
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke(); */
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.car.color;
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      new Point(end.x, end.y).draw(ctx, {
        color: this.car.color,
        outline: true,
      });
    }
  }
}

export default Sensor;

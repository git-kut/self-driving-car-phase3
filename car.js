import Controls from "./controls.js";
import { NeuralNetwork } from "./network.js";
import Sensor from "./sensor.js";
import { polygonIntersect, getRandomColor } from "./utils.js";
import Stop from "./world/js/markings/stop.js";
import Light from "./world/js/markings/light.js";
import { getIntersection } from "./utils.js";

class Car {
  constructor(
    world,
    x,
    y,
    width,
    height,
    controlType,
    angle = 0,
    maxSpeed = 5,
    color = getRandomColor()
  ) {
    this.world = world;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.acceleration = 0.2;
    this.angle = angle;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.controls = new Controls(controlType);
    this.useBrain = controlType == "AI";
    this.mile = 0;
    this.color = color;
    this.roadBorders = null;
    this.target = null;
    this.startingCoordinates = null;

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.damaged = false;
    this.polygon = this.#createPolygon();

    this.img = new Image();
    this.img.src = "car.png";

    this.mask = document.createElement("canvas");
    this.mask.width = width;
    this.mask.height = height;

    const maskCtx = this.mask.getContext("2d");
    this.img.onload = () => {
      maskCtx.fillStyle = color;
      maskCtx.rect(0, 0, this.width, this.height);
      maskCtx.fill();

      maskCtx.globalCompositeOperation = "destination-atop";
      maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
    };
  }

  draw(ctx, drawSensor = false) {
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
    /* if (this.damaged) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill(); */
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);
    if (!this.damaged) {
      ctx.drawImage(
        this.mask,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.globalCompositeOperation = "multiply";
    }
    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }

  load(info) {
    this.brain = info.brain;
    this.maxSpeed = info.maxSpeed;
    this.friction = info.friction;
    this.acceleration = info.acceleration;
    this.sensor.rayCount = info.sensor.rayCount;
    this.sensor.raySpread = info.sensor.raySpread;
    this.sensor.rayLength = info.sensor.rayLength;
    this.sensor.rayOffset = info.sensor.rayOffset;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.mile += this.speed;
      this.polygon = this.#createPolygon();
      this.damaged = this.#detectDamage(
        roadBorders,
        traffic.filter((car) => car !== this)
      );
    }
    if (this.sensor) {
      const stopMarking = this.world.markings.filter(
        (marking) => marking instanceof Stop
      );
      let stopInput = null; // Initialize to null to check for the first intersection
      for (let i = 0; i < stopMarking.length; i++) {
        for (let j = 0; j < this.sensor.rays.length; j++) {
          const touch = getIntersection(
            this.sensor.rays[j][0],
            this.sensor.rays[j][1],
            stopMarking[i].border.p1,
            stopMarking[i].border.p2
          );
          if (touch) {
            const potentialStopInput = 1 - touch.offset;
            if (stopInput === null || potentialStopInput > stopInput) {
              stopInput = potentialStopInput;
            }
          }
        }
      }
      if (stopInput === null) stopInput = 0; // If no intersection was found, set to 0

      const trafficLightMarking = this.world.markings.filter(
        (marking) => marking instanceof Light
      );
      let lightInput = null; // Initialize to null to check for the first intersection
      for (let i = 0; i < trafficLightMarking.length; i++) {
        for (let j = 0; j < this.sensor.rays.length; j++) {
          const touch = getIntersection(
            this.sensor.rays[j][0],
            this.sensor.rays[j][1],
            trafficLightMarking[i].border.p1,
            trafficLightMarking[i].border.p2
          );
          if (touch && trafficLightMarking[i].state !== "green") {
            const potentialLightInput = 1 - touch.offset;
            if (lightInput === null || potentialLightInput > lightInput) {
              lightInput = potentialLightInput;
            }
          }
        }
      }
      if (lightInput === null) lightInput = 0; // If no intersection was found, set to 0

      this.sensor.update(
        roadBorders,
        traffic.filter((car) => car !== this)
      );
      console.log(stopInput, lightInput);
      const offsets = this.sensor.readings
        .map((sensor) => (sensor == null ? 0 : 1 - sensor.offset))
        .concat([this.speed / this.maxSpeed])
        .concat([stopInput])
        .concat([lightInput]);

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #createPolygon() {
    const points = [];
    const radius = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });
    return points;
  }

  #detectDamage(roadBorders, traffic) {
    // console.log(traffic.length);
    for (let i = 0; i < roadBorders.length; i++) {
      // console.log("road", this.polygon, roadBorders[i]);
      if (polygonIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      // console.log("traffic", this.polygon, traffic[i].polygon);
      if (polygonIntersect(this.polygon, traffic[i].polygon)) {
        // console.log("in");
        return true;
      }
    }
    return false;
  }

  #move() {
    // Forward and Reverse Movement
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    // Left and Right Movement
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;

    // Physics
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }
  }
}

export default Car;

import Car from "./car.js";
import { NeuralNetwork } from "./network.js";
import Road from "./road.js";
import { Visualizer } from "./visualizer.js";
import World from "./world/js/world.js";
import Graph from "./world/js/math/graph.js";
import Viewport from "./world/js/viewport.js";
import { angle, scale } from "./world/js/math/utils.js";
import Start from "./world/js/markings/start.js";
import Point from "./world/js/primitives/point.js";
import world from "./world/saves/pathFinding.js";
import MiniMap from "./miniMap.js";
import carInfo from "./saves/carSave.js";
import Target from "./world/js/markings/target.js";

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = window.innerWidth - 330;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const miniMapCanvas = document.getElementById("miniMapCanvas");
miniMapCanvas.height = 300;
miniMapCanvas.width = 300;

carCanvas.height = window.innerHeight;
networkCanvas.height = window.innerHeight - 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

/* const worldSave = localStorage.getItem("world");
const worldInfo = worldSave ? JSON.parse(worldSave) : null;
const world = worldInfo ? World.load(worldInfo) : new World(new Graph()); */
const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
// const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
// const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");

const cars = generateCars(1);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 1);
    }
  }
}
const traffic = [];
let roadBorders = [];
const target = world.markings.find((marking) => marking instanceof Target);
if (target) {
  world.generateCorridor(bestCar, target.center);
  roadBorders = world.corridor.map((segment) => [segment.p1, segment.p2]);
} else {
  roadBorders = world.roadBorders.map((segment) => [segment.p1, segment.p2]);
}

animate();

function save() {
  console.log("saved!");
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  console.log(bestCar.brain);
}
function discard() {
  console.log("discard!");
  localStorage.removeItem("bestBrain");
}
window.save = save;
window.discard = discard;

function generateCars(num) {
  const startingPoints = world.markings.filter(
    (marking) => marking instanceof Start
  );
  const startingPoint =
    startingPoints.length > 0 ? startingPoints[0].center : new Point(100, 100);
  const startingDirection =
    startingPoints.length > 0 ? startingPoints[0].direction : new Point(0, -1);
  const startingAngle = -angle(startingDirection) + Math.PI / 2;
  const cars = [];
  for (let i = 1; i <= num; i++) {
    const car = new Car(
      startingPoint.x,
      startingPoint.y,
      30,
      50,
      "AI",
      startingAngle,
      3,
      "gray"
    );
    car.load(carInfo);
    cars.push(car);
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(roadBorders, cars[0]);
  }
  for (let car of cars) {
    car.update(roadBorders, traffic);
  }
  bestCar = cars.find(
    (car) => car.mile == Math.max(...cars.map((car) => car.mile))
  );
  world.cars = cars;
  world.bestCar = bestCar;

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }

  viewport.offset.x = -bestCar.x;
  viewport.offset.y = -bestCar.y;

  viewport.reset();

  const viewPoint = scale(viewport.offset, -1);
  world.draw(carCtx, viewPoint, false);
  miniMap.update(viewPoint);

  networkCtx.lineDashOffset = -time / 50;
  networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}

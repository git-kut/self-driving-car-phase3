import Car from "./car.js";
import { NeuralNetwork } from "./network.js";
import Road from "./road.js";
import { Visualizer } from "./visualizer.js";
import World from "./world/js/world.js";
import Graph from "./world/js/math/graph.js";
import Viewport from "./world/js/viewport.js";
import { angle, distance, scale, subtract } from "./world/js/math/utils.js";
import Start from "./world/js/markings/start.js";
import Point from "./world/js/primitives/point.js";
import world from "./world/saves/worldFetcher.js";
import MiniMap from "./miniMap.js";
import fetchCarData from "./saves/carSave.js";
import Target from "./world/js/markings/target.js";
import { polygonIntersect } from "./utils.js";

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = window.innerWidth - 330;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 330;

const miniMapCanvas = document.getElementById("miniMapCanvas");
miniMapCanvas.height = 335;
miniMapCanvas.width = 330;

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

const cars = generateCars();
let bestCar = cars[0];
/* if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.9);
    }
  }
} */

let roadBorders = [];

const targets = world.markings.filter((marking) => marking instanceof Target);
if (targets.length > 0) {
  for (let i = 0; i < cars.length; i++) {
    world.generateCorridor(cars[i], targets[i].center);
    roadBorders = world.corridor.map((segment) => [segment.p1, segment.p2]);
    cars[i].roadBorders = roadBorders;
    cars[i].target = targets[i];
  }
} else {
  roadBorders = world.roadBorders.map((segment) => [segment.p1, segment.p2]);
  cars[0].roadBorders = roadBorders;
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

function targetSelect() {
  bestCar.speed = 0;
  const selectElement = document.getElementById("targets");
  const selectedValue = selectElement.value;
  world.generateCorridor(bestCar, targets[selectedValue].center);
  roadBorders = world.corridor.map((segment) => [segment.p1, segment.p2]);
  bestCar.roadBorders = roadBorders;
  bestCar.target = targets[selectedValue];
}
window.targetSelect = targetSelect;

function generateCars() {
  const startingPoints = world.markings.filter(
    (marking) => marking instanceof Start
  );
  const cars = [];
  if (startingPoints.length > 0)
    for (let i = 0; i < startingPoints.length; i++) {
      const startingCoordinates = startingPoints[i].center;
      const startingDirection = startingPoints[i].direction;
      const startingAngle = -angle(startingDirection) + Math.PI / 2;
      const car = new Car(
        world,
        startingCoordinates.x,
        startingCoordinates.y,
        24,
        40,
        "AI",
        startingAngle,
        3
      );
      car.startingCoordinates = startingCoordinates;
      carLoader(car);
      cars.push(car);
    }

  return cars;
}

function animate(time) {
  //for (let i = 0; i < traffic.length; i++) {
  //  traffic[i].update(roadBorders, traffic);
  //}

  for (let car of cars) {
    car.update(car.roadBorders, cars);
    if (distance(car.target.center, car) < 10) {
      const index = targets.indexOf(car.target);
      const newTargetIndex = (index + 1) % targets.length;
      car.target = targets[newTargetIndex];
      world.generateCorridor(car, car.target.center);
      roadBorders = world.corridor.map((segment) => [segment.p1, segment.p2]);
      car.roadBorders = roadBorders;
      const selectElement = document.getElementById("targets");
      selectElement.value = newTargetIndex;
    }
  }
  // bestCar = cars.find(
  //   (car) => car.mile == Math.max(...cars.map((car) => car.mile))
  // );
  world.cars = cars;
  world.bestCar = bestCar;

  // for (let i = 0; i < traffic.length; i++) {
  //   traffic[i].draw(carCtx, "red");
  // }

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

async function carLoader(car) {
  try {
    const carInfo = await fetchCarData();
    console.log(carInfo); // This will log the resolved carInfo object
    car.load(carInfo); // Use the carInfo object to load the car
  } catch (error) {
    console.error("Error handling the car data:", error);
  }
}

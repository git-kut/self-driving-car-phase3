import Graph from "./js/math/graph.js";
import Point from "./js/primitives/point.js";
import Segment from "./js/primitives/segment.js";
import GraphEditor from "./js/editors/graphEditor.js";
import Viewport from "./js/viewport.js";
import World from "./js/world.js";
import { scale } from "./js/math/utils.js";
import StopEditor from "./js/editors/stopEditor.js";
import CrossingEditor from "./js/editors/crossingEditor.js";
import StartEditor from "./js/editors/startEditor.js";
import ParkingEditor from "./js/editors/parkingEditor.js";
import LightEditor from "./js/editors/lightEditor.js";
import YieldEditor from "./js/editors/yieldEditor.js";
import TargetEditor from "./js/editors/targetEditor.js";
import osm from "./js/math/osm.js";
import Building from "./js/items/building.js";

myCanvas.height = 600;
myCanvas.width = 600;

const ctx = myCanvas.getContext("2d");

/* Buttons
function addRandomPoint() {
  graph.tryAddPoint(
    new Point(Math.random() * myCanvas.width, Math.random() * myCanvas.height)
  );
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
window.addRandomPoint = addRandomPoint;

function addRandomSegment() {
  const index1 = Math.floor(Math.random() * graph.points.length);
  const index2 = Math.floor(Math.random() * graph.points.length);
  if (index1 != index2) {
    graph.tryAddSegment(
      new Segment(graph.points[index1], graph.points[index2])
    );
  }
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
window.addRandomSegment = addRandomSegment;

function removeRandomSegment() {
  if (graph.segments.length == 0) {
    console.log("no segments");
  }
  const index = Math.floor(Math.random() * graph.segments.length);
  graph.removeSegment(graph.segments[index]);

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
window.removeRandomSegment = removeRandomSegment;

function removeRandomPoint() {
  if (graph.points.length == 0) {
    console.log("no points");
  }

  const index = Math.floor(Math.random() * graph.points.length);
  graph.removePoint(graph.points[index]);
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
window.removeRandomPoint = removeRandomPoint;

function removeAll() {
  graph.dispose();
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
window.removeAll = removeAll; */

function remove() {
  graphEditor.remove();
  world.markings.length = 0;
  world.buildings.length = 0;
  world.trees.length = 0;
}
window.remove = remove;

function save() {
  world.zoom = viewport.zoom;
  world.offset = viewport.offset;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(world))
  );

  const fileName = "name.world";
  element.setAttribute("download", fileName);

  element.click();

  localStorage.setItem("world", JSON.stringify(world));
}
window.save = save;

function load(event) {
  const file = event.target.files[0];

  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = (event) => {
    const fileContent = event.target.result;
    const jsonData = JSON.parse(fileContent);
    world = World.load(jsonData);

    localStorage.setItem("world", JSON.stringify(world));

    location.reload();
  };
}
window.load = load;

function setMode(mode) {
  disableEditors();
  tools[mode].button.style.backgroundColor = "white";
  tools[mode].button.style.filter = "";
  tools[mode].editor.enable();
}
window.setMode = setMode;

function openOsmPanel() {
  osmPanel.style.display = "block";
}
window.openOsmPanel = openOsmPanel;

function closeOsmPanel() {
  osmPanel.style.display = "none";
}
window.closeOsmPanel = closeOsmPanel;

function parseOsmData() {
  if (osmDataContainer.value == "") {
    alert("Parse data first");
    return;
  }
  const res = osm.parseRoads(JSON.parse(osmDataContainer.value));
  const buildingBases = osm.parseBuildings(JSON.parse(osmDataContainer.value));
  world.graph.points = res.points;
  world.graph.segments = res.segments;
  console.log(buildingBases);
  world.buildings = buildingBases;
  closeOsmPanel();
}
window.parseOsmData = parseOsmData;

function disableEditors() {
  for (const tool of Object.values(tools)) {
    tool.editor.disable();
    tool.button.style.backgroundColor = "gray";
    tool.button.style.filter = "grayscale(100%)";
  }
}

const worldSave = localStorage.getItem("world");
const worldInfo = worldSave ? JSON.parse(worldSave) : null;
let world = worldInfo ? World.load(worldInfo) : new World(new Graph(), 80);

const graph = world.graph;

let oldGraphHash = graph.hash();

const viewport = new Viewport(myCanvas, world.zoom, world.offset);

// const world = new World(graph);
const graphEditor = new GraphEditor(viewport, graph, world);
const stopEditor = new StopEditor(viewport, world);
const crossingEditor = new CrossingEditor(viewport, world);
const startEditor = new StartEditor(viewport, world);
const parkingEditor = new ParkingEditor(viewport, world);
const lightEditor = new LightEditor(viewport, world);
const yieldEditor = new YieldEditor(viewport, world);
const targetEditor = new TargetEditor(viewport, world);

const tools = {
  graph: { button: graphBtn, editor: graphEditor },
  stop: { button: stopBtn, editor: stopEditor },
  crossing: { button: crossingBtn, editor: crossingEditor },
  start: { button: startBtn, editor: startEditor },
  parking: { button: parkingBtn, editor: parkingEditor },
  target: { button: targetBtn, editor: targetEditor },
  light: { button: lightBtn, editor: lightEditor },
  yield: { button: yieldBtn, editor: yieldEditor },
};

// NOTE: STROKE FOR POLYGON CLASS DO NOT WORK
// NOTE: WHILE MOVEMENT WITH ID 1 THE ANIMATION STOPS
console.log(world.graph);
console.log(
  viewport.offset.x - world.graph.points[0].x,
  viewport.offset.y - world.graph.points[0].y
);
setMode("graph");
animate();
function animate() {
  viewport.reset();
  if (graph.hash() != oldGraphHash) {
    world.generate();
    oldGraphHash = graph.hash();
  }
  const viewPoint = scale(viewport.offset, -1);
  world.draw(ctx, viewPoint);
  for (const tool of Object.values(tools)) {
    tool.editor.display();
  }
  // new Envelope(graph.segments[0], 80).draw(ctx);
  requestAnimationFrame(animate);
}

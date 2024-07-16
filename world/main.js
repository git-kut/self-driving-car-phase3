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

// Utility function to strip out non-serializable elements
function stripNonSerializable(obj) {
  // For simplicity, let's assume world.images is the place where HTMLImageElements are stored
  const strippedObj = JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value instanceof HTMLImageElement) {
      return null; // Strip out HTMLImageElement
    }
    return value;
  }));
  return strippedObj;
}

// Open IndexedDB and setup object store
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MyDatabase", 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      db.createObjectStore("world", { keyPath: "id" });
    };

    request.onerror = function(event) {
      console.error("IndexedDB error on open:", event.target.errorCode);
      reject("IndexedDB error: " + event.target.errorCode);
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
  });
}

// Save data to IndexedDB
async function saveToIndexedDB(world) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(["world"], "readwrite");
    const objectStore = transaction.objectStore("world");

    // Clear existing data before saving new data
    const clearRequest = objectStore.clear();

    return new Promise((resolve, reject) => {
      clearRequest.onsuccess = function() {
        console.log("Old data cleared from IndexedDB.");

        const strippedWorld = stripNonSerializable(world);

        const worldData = {
          id: "worldData",
          data: strippedWorld
        };

        const putRequest = objectStore.put(worldData);

        putRequest.onsuccess = function() {
          console.log("World data saved to IndexedDB.");
          resolve();
        };

        putRequest.onerror = function(event) {
          console.error("Error saving data to IndexedDB: ", event.target.errorCode);
          reject(event.target.errorCode);
        };
      };

      clearRequest.onerror = function(event) {
        console.error("Error clearing old data from IndexedDB: ", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  } catch (error) {
    console.error("Error in saveToIndexedDB:", error);
    throw error;
  }
}

function saveToLocalFile(data, filename) {
  const fileData = JSON.stringify(data);
  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Load data from IndexedDB
async function loadFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(["world"], "readonly");
    const objectStore = transaction.objectStore("world");

    const getRequest = objectStore.get("worldData");

    getRequest.onsuccess = function(event) {
      if (getRequest.result) {
        const worldData = getRequest.result.data;
        world = World.load(worldData); // Ensure World.load can restore images
        console.log("World data loaded from IndexedDB.");
        initializeAfterLoad(); // Initialize after data load
      } else {
        console.log("No data found in IndexedDB.");
        initializeAfterLoad(); // Initialize even if no data found
      }
    };

    getRequest.onerror = function(event) {
      console.error("Error loading data from IndexedDB: ", event.target.errorCode);
    };
  } catch (error) {
    console.error("Error in loadFromIndexedDB:", error);
  }
}

myCanvas.height = 600;
myCanvas.width = 600;

const ctx = myCanvas.getContext("2d");

function save() {
  // world.zoom = viewport.zoom;
  // world.offset = viewport.offset;

  saveToIndexedDB(world).then(() => {
    console.log("World data saved successfully.");
    saveToLocalFile(world, "name.world");
  }).catch((error) => {
    console.error("Error saving world data:", error);
  });
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

    console.log("Loaded world data from file:", jsonData);

    saveToIndexedDB(world).then(() => {
      console.log("World data saved to IndexedDB after file load.");
      // Reload the page after a short delay to ensure data is saved
      setTimeout(() => {
        location.reload();
      }, 100);
    }).catch((error) => {
      console.error("Error saving to IndexedDB after file load:", error);
    });
  };

  reader.onerror = function(event) {
    console.error("Error reading file:", event.target.errorCode);
  };
}
window.load = load;

// Initialize world and other components after loading
function initializeAfterLoad() {
  const graph = world.graph;
  console.log("Initializing after load, graph:", graph);
  let oldGraphHash = graph.hash();

  const viewport = new Viewport(myCanvas, world.zoom, world.offset);

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

  function setMode(mode) {
    disableEditors();
    tools[mode].button.style.backgroundColor = "white";
    tools[mode].button.style.filter = "";
    tools[mode].editor.enable();
  }
  window.setMode = setMode;

  function disableEditors() {
    for (const tool of Object.values(tools)) {
      tool.editor.disable();
      tool.button.style.backgroundColor = "gray";
      tool.button.style.filter = "grayscale(100%)";
    }
  }

  setMode("graph");
  animate();

  function remove() {
    graphEditor.remove();
    world.markings.length = 0;
    world.buildings.length = 0;
    world.trees.length = 0;
  }
  window.remove = remove;

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
    requestAnimationFrame(animate);
  }
}

const worldSave = null; // We don't use localStorage anymore
let world = new World(new Graph(), 80); // Initialize world here

// Load data from IndexedDB on page load
loadFromIndexedDB();

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
  world.buildings = buildingBases;
  closeOsmPanel();
}
window.parseOsmData = parseOsmData;


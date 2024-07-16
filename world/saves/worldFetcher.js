import World from "../js/world.js";

async function fetchWorldData() {
  try {
    const response = await fetch("world/saves/skovde.world");
    if (!response.ok) {
      throw new Error(response.status);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching the world data:", error);
  }
}

async function initializeWorld() {
  const worldData = await fetchWorldData();
  if (worldData) {
    const world = World.load(worldData);
    return world;
  } else {
    console.error("Failed to load world data.");
    return null;
  }
}

const world = await initializeWorld();

export default world;
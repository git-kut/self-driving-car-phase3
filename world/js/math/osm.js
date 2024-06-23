import Point from "../primitives/point.js";
import Segment from "../primitives/segment.js";
import { invLerp, degreeToRadius } from "./utils.js";

const osm = {
  parseRoads: (data) => {
    const nodes = data.elements.filter((element) => element.type == "node");

    const lats = nodes.map((node) => node.lat);
    const lon = nodes.map((node) => node.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lon);
    const maxLon = Math.max(...lon);

    const deltaLat = maxLat - minLat;
    const deltaLon = maxLon - minLon;
    const aspectRatio = deltaLon / deltaLat;
    const height = deltaLat * 111000 * 10;
    const width = height * aspectRatio * Math.cos(degreeToRadius(maxLat));

    const points = [];
    const segments = [];
    for (const node of nodes) {
      const x = invLerp(minLon, maxLon, node.lon) * width;
      const y = invLerp(maxLat, minLat, node.lat) * height;
      const point = new Point(x, y);
      point.id = node.id;
      points.push(point);
    }
    const ways = data.elements.filter((element) => element.type == "way");
    for (const way of ways) {
      const ids = way.nodes;
      for (let i = 1; i < ids.length; i++) {
        const prev = points.find((point) => point.id == ids[i - 1]);
        const current = points.find((point) => point.id == ids[i]);
        const isOneWay = way.tags.oneWay || way.tags.lanes == 1;
        segments.push(new Segment(prev, current, isOneWay));
      }
    }
    return {
      points,
      segments,
    };
  },
};

export default osm;

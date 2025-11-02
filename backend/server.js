const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const GRAPH_FILE = path.join(__dirname, "graph.json");
const GPS_FILE = path.join(__dirname, "coep_gps_locations.json");

let graph = {};
function loadGraph() {
  try { graph = JSON.parse(fs.readFileSync(GRAPH_FILE, "utf-8")); }
  catch (err) { graph = {}; }
}
function saveGraph() { fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2)); }
loadGraph();

// MinHeap & Dijkstra (unchanged)
class MinHeap {
  constructor() { this.heap = []; }
  push(node, dist) { this.heap.push({ node, dist }); this._bubbleUp(); }
  _bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].dist <= this.heap[idx].dist) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }
  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) { this.heap[0] = end; this._sinkDown(0); }
    return min;
  }
  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      let left = 2 * idx + 1, right = 2 * idx + 2, swap = null;
      if (left < length && this.heap[left].dist < element.dist) swap = left;
      if (right < length && ((swap === null && this.heap[right].dist < element.dist) || (swap !== null && this.heap[right].dist < this.heap[left].dist))) swap = right;
      if (swap === null) break;
      [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
      idx = swap;
    }
  }
  isEmpty() { return this.heap.length === 0; }
}

function dijkstra(graph, start, end) {
  if (!graph[start] || !graph[end]) return { path: [], distance: "Invalid nodes" };
  const distances = {}, parent = {}, visited = new Set(), pq = new MinHeap();
  for (const n in graph) distances[n] = Infinity;
  distances[start] = 0; pq.push(start, 0);
  while (!pq.isEmpty()) {
    const cur = pq.pop(); if (!cur) break;
    const node = cur.node;
    if (visited.has(node)) continue;
    visited.add(node);
    if (!graph[node]) continue;
    for (const nb in graph[node]) {
      const alt = distances[node] + graph[node][nb];
      if (alt < distances[nb]) { distances[nb] = alt; parent[nb] = node; pq.push(nb, alt); }
    }
  }
  if (distances[end] === Infinity) return { path: [], distance: "No Path Found" };
  const path = []; let cur = end;
  while (cur) { path.unshift(cur); cur = parent[cur]; }
  return { path, distance: distances[end] };
}

// === GRAPH ROUTES (unchanged) ===
app.get("/", (req, res) => res.send("COEP Campus Navigation Backend - Running"));
app.get("/admin/graph", (req, res) => { loadGraph(); res.json(graph); });
app.post("/admin/add-location", (req, res) => {
  const { name } = req.body; if (!name) return res.status(400).json({ error: "name required" });
  loadGraph(); if (graph[name]) return res.status(400).json({ error: "location exists" });
  graph[name] = {}; saveGraph(); res.json({ message: `Location '${name}' added` });
});
app.post("/admin/add-path", (req, res) => {
  const { from, to, distance } = req.body; if (!from || !to || distance == null) return res.status(400).json({ error: "from,to,distance required" });
  loadGraph(); if (!graph[from] || !graph[to]) return res.status(404).json({ error: "locations missing" });
  graph[from][to] = distance; graph[to][from] = distance; saveGraph();
  res.json({ message: `Path added: ${from} <-> ${to} (${distance}m)` });
});
app.delete("/admin/remove-path", (req, res) => {
  const { from, to } = req.body; loadGraph();
  if (graph[from]) delete graph[from][to]; if (graph[to]) delete graph[to][from];
  saveGraph(); res.json({ message: `Path removed between ${from} and ${to}` });
});
app.delete("/admin/delete-location", (req, res) => {
  const { name } = req.body; loadGraph(); if (!graph[name]) return res.status(404).json({ error: "not found" });
  for (const n in graph) { if (graph[n][name]) delete graph[n][name]; } delete graph[name]; saveGraph();
  res.json({ message: `Location '${name}' deleted` });
});
app.post("/find-path", (req, res) => {
  const { source, destination } = req.body; loadGraph();
  if (!source || !destination) return res.status(400).json({ error: "source,destination required" });
  const result = dijkstra(graph, source, destination); res.json(result);
});

// === GPS LOCATION ROUTES (FULL SUPPORT) ===
let gpsLocations = [];
function loadGPS() {
  try {
    gpsLocations = JSON.parse(fs.readFileSync(GPS_FILE, "utf-8"));
    if (!Array.isArray(gpsLocations)) gpsLocations = [];
  } catch (err) {
    gpsLocations = [];
  }
}
function saveGPS() {
  fs.writeFileSync(GPS_FILE, JSON.stringify(gpsLocations, null, 2));
}
loadGPS();

// GET all GPS locations
app.get("/admin/gps-locations", (req, res) => {
  loadGPS();
  res.json(gpsLocations);
});

// ADD new GPS location
app.post("/admin/add-gps-location", (req, res) => {
  loadGPS();
  const data = req.body;

  // Required fields
  if (!data.id || !data.name || data.lat == null || data.lng == null) {
    return res.status(400).json({ error: "id, name, lat, lng are required" });
  }

  // Prevent duplicate ID
  if (gpsLocations.find(loc => loc.id === data.id)) {
    return res.status(400).json({ error: "Location with this ID already exists" });
  }

  // Optional: prevent duplicate name
  if (gpsLocations.find(loc => loc.name === data.name)) {
    return res.status(400).json({ error: "Location with this name already exists" });
  }

  // Default values
  const newLoc = {
    id: data.id,
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    campus_type: data.campus_type || "North",
    type: data.type || "Other",
    maps_url: data.maps_url || "",
    description: data.description || null,
    building_name: data.building_name || null,
    floor_number: data.floor_number != null ? parseInt(data.floor_number) : null,
    priority: data.priority != null ? parseInt(data.priority) : 5,
    icon: data.icon || "pin",
    color: data.color || "#7f8c8d",
    minZoom: data.minZoom != null ? parseInt(data.minZoom) : 16,
    maxZoom: data.maxZoom != null ? parseInt(data.maxZoom) : 22
  };

  gpsLocations.push(newLoc);
  saveGPS();
  res.json({ message: "GPS location added", location: newLoc });
});

// UPDATE GPS location
app.put("/admin/update-gps-location", (req, res) => {
  loadGPS();
  const data = req.body;

  if (!data.id) {
    return res.status(400).json({ error: "id is required for update" });
  }

  const index = gpsLocations.findIndex(loc => loc.id === data.id);
  if (index === -1) {
    return res.status(404).json({ error: "Location not found" });
  }

  const updated = {
    ...gpsLocations[index],
    name: data.name || gpsLocations[index].name,
    lat: data.lat != null ? parseFloat(data.lat) : gpsLocations[index].lat,
    lng: data.lng != null ? parseFloat(data.lng) : gpsLocations[index].lng,
    campus_type: data.campus_type || gpsLocations[index].campus_type,
    type: data.type || gpsLocations[index].type,
    maps_url: data.maps_url ?? gpsLocations[index].maps_url,
    description: data.description ?? gpsLocations[index].description,
    building_name: data.building_name ?? gpsLocations[index].building_name,
    floor_number: data.floor_number != null ? parseInt(data.floor_number) : gpsLocations[index].floor_number,
    priority: data.priority != null ? parseInt(data.priority) : gpsLocations[index].priority,
    icon: data.icon || gpsLocations[index].icon,
    color: data.color || gpsLocations[index].color,
    minZoom: data.minZoom != null ? parseInt(data.minZoom) : gpsLocations[index].minZoom,
    maxZoom: data.maxZoom != null ? parseInt(data.maxZoom) : gpsLocations[index].maxZoom
  };

  gpsLocations[index] = updated;
  saveGPS();
  res.json({ message: "GPS location updated", location: updated });
});

// DELETE GPS location by ID
app.delete("/admin/delete-gps-location", (req, res) => {
  loadGPS();
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const index = gpsLocations.findIndex(loc => loc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Location not found" });
  }

  const removed = gpsLocations.splice(index, 1)[0];
  saveGPS();
  res.json({ message: "GPS location deleted", location: removed });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
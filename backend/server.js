// ====================== IMPORTS & BASIC SETUP ======================
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// ====================== FILE PATHS ======================
const GRAPH_FILE = path.join(__dirname, "graph.json");
const GPS_FILE = path.join(__dirname, "coep_gps_locations.json");

// ====================== GRAPH (ADJACENCY LIST) ======================
// Graph is stored as: { node1: { node2: distance, node3: distance }, ... }
let graph = {};

// ---- Load and Save Graph ----
function loadGraph() {
  try {
    graph = JSON.parse(fs.readFileSync(GRAPH_FILE, "utf-8"));
  } catch (err) {
    graph = {};
  }
}
function saveGraph() {
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2));
}
loadGraph();


// ====================== MIN HEAP CLASS ======================
// Used in Dijkstra’s Algorithm for efficient smallest-distance lookup.
class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Push a new node with distance
  push(node, dist) {
    this.heap.push({ node, dist });
    this._bubbleUp();
  }

  // Moves newly added node up to maintain heap order
  _bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].dist <= this.heap[idx].dist) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  // Removes the smallest (top) element
  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min;
  }

  // Restores heap order after removal
  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let swap = null;

      if (left < length && this.heap[left].dist < element.dist) swap = left;
      if (
        right < length &&
        ((swap === null && this.heap[right].dist < element.dist) ||
          (swap !== null && this.heap[right].dist < this.heap[left].dist))
      )
        swap = right;

      if (swap === null) break;
      [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
      idx = swap;
    }
  }

  // Check if heap is empty
  isEmpty() {
    return this.heap.length === 0;
  }
}


// ====================== DIJKSTRA'S ALGORITHM ======================
// Finds the shortest path between two nodes in the graph
function dijkstra(graph, start, end) {
  // Input validation
  if (!graph[start] || !graph[end])
    return { path: [], distance: "Invalid nodes" };

  const distances = {};
  const parent = {};
  const visited = new Set();
  const pq = new MinHeap();

  // Initialize all distances to infinity
  for (const node in graph) distances[node] = Infinity;
  distances[start] = 0;
  pq.push(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.pop();
    if (!current) break;

    const node = current.node;
    if (visited.has(node)) continue;
    visited.add(node);

    // Explore all neighbors of the current node
    for (const neighbor in graph[node]) {
      const alt = distances[node] + graph[node][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        parent[neighbor] = node;
        pq.push(neighbor, alt);
      }
    }
  }

  // Build the final shortest path
  if (distances[end] === Infinity)
    return { path: [], distance: "No Path Found" };

  const path = [];
  let curr = end;
  while (curr) {
    path.unshift(curr);
    curr = parent[curr];
  }

  return { path, distance: distances[end] };
}


// ====================== GRAPH ROUTES ======================

// Basic route to check server status
app.get("/", (req, res) =>
  res.send("COEP Campus Navigation Backend - Running")
);

// Get full graph data
app.get("/admin/graph", (req, res) => {
  loadGraph();
  res.json(graph);
});

// Add a new location (node)
app.post("/admin/add-location", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  loadGraph();
  if (graph[name])
    return res.status(400).json({ error: "location exists" });

  graph[name] = {};
  saveGraph();
  res.json({ message: `Location '${name}' added` });
});

// Add a path (edge) between two locations
app.post("/admin/add-path", (req, res) => {
  const { from, to, distance } = req.body;
  if (!from || !to || distance == null)
    return res.status(400).json({ error: "from,to,distance required" });

  loadGraph();
  if (!graph[from] || !graph[to])
    return res.status(404).json({ error: "locations missing" });

  // Since the graph is undirected, update both sides
  graph[from][to] = distance;
  graph[to][from] = distance;
  saveGraph();
  res.json({ message: `Path added: ${from} <-> ${to} (${distance}m)` });
});

// Remove a path between two locations
app.delete("/admin/remove-path", (req, res) => {
  const { from, to } = req.body;
  loadGraph();
  if (graph[from]) delete graph[from][to];
  if (graph[to]) delete graph[to][from];
  saveGraph();
  res.json({ message: `Path removed between ${from} and ${to}` });
});

// Delete a location (node)
app.delete("/admin/delete-location", (req, res) => {
  const { name } = req.body;
  loadGraph();
  if (!graph[name]) return res.status(404).json({ error: "not found" });

  // Remove references from other nodes
  for (const node in graph) {
    if (graph[node][name]) delete graph[node][name];
  }

  delete graph[name];
  saveGraph();
  res.json({ message: `Location '${name}' deleted` });
});

// Find shortest path using Dijkstra
app.post("/find-path", (req, res) => {
  const { source, destination } = req.body;
  loadGraph();
  if (!source || !destination)
    return res.status(400).json({ error: "source,destination required" });

  const result = dijkstra(graph, source, destination);
  res.json(result);
});


// ====================== GPS LOCATIONS HANDLING ======================

// Stored as array of objects for easy access and mapping
let gpsLocations = [];

// Load and Save GPS Data
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

// Get all GPS locations
app.get("/admin/gps-locations", (req, res) => {
  loadGPS();
  res.json(gpsLocations);
});

// Add a new GPS location
app.post("/admin/add-gps-location", (req, res) => {
  loadGPS();
  const data = req.body;

  if (!data.id || !data.name || data.lat == null || data.lng == null)
    return res.status(400).json({ error: "id, name, lat, lng are required" });

  if (gpsLocations.find(loc => loc.id === data.id))
    return res.status(400).json({ error: "Location with this ID exists" });

  if (gpsLocations.find(loc => loc.name === data.name))
    return res.status(400).json({ error: "Location with this name exists" });

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

// Update GPS location
app.put("/admin/update-gps-location", (req, res) => {
  loadGPS();
  const data = req.body;
  if (!data.id)
    return res.status(400).json({ error: "id is required for update" });

  const index = gpsLocations.findIndex(loc => loc.id === data.id);
  if (index === -1)
    return res.status(404).json({ error: "Location not found" });

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
    floor_number:
      data.floor_number != null
        ? parseInt(data.floor_number)
        : gpsLocations[index].floor_number,
    priority:
      data.priority != null
        ? parseInt(data.priority)
        : gpsLocations[index].priority,
    icon: data.icon || gpsLocations[index].icon,
    color: data.color || gpsLocations[index].color,
    minZoom:
      data.minZoom != null
        ? parseInt(data.minZoom)
        : gpsLocations[index].minZoom,
    maxZoom:
      data.maxZoom != null
        ? parseInt(data.maxZoom)
        : gpsLocations[index].maxZoom
  };

  gpsLocations[index] = updated;
  saveGPS();
  res.json({ message: "GPS location updated", location: updated });
});

// Delete GPS location
app.delete("/admin/delete-gps-location", (req, res) => {
  loadGPS();
  const { id } = req.body;
  if (!id)
    return res.status(400).json({ error: "id is required" });

  const index = gpsLocations.findIndex(loc => loc.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Location not found" });

  const removed = gpsLocations.splice(index, 1)[0];
  saveGPS();
  res.json({ message: "GPS location deleted", location: removed });
});


// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

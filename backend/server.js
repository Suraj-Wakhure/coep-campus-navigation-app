const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());

const GRAPH_FILE = path.join(__dirname, "graph.json");
let graph = {};
function loadGraph() {
  try { graph = JSON.parse(fs.readFileSync(GRAPH_FILE, "utf-8")); }
  catch (err) { graph = {}; }
}
loadGraph();
function saveGraph(){ fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2)); }

class MinHeap {
  constructor(){ this.heap = []; }
  push(node, dist){ this.heap.push({node, dist}); this._bubbleUp(); }
  _bubbleUp(){
    let idx = this.heap.length - 1;
    while(idx > 0){
      const parent = Math.floor((idx - 1)/2);
      if(this.heap[parent].dist <= this.heap[idx].dist) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }
  pop(){ if(this.heap.length===0) return null; const min = this.heap[0]; const end = this.heap.pop();
    if(this.heap.length>0){ this.heap[0]=end; this._sinkDown(0); } return min;
  }
  _sinkDown(idx){
    const length = this.heap.length;
    const element = this.heap[idx];
    while(true){
      let left = 2*idx+1, right = 2*idx+2, swap = null;
      if(left < length && this.heap[left].dist < element.dist) swap = left;
      if(right < length && ((swap===null && this.heap[right].dist < element.dist) || (swap!==null && this.heap[right].dist < this.heap[left].dist))) swap = right;
      if(swap===null) break;
      [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
      idx = swap;
    }
  }
  isEmpty(){ return this.heap.length === 0; }
}

function dijkstra(graph, start, end){
  if(!graph[start] || !graph[end]) return { path: [], distance: "Invalid nodes" };
  const distances = {}, parent = {}, visited = new Set(), pq = new MinHeap();
  for(const n in graph) distances[n] = Infinity;
  distances[start] = 0; pq.push(start,0);
  while(!pq.isEmpty()){
    const cur = pq.pop(); if(!cur) break;
    const node = cur.node;
    if(visited.has(node)) continue;
    visited.add(node);
    if(!graph[node]) continue;
    for(const nb in graph[node]){
      const alt = distances[node] + graph[node][nb];
      if(alt < distances[nb]){ distances[nb]=alt; parent[nb]=node; pq.push(nb, alt); }
    }
  }
  if(distances[end] === Infinity) return { path: [], distance: "No Path Found" };
  const path = []; let cur = end;
  while(cur){ path.unshift(cur); cur = parent[cur]; }
  return { path, distance: distances[end] };
}

// Routes
app.get("/", (req, res) => res.send("COEP Campus Navigation Backend - Running"));
app.get("/admin/graph", (req, res) => { loadGraph(); res.json(graph); });
app.post("/admin/add-location", (req, res) => {
  const { name } = req.body; if(!name) return res.status(400).json({ error: "name required" });
  loadGraph(); if(graph[name]) return res.status(400).json({ error: "location exists" });
  graph[name] = {}; saveGraph(); res.json({ message: `Location '${name}' added` });
});
app.post("/admin/add-path", (req, res) => {
  const { from, to, distance } = req.body; if(!from||!to||distance==null) return res.status(400).json({ error: "from,to,distance required" });
  loadGraph(); if(!graph[from]||!graph[to]) return res.status(404).json({ error: "locations missing" });
  graph[from][to]=distance; graph[to][from]=distance; saveGraph(); res.json({ message: `Path added: ${from} <-> ${to} (${distance}m)`});
});
app.delete("/admin/remove-path", (req, res) => {
  const { from, to } = req.body; loadGraph();
  if(graph[from]) delete graph[from][to]; if(graph[to]) delete graph[to][from];
  saveGraph(); res.json({ message: `Path removed between ${from} and ${to}` });
});
app.delete("/admin/delete-location", (req, res) => {
  const { name } = req.body; loadGraph(); if(!graph[name]) return res.status(404).json({ error: "not found" });
  for(const n in graph){ if(graph[n][name]) delete graph[n][name]; } delete graph[name]; saveGraph();
  res.json({ message: `Location '${name}' deleted` });
});
app.post("/find-path", (req, res) => {
  const { source, destination } = req.body; loadGraph();
  if(!source||!destination) return res.status(400).json({ error: "source,destination required" });
  const result = dijkstra(graph, source, destination); res.json(result);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

// New API routes for GPS location management
app.get('/admin/gps-locations', (req, res) => {
  try {
    const gpsData = require('./coep_gps_locations.json');
    res.json(gpsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load GPS locations' });
  }
});

app.post('/admin/add-gps-location', (req, res) => {
  try {
    const fs = require('fs');
    const { name, lat, lng, campus } = req.body;
    
    // Validate input
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }
    
    const gpsData = require('./coep_gps_locations.json');
    
    // Check if location already exists
    if (gpsData.find(loc => loc.name === name)) {
      return res.status(400).json({ error: 'Location with this name already exists' });
    }
    
    // Add new location
    gpsData.push({ name, lat, lng, campus });
    
    // Save back to file
    fs.writeFileSync('./coep_gps_locations.json', JSON.stringify(gpsData, null, 2));
    
    res.json({ message: 'GPS location added successfully', location: { name, lat, lng, campus } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add GPS location' });
  }
});

app.put('/admin/update-gps-location', (req, res) => {
  try {
    const fs = require('fs');
    const { name, lat, lng, campus } = req.body;
    
    // Validate input
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }
    
    const gpsData = require('./coep_gps_locations.json');
    
    // Find and update location
    const locationIndex = gpsData.findIndex(loc => loc.name === name);
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    gpsData[locationIndex] = { name, lat, lng, campus };
    
    // Save back to file
    fs.writeFileSync('./coep_gps_locations.json', JSON.stringify(gpsData, null, 2));
    
    res.json({ message: 'GPS location updated successfully', location: { name, lat, lng, campus } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update GPS location' });
  }
});

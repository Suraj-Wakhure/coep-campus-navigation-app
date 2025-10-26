import React, { useEffect, useState, useRef } from "react";

// API Functions
const BASE = "http://localhost:5000";

async function getGraph() {
  const res = await fetch(`${BASE}/admin/graph`);
  return res.json();
}

async function findPath(source, destination) {
  const res = await fetch(`${BASE}/find-path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination })
  });
  return res.json();
}

async function addLocation(name) {
  const res = await fetch(`${BASE}/admin/add-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return res.json();
}

async function addPath(from, to, distance) {
  const res = await fetch(`${BASE}/admin/add-path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, distance })
  });
  return res.json();
}

async function removePath(from, to) {
  const res = await fetch(`${BASE}/admin/remove-path`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to })
  });
  return res.json();
}

async function deleteLocation(name) {
  const res = await fetch(`${BASE}/admin/delete-location`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return res.json();
}

// GPS Location Management APIs
async function getGPSLocations() {
  const res = await fetch(`${BASE}/admin/gps-locations`);
  return res.json();
}

async function addGPSLocation(locationData) {
  const res = await fetch(`${BASE}/admin/add-gps-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(locationData)
  });
  return res.json();
}

async function updateGPSLocation(locationData) {
  const res = await fetch(`${BASE}/admin/update-gps-location`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(locationData)
  });
  return res.json();
}

// Graph Visualization Component with Real GPS Coordinates
function GraphVisualizer({ graph, highlightedPath, source, destination, gpsLocations }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Convert GPS coordinates to canvas coordinates
  const gpsToCanvas = (lat, lng, bounds, canvasWidth, canvasHeight) => {
    const padding = 60;
    const usableWidth = canvasWidth - 2 * padding;
    const usableHeight = canvasHeight - 2 * padding;

    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * usableWidth;
    const y = canvasHeight - (padding + ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * usableHeight);

    return { x: x * scale + pan.x, y: y * scale + pan.y };
  };

  // Check if an edge is part of the highlighted path
  const isEdgeInPath = (from, to) => {
    if (!highlightedPath || highlightedPath.length === 0) return false;
    
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const current = highlightedPath[i];
      const next = highlightedPath[i + 1];
      
      if ((current === from && next === to) || (current === to && next === from)) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const locations = Object.keys(graph);
    if (locations.length === 0) return;

    // Get GPS coordinates for locations from the gpsLocations prop
    const coordMap = {};
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    locations.forEach(loc => {
      const coord = gpsLocations.find(c => c.name === loc);
      if (coord) {
        coordMap[loc] = coord;
        minLat = Math.min(minLat, coord.lat);
        maxLat = Math.max(maxLat, coord.lat);
        minLng = Math.min(minLng, coord.lng);
        maxLng = Math.max(maxLng, coord.lng);
      }
    });

    // If no GPS coordinates found, use default bounds
    if (minLat === Infinity) {
      minLat = 18.528; maxLat = 18.532;
      minLng = 73.854; maxLng = 73.859;
    }

    const bounds = { minLat, maxLat, minLng, maxLng };

    // Draw campus background regions
    ctx.fillStyle = 'rgba(102, 126, 234, 0.05)';
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = 'rgba(118, 75, 162, 0.05)';
    ctx.fillRect(0, height / 2, width, height / 2);

    // Draw grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw campus labels
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#667eea';
    ctx.fillText('North Campus', 20, 30);
    ctx.fillStyle = '#764ba2';
    ctx.fillText('South Campus', 20, height - 20);

    // Draw edges
    Object.entries(graph).forEach(([from, neighbors]) => {
      const fromCoord = coordMap[from];
      if (!fromCoord) return;

      const fromPos = gpsToCanvas(fromCoord.lat, fromCoord.lng, bounds, width, height);

      Object.entries(neighbors).forEach(([to, distance]) => {
        const toCoord = coordMap[to];
        if (!toCoord) return;

        const toPos = gpsToCanvas(toCoord.lat, toCoord.lng, bounds, width, height);

        const isHighlighted = isEdgeInPath(from, to);

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        
        if (isHighlighted) {
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#4CAF50';
          ctx.shadowBlur = 15;
        } else {
          ctx.strokeStyle = '#cbd5e0';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw distance label
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        ctx.fillStyle = isHighlighted ? '#2E7D32' : '#718096';
        ctx.beginPath();
        ctx.roundRect(midX - 22, midY - 12, 44, 24, 4);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = isHighlighted ? 'bold 11px Arial' : '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${distance}m`, midX, midY);
      });
    });

    // Draw nodes
    Object.entries(coordMap).forEach(([loc, coord]) => {
      const pos = gpsToCanvas(coord.lat, coord.lng, bounds, width, height);
      const isSource = loc === source;
      const isDestination = loc === destination;
      const isInPath = highlightedPath && highlightedPath.includes(loc);
      const isHovered = hoveredNode === loc;

      const radius = isSource ? 35 : (isDestination ? 32 : (isHovered ? 24 : 20));

      // Enhanced root (source) node styling
      if (isSource) {
        // Outer glow for root node
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }

      // Node shadow
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      
      if (isSource) {
        // Root node gradient
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#1D4ED8');
        ctx.fillStyle = gradient;
      } else if (isDestination) {
        ctx.fillStyle = '#EF4444';
      } else if (isInPath) {
        ctx.fillStyle = '#10B981';
      } else if (coord.campus === 'North') {
        ctx.fillStyle = '#667eea';
      } else {
        ctx.fillStyle = '#764ba2';
      }
      
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = isSource ? 4 : 3;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw icon
      ctx.fillStyle = 'white';
      ctx.font = isSource ? 'bold 18px Arial' : 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isSource) {
        ctx.fillText('🚩', pos.x, pos.y);
      } else if (isDestination) {
        ctx.fillText('🎯', pos.x, pos.y);
      } else {
        ctx.fillText('📍', pos.x, pos.y);
      }

      // Draw label on hover or for important nodes
      if (isHovered || isSource || isDestination || isInPath) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 11px Arial';
        const textWidth = ctx.measureText(loc).width;
        const labelY = pos.y + (isSource ? 45 : 35);
        
        ctx.beginPath();
        ctx.roundRect(pos.x - textWidth / 2 - 6, labelY, textWidth + 12, 22, 4);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(loc, pos.x, labelY + 11);
        
        // Add special badge for root node
        if (isSource) {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.roundRect(pos.x - 25, labelY - 25, 50, 20, 10);
          ctx.fill();
          
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px Arial';
          ctx.fillText('START', pos.x, labelY - 15);
        }
      }
    });

    // Draw path sequence numbers (skip the root since it's already highlighted)
    if (highlightedPath && highlightedPath.length > 1) {
      highlightedPath.forEach((loc, i) => {
        // Skip drawing number on root node (index 0) as it has special styling
        if (i === 0) return;
        
        const coord = coordMap[loc];
        if (!coord) return;
        
        const pos = gpsToCanvas(coord.lat, coord.lng, bounds, width, height);
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(pos.x + 15, pos.y - 15, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, pos.x + 15, pos.y - 15);
      });
    }

    // Draw legend
    const legendX = width - 180;
    const legendY = 20;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 160, 160, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#2d3748';
    ctx.textAlign = 'left';
    ctx.fillText('Legend', legendX + 10, legendY + 20);

    const legendItems = [
      { color: '#3B82F6', label: 'Root/Start 🚩', y: 40 },
      { color: '#EF4444', label: 'Destination 🎯', y: 60 },
      { color: '#10B981', label: 'Path Node 📍', y: 80 },
      { color: '#667eea', label: 'North Campus', y: 100 },
      { color: '#764ba2', label: 'South Campus', y: 120 },
      { color: '#4CAF50', label: 'Path Route', y: 140 }
    ];

    legendItems.forEach(item => {
      if (item.label === 'Path Route') {
        // Draw line for path route
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(legendX + 10, legendY + item.y);
        ctx.lineTo(legendX + 25, legendY + item.y);
        ctx.stroke();
      } else {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + 15, legendY + item.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.fillStyle = '#4a5568';
      ctx.font = '11px Arial';
      ctx.fillText(item.label, legendX + 28, legendY + item.y + 4);
    });
  }, [graph, highlightedPath, source, destination, scale, pan, hoveredNode, gpsLocations]);

  const handleMouseMove = (e) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPan({
        x: pan.x + (x - dragStart.x),
        y: pan.y + (y - dragStart.y)
      });
      setDragStart({ x, y });
    } else {
      // Check for node hover
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const locations = Object.keys(graph);
      let foundNode = null;

      // Get bounds from GPS locations
      const validLocations = gpsLocations.filter(coord => locations.includes(coord.name));
      if (validLocations.length === 0) return;

      const bounds = {
        minLat: Math.min(...validLocations.map(c => c.lat)),
        maxLat: Math.max(...validLocations.map(c => c.lat)),
        minLng: Math.min(...validLocations.map(c => c.lng)),
        maxLng: Math.max(...validLocations.map(c => c.lng))
      };

      for (const loc of locations) {
        const coord = gpsLocations.find(c => c.name === loc);
        if (coord) {
          const pos = gpsToCanvas(coord.lat, coord.lng, bounds, canvas.width, canvas.height);
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < 25) {
            foundNode = loc;
            break;
          }
        }
      }

      setHoveredNode(foundNode);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.max(0.5, Math.min(3, s * delta)));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: 0
        }}>
          🗺️ COEP Campus Map (GPS-Based)
        </h3>
        <button
          onClick={resetView}
          style={{
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}
        >
          🔄 Reset View
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'grab',
          width: '100%',
          maxWidth: '1000px',
          height: 'auto',
          display: 'block'
        }}
      />
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginTop: '1rem',
        fontSize: '0.85rem',
        color: '#6c757d',
        fontStyle: 'italic'
      }}>
        <p style={{ margin: 0 }}>💡 Drag to pan • Scroll to zoom</p>
        <p style={{ margin: 0 }}>📍 Hover over nodes to see location names</p>
        <p style={{ margin: 0 }}>🎯 Zoom: {Math.round(scale * 100)}%</p>
      </div>
    </div>
  );
}

export default function App() {
  const [graph, setGraph] = useState({});
  const [locations, setLocations] = useState([]);
  const [gpsLocations, setGpsLocations] = useState([]);
  const [tab, setTab] = useState("user");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Admin states
  const [newLocation, setNewLocation] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [distance, setDistance] = useState("");
  
  // GPS Location Management states
  const [newGPSLocation, setNewGPSLocation] = useState({
    name: "",
    lat: "",
    lng: "",
    campus: "North"
  });
  const [editingLocation, setEditingLocation] = useState(null);

  async function refresh() {
    try {
      const g = await getGraph();
      setGraph(g || {});
      setLocations(Object.keys(g || {}));
      
      const gpsData = await getGPSLocations();
      setGpsLocations(gpsData || []);
    } catch (e) {
      console.error("Error fetching data:", e);
      alert("Failed to connect to backend. Make sure the server is running on http://localhost:5000");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleFind() {
    if (!source || !destination) return alert("Please select both source and destination");
    setLoading(true);
    try {
      const r = await findPath(source, destination);
      setResult(r);
    } catch (error) {
      console.error("Error finding path:", error);
      alert("Error finding path. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLocation() {
    if (!newLocation) return alert("Please enter location name");
    try {
      await addLocation(newLocation);
      setNewLocation("");
      refresh();
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Error adding location. Please check the console for details.");
    }
  }

  async function handleAddPath() {
    if (!from || !to || !distance) return alert("Please fill all fields");
    const d = Number(distance);
    if (isNaN(d) || d <= 0) return alert("Invalid distance value");
    try {
      await addPath(from, to, d);
      setFrom("");
      setTo("");
      setDistance("");
      refresh();
    } catch (error) {
      console.error("Error adding path:", error);
      alert("Error adding path. Please check the console for details.");
    }
  }

  async function handleRemovePath() {
    if (!from || !to) return alert("Please select from and to locations");
    try {
      await removePath(from, to);
      setFrom("");
      setTo("");
      refresh();
    } catch (error) {
      console.error("Error removing path:", error);
      alert("Error removing path. Please check the console for details.");
    }
  }

  async function handleDeleteLocation() {
    const name = prompt("Enter exact location name to delete:");
    if (!name) return;
    try {
      await deleteLocation(name);
      refresh();
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Error deleting location. Please check the console for details.");
    }
  }

  // GPS Location Management functions
  async function handleAddGPSLocation() {
    if (!newGPSLocation.name || !newGPSLocation.lat || !newGPSLocation.lng) {
      return alert("Please fill all GPS location fields");
    }
    
    const lat = parseFloat(newGPSLocation.lat);
    const lng = parseFloat(newGPSLocation.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return alert("Please enter valid latitude and longitude values");
    }
    
    try {
      await addGPSLocation({
        name: newGPSLocation.name,
        lat: lat,
        lng: lng,
        campus: newGPSLocation.campus
      });
      
      setNewGPSLocation({
        name: "",
        lat: "",
        lng: "",
        campus: "North"
      });
      refresh();
    } catch (error) {
      console.error("Error adding GPS location:", error);
      alert("Error adding GPS location. Please check the console for details.");
    }
  }

  async function handleUpdateGPSLocation() {
    if (!editingLocation) return;
    
    const lat = parseFloat(editingLocation.lat);
    const lng = parseFloat(editingLocation.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return alert("Please enter valid latitude and longitude values");
    }
    
    try {
      await updateGPSLocation({
        name: editingLocation.name,
        lat: lat,
        lng: lng,
        campus: editingLocation.campus
      });
      
      setEditingLocation(null);
      refresh();
    } catch (error) {
      console.error("Error updating GPS location:", error);
      alert("Error updating GPS location. Please check the console for details.");
    }
  }

  function startEditLocation(location) {
    setEditingLocation({ ...location });
  }

  function cancelEditLocation() {
    setEditingLocation(null);
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    mainCard: {
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2.5rem 2rem',
      color: 'white',
      textAlign: 'center'
    },
    title: {
      margin: 0,
      fontSize: '2.5rem',
      fontWeight: '700',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      margin: '0.5rem 0 0 0',
      fontSize: '1rem',
      opacity: 0.9,
      fontWeight: '400'
    },
    tabContainer: {
      display: 'flex',
      background: '#f8f9fa',
      borderBottom: '2px solid #e9ecef',
      padding: '0 2rem'
    },
    tab: (active) => ({
      flex: 1,
      padding: '1.2rem 2rem',
      border: 'none',
      background: active ? 'white' : 'transparent',
      color: active ? '#667eea' : '#6c757d',
      fontWeight: active ? '600' : '500',
      fontSize: '1rem',
      cursor: 'pointer',
      borderBottom: active ? '3px solid #667eea' : 'none',
      transition: 'all 0.3s ease',
      transform: active ? 'translateY(2px)' : 'none'
    }),
    content: {
      padding: '2.5rem'
    },
    sectionTitle: {
      fontSize: '1.8rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '1.5rem',
      marginTop: 0
    },
    card: {
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid #e9ecef'
    },
    inputGroup: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    select: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '2px solid #e9ecef',
      fontSize: '0.95rem',
      flex: '1',
      minWidth: '150px',
      background: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease'
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '2px solid #e9ecef',
      fontSize: '0.95rem',
      flex: '1',
      minWidth: '150px',
      transition: 'border-color 0.3s ease'
    },
    button: (variant = 'primary') => ({
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                  variant === 'danger' ? '#dc3545' : '#6c757d',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }),
    resultCard: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
      borderRadius: '12px',
      border: '2px solid #4dd0e1'
    },
    resultTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#00695c',
      marginTop: 0,
      marginBottom: '1rem'
    },
    pathDisplay: {
      fontSize: '1.1rem',
      color: '#004d40',
      marginBottom: '0.75rem',
      fontWeight: '500'
    },
    locationGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    locationChip: {
      padding: '0.6rem 1rem',
      background: 'white',
      border: '2px solid #667eea',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#667eea',
      textAlign: 'center'
    },
    adminSection: {
      marginBottom: '2rem',
      padding: '1.5rem',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    },
    adminTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#495057',
      marginTop: 0,
      marginBottom: '1rem'
    },
    codeBlock: {
      background: '#282c34',
      color: '#61dafb',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      maxHeight: '300px',
      overflow: 'auto',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
    },
    footer: {
      background: '#f8f9fa',
      padding: '1.5rem',
      textAlign: 'center',
      color: '#6c757d',
      borderTop: '1px solid #e9ecef',
      fontSize: '0.9rem'
    },
    gpsForm: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    editForm: {
      background: '#e7f3ff',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '2px solid #3B82F6'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎓 COEP Campus Navigation</h1>
          <p style={styles.subtitle}>Find the shortest path across campus using Dijkstra's Algorithm</p>
        </div>

        <div style={styles.tabContainer}>
          <button 
            onClick={() => setTab('user')} 
            style={styles.tab(tab === 'user')}
          >
            🗺️ Navigation
          </button>
          <button 
            onClick={() => setTab('admin')} 
            style={styles.tab(tab === 'admin')}
          >
            ⚙️ Admin Panel
          </button>
        </div>

        <div style={styles.content}>
          {tab === 'user' && (
            <div>
              <h2 style={styles.sectionTitle}>Find Shortest Path</h2>
              
              <div style={styles.card}>
                <div style={styles.inputGroup}>
                  <select 
                    value={source} 
                    onChange={e => setSource(e.target.value)}
                    style={styles.select}
                  >
                    <option value=''>📍 Select Source (Root)</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  <select 
                    value={destination} 
                    onChange={e => setDestination(e.target.value)}
                    style={styles.select}
                  >
                    <option value=''>🎯 Select Destination</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  <button 
                    onClick={handleFind} 
                    disabled={loading}
                    style={styles.button('primary')}
                    onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                  >
                    {loading ? '🔍 Finding...' : '🚀 Find Path'}
                  </button>
                </div>
              </div>

              {Object.keys(graph).length > 0 && (
                <GraphVisualizer 
                  graph={graph} 
                  highlightedPath={result?.path || []}
                  source={source}
                  destination={destination}
                  gpsLocations={gpsLocations}
                />
              )}

              {result && (
                <div style={styles.resultCard}>
                  <h3 style={styles.resultTitle}>📊 Route Results</h3>
                  {result.distance === 'No Path Found' || result.path.length === 0 ? (
                    <p style={styles.pathDisplay}>❌ No path found between these locations</p>
                  ) : (
                    <>
                      <p style={styles.pathDisplay}>
                        🛤️ Path: {result.path.join(' → ')}
                      </p>
                      <p style={styles.pathDisplay}>
                        📏 Total Distance: <strong>{result.distance} meters</strong>
                      </p>
                      <p style={styles.pathDisplay}>
                        🚶 Number of Stops: <strong>{result.path.length}</strong>
                      </p>
                    </>
                  )}
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#495057', marginBottom: '1rem' }}>
                  📌 Available Locations ({locations.length})
                </h4>
                <div style={styles.locationGrid}>
                  {locations.map(l => (
                    <div key={l} style={styles.locationChip}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div>
              <h2 style={styles.sectionTitle}>Admin Control Panel</h2>

              {/* GPS Location Management Section */}
              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>📍 Manage GPS Locations</h4>
                
                {/* Add New GPS Location Form */}
                <div style={styles.card}>
                  <h5 style={{ marginTop: 0, marginBottom: '1rem', color: '#495057' }}>➕ Add New GPS Location</h5>
                  <div style={styles.gpsForm}>
                    <input
                      value={newGPSLocation.name}
                      onChange={e => setNewGPSLocation({...newGPSLocation, name: e.target.value})}
                      placeholder="Location Name"
                      style={styles.input}
                    />
                    <input
                      value={newGPSLocation.lat}
                      onChange={e => setNewGPSLocation({...newGPSLocation, lat: e.target.value})}
                      placeholder="Latitude (e.g., 18.530111)"
                      style={styles.input}
                      type="number"
                      step="0.000001"
                    />
                    <input
                      value={newGPSLocation.lng}
                      onChange={e => setNewGPSLocation({...newGPSLocation, lng: e.target.value})}
                      placeholder="Longitude (e.g., 73.855194)"
                      style={styles.input}
                      type="number"
                      step="0.000001"
                    />
                    <select
                      value={newGPSLocation.campus}
                      onChange={e => setNewGPSLocation({...newGPSLocation, campus: e.target.value})}
                      style={styles.select}
                    >
                      <option value="North">North Campus</option>
                      <option value="South">South Campus</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleAddGPSLocation}
                    style={styles.button('primary')}
                  >
                    📍 Add GPS Location
                  </button>
                </div>

                {/* Edit GPS Location Form */}
                {editingLocation && (
                  <div style={styles.editForm}>
                    <h5 style={{ marginTop: 0, marginBottom: '1rem', color: '#3B82F6' }}>✏️ Editing: {editingLocation.name}</h5>
                    <div style={styles.gpsForm}>
                      <input
                        value={editingLocation.name}
                        onChange={e => setEditingLocation({...editingLocation, name: e.target.value})}
                        placeholder="Location Name"
                        style={styles.input}
                      />
                      <input
                        value={editingLocation.lat}
                        onChange={e => setEditingLocation({...editingLocation, lat: e.target.value})}
                        placeholder="Latitude"
                        style={styles.input}
                        type="number"
                        step="0.000001"
                      />
                      <input
                        value={editingLocation.lng}
                        onChange={e => setEditingLocation({...editingLocation, lng: e.target.value})}
                        placeholder="Longitude"
                        style={styles.input}
                        type="number"
                        step="0.000001"
                      />
                      <select
                        value={editingLocation.campus}
                        onChange={e => setEditingLocation({...editingLocation, campus: e.target.value})}
                        style={styles.select}
                      >
                        <option value="North">North Campus</option>
                        <option value="South">South Campus</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button 
                        onClick={handleUpdateGPSLocation}
                        style={styles.button('primary')}
                      >
                        💾 Save Changes
                      </button>
                      <button 
                        onClick={cancelEditLocation}
                        style={styles.button()}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* GPS Locations Table */}
                <div style={{ marginTop: '2rem' }}>
                  <h5 style={{ marginBottom: '1rem', color: '#495057' }}>📋 Available GPS Locations ({gpsLocations.length})</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Location</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Campus</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Latitude</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Longitude</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gpsLocations.map((coord, index) => (
                          <tr key={coord.name} style={{ borderBottom: '1px solid #e9ecef' }}>
                            <td style={{ padding: '0.75rem' }}>{coord.name}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem',
                                background: coord.campus === 'North' ? '#667eea' : '#764ba2',
                                color: 'white'
                              }}>
                                {coord.campus}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{coord.lat}</td>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{coord.lng}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                onClick={() => startEditLocation(coord)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#3B82F6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Rest of the admin sections remain the same */}
              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>➕ Add New Location</h4>
                <div style={styles.inputGroup}>
                  <input 
                    value={newLocation} 
                    onChange={e => setNewLocation(e.target.value)} 
                    placeholder='Enter location name'
                    style={styles.input}
                  />
                  <button 
                    onClick={handleAddLocation} 
                    style={styles.button('primary')}
                  >
                    Add Location
                  </button>
                </div>
              </div>

              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>🔗 Manage Paths</h4>
                <div style={styles.inputGroup}>
                  <select 
                    value={from} 
                    onChange={e => setFrom(e.target.value)}
                    style={styles.select}
                  >
                    <option value=''>From Location</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  <select 
                    value={to} 
                    onChange={e => setTo(e.target.value)}
                    style={styles.select}
                  >
                    <option value=''>To Location</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  <input 
                    value={distance} 
                    onChange={e => setDistance(e.target.value)} 
                    placeholder='Distance (m)' 
                    style={{ ...styles.input, maxWidth: '150px' }}
                    type="number"
                    min="1"
                  />
                </div>
                <div style={{ ...styles.inputGroup, marginTop: '1rem' }}>
                  <button 
                    onClick={handleAddPath} 
                    style={styles.button('primary')}
                  >
                    ➕ Add Path
                  </button>
                  <button 
                    onClick={handleRemovePath} 
                    style={styles.button('danger')}
                  >
                    ➖ Remove Path
                  </button>
                </div>
              </div>

              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>🗑️ Delete Location</h4>
                <button 
                  onClick={handleDeleteLocation} 
                  style={styles.button('danger')}
                >
                  Delete Location
                </button>
              </div>

              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>📊 Graph Data</h4>
                <pre style={styles.codeBlock}>
                  {JSON.stringify(graph, null, 2)}
                </pre>
                <button 
                  onClick={refresh} 
                  style={{ ...styles.button('primary'), marginTop: '1rem' }}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <p style={{ margin: 0 }}>
            ⚡ Backend Server: <strong>http://localhost:5000</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
            Built with React | Dijkstra's Algorithm | COEP Campus Navigation System
          </p>
        </div>
      </div>
    </div>
  );
}
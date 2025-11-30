<<<<<<< HEAD
=======
//  src/components/GraphVisualizer/GraphVisualizer.jsx
>>>>>>> aac740d4855773c5a8d00e3ec1bb93624ed6bf72
import React, { useEffect, useState, useRef } from "react";
import { useSpring } from "react-spring";
import { Plus, Minus, LocateFixed } from "lucide-react";

export default function GraphVisualizer({ graph, highlightedPath, source, destination, gpsLocations }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [value, setValue] = useState(0);

  //  Convert GPS to canvas coordinates
  const gpsToCanvas = (lat, lng, bounds, canvasWidth, canvasHeight) => {
    const padding = 60;
    const usableWidth = canvasWidth - 2 * padding;
    const usableHeight = canvasHeight - 2 * padding;
    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * usableWidth;
    const y = canvasHeight - (padding + ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * usableHeight);
    return { x: x * scale + pan.x, y: y * scale + pan.y };
  };

  //  Check if an edge is part of the highlighted path
  const isEdgeInPath = (from, to) => {
    if (!highlightedPath || highlightedPath.length === 0) return false;
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const current = highlightedPath[i];
      const next = highlightedPath[i + 1];
      if ((current === from && next === to) || (current === to && next === from)) return true;
    }
    return false;
  };

  // ✨ Draw modern gradient background + grid
  const drawBackground = (ctx, width, height) => {
    // --- Gradient base ---
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // --- Subtle grid ---
    const gridSize = 50;
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // --- Soft light center glow ---
    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.2);
    glow.addColorStop(0, "rgba(255,255,255,0.4)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // --- Campus color zoning ---
    const topZone = ctx.createLinearGradient(0, 0, 0, height / 2);
    topZone.addColorStop(0, "rgba(102,126,234,0.15)");
    topZone.addColorStop(1, "rgba(102,126,234,0.05)");
    ctx.fillStyle = topZone;
    ctx.fillRect(0, 0, width, height / 2);

    const bottomZone = ctx.createLinearGradient(0, height / 2, 0, height);
    bottomZone.addColorStop(0, "rgba(118,75,162,0.08)");
    bottomZone.addColorStop(1, "rgba(118,75,162,0.02)");
    ctx.fillStyle = bottomZone;
    ctx.fillRect(0, height / 2, width, height / 2);

    // --- Zone labels ---
    ctx.font = "bold 16px Poppins, Arial";
    ctx.fillStyle = "#667eea";
    ctx.fillText("North Campus", 20, 30);
    ctx.fillStyle = "#764ba2";
    ctx.fillText("South Campus", 20, height - 20);
  };

  // 🖼️ Main drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const locations = Object.keys(graph);
    if (locations.length === 0) return;

    const coordMap = {};
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

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

    if (minLat === Infinity) {
      minLat = 18.528; maxLat = 18.532; minLng = 73.854; maxLng = 73.859;
    }

    const bounds = { minLat, maxLat, minLng, maxLng };
    drawBackground(ctx, width, height);

    // 🩶 Draw edges
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
        ctx.strokeStyle = isHighlighted ? "#4CAF50" : "#cbd5e0";
        ctx.lineWidth = isHighlighted ? 6 : 2;
        ctx.shadowColor = isHighlighted ? "#4CAF50" : "transparent";
        ctx.shadowBlur = isHighlighted ? 15 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ✨ Show animated distance label only for highlighted path edges
        if (highlightedPath && highlightedPath.length > 0 && isHighlighted) {
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;

          // Animated glow effect — pulsating brightness
          const time = Date.now() / 500; // controls speed
          const glowIntensity = 0.5 + 0.5 * Math.sin(time); // smooth sine glow

          ctx.save();
          ctx.shadowColor = `rgba(46, 125, 50, ${0.6 + glowIntensity * 0.4})`;
          ctx.shadowBlur = 25 * glowIntensity;

          ctx.fillStyle = "#2E7D32";
          ctx.beginPath();
          ctx.roundRect(midX - 22, midY - 12, 44, 24, 4);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = "white";
          ctx.font = "bold 11px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${distance}m`, midX, midY);
          ctx.restore();
        }
      });
    });

    // 🎯 Draw nodes — minimal modern style with scalable text
    Object.entries(coordMap).forEach(([loc, coord]) => {
      const pos = gpsToCanvas(coord.lat, coord.lng, bounds, width, height);
      const isSource = loc === source;
      const isDestination = loc === destination;
      const isInPath = highlightedPath && highlightedPath.includes(loc);
      const isHovered = hoveredNode === loc;

      // --- Dynamic scaling ---
      const baseDot = 2.5;
      const zoomedDot = baseDot * scale;
      const labelOffset = 10 * scale;

      // --- Draw small point ---
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, zoomedDot, 0, 2 * Math.PI);
      if (isSource) ctx.fillStyle = "#3B82F6";
      else if (isDestination) ctx.fillStyle = "#EF4444";
      else if (isInPath) ctx.fillStyle = "#10B981";
      // Fallback if campus_type is missing, use campus, or default to North color
      else ctx.fillStyle = (coord.campus_type === "North" || coord.campus === "North") ? "#667eea" : "#764ba2";
      ctx.fill();

      // 🧠 Intelligent font scaling based on zoom level
      const zoomLevel = 14 + (scale - 1) * 4;

      setValue(zoomLevel);

      // 🎚️ Smooth font scaling across zoom levels (fine-tuned 0.1 steps)
      let labelFontSize;

      if (zoomLevel < 15) labelFontSize = 0.5;
      else if (zoomLevel < 14.1) labelFontSize = 0.45;
      else if (zoomLevel < 14.2) labelFontSize = 0.46;
      else if (zoomLevel < 14.3) labelFontSize = 0.47;
      else if (zoomLevel < 14.4) labelFontSize = 0.48;
      else if (zoomLevel < 14.5) labelFontSize = 0.49;
      else if (zoomLevel < 14.6) labelFontSize = 0.5;
      else if (zoomLevel < 14.7) labelFontSize = 0.52;
      else if (zoomLevel < 14.8) labelFontSize = 0.54;
      else if (zoomLevel < 14.9) labelFontSize = 0.54;
      else if (zoomLevel < 15.0) labelFontSize = 0.58;
      else if (zoomLevel < 15.1) labelFontSize = 0.6;
      else if (zoomLevel < 15.2) labelFontSize = 0.62;
      else if (zoomLevel < 15.3) labelFontSize = 0.64;
      else if (zoomLevel < 15.4) labelFontSize = 0.66;
      else if (zoomLevel < 15.5) labelFontSize = 0.68;
      else if (zoomLevel < 15.6) labelFontSize = 0.7;
      else if (zoomLevel < 15.7) labelFontSize = 0.72;
      else if (zoomLevel < 15.8) labelFontSize = 0.74;
      else if (zoomLevel < 15.9) labelFontSize = 0.6;
      else if (zoomLevel < 16.0) labelFontSize = 0.78;
      else if (zoomLevel < 16.1) labelFontSize = 0.8;
      else if (zoomLevel < 16.2) labelFontSize = 0.82;
      else if (zoomLevel < 16.3) labelFontSize = 0.84;
      else if (zoomLevel < 16.4) labelFontSize = 0.86;
      else if (zoomLevel < 16.5) labelFontSize = 0.88;
      else if (zoomLevel < 16.6) labelFontSize = 0.9;
      else if (zoomLevel < 16.7) labelFontSize = 0.92;
      else if (zoomLevel < 16.8) labelFontSize = 0.94;
      else if (zoomLevel < 16.9) labelFontSize = 0.96;
      else if (zoomLevel < 17.0) labelFontSize = 0.98;
      else if (zoomLevel < 17.1) labelFontSize = 0.8;
      else if (zoomLevel < 17.2) labelFontSize = 0.8;
      else if (zoomLevel < 17.3) labelFontSize = 0.8;
      else if (zoomLevel < 17.4) labelFontSize = 0.85;
      else if (zoomLevel < 17.5) labelFontSize = 0.9;
      else if (zoomLevel < 17.6) labelFontSize = 0.9;
      else if (zoomLevel < 17.7) labelFontSize = 0.9;
      else if (zoomLevel < 17.8) labelFontSize = 0.9;
      else if (zoomLevel < 17.9) labelFontSize = 0.9;
      else if (zoomLevel < 18.0) labelFontSize = 0.9;
      else if (zoomLevel < 18.5) labelFontSize = 0.9;
      else if (zoomLevel < 19.0) labelFontSize = 0.9;
      else if (zoomLevel < 19.5) labelFontSize = 0.9;
      else if (zoomLevel < 22.6) labelFontSize = 0.9;
      else if (zoomLevel < 19.5) labelFontSize = 0.9;
      else if (zoomLevel < 19.5) labelFontSize = 0.9;
      else labelFontSize = 1;

      // ✍️ Label styling — modern, elegant, and readable
      ctx.font = `500 ${labelFontSize * 0.9}rem "Inter", "Segoe UI", "Helvetica Neue", sans-serif`;
      ctx.fillStyle = "rgba(60, 72, 88, 0.85)"; // softer gray-blue tone
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // 🪄 Add subtle shadow for visibility on bright backgrounds
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(coord.name, pos.x, pos.y + 10 * scale);
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 1;
    });
  }, [graph, highlightedPath, source, destination, scale, pan, hoveredNode, gpsLocations]);

  // 🖱️ Interaction handlers
  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPan({ x: pan.x + (x - dragStart.x), y: pan.y + (y - dragStart.y) });
      setDragStart({ x, y });
    } else {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const locations = Object.keys(graph);
      const valid = gpsLocations.filter(c => locations.includes(c.name));
      if (valid.length === 0) return;
      const bounds = {
        minLat: Math.min(...valid.map(c => c.lat)),
        maxLat: Math.max(...valid.map(c => c.lat)),
        minLng: Math.min(...valid.map(c => c.lng)),
        maxLng : Math.max(...valid.map(c => c.lng))
      };
      let found = null;
      for (const loc of locations) {
        const coord = gpsLocations.find(c => c.name === loc);
        if (!coord) continue;
        const pos = gpsToCanvas(coord.lat, coord.lng, bounds, canvas.width, canvas.height);
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < 25) { found = loc; break; }
      }
      setHoveredNode(found);
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => {
      const newScale = Math.max(0.5, Math.min(8, prevScale * zoomFactor));

      // 🧮 Adjust pan so zoom happens at cursor position
      setPan(prevPan => {
        const dx = mouseX - prevPan.x;
        const dy = mouseY - prevPan.y;
        const scaleChange = newScale / prevScale;
        return {
          x: mouseX - dx * scaleChange,
          y: mouseY - dy * scaleChange
        };
      });

      return newScale;
    });
  };

  // 🔍 Manual Zoom Logic for Buttons
  const handleManualZoom = (factor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Zoom towards center of the view
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setScale(prevScale => {
      const newScale = Math.max(0.5, Math.min(8, prevScale * factor));
      setPan(prevPan => {
        const dx = centerX - prevPan.x;
        const dy = centerY - prevPan.y;
        const scaleChange = newScale / prevScale;
        return {
          x: centerX - dx * scaleChange,
          y: centerY - dy * scaleChange
        };
      });
      return newScale;
    });
  };

  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheelEvent = (e) => { e.preventDefault(); handleWheel(e); };
    canvas.addEventListener("wheel", handleWheelEvent, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheelEvent);
  }, [handleWheel]);

  // Styles for the map control buttons
  const controlButtonStyle = {
    width: "36px",
    height: "36px",
    background: "white",
    border: "none",
    borderRadius: "8px", // Google maps style rounded squares
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#4a5568",
    transition: "background 0.2s"
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "0.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: "1.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#2d3748", margin: 0 }}>COEP CAMPUS MAP</h3>
        <button onClick={resetView} style={{
          padding: "0.5rem 1rem",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: "600"
        }}>Reset View</button>
      </div>

      <div style={{ position: "relative", width: "100%", height: "auto" }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            cursor: isDragging ? "grabbing" : "grab",
            width: "100%",
            height: "auto",
            display: "block"
          }}
        />

        {/* 🗺️ Google Maps style controls */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 10
        }}>
          {/* Zoom In */}
          <button 
            onClick={() => handleManualZoom(1.2)} 
            style={controlButtonStyle}
            title="Zoom In"
            onMouseOver={(e) => e.currentTarget.style.background = "#f7fafc"}
            onMouseOut={(e) => e.currentTarget.style.background = "white"}
          >
            <Plus size={20} />
          </button>

          {/* Zoom Out */}
          <button 
            onClick={() => handleManualZoom(0.8)} 
            style={controlButtonStyle}
            title="Zoom Out"
            onMouseOver={(e) => e.currentTarget.style.background = "#f7fafc"}
            onMouseOut={(e) => e.currentTarget.style.background = "white"}
          >
            <Minus size={20} />
          </button>

          {/* Recenter */}
          <button 
            onClick={resetView} 
            style={{...controlButtonStyle, marginTop: "4px"}}
            title="Recenter Map"
            onMouseOver={(e) => e.currentTarget.style.background = "#f7fafc"}
            onMouseOut={(e) => e.currentTarget.style.background = "white"}
          >
            <LocateFixed size={20} color="#3182ce" />
          </button>
        </div>
      </div>
    </div>
  );
}
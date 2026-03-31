// src/api/api.js
const BASE = "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/*  Graph / Path helpers – unchanged                                            */
/* -------------------------------------------------------------------------- */
export async function getGraph() {
  const res = await fetch(`${BASE}/admin/graph`);
  return res.json();
}

export async function findPath(source, destination) {
  const res = await fetch(`${BASE}/find-path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination })
  });
  return res.json();
}

export async function addLocation(name) {
  const res = await fetch(`${BASE}/admin/add-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function addPath(from, to, distance) {
  const res = await fetch(`${BASE}/admin/add-path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, distance })
  });
  return res.json();
}

export async function removePath(from, to) {
  const res = await fetch(`${BASE}/admin/remove-path`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to })
  });
  return res.json();
}

export async function deleteLocation(name) {
  const res = await fetch(`${BASE}/admin/delete-location`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  GPS-location helpers – **updated** to send/receive the full object          */
/* -------------------------------------------------------------------------- */

/**
 * GET  →  /admin/gps-locations
 * Returns an array of full location objects.
 */
export async function getGPSLocations() {
  const res = await fetch(`${BASE}/admin/gps-locations`);
  return res.json();               // → [{ id, name, lat, lng, maps_url, … }, …]
}

/**
 * POST →  /admin/add-gps-location
 * Sends the **complete** location object (all fields you filled in the form).
 */
export async function addGPSLocation(locationData) {
  const res = await fetch(`${BASE}/admin/add-gps-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(locationData)   // <-- whole object
  });
  return res.json();
}

/**
 * PUT  →  /admin/update-gps-location
 * Sends the **updated** location object (id is required for the backend to know which row to update).
 */
export async function updateGPSLocation(locationData) {
  const res = await fetch(`${BASE}/admin/update-gps-location`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(locationData)   // <-- whole object (must contain `id`)
  });
  return res.json();
}

/**
 * DELETE →  /admin/delete-gps-location
 * Deletes a GPS location by its `id`.
 */
export async function deleteGPSLocation(id) {
  const res = await fetch(`${BASE}/admin/delete-gps-location`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  return res.json();
}
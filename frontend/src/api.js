const BASE = "http://localhost:5000";
export async function getGraph(){ const res = await fetch(`${BASE}/admin/graph`); return res.json(); }
export async function findPath(source,destination){ const res = await fetch(`${BASE}/find-path`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ source, destination }) }); return res.json(); }
export async function addLocation(name){ const res = await fetch(`${BASE}/admin/add-location`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name }) }); return res.json(); }
export async function addPath(from,to,distance){ const res = await fetch(`${BASE}/admin/add-path`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ from,to,distance }) }); return res.json(); }
export async function removePath(from,to){ const res = await fetch(`${BASE}/admin/remove-path`, { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ from,to }) }); return res.json(); }
export async function deleteLocation(name){ const res = await fetch(`${BASE}/admin/delete-location`, { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name }) }); return res.json(); }

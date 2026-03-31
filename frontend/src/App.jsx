// src/App.jsx
import { useState, useEffect } from 'react';
import { styles } from './styles/styles';
import TabButton from './components/common/TabButton';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import PathFinderForm from './components/UserPanel/PathFinderForm';
import ResultCard from './components/UserPanel/ResultCard';
import LocationChips from './components/UserPanel/LocationChips';
import GPSLocationManager from './components/AdminPanel/GPSLocationManager';
import Modal from './components/AdminPanel/Modal';
import AddGPSForm from './components/AdminPanel/AddGPSForm';
import EditGPSForm from './components/AdminPanel/EditGPSForm';
import ManagePaths from './components/AdminPanel/ManagePaths';
import DeleteLocation from './components/AdminPanel/DeleteLocation';

import {
  getGraph, findPath, addLocation, addPath, removePath, deleteLocation,
  getGPSLocations, addGPSLocation, updateGPSLocation, deleteGPSLocation
} from './api/api';

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

  // Full GPS form state
  const [newGPSLocation, setNewGPSLocation] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    maps_url: '',
    description: '',
    type: '',
    building_name: '',
    floor_number: '',
    campus_type: 'North',
    priority: 5,
    icon: '',
    color: '#7f8c8d',
    minZoom: 16,
    maxZoom: 22
  });

  // Modal
  const [modalType, setModalType] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);

  const openEditModal = (loc) => {
    setModalPayload(loc);
    setModalType('edit');
  };

  const openDeleteModal = (loc) => {
    setModalPayload(loc);
    setModalType('delete');
  };

  const getModalTitle = (type) => {
    const titles = {
      add: 'Add GPS Location',
      edit: 'Edit GPS Location',
      paths: 'Manage Paths',
      delete: 'Delete Location'
    };
    return titles[type] || '';
  };

  // Refresh data
  async function refresh() {
    try {
      const [g, gpsData] = await Promise.all([getGraph(), getGPSLocations()]);
      setGraph(g || {});
      setLocations(Object.keys(g || {}));
      setGpsLocations(gpsData || []);
    } catch (e) {
      console.error("Error:", e);
      alert("Failed to connect to backend");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // USER HANDLERS
  const handleFind = async () => {
    if (!source || !destination) return alert("Please select both source and destination");
    setLoading(true);
    try {
      const r = await findPath(source, destination);
      setResult(r);
    } catch (e) {
      console.error(e);
      alert("Error finding path");
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: GRAPH HANDLERS
  const handleAddLocation = async () => {
    if (!newLocation) return alert("Please enter location name");
    try {
      await addLocation(newLocation);
      setNewLocation("");
      refresh();
    } catch (e) {
      alert("Error adding location");
    }
  };

  const handleAddPath = async () => {
    if (!from || !to || !distance) return alert("Please fill all fields");
    const d = Number(distance);
    if (isNaN(d) || d <= 0) return alert("Invalid distance");
    try {
      await addPath(from, to, d);
      setFrom(""); setTo(""); setDistance("");
      refresh();
    } catch (e) {
      alert("Error adding path");
    }
  };

  const handleRemovePath = async () => {
    if (!from || !to) return alert("Please select from and to");
    try {
      await removePath(from, to);
      setFrom(""); setTo("");
      refresh();
    } catch (e) {
      alert("Error removing path");
    }
  };

  // GPS HANDLERS
  const handleAddGPSLocation = async () => {
    const { name, lat, lng, id } = newGPSLocation;
    if (!id || !name || !lat || !lng) {
      return alert("Name, Latitude, and Longitude are required");
    }
    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);
    if (isNaN(latF) || isNaN(lngF)) {
      return alert("Invalid latitude or longitude");
    }
    try {
      await addGPSLocation({ ...newGPSLocation, lat: latF, lng: lngF });
      // Reset all fields
      setNewGPSLocation({
        id: '', name: '', lat: '', lng: '', maps_url: '', description: '',
        type: '', building_name: '', floor_number: '', campus_type: 'North',
        priority: 5, icon: '', color: '#7f8c8d', minZoom: 16, maxZoom: 22
      });
      setModalType(null);
      refresh();
    } catch (e) {
      alert("Error adding GPS location");
    }
  };

  const handleUpdateGPSLocation = async () => {
    if (!modalPayload) return;
    const { id, name, lat, lng } = modalPayload;
    if (!name || lat == null || lng == null) {
      return alert("ID, Name, Latitude, and Longitude are required");
    }
    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);
    if (isNaN(latF) || isNaN(lngF)) {
      return alert("Invalid latitude or longitude");
    }
    try {
      await updateGPSLocation({ ...modalPayload, lat: latF, lng: lngF });
      setModalType(null);
      refresh();
    } catch (e) {
      alert("Error updating GPS location");
    }
  };

  // GPS HANDLERS – replace ONLY this function
  const handleDeleteLocation = async (id) => {
    if (!id) return alert('Location ID is missing');
    if (!window.confirm('Delete this GPS location permanently?')) return;
    try {
      await deleteGPSLocation(id);   // <-- API receives only the ID
      setModalType(null);
      refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to delete location');
    }
  };

  // Modal content
  function renderModalContent(type) {
    switch (type) {
      case 'add':
        return (
          <AddGPSForm
            newGPSLocation={newGPSLocation}
            setNewGPSLocation={setNewGPSLocation}
            handleAddGPSLocation={handleAddGPSLocation}
            gpsLocations={gpsLocations}
          />
        );

      case 'edit':
        if (!modalPayload) return null;
        return (
          <EditGPSForm
            editingLocation={modalPayload}
            setEditingLocation={setModalPayload}
            handleUpdateGPSLocation={handleUpdateGPSLocation}
            cancelEditLocation={() => setModalType(null)}
          />
        );

      case 'delete':
        if (!modalPayload) return null;
        return (
          <DeleteLocation
            location={modalPayload}
            handleDeleteLocation={handleDeleteLocation}
            onClose={() => setModalType(null)}
          />
        );

      case 'paths':
        return (
          <ManagePaths
            locations={locations}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            distance={distance}
            setDistance={setDistance}
            handleAddPath={handleAddPath}
            handleRemovePath={handleRemovePath}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>COEP Campus Navigation</h1>
        </div>

        <div style={styles.tabContainer}>
          <TabButton active={tab === 'user'} onClick={() => setTab('user')}>Navigation</TabButton>
          <TabButton active={tab === 'admin'} onClick={() => setTab('admin')}>Admin Panel</TabButton>
        </div>

        <div style={styles.content}>
          {/* USER TAB */}
          {tab === 'user' && (
            <>
              <h2 style={styles.sectionTitle}>Find Shortest Path</h2>
              <PathFinderForm
                source={source}
                setSource={setSource}
                destination={destination}
                setDestination={setDestination}
                locations={locations}
                loading={loading}
                handleFind={handleFind}
              />
              <ResultCard result={result} />
              {Object.keys(graph).length > 0 && (
                <GraphVisualizer
                  graph={graph}
                  highlightedPath={result?.path || []}
                  source={source}
                  destination={destination}
                  gpsLocations={gpsLocations}
                />
              )}
              <LocationChips locations={locations} />
            </>
          )}

          {/* ADMIN TAB */}
          {tab === 'admin' && (
            <>
              {/* Admin Control Panel */}
              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>Admin Control Panel</h4>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <button onClick={() => setModalType('add')} style={styles.button('primary')}>
                    Add GPS Location
                  </button>
                  <button onClick={() => setModalType('paths')} style={styles.button('success')}>
                    Manage Paths
                  </button>
                </div>

                {/* Modal */}
                {modalType && (
                  <Modal
                    title={getModalTitle(modalType)}
                    onClose={() => setModalType(null)}
                  >
                    {renderModalContent(modalType)}
                  </Modal>
                )}
              </div>

              {/* GPS Table */}
              <GPSLocationManager
                gpsLocations={gpsLocations}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
              />

              {/* Graph Data */}
              <div style={styles.adminSection}>
                <h4 style={styles.adminTitle}>Graph Data</h4>
                <pre style={styles.codeBlock}>{JSON.stringify(graph, null, 2)}</pre>
                <button onClick={refresh} style={{ ...styles.button('primary'), marginTop: '1rem' }}>
                  Refresh Data
                </button>
              </div>
            </>
          )}
        </div>

        <div style={styles.footer}>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>Made with Love by Chaitanya, Suraj & Rutuja</p>
        </div>
      </div>
    </div>
  );
}
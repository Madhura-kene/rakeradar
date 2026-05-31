import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { BottomSheet } from './components/BottomSheet';
import { CrowdReportForm } from './components/CrowdReportForm';
import { fetchLiveTrains, submitCrowdReport } from './data/apiService';
import './index.css';
import './App.css';

function App() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Real-time server-persisted database states
  const [trains, setTrains] = useState(null);
  const [selectedTrainId, setSelectedTrainId] = useState('99812'); // Defaults to Up Local (Pune -> Lonavala)

  // Poll the backend REST API every 1.5 seconds for synchronized GPS & crowd telemetry of BOTH trains
  useEffect(() => {
    const getLiveData = async () => {
      try {
        const data = await fetchLiveTrains();
        setTrains(data);
      } catch {
        console.warn('Vite Mock Backend API polling failed. Retrying in next tick.');
      }
    };

    // Initial pull
    getLiveData();

    const timer = setInterval(getLiveData, 1500);
    return () => clearInterval(timer);
  }, []);

  // Handler to update crowd level by sending a POST request to the backend server
  const handleReportSubmit = async (targetTrainId, coachNum, sectionId, level) => {
    try {
      // Call POST backend API
      const response = await submitCrowdReport(targetTrainId, coachNum, sectionId, level);
      
      if (response.success) {
        // Flash a success toast
        setToastMessage(`Feedback received! Train ${targetTrainId} Coach C${coachNum} status updated.`);
        setTimeout(() => setToastMessage(null), 4000);

        // Instantly pull the fresh server-side state for immediate frontend reactivity
        const freshData = await fetchLiveTrains();
        setTrains(freshData);
      }
    } catch {
      setToastMessage('⚠️ Failed to communicate crowd report with the server database.');
      setTimeout(() => setToastMessage(null), 3000);
    }
    
    setIsReportOpen(false);
  };

  // Derive the active train state from our server telemetry data map
  const activeTrain = trains ? trains[selectedTrainId] : null;
  const crowdData = activeTrain ? activeTrain.crowd : null;

  // Simulated platform crowds for the station detail card
  const getStationPlatformOccupancy = (stationName) => {
    const hash = stationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 60) + 30; // 30% to 90%
  };

  // Callback when a train marker is clicked directly on the map
  const handleTrainMarkerClick = (trainId) => {
    setSelectedTrainId(trainId);
    setIsSheetOpen(true);
  };

  return (
    <div className="app-container">
      {/* Real-time Map Layer with coordinates fed directly from backend API */}
      <MapView 
        trains={trains}
        selectedTrainId={selectedTrainId}
        onTrainClick={handleTrainMarkerClick} 
        onStationClick={(station) => setSelectedStation(station)}
      />

      {/* Floating Header Dashboard */}
      <div className="map-overlay-header" style={{ width: '310px' }}>
        <div className="header-title-container">
          <div className="live-pulse-dot"></div>
          <h1 className="header-title" style={{ margin: 0, fontSize: '18px' }}>RakeRadar Pune</h1>
        </div>
        <p className="header-subtitle" style={{ margin: 0, fontSize: '12px' }}>
          Live Full-Stack telemetry mapping. Pune-Lonavala suburban division.
        </p>

        {/* Bidirectional Train Selector Dropdown Group */}
        <div className="train-direction-switcher" style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <label className="switcher-label" style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '0.5px' }}>
            Focus Train / Direction:
          </label>
          <div className="switcher-button-group" style={{ display: 'flex', gap: '6px' }}>
            <button 
              className={`switcher-btn ${selectedTrainId === '99812' ? 'active' : ''}`}
              onClick={() => setSelectedTrainId('99812')}
              style={{
                flex: 1,
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: selectedTrainId === '99812' ? 'var(--text-main)' : 'rgba(255,255,255,0.02)',
                color: selectedTrainId === '99812' ? 'var(--bg-darker)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              Up: Pune ➔ Lonavala
            </button>
            <button 
              className={`switcher-btn ${selectedTrainId === '99815' ? 'active' : ''}`}
              onClick={() => setSelectedTrainId('99815')}
              style={{
                flex: 1,
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: selectedTrainId === '99815' ? 'var(--text-main)' : 'rgba(255,255,255,0.02)',
                color: selectedTrainId === '99815' ? 'var(--bg-darker)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              Down: Lonavala ➔ Pune
            </button>
          </div>
        </div>
      </div>

      {/* Floating Crowdsource Trigger */}
      <button 
        className="report-floater-btn"
        onClick={() => setIsReportOpen(true)}
      >
        <span>📢</span> Report Live Crowd
      </button>

      {/* Real-time Toast Notifications */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {/* Station detail side overlay card */}
      {selectedStation && (
        <div className="station-detail-card">
          <div className="station-card-header">
            <h3 className="station-card-title" style={{ margin: 0 }}>
              🚉 {selectedStation.name}
            </h3>
            <button 
              className="station-card-close"
              onClick={() => setSelectedStation(null)}
            >
              ✕
            </button>
          </div>
          
          <div className="station-info-row">
            <span className="station-info-label">Line:</span>
            <span className="station-info-value">Pune - Lonavala Division</span>
          </div>
          <div className="station-info-row">
            <span className="station-info-label">Platform Occupancy:</span>
            <span className={`station-info-value`} style={{ 
              color: getStationPlatformOccupancy(selectedStation.name) > 75 ? 'var(--crowd-high)' : 
                     getStationPlatformOccupancy(selectedStation.name) > 50 ? 'var(--crowd-medium)' : 'var(--crowd-low)'
            }}>
              {getStationPlatformOccupancy(selectedStation.name)}% Busy
            </span>
          </div>
          <div className="station-info-row">
            <span className="station-info-label">Status:</span>
            <span className="station-info-value" style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>
              Services Active
            </span>
          </div>

          <div className="platform-occupancy">
            <div className="occupancy-meter-bg">
              <div 
                className="occupancy-meter-fill"
                style={{ 
                  width: `${getStationPlatformOccupancy(selectedStation.name)}%`,
                  backgroundColor: getStationPlatformOccupancy(selectedStation.name) > 75 ? 'var(--crowd-high)' : 
                                  getStationPlatformOccupancy(selectedStation.name) > 50 ? 'var(--crowd-medium)' : 'var(--crowd-low)'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Train Detail Bottom Sheet */}
      <BottomSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        crowdData={crowdData}
      />

      {/* Crowdsourced reporting form modal */}
      {isReportOpen && (
        <CrowdReportForm 
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          crowdData={crowdData}
          selectedTrainId={selectedTrainId}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
}

export default App;

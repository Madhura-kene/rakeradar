import { useState, useEffect, useRef } from 'react';
import { TrainDiagram } from './TrainDiagram';
import { CompartmentList } from './CompartmentList';
import { CrowdRecommendation } from './CrowdRecommendation';
import './BottomSheet.css';

export const BottomSheet = ({ isOpen, onClose, crowdData }) => {
  const sheetRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target.className === 'bottom-sheet-backdrop') {
      onClose();
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filterOptions = [
    { value: 'all', label: 'All Coaches' },
    { value: 'general', label: 'General' },
    { value: 'ladies', label: 'Ladies ♀' },
    { value: 'first_class', label: 'First Class ★' },
    { value: 'divyangjan', label: 'Divyang ♿' }
  ];

  return (
    <>
      {isOpen && (
        <div className="bottom-sheet-backdrop" onClick={handleBackdropClick} />
      )}
      
      <div 
        ref={sheetRef}
        className={`bottom-sheet glass-panel-sheet ${isOpen ? 'open' : ''}`}
      >
        <div className="bottom-sheet-header">
          <div className="drag-handle" onClick={onClose}></div>
          <div className="header-content">
            <div>
              <h2 className="train-title">Pune - Lonavala local (99812)</h2>
              <p className="train-subtitle">
                Rake: 12-Coach Siemens EMU • Track Live Status • Updated {formatTime(crowdData?.last_updated)}
              </p>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="bottom-sheet-content">
          {/* Smart Recommendation Module */}
          <div className="section-title">Commuter Insights</div>
          <div style={{ padding: '0 20px' }}>
            <CrowdRecommendation crowdData={crowdData} />
          </div>

          {/* Interactive Filtering Module */}
          <div className="section-title">Filter by Comfort / Class</div>
          <div className="filter-chips-row">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                className={`filter-chip ${activeFilter === opt.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="section-title">Train Configuration & Occupancy Map</div>
          <TrainDiagram crowdData={crowdData} activeFilter={activeFilter} />
          
          <div className="section-title">Compartment Specific Status</div>
          <CompartmentList crowdData={crowdData} activeFilter={activeFilter} />
        </div>
      </div>
    </>
  );
};

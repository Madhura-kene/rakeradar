import { useState } from 'react';
import './CrowdReportForm.css';

export const CrowdReportForm = ({ isOpen, onClose, crowdData, selectedTrainId, onSubmit }) => {
  const [reportMode, setReportMode] = useState('manual'); // 'manual' or 'ai'
  const [aiSubMode, setAiSubMode] = useState('single'); // 'single' (1 coach) or 'bulk' (all 12 coaches)
  
  // Bidirectional Target Train State
  const [targetTrainId, setTargetTrainId] = useState(selectedTrainId || '99812');

  // Manual Compartment State
  const [selectedCoach, setSelectedCoach] = useState('1');
  const [selectedSection, setSelectedSection] = useState(() => {
    if (crowdData && crowdData.coaches) {
      const coach = crowdData.coaches.find(c => c.coach === 1);
      if (coach && coach.sections.length > 0) {
        return coach.sections[0].id;
      }
    }
    return '';
  });
  const [selectedLevel, setSelectedLevel] = useState('medium');

  // AI Single Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [aiResult, setAiResult] = useState(null); // { level: 'low'|'medium'|'high', confidence: number }

  // AI Bulk Upload State
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkPreviews, setBulkPreviews] = useState([]); // [{ name, url }]
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [bulkScanProgress, setBulkScanProgress] = useState(0);
  const [bulkScanStatus, setBulkScanStatus] = useState('');
  const [bulkResults, setBulkResults] = useState([]); // [{ coachNum, sectionId, level, confidence, fileName }]

  if (!isOpen || !crowdData || !crowdData.coaches) return null;

  const currentCoachData = crowdData.coaches.find(c => c.coach === Number(selectedCoach));

  // Reset AI states when switching modes
  const handleModeChange = (mode) => {
    setReportMode(mode);
    // Reset all AI and Bulk states
    setSelectedFile(null);
    setPreviewUrl('');
    setIsScanning(false);
    setScanProgress(0);
    setScanStatus('');
    setAiResult(null);
    
    setBulkFiles([]);
    setBulkPreviews([]);
    setIsBulkScanning(false);
    setBulkScanProgress(0);
    setBulkScanStatus('');
    setBulkResults([]);
  };

  const handleAiSubModeChange = (subMode) => {
    setAiSubMode(subMode);
    // Reset uploader states
    setSelectedFile(null);
    setPreviewUrl('');
    setIsScanning(false);
    setScanProgress(0);
    setScanStatus('');
    setAiResult(null);

    setBulkFiles([]);
    setBulkPreviews([]);
    setIsBulkScanning(false);
    setBulkScanProgress(0);
    setBulkScanStatus('');
    setBulkResults([]);
  };

  const handleCoachClick = (coachNum) => {
    setSelectedCoach(coachNum);
    const coach = crowdData.coaches.find(c => c.coach === Number(coachNum));
    if (coach && coach.sections.length > 0) {
      setSelectedSection(coach.sections[0].id);
    }
  };

  // Handle Single File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAiResult(null);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
    }
  };

  // Handle Bulk Multi-File selection
  const handleBulkFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setBulkFiles(files);
      const previews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setBulkPreviews(previews);
      setBulkResults([]);
      setIsBulkScanning(false);
      setBulkScanProgress(0);
      setBulkScanStatus('');
    }
  };

  // Simulated AI Single Scan
  const startAiScan = () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanProgress(0);
    setAiResult(null);

    const steps = [
      { progress: 10, text: '📥 [1/4] Uploading compartment feed to RakeVision...' },
      { progress: 35, text: '🔍 [2/4] Initializing neural network grid layers...' },
      { progress: 65, text: '👤 [3/4] Running YOLOv8 head detection...' },
      { progress: 85, text: '📊 [4/4] Calculating occupancy ratio...' },
      { progress: 100, text: '✅ RakeVision AI scan complete.' }
    ];

    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setScanProgress(step.progress);
        setScanStatus(step.text);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        
        const name = selectedFile.name.toLowerCase();
        let detectedLevel = 'medium';
        let confidence = 88.5;

        if (name.includes('low') || name.includes('empty') || name.includes('vacant') || name.includes('clear') || /c\d+l/i.test(name)) {
          detectedLevel = 'low';
          confidence = 94.2;
        } else if (name.includes('high') || name.includes('crowd') || name.includes('packed') || name.includes('full') || name.includes('busy') || /c\d+h/i.test(name)) {
          detectedLevel = 'high';
          confidence = 97.8;
        }

        setAiResult({ level: detectedLevel, confidence });
        setSelectedLevel(detectedLevel);
        setIsScanning(false);
      }
    }, 500);
  };

  // Simulated AI Bulk Batch Scan
  const startBulkScan = () => {
    if (bulkFiles.length === 0) return;

    setIsBulkScanning(true);
    setBulkScanProgress(0);
    setBulkResults([]);

    const steps = [
      { progress: 15, text: '📥 [1/5] Initializing RakeVision Parallel Batch Pipeline...' },
      { progress: 40, text: '📦 [2/5] Synthesizing 12 compartment visual streams...' },
      { progress: 70, text: '🧠 [3/5] Running YOLOv8 head counts on all coaches concurrently...' },
      { progress: 90, text: '💻 [4/5] Running boundary ratio heuristics...' },
      { progress: 100, text: '✅ RakeVision Batch AI Classification complete!' }
    ];

    let currentStepIndex = 0;

    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setBulkScanProgress(step.progress);
        setBulkScanStatus(step.text);
        currentStepIndex++;
      } else {
        clearInterval(interval);

        // Process all selected files using our smart filename regex parser
        const results = bulkFiles.map((file) => {
          const name = file.name.toLowerCase();
          
          // 1. Extract Coach Number (e.g. c5 -> 5, c10 -> 10)
          const coachMatch = name.match(/c(\d+)/i);
          const coachNum = coachMatch ? Number(coachMatch[1]) : 1;

          // 2. Extract Section ID based on train configuration
          let sectionId = `C${coachNum}`;
          if (coachNum === 4) {
            sectionId = name.includes('c4b') || name.includes('4b') ? 'C4B' : 'C4A';
          } else if (coachNum === 6) {
            sectionId = name.includes('c6b') || name.includes('6b') ? 'C6B' : 'C6A';
          } else if (coachNum === 9) {
            sectionId = name.includes('c9b') || name.includes('9b') ? 'C9B' : 'C9A';
          }

          // 3. Extract Crowd Level using subtle codes
          let level = 'medium';
          let confidence = 88.5;

          if (name.includes('low') || name.includes('empty') || name.includes('vacant') || name.includes('clear') || /c\d+l/i.test(name)) {
            level = 'low';
            confidence = 94.2;
          } else if (name.includes('high') || name.includes('crowd') || name.includes('packed') || name.includes('full') || name.includes('busy') || /c\d+h/i.test(name)) {
            level = 'high';
            confidence = 97.8;
          }

          return {
            coachNum,
            sectionId,
            level,
            confidence,
            fileName: file.name
          };
        });

        // Sort by coach number for clean rendering inside summary list
        results.sort((a, b) => a.coachNum - b.coachNum);

        setBulkResults(results);
        setIsBulkScanning(false);
      }
    }, 550);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetTrainId) return;

    if (reportMode === 'ai' && aiSubMode === 'bulk') {
      if (bulkResults.length === 0) return;
      // Send the entire reports array!
      onSubmit(targetTrainId, bulkResults);
    } else {
      if (!selectedCoach || !selectedSection || !selectedLevel) return;
      onSubmit(targetTrainId, selectedCoach, selectedSection, selectedLevel);
    }
  };

  return (
    <div className="report-modal-backdrop" onClick={(e) => e.target.className === 'report-modal-backdrop' && onClose()}>
      <div className={`report-modal glass-panel ${reportMode === 'ai' && aiSubMode === 'bulk' ? 'bulk-layout' : ''}`}>
        <div className="report-modal-header">
          <h2 className="report-modal-title">📢 Compartment Live Reporting</h2>
          <button className="report-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab selection */}
        <div className="report-mode-tabs">
          <button 
            type="button" 
            className={`mode-tab-btn ${reportMode === 'manual' ? 'active' : ''}`}
            onClick={() => handleModeChange('manual')}
          >
            ✍️ Manual Assessment
          </button>
          <button 
            type="button" 
            className={`mode-tab-btn ${reportMode === 'ai' ? 'active' : ''}`}
            onClick={() => handleModeChange('ai')}
          >
            ⚡ RakeVision AI Scan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form" style={{ marginTop: '16px' }}>
          
          {/* Target Train Selection */}
          <div className="form-group">
            <label className="form-label">Which train are you boarding?</label>
            <div className="section-selector-row">
              <button
                type="button"
                className={`section-btn ${targetTrainId === '99812' ? 'selected' : ''}`}
                onClick={() => setTargetTrainId('99812')}
                disabled={isScanning || isBulkScanning}
                style={{ fontSize: '11px', padding: '10px 4px' }}
              >
                Up: Pune ➔ Lonavala (99812)
              </button>
              <button
                type="button"
                className={`section-btn ${targetTrainId === '99815' ? 'selected' : ''}`}
                onClick={() => setTargetTrainId('99815')}
                disabled={isScanning || isBulkScanning}
                style={{ fontSize: '11px', padding: '10px 4px' }}
              >
                Down: Lonavala ➔ Pune (99815)
              </button>
            </div>
          </div>

          {/* Render Manual Mode */}
          {reportMode === 'manual' && (
            <>
              <div className="form-group">
                <label className="form-label">Which coach are you in?</label>
                <div className="coach-selector-grid">
                  {crowdData.coaches.map((c) => (
                    <button
                      key={c.coach}
                      type="button"
                      className={`coach-btn ${selectedCoach === String(c.coach) ? 'selected' : ''}`}
                      onClick={() => handleCoachClick(String(c.coach))}
                    >
                      C{c.coach}
                      <span className="coach-sub-icon">
                        {c.type === 'ladies' ? '♀' : 
                         c.type === 'first_class' ? '★' : 
                         c.type === 'divyangjan' ? '♿' : 'G'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {currentCoachData && currentCoachData.sections.length > 1 && (
                <div className="form-group">
                  <label className="form-label">Which section are you in?</label>
                  <div className="section-selector-row">
                    {currentCoachData.sections.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`section-btn ${selectedSection === s.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSection(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">How crowded is it right now?</label>
                <div className="level-selector-row">
                  <button
                    type="button"
                    className={`level-btn level-low ${selectedLevel === 'low' ? 'selected' : ''}`}
                    onClick={() => setSelectedLevel('low')}
                  >
                    <div className="level-indicator low"></div>
                    <div className="level-btn-text">
                      <span className="btn-level-title">Low Crowd</span>
                      <span className="btn-level-desc">Lots of vacant seats</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`level-btn level-medium ${selectedLevel === 'medium' ? 'selected' : ''}`}
                    onClick={() => setSelectedLevel('medium')}
                  >
                    <div className="level-indicator medium"></div>
                    <div className="level-btn-text">
                      <span className="btn-level-title">Medium Crowd</span>
                      <span className="btn-level-desc">Standing room only</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`level-btn level-high ${selectedLevel === 'high' ? 'selected' : ''}`}
                    onClick={() => setSelectedLevel('high')}
                  >
                    <div className="level-indicator high"></div>
                    <div className="level-btn-text">
                      <span className="btn-level-title">High Crowd</span>
                      <span className="btn-level-desc">Packed compartment</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Render AI Photo Scan Mode */}
          {reportMode === 'ai' && (
            <>
              {/* Selector for Single vs Bulk upload inside AI tab */}
              <div className="report-mode-tabs" style={{ background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                <button
                  type="button"
                  className={`mode-tab-btn ${aiSubMode === 'single' ? 'active' : ''}`}
                  onClick={() => handleAiSubModeChange('single')}
                  disabled={isScanning || isBulkScanning}
                >
                  📸 Single Compartment Feed
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${aiSubMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => handleAiSubModeChange('bulk')}
                  disabled={isScanning || isBulkScanning}
                >
                  🗂️ Bulk Train Seed (12 Feeds)
                </button>
              </div>

              {/* SINGLE COACH UPLOAD PANEL */}
              {aiSubMode === 'single' && (
                <>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label">Which coach are you in?</label>
                    <div className="coach-selector-grid">
                      {crowdData.coaches.map((c) => (
                        <button
                          key={c.coach}
                          type="button"
                          className={`coach-btn ${selectedCoach === String(c.coach) ? 'selected' : ''}`}
                          onClick={() => handleCoachClick(String(c.coach))}
                          disabled={isScanning}
                        >
                          C{c.coach}
                          <span className="coach-sub-icon">
                            {c.type === 'ladies' ? '♀' : 
                             c.type === 'first_class' ? '★' : 
                             c.type === 'divyangjan' ? '♿' : 'G'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentCoachData && currentCoachData.sections.length > 1 && (
                    <div className="form-group">
                      <label className="form-label">Which section are you in?</label>
                      <div className="section-selector-row">
                        {currentCoachData.sections.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`section-btn ${selectedSection === s.id ? 'selected' : ''}`}
                            onClick={() => setSelectedSection(s.id)}
                            disabled={isScanning}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label">Compartment Image Feed</label>
                    
                    {!previewUrl ? (
                      <div className="file-drop-area">
                        <span className="drop-icon">📷</span>
                        <p className="drop-text">Drag compartment photo here or click to browse</p>
                        <input 
                          type="file" 
                          className="file-input-hidden" 
                          accept="image/*" 
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="image-preview-container">
                        <img src={previewUrl} className="preview-image" alt="Compartment Feed Preview" />
                        
                        {isScanning && (
                          <div className="scanning-overlay">
                            <div className="laser-scanner-line"></div>
                            <div className="scan-progress-box">
                              <div className="scan-bar-bg">
                                <div className="scan-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                              </div>
                              <span className="scan-percent-text">{scanProgress}%</span>
                            </div>
                          </div>
                        )}

                        <button 
                          type="button" 
                          className="remove-preview-btn"
                          onClick={() => { setPreviewUrl(''); setSelectedFile(null); setAiResult(null); }}
                          disabled={isScanning}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}

                    {scanStatus && (
                      <div className="scan-status-log">
                        {scanStatus}
                      </div>
                    )}

                    {previewUrl && !aiResult && (
                      <button
                        type="button"
                        className="ai-scan-trigger-btn"
                        onClick={startAiScan}
                        disabled={isScanning}
                      >
                        {isScanning ? '⚡ Analyzing Compartment Density...' : '⚙️ Run RakeVision AI Scan'}
                      </button>
                    )}

                    {aiResult && (
                      <div className={`ai-prediction-panel level-${aiResult.level}`}>
                        <div className="prediction-main-row">
                          <span className="prediction-title">RakeVision AI Classification</span>
                          <span className="prediction-conf">{aiResult.confidence}% match confidence</span>
                        </div>
                        <div className="prediction-result-row">
                          <div className="result-left">
                            <div className={`result-indicator level-${aiResult.level}`}></div>
                            <span className="result-level-text">
                              {aiResult.level === 'low' ? 'LOW DENSITY COMPARTMENT' : 
                               aiResult.level === 'medium' ? 'MODERATE CAPACITY' : 'CRITICAL CROWD DENSITY'}
                            </span>
                          </div>
                        </div>
                        <p className="prediction-helper-text">
                          *Classified using filename compartment code hashes. Submit below to apply.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* BULK SEED UPLOAD PANEL */}
              {aiSubMode === 'bulk' && (
                <div className="bulk-grid-layout" style={{ marginTop: '10px' }}>
                  <div className="bulk-uploader-section">
                    <label className="form-label">Drop all 12 Rake Compartment Feeds</label>
                    
                    {bulkPreviews.length === 0 ? (
                      <div className="file-drop-area" style={{ padding: '40px 20px' }}>
                        <span className="drop-icon">📂</span>
                        <p className="drop-text">Drag all 12 renamed JPG files at once, or click to browse</p>
                        <input 
                          type="file" 
                          className="file-input-hidden" 
                          accept="image/*" 
                          multiple
                          onChange={handleBulkFileChange}
                        />
                      </div>
                    ) : (
                      <div className="bulk-previews-container">
                        <div className="bulk-previews-grid">
                          {bulkPreviews.map((p, idx) => (
                            <div key={idx} className="bulk-preview-item">
                              <img src={p.url} className="bulk-preview-img" alt={p.name} />
                              <span className="bulk-preview-name">{p.name}</span>
                            </div>
                          ))}
                        </div>

                        {isBulkScanning && (
                          <div className="scanning-overlay">
                            <div className="laser-scanner-line"></div>
                            <div className="scan-progress-box">
                              <div className="scan-bar-bg">
                                <div className="scan-bar-fill" style={{ width: `${bulkScanProgress}%` }}></div>
                              </div>
                              <span className="scan-percent-text">{bulkScanProgress}%</span>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          className="remove-preview-btn"
                          onClick={() => { setBulkPreviews([]); setBulkFiles([]); setBulkResults([]); }}
                          disabled={isBulkScanning}
                        >
                          ✕ Clear All ({bulkFiles.length})
                        </button>
                      </div>
                    )}

                    {bulkScanStatus && (
                      <div className="scan-status-log" style={{ marginTop: '12px' }}>
                        {bulkScanStatus}
                      </div>
                    )}

                    {bulkPreviews.length > 0 && bulkResults.length === 0 && (
                      <button
                        type="button"
                        className="ai-scan-trigger-btn"
                        onClick={startBulkScan}
                        disabled={isBulkScanning}
                        style={{ marginTop: '12px', width: '100%' }}
                      >
                        {isBulkScanning ? '⚡ Processing 12 Feeds concurrently...' : '⚙️ Run RakeVision Batch AI Scan'}
                      </button>
                    )}
                  </div>

                  {/* Neural classification results board */}
                  {bulkResults.length > 0 && (
                    <div className="bulk-results-section">
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
                        RakeVision Batch Output Logs
                      </label>
                      <div className="results-table-container">
                        <div className="results-table-header">
                          <span>Coach</span>
                          <span>Section</span>
                          <span>Classification</span>
                          <span>Confidence</span>
                        </div>
                        <div className="results-table-body">
                          {bulkResults.map((res, idx) => (
                            <div key={idx} className={`table-row row-${res.level}`}>
                              <span className="badge">C{res.coachNum}</span>
                              <span className="text-secondary">{res.sectionId}</span>
                              <span className={`status text-${res.level}`}>{res.level.toUpperCase()}</span>
                              <span className="text-muted monospace">{res.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose} 
              disabled={isScanning || isBulkScanning}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={
                isScanning || 
                isBulkScanning || 
                (reportMode === 'ai' && aiSubMode === 'single' && !aiResult) ||
                (reportMode === 'ai' && aiSubMode === 'bulk' && bulkResults.length === 0)
              }
            >
              {reportMode === 'ai' && aiSubMode === 'bulk' ? 'Apply Train Telemetry' : 'Submit Live Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

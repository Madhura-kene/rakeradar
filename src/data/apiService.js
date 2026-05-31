/**
 * RakeRadar API Service Module
 * Handles client-side HTTP GET and POST operations to communicate with our
 * Vite-driven Backend REST API Server.
 */

// Fetches real-time position and coach crowd telemetry for BOTH active trains
export const fetchLiveTrains = async () => {
  try {
    const response = await fetch('/api/live-trains', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json(); // returns map of train objects: { "99812": { id, name, position, crowd }, "99815": {...} }
  } catch (error) {
    console.error('RakeRadar API [GET /api/live-trains] failed:', error);
    throw error;
  }
};

// Submits a live crowdsourced compartment crowd density report for a specific train
export const submitCrowdReport = async (trainId, coachNum, sectionId, level) => {
  try {
    const response = await fetch('/api/report-crowd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        trainId,
        coachNum: Number(coachNum),
        sectionId,
        level
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json(); // returns { success: true, message: "..." }
  } catch (error) {
    console.error('RakeRadar API [POST /api/report-crowd] failed:', error);
    throw error;
  }
};

// Submits a batch array of coach reports (seeding the entire train rake) to the server
export const submitBulkCrowdReport = async (trainId, reports) => {
  try {
    const response = await fetch('/api/report-crowd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        trainId,
        reports
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json(); // returns { success: true, message: "..." }
  } catch (error) {
    console.error('RakeRadar API [POST /api/report-crowd bulk] failed:', error);
    throw error;
  }
};

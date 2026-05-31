import { STATIONS } from './routeData';

// Helper function to generate crowd data locally
const generateRandomLevel = (weights) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [level, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand < cumulative) return level;
  }
  return 'low';
};

const generateLocalCrowdData = (trainId) => {
  const generalWeights = { low: 0.2, medium: 0.4, high: 0.4 };
  const ladiesWeights = { low: 0.1, medium: 0.5, high: 0.4 };
  const fcWeights = { low: 0.6, medium: 0.3, high: 0.1 };
  const divyangjanWeights = { low: 0.8, medium: 0.15, max: 0.05 }; // Divyangjan weighting

  return {
    train_id: trainId,
    last_updated: new Date().toISOString(),
    coaches: [
      { coach: 1, type: "general", sections: [{ id: "C1", label: "General", level: generateRandomLevel(generalWeights) }] },
      { coach: 2, type: "ladies", sections: [{ id: "C2", label: "Ladies", level: generateRandomLevel(ladiesWeights) }] },
      { coach: 3, type: "general", sections: [{ id: "C3", label: "General", level: generateRandomLevel(generalWeights) }] },
      { coach: 4, type: "divyangjan", sections: [
        { id: "C4A", label: "Divyangjan", level: generateRandomLevel(divyangjanWeights) },
        { id: "C4B", label: "Ladies", level: generateRandomLevel(ladiesWeights) }
      ]},
      { coach: 5, type: "general", sections: [{ id: "C5", label: "General", level: generateRandomLevel(generalWeights) }] },
      { coach: 6, type: "first_class", sections: [
        { id: "C6A", label: "FC Men", level: generateRandomLevel(fcWeights) },
        { id: "C6B", label: "FC Ladies", level: generateRandomLevel(fcWeights) }
      ]},
      { coach: 7, type: "ladies", sections: [{ id: "C7", label: "Ladies", level: generateRandomLevel(ladiesWeights) }] },
      { coach: 8, type: "general", sections: [{ id: "C8", label: "General", level: generateRandomLevel(generalWeights) }] },
      { coach: 9, type: "first_class", sections: [
        { id: "C9A", label: "FC Men", level: generateRandomLevel(fcWeights) },
        { id: "C9B", label: "FC Ladies", level: generateRandomLevel(fcWeights) }
      ]},
      { coach: 10, type: "general", sections: [{ id: "C10", label: "General", level: generateRandomLevel(generalWeights) }] },
      { coach: 11, type: "ladies", sections: [{ id: "C11", label: "Ladies", level: generateRandomLevel(ladiesWeights) }] },
      { coach: 12, type: "general", sections: [{ id: "C12", label: "General", level: generateRandomLevel(generalWeights) }] }
    ]
  };
};

// In-memory simulation database state for BIDIRECTIONAL local fallback (when server is offline or static)
const localTrains = {
  "99812": {
    id: "99812",
    name: "99812 Pune - Lonavala Up Local",
    direction: "up",
    position: { lat: STATIONS[0].lat, lng: STATIONS[0].lng, nextStation: STATIONS[1].name },
    crowd: generateLocalCrowdData("99812")
  },
  "99815": {
    id: "99815",
    name: "99815 Lonavala - Pune Down Local",
    direction: "down",
    position: { lat: STATIONS[STATIONS.length - 1].lat, lng: STATIONS[STATIONS.length - 1].lng, nextStation: STATIONS[STATIONS.length - 2].name },
    crowd: generateLocalCrowdData("99815")
  }
};

// Tick coordinates for local simulated trains every 250ms
let segment12 = 0;
let progress12 = 0;

let segment15 = STATIONS.length - 2;
let progress15 = 0;

setInterval(() => {
  // 1. Tick Train 99812 (Pune -> Lonavala)
  progress12 += 0.04;
  if (progress12 >= 1) {
    progress12 = 0;
    segment12++;
    if (segment12 >= STATIONS.length - 1) {
      segment12 = 0;
    }
  }
  const start12 = STATIONS[segment12];
  const end12 = STATIONS[segment12 + 1];
  localTrains["99812"].position = {
    lat: start12.lat + (end12.lat - start12.lat) * progress12,
    lng: start12.lng + (end12.lng - start12.lng) * progress12,
    nextStation: end12.name
  };

  // 2. Tick Train 99815 (Lonavala -> Pune Jn - Reverse!)
  progress15 += 0.04;
  if (progress15 >= 1) {
    progress15 = 0;
    segment15--;
    if (segment15 < 0) {
      segment15 = STATIONS.length - 2;
    }
  }
  const start15 = STATIONS[segment15 + 1];
  const end15 = STATIONS[segment15];
  localTrains["99815"].position = {
    lat: start15.lat + (end15.lat - start15.lat) * progress15,
    lng: start15.lng + (end15.lng - start15.lng) * progress15,
    nextStation: end15.name
  };
}, 250);

// Tick crowd randomization for local simulated trains every 15s (preserving overrides)
setInterval(() => {
  Object.keys(localTrains).forEach((id) => {
    const fresh = generateLocalCrowdData(id);
    localTrains[id].crowd = {
      ...fresh,
      coaches: fresh.coaches.map((c, idx) => {
        const current = localTrains[id].crowd.coaches[idx];
        if (current && current.isUserReported) {
          return current;
        }
        return c;
      })
    };
  });
}, 15000);

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

    return await response.json();
  } catch (error) {
    console.warn('RakeRadar API [/api/live-trains] failed, falling back to local simulation mode:', error.message);
    return localTrains;
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

    return await response.json();
  } catch (error) {
    console.warn('RakeRadar API [/api/report-crowd] failed, applying locally:', error.message);
    const targetId = trainId || "99812";
    if (localTrains[targetId]) {
      const targetTrain = localTrains[targetId];
      targetTrain.crowd.coaches = targetTrain.crowd.coaches.map((c) => {
        if (c.coach === Number(coachNum)) {
          const updatedSections = c.sections.map((s) => {
            if (s.id === sectionId) {
              return { ...s, level };
            }
            return s;
          });
          return {
            ...c,
            isUserReported: true,
            sections: updatedSections
          };
        }
        return c;
      });
      targetTrain.crowd.last_updated = new Date().toISOString();
    }
    return { success: true, message: `Persisted locally (Offline Mode)` };
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

    return await response.json();
  } catch (error) {
    console.warn('RakeRadar API [/api/report-crowd bulk] failed, applying locally:', error.message);
    const targetId = trainId || "99812";
    if (localTrains[targetId] && reports && Array.isArray(reports)) {
      const targetTrain = localTrains[targetId];
      reports.forEach((report) => {
        const { coachNum: cNum, sectionId: sId, level: lvl } = report;
        targetTrain.crowd.coaches = targetTrain.crowd.coaches.map((c) => {
          if (c.coach === Number(cNum)) {
            const updatedSections = c.sections.map((s) => {
              if (s.id === sId) {
                return { ...s, level: lvl };
              }
              return s;
            });
            return {
              ...c,
              isUserReported: true,
              sections: updatedSections
            };
          }
          return c;
        });
      });
      targetTrain.crowd.last_updated = new Date().toISOString();
    }
    return { success: true, message: `Batch persist: Synchronized ${reports.length} coaches locally (Offline Mode).` };
  }
};


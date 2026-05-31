import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Exact Pune-Lonavala Station List for server-side GPS telemetry
const STATIONS = [
  { name: "Pune Jn", lat: 18.528, lng: 73.874 },
  { name: "Shivajinagar", lat: 18.531, lng: 73.855 },
  { name: "Khadki", lat: 18.563, lng: 73.840 },
  { name: "Dapodi", lat: 18.583, lng: 73.824 },
  { name: "Kasarwadi", lat: 18.601, lng: 73.815 },
  { name: "Pimpri", lat: 18.625, lng: 73.795 },
  { name: "Chinchwad", lat: 18.636, lng: 73.784 },
  { name: "Akurdi", lat: 18.651, lng: 73.766 },
  { name: "Dehu Road", lat: 18.674, lng: 73.738 },
  { name: "Begdewadi", lat: 18.688, lng: 73.722 },
  { name: "Talegaon", lat: 18.724, lng: 73.676 },
  { name: "Kanhe", lat: 18.739, lng: 73.578 },
  { name: "Malavli", lat: 18.753, lng: 73.488 },
  { name: "Karjat", lat: 18.913, lng: 73.328 },
  { name: "Lonavala", lat: 18.756, lng: 73.407 }
];

// Helper function to generate crowd data for a train
const generateRandomLevel = (weights) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [level, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand < cumulative) return level;
  }
  return 'low';
};

const generateServerCrowdData = (trainId) => {
  const generalWeights = { low: 0.2, medium: 0.4, high: 0.4 };
  const ladiesWeights = { low: 0.1, medium: 0.5, high: 0.4 };
  const fcWeights = { low: 0.6, medium: 0.3, high: 0.1 };
  const divyangjanWeights = { low: 0.8, medium: 0.15, high: 0.05 };

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

// Server-side database state for BIDIRECTIONAL trains
const serverTrains = {
  "99812": {
    id: "99812",
    name: "99812 Pune - Lonavala Up Local",
    direction: "up",
    position: { lat: STATIONS[0].lat, lng: STATIONS[0].lng, nextStation: STATIONS[1].name },
    crowd: generateServerCrowdData("99812")
  },
  "99815": {
    id: "99815",
    name: "99815 Lonavala - Pune Down Local",
    direction: "down",
    position: { lat: STATIONS[STATIONS.length - 1].lat, lng: STATIONS[STATIONS.length - 1].lng, nextStation: STATIONS[STATIONS.length - 2].name },
    crowd: generateServerCrowdData("99815")
  }
};

// Tracking variables for bidirectional segment interpolation
let segment12 = 0;
let progress12 = 0;

let segment15 = STATIONS.length - 2;
let progress15 = 0;

// Tick coordinates for both trains every 250ms
setInterval(() => {
  // 1. Tick Train 99812 (Pune -> Lonavala)
  progress12 += 0.04;
  if (progress12 >= 1) {
    progress12 = 0;
    segment12++;
    if (segment12 >= STATIONS.length - 1) {
      segment12 = 0; // Loop Pune -> Lonavala
    }
  }
  const start12 = STATIONS[segment12];
  const end12 = STATIONS[segment12 + 1];
  serverTrains["99812"].position = {
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
      segment15 = STATIONS.length - 2; // Loop Lonavala -> Pune
    }
  }
  const start15 = STATIONS[segment15 + 1];
  const end15 = STATIONS[segment15];
  serverTrains["99815"].position = {
    lat: start15.lat + (end15.lat - start15.lat) * progress15,
    lng: start15.lng + (end15.lng - start15.lng) * progress15,
    nextStation: end15.name
  };
}, 250);

// Tick crowd randomization for both trains every 15s (preserving user overrides)
setInterval(() => {
  Object.keys(serverTrains).forEach((id) => {
    const fresh = generateServerCrowdData(id);
    serverTrains[id].crowd = {
      ...fresh,
      coaches: fresh.coaches.map((c, idx) => {
        const current = serverTrains[id].crowd.coaches[idx];
        if (current && current.isUserReported) {
          return current; // Lock in commuter overrides
        }
        return c;
      })
    };
  });
}, 15000);

// Helper function to read and parse JSON body in standard Node HTTP req
const readJSONBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
};

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/rakeradar/' : '/',
  plugins: [
    react(),
    {
      name: 'rake-radar-server-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Endpoint: GET /api/live-trains
          if (req.url === '/api/live-trains' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(serverTrains));
          } 
          // Endpoint: POST /api/report-crowd
          else if (req.url === '/api/report-crowd' && req.method === 'POST') {
            const body = await readJSONBody(req);
            const { trainId, coachNum, sectionId, level, reports } = body;

            const targetId = trainId || "99812"; // Default fallback
            
            if (serverTrains[targetId]) {
              const targetTrain = serverTrains[targetId];
              
              // Handle Batch Reports Array (Seeding entire Rake)
              if (reports && Array.isArray(reports)) {
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
                        isUserReported: true, // Lock overrides
                        sections: updatedSections
                      };
                    }
                    return c;
                  });
                });
                targetTrain.crowd.last_updated = new Date().toISOString();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: true, 
                  message: `Batch persist: Synchronized ${reports.length} coaches on train ${targetId} server database.` 
                }));
              }
              // Handle Single Report
              else if (coachNum && sectionId && level) {
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
                      isUserReported: true, // Mark coach override
                      sections: updatedSections
                    };
                  }
                  return c;
                });
                targetTrain.crowd.last_updated = new Date().toISOString();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: true, 
                  message: `Persisted: Train ${targetId} Coach C${coachNum} section ${sectionId} set to ${level.toUpperCase()} on server database.` 
                }));
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid payload: coachNum/sectionId/level or reports array is required.' }));
              }
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Target train not found.' }));
            }
          } 
          // Fallback to bundler asset server
          else {
            next();
          }
        });
      }
    }
  ]
});

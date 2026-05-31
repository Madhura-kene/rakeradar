import { useState, useEffect } from 'react';

// Approximate coordinates for the Pune-Lonavala route (linear interpolation for prototype)
// Real coordinates would trace the actual curved railway tracks.
export const STATIONS = [
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
  { name: "Karjat", lat: 18.913, lng: 73.328 }, // Placed based on PRD order, even if geographically further
  { name: "Lonavala", lat: 18.756, lng: 73.407 }
];

export const ROUTE_PATH = STATIONS.map(s => [s.lat, s.lng]);

// Hook to simulate train movement along the route
export const useTrainPosition = (speedMs = 3000) => {
  const [position, setPosition] = useState({
    lat: STATIONS[0].lat,
    lng: STATIONS[0].lng,
    nextStation: STATIONS[1].name
  });

  useEffect(() => {
    let currentSegment = 0;
    let progress = 0; // 0 to 1

    const timer = setInterval(() => {
      progress += 0.05; // Move 5% along the segment

      if (progress >= 1) {
        progress = 0;
        currentSegment++;
        if (currentSegment >= STATIONS.length - 1) {
          // Restart for the prototype loop
          currentSegment = 0;
        }
      }

      const start = STATIONS[currentSegment];
      const end = STATIONS[currentSegment + 1];

      // Linear interpolation
      const currentLat = start.lat + (end.lat - start.lat) * progress;
      const currentLng = start.lng + (end.lng - start.lng) * progress;

      setPosition({
        lat: currentLat,
        lng: currentLng,
        nextStation: end.name
      });
    }, speedMs / 20); // updates frequently for smooth movement

    return () => clearInterval(timer);
  }, [speedMs]);

  return position;
};

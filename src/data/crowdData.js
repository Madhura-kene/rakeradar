import { useState, useEffect } from 'react';

const generateRandomLevel = (weights) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [level, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand < cumulative) return level;
  }
  return 'low'; // fallback
};

export const generateCrowdData = () => {
  // Weights for different coach types
  const generalWeights = { low: 0.2, medium: 0.4, high: 0.4 };
  const ladiesWeights = { low: 0.1, medium: 0.5, high: 0.4 };
  const fcWeights = { low: 0.6, medium: 0.3, high: 0.1 };
  const divyangjanWeights = { low: 0.8, medium: 0.15, high: 0.05 };

  return {
    train_id: "pune_local_001",
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

export const useSimulatedCrowdData = (intervalMs = 10000) => {
  const [crowdData, setCrowdData] = useState(generateCrowdData());

  useEffect(() => {
    const timer = setInterval(() => {
      setCrowdData(generateCrowdData());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return crowdData;
};

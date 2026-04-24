export const satelliteMockData = {
  ndvi: 0.72,
  ndwi: 0.41,
  healthPercent: 87,
  status: "healthy",
  lastScanDate: "2024-04-18",
  nextScanDate: "2024-04-25",
  diseaseRisk: "low",
  weeklyHistory: [
    { week: "Apr 1",  ndvi: 0.65 },
    { week: "Apr 8",  ndvi: 0.68 },
    { week: "Apr 15", ndvi: 0.71 },
    { week: "Apr 18", ndvi: 0.72 },
  ],
  alerts: [
    { id: 1, severity: "info",    icon: "check-circle", title: "Crop is 87% healthy",           action: "No action needed", date: "2024-04-18" },
    { id: 2, severity: "warning", icon: "alert-triangle", title: "Moisture stress in NE corner", action: "Check drip irrigation line 3", date: "2024-04-16" },
    { id: 3, severity: "warning", icon: "bug",           title: "Early fungal pattern (0.3 ac)", action: "Spray Mancozeb 2g/L within 3 days", date: "2024-04-15" },
  ],
  farmPolygon: [
    [19.9975, 73.7898],
    [19.9975, 73.7942],
    [19.9943, 73.7942],
    [19.9943, 73.7898],
    [19.9975, 73.7898]
  ]
};

export const mockFarmer = {
  farmer: {
    id: "KM-2024-00142",
    name: "Rajan Kumar",
    phone: "+91-98765-43210",
    village: "Nashik, Maharashtra",
    aadhaarHash: "a3f9...mock",
    kmCardId: "",
    registeredAt: "2024-01-15"
  },
  farm: {
    id: "FARM-001",
    areaAcres: 2.4,
    // A sample polygon around Nashik area
    polygon: [
      [19.9975, 73.7898],
      [19.9975, 73.7942],
      [19.9943, 73.7942],
      [19.9943, 73.7898],
      [19.9975, 73.7898]
    ],
    soilType: "black cotton",
    irrigationType: "drip"
  },
  activeCrop: {
    type: "tomato",
    variety: "Hybrid F1",
    plantedDate: "2024-02-10",
    expectedHarvestDate: "2024-05-15",
    totalPlantedKg: 0,
    expectedYieldKg: 4800
  },
  satellite: {
    lastScanDate: "2024-04-18",
    ndviScore: 0.72,
    healthPercent: 87,
    status: "healthy",
    alerts: [
      { id: 1, severity: "info", icon: "check-circle", title: "Crop is 87% healthy", action: "No action needed", date: "2024-04-18" },
      { id: 2, severity: "warning", icon: "alert-triangle", title: "Moisture stress in NE corner", action: "Check drip irrigation line 3", date: "2024-04-16" },
      { id: 3, severity: "warning", icon: "bug", title: "Early fungal pattern (0.3 ac)", action: "Spray Mancozeb 2g/L within 3 days", date: "2024-04-15" }
    ],
    weeklyHistory: [
      { week: "Apr 1", ndvi: 0.65 },
      { week: "Apr 8", ndvi: 0.68 },
      { week: "Apr 15", ndvi: 0.71 },
      { week: "Apr 18", ndvi: 0.72 }
    ]
  },
  fpoOrders: [],
  financials: {
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0
  },
  mandiPrices: {}
};

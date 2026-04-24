export const schemes = [
  {
    id: "PM-KISAN",
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture",
    amount: "₹6,000/year",
    amountNum: 6000,
    eligible: true,
    applied: false,
    deadline: "2024-06-30",
    description: "Direct income support to small and marginal farmers",
    documents: ["Aadhaar", "Land Records", "Bank Account"],
    applyLink: "https://pmkisan.gov.in"
  },
  {
    id: "PMFBY",
    name: "PM Fasal Bima Yojana",
    ministry: "Ministry of Agriculture",
    amount: "Up to ₹2,00,000 claim",
    amountNum: 200000,
    eligible: true,
    applied: true,
    deadline: null,
    description: "Crop insurance covering natural calamities",
    documents: ["KM Satellite Report", "Aadhaar", "Bank Account"],
    applyLink: "https://pmfby.gov.in"
  },
  {
    id: "KCC",
    name: "Kisan Credit Card",
    ministry: "NABARD / Banks",
    amount: "₹3,00,000 credit limit",
    amountNum: 300000,
    eligible: true,
    applied: false,
    deadline: null,
    description: "Revolving credit at 7% for crop inputs",
    documents: ["KM Card", "Land Records", "6-month crop history"],
    applyLink: null
  },
  {
    id: "MNREGA-LAND",
    name: "MNREGA Land Development",
    ministry: "Ministry of Rural Development",
    amount: "₹8,500 labour subsidy",
    amountNum: 8500,
    eligible: true,
    applied: false,
    deadline: "2024-07-31",
    description: "Free land leveling and bunding under MNREGA",
    documents: ["Job Card", "Aadhaar"],
    applyLink: null
  },
  {
    id: "MH-DRIP",
    name: "Maharashtra Drip Irrigation Subsidy",
    ministry: "Govt of Maharashtra",
    amount: "₹9,000 subsidy",
    amountNum: 9000,
    eligible: true,
    applied: false,
    deadline: "2024-08-15",
    description: "55% subsidy on drip irrigation system cost",
    documents: ["KM Card", "Land Records", "Quotation from supplier"],
    applyLink: null
  }
];

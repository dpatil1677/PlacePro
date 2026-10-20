// Mock reports data — replace with PostgreSQL aggregation queries later
export function getReports() {
  return {
    totalEligible: 320,
    totalPlaced: 218,
    averagePackage: '8.5L',
    highestPackage: '42L',
    historicalTrend: [
      { month: 'Jan', placed: 12 },
      { month: 'Feb', placed: 18 },
      { month: 'Mar', placed: 24 },
      { month: 'Apr', placed: 31 },
      { month: 'May', placed: 29 },
      { month: 'Jun', placed: 15 },
    ],
    companyWiseOffers: [
      { company: 'TCS', offers: 62 },
      { company: 'Infosys', offers: 45 },
      { company: 'Amazon', offers: 24 },
      { company: 'Microsoft', offers: 18 },
      { company: 'Google', offers: 12 },
    ],
    branchWisePlacementRate: [
      { branch: 'CSE', placed: 95, total: 110 },
      { branch: 'IT', placed: 72, total: 85 },
      { branch: 'ECE', placed: 34, total: 60 },
      { branch: 'ME', placed: 17, total: 65 },
    ],
  };
}

// Mock drives data — replace with PostgreSQL queries later
let drives = [
  {
    id: 'd1',
    company: 'Google',
    abbr: 'GO',
    title: 'Campus Recruitment Drive 2025 - Google STEP Intern',
    status: 'Upcoming',
    date: '25/07/2025',
    eligibility: 'CSE/IT - 8.0 CGPA+, 2026 batch',
    package: '2.5 LPM stipend',
    registered: 142,
  },
  {
    id: 'd2',
    company: 'Infosys',
    abbr: 'IN',
    title: 'Mass Hiring Drive - Infosys InfyTQ',
    status: 'Upcoming',
    date: '18/07/2025',
    eligibility: 'All branches - 6.0 CGPA+, 2025 batch',
    package: '3.6 LPA',
    registered: 380,
  },
  {
    id: 'd3',
    company: 'Flipkart',
    abbr: 'FL',
    title: 'SDE Hiring - Flipkart',
    status: 'Upcoming',
    date: '05/08/2025',
    eligibility: 'CSE/IT/ECE - 7.5 CGPA+, 2025 batch',
    package: '15-20 LPA',
    registered: 89,
  },
  {
    id: 'd4',
    company: 'TCS',
    abbr: 'TC',
    title: 'TCS Smart Hiring',
    status: 'Ongoing',
    date: '10/07/2025',
    eligibility: 'All branches - 6.0 CGPA+, 2025 batch',
    package: '3.36 LPA',
    registered: 512,
  },
  {
    id: 'd5',
    company: 'Microsoft',
    abbr: 'MS',
    title: 'Microsoft University Recruitment',
    status: 'Upcoming',
    date: '15/08/2025',
    eligibility: 'CSE/IT - 8.5 CGPA+, 2025/2026 batch',
    package: '20-30 LPA',
    registered: 67,
  },
  {
    id: 'd6',
    company: 'Accenture',
    abbr: 'AC',
    title: 'Accenture Campus Drive',
    status: 'Completed',
    date: '28/06/2025',
    eligibility: 'All branches - 6.5 CGPA+, 2025 batch',
    package: '4.5 LPA',
    registered: 245,
  },
];

export function getAllDrives() {
  return drives;
}

export function getDriveById(id) {
  return drives.find((d) => d.id === id) || null;
}

export function createDrive(data) {
  const newDrive = {
    id: `d${Date.now()}`,
    ...data,
    registered: 0,
  };
  drives.push(newDrive);
  return newDrive;
}

export function updateDrive(id, data) {
  const idx = drives.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  drives[idx] = { ...drives[idx], ...data };
  return drives[idx];
}

export function deleteDrive(id) {
  const idx = drives.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  drives.splice(idx, 1);
  return true;
}

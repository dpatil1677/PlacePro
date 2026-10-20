// Mock student data — replace with PostgreSQL queries later
let students = [
  {
    id: 's1',
    name: 'Dhruv',
    email: 'dpatil380@rku.ac.in',
    branch: 'Computer',
    gradYear: '2026',
    readiness: 52,
    status: 'Active',
    avatar: 'D',
  },
  {
    id: 's2',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    branch: 'Computer Science',
    gradYear: '2025',
    readiness: 47,
    status: 'Active',
    avatar: 'AK',
  },
  {
    id: 's3',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    branch: 'ECE',
    gradYear: '2026',
    readiness: 84,
    status: 'Active',
    avatar: 'SR',
  },
  {
    id: 's4',
    name: 'Rahul Gupta',
    email: 'rahul@example.com',
    branch: 'Computer Science',
    gradYear: '2025',
    readiness: 33,
    status: 'Active',
    avatar: 'RG',
  },
  {
    id: 's5',
    name: 'Priya Patel',
    email: 'priya@example.com',
    branch: 'Information Technology',
    gradYear: '2025',
    readiness: 41,
    status: 'Active',
    avatar: 'PP',
  },
  {
    id: 's6',
    name: 'Arjun Sharma',
    email: 'student@placepro.com',
    branch: 'Computer Science',
    gradYear: '2025',
    readiness: 34,
    status: 'Active',
    avatar: 'AS',
  },
];

export function getAllStudents(search = '') {
  if (!search) return students;
  const q = search.toLowerCase();
  return students.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q)
  );
}

export function getStudentById(id) {
  return students.find((s) => s.id === id) || null;
}

export function updateStudent(id, data) {
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...data };
  return students[idx];
}

export function deleteStudent(id) {
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  students.splice(idx, 1);
  return true;
}

// Mock resume data — replace with PostgreSQL queries later
// Keyed by userId

const resumes = {
  '1': {
    personal: {
      fullName: 'Arjun Sharma',
      email: 'student@placepro.com',
      phone: '+91 98765 43210',
      location: 'New Delhi, India',
      linkedin: 'linkedin.com/in/arjunsharma',
      github: 'github.com/arjunsharma',
    },
    summary: 'Motivated Computer Science student with a strong foundation in Data Structures and Algorithms. Passionate about building scalable web applications and solving complex technical problems.',
    experience: [
      {
        id: 'exp1',
        company: 'Tech Startup',
        role: 'Frontend Developer Intern',
        startDate: '2024-05',
        endDate: '2024-07',
        description: 'Developed responsive UI components using React.js. Implemented API integrations and improved page load performance by 30%.',
        bullets: [
          'Developed responsive UI components using React.js and Tailwind CSS.',
          'Implemented RESTful API integrations and improved page load performance by 30%.',
        ],
      },
    ],
    education: [
      {
        id: 'edu1',
        institution: 'IIT Delhi',
        degree: 'B.Tech',
        field: 'Computer Science',
        startYear: '2021',
        endYear: '2025',
        cgpa: '8.2 / 10',
        bullets: ['Average CGPA: 8.2 / 10'],
      },
    ],
    projects: [
      {
        id: 'proj1',
        title: 'PlacementPro – Smart Placement Portal',
        techStack: 'React.js, Node.js, Express.js, MySQL/MongoDB, REST APIs',
        bullets: [
          'Built a full-stack web application to automate campus placement workflows for students, officers, and recruiters.',
          'Implemented secure user authentication and authorization using JSON Web Tokens (JWT) with Role-Based Access Control (RBAC).',
        ],
      },
    ],
    technicalSkills: {
      languages: 'JavaScript (ES6+), Python, SQL, C++',
      frontend: 'React.js, Tailwind CSS, HTML5, CSS3',
      backend: 'Node.js, Express.js, RESTful APIs, JWT Authentication',
      databases: 'MySQL, MongoDB, PostgreSQL',
      tools: 'Git, GitHub, Postman, VS Code, npm',
    },
    skills: ['JavaScript', 'React.js', 'Node.js', 'Python', 'SQL', 'Git'],
    certifications: [
      {
        id: 'cert1',
        name: 'Full Stack Web Development',
        issuer: 'Coursera',
        date: '2024',
      },
    ],
  },
  '1791262201154': {
    personal: {
      fullName: 'Dhruv Patil',
      email: 'dhruvpatil1677@gmail.com',
      phone: '+91 9328027022',
      location: '',
      linkedin: 'linkedin.com/in/dhruv-patil-6154803b1',
      github: 'github.com/dpatil1677',
    },
    summary: 'Computer Engineering student (9.22/10 CGPA) and aspiring Full-Stack Web Developer with hands-on experience building web applications using React, Node.js, Express, Laravel, PHP, and MySQL. Skilled in designing RESTful APIs, relational database schemas, JWT authentication, and responsive user interfaces. Focused on clean software architecture, backend API design, and delivering scalable web platforms.',
    education: [
      {
        id: 'edu_1',
        degree: 'Diploma in Computer Engineering',
        institution: 'RK University',
        field: '',
        startYear: '2024',
        endYear: '2027',
        cgpa: '9.22 / 10',
        bullets: ['Average CGPA: 9.22 / 10'],
      },
      {
        id: 'edu_2',
        degree: 'Secondary Education (10th Grade)',
        institution: 'Saint Francis School',
        field: '',
        startYear: '',
        endYear: '',
        cgpa: '93.13%',
        bullets: ['Percentage: 93.13%'],
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: 'PlacementPro – Smart Placement Portal',
        techStack: 'React.js, Node.js, Express.js, MySQL/MongoDB, REST APIs',
        bullets: [
          'Built a full-stack web application to automate campus placement workflows for students, officers, and recruiters.',
          'Implemented secure user authentication and authorization using JSON Web Tokens (JWT) with Role-Based Access Control (RBAC).',
          'Developed interactive administrative dashboards for automated student eligibility verification, job postings, and application tracking.',
          'Designed modular RESTful endpoints for profile management, resume handling, and real-time application status updates.',
        ],
      },
      {
        id: 'proj_2',
        title: 'SkillHive – Student Freelance Platform',
        techStack: 'Laravel, PHP, MySQL, Blade, Tailwind CSS',
        bullets: [
          'Engineered a peer-to-peer freelance marketplace allowing students to list digital services, submit proposals, and manage project bids.',
          'Modeled relational database schemas using Laravel Eloquent ORM and migrations to manage orders, reviews, and dynamic messaging.',
          'Implemented custom backend middleware for session protection, access control, and route authentication.',
          'Built real-time project milestone tracking and proposal evaluation workflows for clients and freelancers.',
        ],
      },
      {
        id: 'proj_3',
        title: 'GradeFlow – Academic & Result Management System',
        techStack: 'PHP, MySQL, JavaScript, HTML5, CSS3',
        bullets: [
          'Developed a relational web application featuring secure multi-role portals for administrators, faculty, and students.',
          'Engineered optimized MySQL relational queries to handle student result lookups and academic transcript generation.',
          'Designed responsive UI components for dynamic grade entry, attendance monitoring, and search filtering.',
        ],
      },
    ],
    technicalSkills: {
      languages: 'JavaScript (ES6+), PHP, SQL, HTML5, CSS3, Python',
      frontend: 'React.js, Tailwind CSS, Bootstrap, Responsive Web Design, DOM Manipulation',
      backend: 'Node.js, Express.js, Laravel, Core PHP, RESTful APIs, JWT Authentication',
      databases: 'MySQL, MongoDB, Database Schema Design',
      tools: 'Git, GitHub, Postman, VS Code, npm',
    },
    skills: [
      'JavaScript (ES6+)', 'PHP', 'SQL', 'HTML5', 'CSS3', 'Python',
      'React.js', 'Tailwind CSS', 'Bootstrap', 'Node.js', 'Express.js',
      'Laravel', 'MySQL', 'MongoDB', 'Git', 'GitHub', 'Postman',
    ],
    certifications: [
      {
        id: 'cert_1',
        name: 'Introduction to Python',
        issuer: 'Infosys',
        date: 'July 2026',
      },
      {
        id: 'cert_2',
        name: 'Introduction to Figma',
        issuer: 'SkillUp',
        date: 'August 2026',
      },
    ],
    experience: [],
  },
};

const defaultResume = {
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '' },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  technicalSkills: {
    languages: '',
    frontend: '',
    backend: '',
    databases: '',
    tools: '',
  },
  skills: [],
  certifications: [],
};

export function getResumeByUserId(userId) {
  return resumes[userId] || { ...defaultResume };
}

export function updateResumeByUserId(userId, data) {
  resumes[userId] = { ...getResumeByUserId(userId), ...data };
  return resumes[userId];
}


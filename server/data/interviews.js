// Mock interview data — replace with PostgreSQL queries later

export const topics = [
  {
    id: 'oop',
    slug: 'oop',
    title: 'Object-Oriented Programming',
    category: 'Technical',
    icon: 'code',
    questions: [
      {
        id: 'oop1',
        question: 'What are the four pillars of Object-Oriented Programming? Explain each with an example.',
        difficulty: 'Easy',
        modelAnswer: 'The four pillars of OOP are: 1) Encapsulation — bundling data and methods that operate on the data within a single unit (class), hiding internal state. Example: A BankAccount class with private balance and public deposit/withdraw methods. 2) Abstraction — hiding complex implementation details and showing only essential features. Example: A Car class with a start() method that hides engine details. 3) Inheritance — a class can inherit properties and methods from another class. Example: Dog extends Animal. 4) Polymorphism — one interface, many implementations. Example: Shape.draw() works differently for Circle and Square.',
        tips: ['Define each pillar clearly', 'Give real-world examples', 'Explain how they relate to code design'],
      },
      {
        id: 'oop2',
        question: 'What is the difference between abstraction and encapsulation?',
        difficulty: 'Medium',
        modelAnswer: 'Abstraction focuses on hiding complexity by showing only what is necessary (what an object does). Encapsulation focuses on wrapping data and methods together and restricting direct access (how it is done). Abstraction is achieved through abstract classes and interfaces, while encapsulation is achieved through access modifiers like private, protected, public. Example: A TV remote is an abstraction (you press a button without knowing the internal circuit), while the TV\'s circuit board is encapsulated (components inside are protected from direct access).',
        tips: ['Focus on the "what vs how" distinction', 'Mention design patterns', 'Give relatable real-world examples'],
      },
    ],
  },
  {
    id: 'ds',
    slug: 'data-structures',
    title: 'Data Structures',
    category: 'Technical',
    icon: 'code',
    questions: [
      {
        id: 'ds1',
        question: 'Explain the difference between a Stack and a Queue. When would you use each?',
        difficulty: 'Easy',
        modelAnswer: 'A Stack follows LIFO (Last In First Out) — like a stack of plates. Operations: push (add to top) and pop (remove from top). Use cases: function call stack, undo operations, expression evaluation. A Queue follows FIFO (First In First Out) — like a line at a bank. Operations: enqueue (add to rear) and dequeue (remove from front). Use cases: BFS traversal, print queues, task scheduling. I would use a Stack for backtracking problems and a Queue for level-order traversal or scheduling.',
        tips: ['Use LIFO/FIFO terminology', 'Mention real-world use cases', 'Compare time complexities'],
      },
    ],
  },
  {
    id: 'algorithms',
    slug: 'algorithms',
    title: 'Algorithms',
    category: 'Technical',
    icon: 'code',
    questions: [
      {
        id: 'algo1',
        question: 'What is Dynamic Programming? How does it differ from Divide and Conquer?',
        difficulty: 'Medium',
        modelAnswer: 'Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them into overlapping sub-problems and storing results to avoid recomputation (memoization/tabulation). Key properties: optimal substructure and overlapping subproblems. Examples: Fibonacci, Knapsack, LCS. Divide and Conquer also breaks problems into sub-problems, but the sub-problems are non-overlapping and are solved independently. Examples: Merge Sort, Quick Sort, Binary Search. The key difference: DP stores results of sub-problems (avoids redundant calculations), while D&C solves each sub-problem fresh.',
        tips: ['Define both techniques clearly', 'Mention memoization vs tabulation', 'Give specific algorithm examples'],
      },
    ],
  },
  {
    id: 'dbms',
    slug: 'database-management',
    title: 'Database Management',
    category: 'Technical',
    icon: 'code',
    questions: [
      {
        id: 'db1',
        question: 'What is normalization in databases? Explain the first three normal forms.',
        difficulty: 'Medium',
        modelAnswer: 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity. 1NF (First Normal Form): Each column must contain atomic values, each row must be unique, no repeating groups. 2NF (Second Normal Form): Must be in 1NF + all non-key attributes must be fully functionally dependent on the primary key (no partial dependencies). 3NF (Third Normal Form): Must be in 2NF + no transitive dependencies (non-key attributes should not depend on other non-key attributes). Benefits: reduces data redundancy, improves data integrity, makes updates easier.',
        tips: ['Start with the purpose of normalization', 'Define each NF building on the previous', 'Mention trade-offs (performance vs integrity)'],
      },
    ],
  },
  {
    id: 'os',
    slug: 'operating-systems',
    title: 'Operating Systems',
    category: 'Technical',
    icon: 'code',
    questions: [],
  },
  {
    id: 'sd',
    slug: 'system-design',
    title: 'System Design',
    category: 'Technical',
    icon: 'code',
    questions: [],
  },
  // HR & Culture topics
  {
    id: 'hr-teamwork',
    slug: 'teamwork-collaboration',
    title: 'Teamwork & Collaboration',
    category: 'HR & Culture',
    icon: 'users',
    questions: [
      {
        id: 'hr1',
        question: 'Tell me about a time you worked effectively in a team.',
        difficulty: 'Easy',
        modelAnswer: 'In my final year project, our team of 4 built a student management system. I initiated daily standups, created a shared task board in Notion, and made sure everyone was unblocked. When a teammate struggled with the backend, I spent an afternoon pair programming with them. We delivered the project on time and received the highest grade in our class. This taught me that clear communication and mutual support are the pillars of effective teamwork.',
        tips: ['Use the STAR method', 'Highlight your specific contribution', 'Mention the outcome'],
      },
    ],
  },
  // Behavioral topics
  {
    id: 'beh-leadership',
    slug: 'leadership',
    title: 'Leadership',
    category: 'Behavioral',
    icon: 'trending',
    questions: [
      {
        id: 'beh1',
        question: 'Describe a situation where you demonstrated leadership.',
        difficulty: 'Medium',
        modelAnswer: 'During a hackathon, our team was falling behind on integration because no one had a clear vision of the final product. I stepped in, reorganized tasks based on each person\'s strengths, created a simple API contract document, and set up 2-hour checkpoint meetings. My clear direction helped the team align and we ended up finishing 2nd out of 30 teams. This experience showed me that leadership is about creating clarity and enabling others to do their best work.',
        tips: ['Use a specific situation', 'Focus on actions you took', 'Highlight the impact on the team'],
      },
    ],
  },
];

// In-memory sessions store
const sessions = {};

export function getTopicsByCategory(category) {
  if (!category || category === 'all') return topics;
  return topics.filter((t) => t.category === category);
}

export function getTopicById(id) {
  return topics.find((t) => t.id === id) || null;
}

export function getSessionsForUser(userId) {
  return sessions[userId] || [];
}

export function saveSession(userId, session) {
  if (!sessions[userId]) sessions[userId] = [];
  sessions[userId].unshift(session);
  return session;
}

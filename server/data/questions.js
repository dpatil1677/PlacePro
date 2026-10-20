// Mock questions data — replace with PostgreSQL queries later
let questions = [
  {
    id: 'q1',
    category: 'Behavioral',
    difficulty: 'Easy',
    question: 'Describe a situation where you had to meet a tight deadline.',
  },
  {
    id: 'q2',
    category: 'Behavioral',
    difficulty: 'Medium',
    question: 'Tell me about a time you led a team through a difficult situation.',
  },
  {
    id: 'q3',
    category: 'HR',
    difficulty: 'Medium',
    question: 'What is your greatest weakness and how are you working on it?',
  },
  {
    id: 'q4',
    category: 'HR',
    difficulty: 'Easy',
    question: 'Tell me about yourself and your technical background.',
  },
  {
    id: 'q5',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'What is normalization? Explain 1NF, 2NF, and 3NF.',
  },
  {
    id: 'q6',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'What is dynamic programming? Explain with an example.',
  },
  {
    id: 'q7',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'Explain how a Hash Map works internally.',
  },
  {
    id: 'q8',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'What is the difference between abstract class and interface in Java?',
  },
  {
    id: 'q9',
    category: 'Technical',
    difficulty: 'Easy',
    question: 'Explain the four pillars of Object-Oriented Programming with examples.',
  },
  {
    id: 'q10',
    category: 'Aptitude',
    difficulty: 'Medium',
    question: 'A train travels 360 km in 4 hours. What is its speed in m/s?',
  },
  {
    id: 'q11',
    category: 'Aptitude',
    difficulty: 'Easy',
    question: 'If 12 workers finish a job in 8 days, how many days will 16 workers take?',
  },
];

export function getAllQuestions(search = '') {
  if (!search) return questions;
  const q = search.toLowerCase();
  return questions.filter(
    (item) =>
      item.question.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.difficulty.toLowerCase().includes(q)
  );
}

export function getQuestionById(id) {
  return questions.find((q) => q.id === id) || null;
}

export function createQuestion(data) {
  const newQ = { id: `q${Date.now()}`, ...data };
  questions.push(newQ);
  return newQ;
}

export function updateQuestion(id, data) {
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  questions[idx] = { ...questions[idx], ...data };
  return questions[idx];
}

export function deleteQuestion(id) {
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return false;
  questions.splice(idx, 1);
  return true;
}

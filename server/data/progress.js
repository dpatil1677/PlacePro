// Mock progress data — replace with PostgreSQL aggregation queries later

const ACHIEVEMENTS_LIST = [
  { id: 'first_steps', title: 'First Steps', icon: '👣', desc: 'Complete your profile', unlocked: false },
  { id: 'code_warrior', title: 'Code Warrior', icon: '⚔️', desc: 'Solve 10 coding problems', unlocked: false },
  { id: 'interview_ready', title: 'Interview Ready', icon: '🎤', desc: 'Complete 5 interview sessions', unlocked: false },
  { id: 'resume_rockstar', title: 'Resume Rockstar', icon: '📄', desc: 'Build a complete resume', unlocked: false },
  { id: 'streak_master', title: 'Streak Master', icon: '🔥', desc: 'Maintain a 7-day streak', unlocked: false },
  { id: 'perfect_score', title: 'Perfect Score', icon: '💯', desc: 'Score 100% on any test', unlocked: false },
  { id: 'placement_ready', title: 'Placement Ready', icon: '🏆', desc: 'Reach 80% readiness', unlocked: false },
  { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', desc: 'Complete a test in half the time', unlocked: false },
  { id: 'company_expert', title: 'Company Expert', icon: '🏢', desc: 'Study 5 company profiles', unlocked: false },
  { id: 'knowledge_base', title: 'Knowledge Base', icon: '📚', desc: 'Complete 20 aptitude tests', unlocked: false },
  { id: 'the_grind', title: 'The Grind', icon: '💪', desc: 'Practice for 30 days', unlocked: false },
  { id: 'early_bird', title: 'Early Bird', icon: '🐦', desc: 'Start preparation 6 months before placements', unlocked: false },
];

const ROADMAP = [
  { id: 'r1', category: 'RESUME', title: 'Complete Profile & Resume', hours: '2h', status: 'active' },
  { id: 'r2', category: 'APTITUDE', title: 'Master Quantitative Aptitude', hours: '10h', status: 'locked' },
  { id: 'r3', category: 'CODING', title: 'Solve 50 Coding Problems', hours: '30h', status: 'active' },
  { id: 'r4', category: 'INTERVIEW', title: 'Practice Technical Interviews', hours: '8h', status: 'locked' },
  { id: 'r5', category: 'INTERVIEW', title: 'HR & Behavioral Preparation', hours: '5h', status: 'locked' },
  { id: 'r6', category: 'CODING', title: 'Company-wise Mock Preparation', hours: '15h', status: 'locked' },
];

// Default progress keyed by userId
const progressStore = {
  '1': {
    readinessScore: 5,
    resumeProgress: 14,
    aptitudeProgress: 0,
    codingProgress: 5,
    interviewProgress: 0,
    roadmap: ROADMAP,
    achievements: ACHIEVEMENTS_LIST,
  },
};

const defaultProgress = {
  readinessScore: 0,
  resumeProgress: 0,
  aptitudeProgress: 0,
  codingProgress: 0,
  interviewProgress: 0,
  roadmap: ROADMAP,
  achievements: ACHIEVEMENTS_LIST.map((a) => ({ ...a, unlocked: false })),
};

export function getProgressByUserId(userId) {
  return progressStore[userId] || { ...defaultProgress };
}

export function getAchievementsByUserId(userId) {
  const progress = progressStore[userId] || defaultProgress;
  return progress.achievements;
}

export function updateProgressByUserId(userId, updates) {
  if (!progressStore[userId]) progressStore[userId] = { ...defaultProgress };
  progressStore[userId] = { ...progressStore[userId], ...updates };
  // Recalculate readiness
  const p = progressStore[userId];
  p.readinessScore = Math.round(
    (p.resumeProgress * 0.2 + p.aptitudeProgress * 0.3 + p.codingProgress * 0.3 + p.interviewProgress * 0.2)
  );
  return progressStore[userId];
}

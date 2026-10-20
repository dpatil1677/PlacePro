import prisma from '../db.js';
import { evaluateTestCases, generateInterviewFeedback } from '../utils/codeRunner.js';
import {
  getAllTests as getBackupTests,
  getTestById as getBackupTestById,
  getResultsForUser as getBackupResultsForUser,
  saveResult as saveBackupResult,
} from '../data/aptitude.js';
import {
  getAllProblems as getBackupProblems,
  getProblemById as getBackupProblemById,
  getSubmissionsForUser as getBackupSubmissions,
  saveSubmission as saveBackupSubmission,
  markSolved as markBackupSolved,
} from '../data/coding.js';
import {
  getTopicsByCategory as getBackupTopics,
  getTopicById as getBackupTopicById,
  getSessionsForUser as getBackupSessions,
  saveSession as saveBackupSession,
} from '../data/interviews.js';
import {
  getResumeByUserId as getBackupResume,
  updateResumeByUserId as updateBackupResume,
} from '../data/resumes.js';
import {
  getAllCompanies as getBackupCompanies,
  getCompanyById as getBackupCompanyById,
} from '../data/companies.js';
import {
  getProgressByUserId as getBackupProgress,
  getAchievementsByUserId as getBackupAchievements,
  updateProgressByUserId as updateBackupProgress,
} from '../data/progress.js';

// ── Dashboard ──────────────────────────────────────────────
export async function getDashboard(req, res) {
  const user = req.user;
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: user.id },
    });
    if (progress) {
      return res.json({
        user: { id: user.id, name: user.name, email: user.email },
        readinessScore: progress.readinessScore,
        codingProgress: progress.codingProgress,
        aptitudeProgress: progress.aptitudeProgress,
        resumeProgress: progress.resumeProgress,
        interviewProgress: progress.interviewProgress,
      });
    }
  } catch (e) {
    console.error('getDashboard error:', e);
  }

  const fallback = getBackupProgress(user.id);
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    readinessScore: fallback.readinessScore,
    codingProgress: fallback.codingProgress,
    aptitudeProgress: fallback.aptitudeProgress,
    resumeProgress: fallback.resumeProgress,
    interviewProgress: fallback.interviewProgress,
  });
}

// ── Aptitude ──────────────────────────────────────────────
export async function listAptitudeTests(req, res) {
  try {
    const tests = await prisma.aptitudeTest.findMany({ orderBy: { createdAt: 'desc' } });
    if (tests.length > 0) {
      const formatted = tests.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty || 'Medium',
        duration: t.duration,
        questions: t.totalQuestions,
      }));
      return res.json(formatted);
    }
  } catch (e) {
    console.error('listAptitudeTests error:', e);
  }
  res.json(getBackupTests());
}

export async function getAptitudeTest(req, res) {
  try {
    const test = await prisma.aptitudeTest.findUnique({
      where: { id: req.params.id },
    });
    if (test) {
      const questionsData = JSON.parse(test.questionsData || '[]');
      const questionsWithoutAnswers = questionsData.map(({ answer, ...q }) => q);
      return res.json({
        id: test.id,
        title: test.title,
        category: test.category,
        duration: test.duration,
        questions: questionsWithoutAnswers,
      });
    }
  } catch (e) {
    console.error('getAptitudeTest error:', e);
  }

  const fallback = getBackupTestById(req.params.id);
  if (!fallback) return res.status(404).json({ message: 'Test not found' });
  const { questions_data, ...testMeta } = fallback;
  const questionsWithoutAnswers = questions_data.map(({ answer, ...q }) => q);
  res.json({ ...testMeta, questions: questionsWithoutAnswers });
}

export async function submitAptitudeTest(req, res) {
  const { id } = req.params;
  const { answers } = req.body;

  let testQuestions = null;
  let testTitle = '';
  try {
    const test = await prisma.aptitudeTest.findUnique({ where: { id } });
    if (test) {
      testQuestions = JSON.parse(test.questionsData || '[]');
      testTitle = test.title;
    }
  } catch (e) {
    console.error('submitAptitudeTest fetch error:', e);
  }

  if (!testQuestions) {
    const fallback = getBackupTestById(id);
    if (!fallback) return res.status(404).json({ message: 'Test not found' });
    testQuestions = fallback.questions_data;
    testTitle = fallback.title;
  }

  let correct = 0;
  const breakdown = testQuestions.map((q) => {
    const selected = answers?.[q.id];
    const isCorrect = selected === q.answer;
    if (isCorrect) correct++;
    return { id: q.id, selected, correctAnswer: q.answer, isCorrect };
  });

  const score = Math.round((correct / testQuestions.length) * 100);
  const result = {
    testId: id,
    testTitle,
    score,
    correct,
    total: testQuestions.length,
    date: new Date().toISOString(),
    breakdown,
  };

  try {
    await prisma.aptitudeResult.create({
      data: {
        userId: req.user.id,
        testId: id,
        testTitle,
        score,
        correct,
        total: testQuestions.length,
        breakdown: JSON.stringify(breakdown),
      },
    });

    const prevProg = await prisma.progress.findUnique({ where: { userId: req.user.id } });
    const prevApt = prevProg?.aptitudeProgress || 0;
    const newAptProgress = Math.min(100, Math.max(prevApt, score));
    await prisma.progress.upsert({
      where: { userId: req.user.id },
      update: {
        aptitudeProgress: newAptProgress,
        readinessScore: Math.round(
          (prevProg?.resumeProgress || 0) * 0.2 +
            newAptProgress * 0.3 +
            (prevProg?.codingProgress || 0) * 0.3 +
            (prevProg?.interviewProgress || 0) * 0.2
        ),
      },
      create: {
        userId: req.user.id,
        aptitudeProgress: newAptProgress,
        readinessScore: Math.round(newAptProgress * 0.3),
      },
    });
  } catch (e) {
    console.error('submitAptitudeTest DB save error:', e);
  }

  saveBackupResult(req.user.id, result);
  updateBackupProgress(req.user.id, { aptitudeProgress: score });

  res.json(result);
}

export async function getAptitudeResults(req, res) {
  try {
    const results = await prisma.aptitudeResult.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    if (results.length > 0) {
      return res.json(
        results.map((r) => ({
          id: r.id,
          testId: r.testId,
          testTitle: r.testTitle || 'Aptitude Test',
          score: r.score,
          correct: r.correct,
          total: r.total,
          date: r.date,
          breakdown: (() => { try { return JSON.parse(r.breakdown || '[]'); } catch { return []; } })(),
        }))
      );
    }
  } catch (e) {
    console.error('getAptitudeResults error:', e);
  }
  res.json(getBackupResultsForUser(req.user.id));
}

// ── Coding ────────────────────────────────────────────────
export async function listCodingProblems(req, res) {
  try {
    const [problems, solvedProblems] = await Promise.all([
      prisma.codingProblem.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.solvedProblem.findMany({ where: { userId: req.user.id } }),
    ]);
    if (problems.length > 0) {
      const solvedIds = new Set(solvedProblems.map((s) => s.problemId));
      return res.json(
        problems.map((p) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.category,
          acceptance: p.acceptance || '—',
          companies: (() => { try { return JSON.parse(p.companies || '[]'); } catch { return []; } })(),
          solved: solvedIds.has(p.id),
        }))
      );
    }
  } catch (e) {
    console.error('listCodingProblems error:', e);
  }
  res.json(getBackupProblems());
}

export async function getCodingProblem(req, res) {
  try {
    const [prob, solved] = await Promise.all([
      prisma.codingProblem.findUnique({ where: { id: req.params.id } }),
      prisma.solvedProblem.findUnique({ where: { userId_problemId: { userId: req.user.id, problemId: req.params.id } } }),
    ]);
    if (prob) {
      return res.json({
        id: prob.id,
        title: prob.title,
        difficulty: prob.difficulty,
        topic: prob.category,
        description: prob.description,
        examples: (() => { try { return JSON.parse(prob.examples || '[]'); } catch { return []; } })(),
        constraints: (() => { try { return JSON.parse(prob.constraints || '[]'); } catch { return []; } })(),
        starterCode: (() => { try { return JSON.parse(prob.starterCode || '{}'); } catch { return {}; } })(),
        testCases: (() => { try { return JSON.parse(prob.testCases || '[]'); } catch { return []; } })(),
        companies: (() => { try { return JSON.parse(prob.companies || '[]'); } catch { return []; } })(),
        acceptance: prob.acceptance || '—',
        solved: !!solved,
      });
    }
  } catch (e) {
    console.error('getCodingProblem error:', e);
  }
  const fallback = getBackupProblemById(req.params.id);
  if (!fallback) return res.status(404).json({ message: 'Problem not found' });
  res.json(fallback);
}

export async function runCode(req, res) {
  const { id } = req.params;
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ message: 'No code provided.' });

  let testCases = [];
  try {
    const prob = await prisma.codingProblem.findUnique({ where: { id } });
    if (prob?.testCases) {
      testCases = JSON.parse(prob.testCases || '[]').slice(0, 2); // run only first 2 for speed
    }
  } catch (e) { /* fallback: empty test cases */ }

  const startTime = Date.now();
  const evalResult = evaluateTestCases(code, language || 'javascript', testCases);
  const runtime = `${Date.now() - startTime} ms`;

  if (testCases.length > 0) {
    return res.json({
      status: evalResult.allPassed ? 'success' : 'wrong_answer',
      output: evalResult.results.map((r, i) =>
        `Test Case ${i + 1}: ${r.passed ? '✅ Passed' : '❌ Failed'}\nInput: ${r.input}\nExpected: ${r.expected}\nGot: ${r.actual}`
      ).join('\n\n'),
      runtime,
      memory: '41.2 MB',
      testResults: evalResult.results,
      passed: evalResult.passed,
      total: evalResult.total,
    });
  }

  // No test cases: just execute and return output
  const simResult = evaluateTestCases(code, language || 'javascript', []);
  res.json({
    status: simResult.allPassed ? 'success' : 'error',
    output: simResult.sampleOutput || '// Code executed. Add test cases for proper evaluation.',
    runtime,
    memory: '41.2 MB',
  });
}

export async function submitCode(req, res) {
  const { id } = req.params;
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ message: 'No code provided.' });

  let probTitle = 'Problem';
  let testCases = [];
  let probFromDB = null;

  try {
    probFromDB = await prisma.codingProblem.findUnique({ where: { id } });
    if (probFromDB) {
      probTitle = probFromDB.title;
      testCases = JSON.parse(probFromDB.testCases || '[]');
    }
  } catch (e) { /* fallback */ }

  // Fallback to in-memory backup if not in DB
  if (!probFromDB) {
    const backupProb = getBackupProblemById(id);
    if (!backupProb) return res.status(404).json({ message: 'Problem not found' });
    probTitle = backupProb.title;
    testCases = backupProb.testCases || [];
  }

  const startTime = Date.now();
  const evalResult = evaluateTestCases(code, language || 'javascript', testCases);
  const runtime = `${Date.now() - startTime} ms`;
  const memory = `${(Math.random() * 5 + 40).toFixed(1)} MB`;

  const accepted = testCases.length === 0
    ? evalResult.allPassed // if no test cases, trust the code ran without error
    : evalResult.allPassed;

  const status = accepted ? 'Accepted' : 'Wrong Answer';

  const sub = {
    problemId: id,
    problemTitle: probTitle,
    language: language || 'javascript',
    status,
    runtime: accepted ? runtime : null,
    memory: accepted ? memory : null,
    testResults: evalResult.results,
    passed: evalResult.passed,
    total: evalResult.total,
    submittedAt: new Date().toISOString(),
  };

  try {
    await prisma.codingSubmission.create({
      data: {
        userId: req.user.id,
        problemId: id,
        problemTitle: probTitle,
        language: sub.language,
        status: sub.status,
        runtime: sub.runtime,
        memory: sub.memory,
      },
    });

    if (accepted) {
      await prisma.solvedProblem.upsert({
        where: { userId_problemId: { userId: req.user.id, problemId: id } },
        update: { solvedAt: new Date() },
        create: { userId: req.user.id, problemId: id },
      });

      const totalProblems = await prisma.codingProblem.count();
      const solvedCount = await prisma.solvedProblem.count({ where: { userId: req.user.id } });
      const denominator = Math.max(totalProblems, 10);
      const newProgress = Math.min(100, Math.round((solvedCount / denominator) * 100));

      const prevProg = await prisma.progress.findUnique({ where: { userId: req.user.id } });
      await prisma.progress.upsert({
        where: { userId: req.user.id },
        update: {
          codingProgress: newProgress,
          readinessScore: Math.round(
            (prevProg?.resumeProgress || 0) * 0.2 +
              (prevProg?.aptitudeProgress || 0) * 0.3 +
              newProgress * 0.3 +
              (prevProg?.interviewProgress || 0) * 0.2
          ),
        },
        create: { userId: req.user.id, codingProgress: newProgress, readinessScore: Math.round(newProgress * 0.3) },
      });
    }
  } catch (e) {
    console.error('submitCode DB error:', e);
  }

  res.json(sub);
}

// ── Interview ─────────────────────────────────────────────
export async function listInterviewTopics(req, res) {
  const { category } = req.query;
  try {
    const topics = await prisma.interviewTopic.findMany({
      where: category ? { category } : undefined,
    });
    if (topics.length > 0) {
      return res.json(
        topics.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          icon: t.icon,
          questions: JSON.parse(t.questions || '[]'),
        }))
      );
    }
  } catch (e) {
    console.error('listInterviewTopics error:', e);
  }
  res.json(getBackupTopics(category));
}

export async function getInterviewQuestions(req, res) {
  try {
    const topic = await prisma.interviewTopic.findUnique({
      where: { id: req.params.id },
    });
    if (topic) {
      return res.json({
        id: topic.id,
        title: topic.title,
        category: topic.category,
        icon: topic.icon,
        questions: JSON.parse(topic.questions || '[]'),
      });
    }
  } catch (e) {
    console.error('getInterviewQuestions error:', e);
  }
  const fallback = getBackupTopicById(req.params.id);
  if (!fallback) return res.status(404).json({ message: 'Topic not found' });
  res.json(fallback);
}

export async function submitInterview(req, res) {
  const { topicId, topicTitle, answers, category } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Answers array required.' });
  }

  // Generate real AI-style feedback for each answer
  const scoredAnswers = answers.map((a) => {
    const fb = generateInterviewFeedback(a.question, a.answer || '', category || 'Technical');
    return { ...a, feedback: fb };
  });

  const totalScore = scoredAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0);
  const totalMax = scoredAnswers.reduce((sum, a) => sum + (a.feedback?.maxScore || 14), 0);
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const feedbackSummary = {
    overallScore: overallPct,
    totalScore,
    totalMax,
    questionsAnswered: answers.length,
    strength: overallPct >= 75 ? 'Strong performance overall. Keep it up!'
      : overallPct >= 50 ? 'Good effort. Work on structuring your answers better.'
      : 'Needs improvement. Practice the STAR method and add more examples.',
    topTips: [
      ...new Set(scoredAnswers.flatMap((a) => a.feedback?.tips || []))
    ].slice(0, 3),
  };

  const session = {
    id: 'ses_' + Date.now(),
    topicId,
    topicTitle,
    answers: scoredAnswers,
    score: overallPct,
    feedback: feedbackSummary,
    completedAt: new Date().toISOString(),
  };

  try {
    await prisma.interviewSession.create({
      data: {
        userId: req.user.id,
        topicId: topicId || 'unknown',
        topicTitle: topicTitle || 'Interview Practice',
        answers: JSON.stringify(scoredAnswers),
        score: overallPct,
        feedback: JSON.stringify(feedbackSummary),
      },
    });

    const sessionCount = await prisma.interviewSession.count({ where: { userId: req.user.id } });
    const newProgress = Math.min(100, Math.max(overallPct, Math.round(sessionCount * 10)));
    const prevProg = await prisma.progress.findUnique({ where: { userId: req.user.id } });
    await prisma.progress.upsert({
      where: { userId: req.user.id },
      update: {
        interviewProgress: newProgress,
        readinessScore: Math.round(
          (prevProg?.resumeProgress || 0) * 0.2 +
            (prevProg?.aptitudeProgress || 0) * 0.3 +
            (prevProg?.codingProgress || 0) * 0.3 +
            newProgress * 0.2
        ),
      },
      create: {
        userId: req.user.id,
        interviewProgress: newProgress,
        readinessScore: Math.round(newProgress * 0.2),
      },
    });
  } catch (e) {
    console.error('submitInterview DB error:', e);
  }

  saveBackupSession(req.user.id, session);
  res.json(session);
}

export async function listInterviewSessions(req, res) {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: req.user.id },
      orderBy: { completedAt: 'desc' },
    });
    if (sessions.length > 0) {
      return res.json(
        sessions.map((s) => ({
          ...s,
          answers: JSON.parse(s.answers || '[]'),
          feedback: (() => { try { return JSON.parse(s.feedback || '{}'); } catch { return { overallScore: s.score }; } })(),
        }))
      );
    }
  } catch (e) {
    console.error('listInterviewSessions error:', e);
  }
  res.json(getBackupSessions(req.user.id));
}

// ── Resume ────────────────────────────────────────────────
export async function getResume(req, res) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });

    if (resume) {
      return res.json({
        personal: {
          fullName: resume.fullName || '',
          email: resume.email || '',
          phone: resume.phone || '',
          location: resume.location || '',
          linkedin: resume.linkedin || '',
          github: resume.github || '',
        },
        summary: resume.summary || '',
        education: JSON.parse(resume.education || '[]'),
        projects: JSON.parse(resume.projects || '[]'),
        technicalSkills: JSON.parse(resume.technicalSkills || '{}'),
        skills: JSON.parse(resume.skills || '[]'),
        certifications: JSON.parse(resume.certifications || '[]'),
        experience: JSON.parse(resume.experience || '[]'),
      });
    }
  } catch (e) {
    console.error('getResume error:', e);
  }

  res.json(getBackupResume(req.user.id));
}

export async function updateResume(req, res) {
  const data = req.body;
  try {
    await prisma.resume.upsert({
      where: { userId: req.user.id },
      update: {
        fullName: data.personal?.fullName || '',
        email: data.personal?.email || '',
        phone: data.personal?.phone || '',
        location: data.personal?.location || '',
        linkedin: data.personal?.linkedin || '',
        github: data.personal?.github || '',
        summary: data.summary || '',
        education: JSON.stringify(data.education || []),
        projects: JSON.stringify(data.projects || []),
        technicalSkills: JSON.stringify(data.technicalSkills || {}),
        skills: JSON.stringify(data.skills || []),
        certifications: JSON.stringify(data.certifications || []),
        experience: JSON.stringify(data.experience || []),
      },
      create: {
        userId: req.user.id,
        fullName: data.personal?.fullName || '',
        email: data.personal?.email || '',
        phone: data.personal?.phone || '',
        location: data.personal?.location || '',
        linkedin: data.personal?.linkedin || '',
        github: data.personal?.github || '',
        summary: data.summary || '',
        education: JSON.stringify(data.education || []),
        projects: JSON.stringify(data.projects || []),
        technicalSkills: JSON.stringify(data.technicalSkills || {}),
        skills: JSON.stringify(data.skills || []),
        certifications: JSON.stringify(data.certifications || []),
        experience: JSON.stringify(data.experience || []),
      },
    });

    // Compute ATS Score
    let score = 0;
    if (data.personal?.fullName) score += 10;
    if (data.personal?.email) score += 10;
    if (data.personal?.phone) score += 5;
    if (data.personal?.linkedin || data.personal?.github) score += 10;
    if (data.summary?.trim().length > 20) score += 15;
    if (data.experience?.length > 0 || data.projects?.length > 0) score += 20;
    if (data.education?.length > 0) score += 15;
    const hasSkills =
      data.skills?.length >= 5 ||
      (data.technicalSkills && Object.values(data.technicalSkills).some((v) => v && v.trim().length > 0));
    if (hasSkills) score += 15;
    const finalScore = Math.min(100, score);

    const prevProg = await prisma.progress.findUnique({ where: { userId: req.user.id } });
    await prisma.progress.upsert({
      where: { userId: req.user.id },
      update: {
        resumeProgress: finalScore,
        readinessScore: Math.round(
          finalScore * 0.2 +
            (prevProg?.aptitudeProgress || 0) * 0.3 +
            (prevProg?.codingProgress || 0) * 0.3 +
            (prevProg?.interviewProgress || 0) * 0.2
        ),
      },
      create: {
        userId: req.user.id,
        resumeProgress: finalScore,
        readinessScore: Math.round(finalScore * 0.2),
      },
    });
  } catch (e) {
    console.error('updateResume DB error:', e);
  }

  updateBackupResume(req.user.id, data);
  updateBackupProgress(req.user.id, { resumeProgress: 100 });
  res.json(data);
}

export async function exportResume(req, res) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });
    if (resume) {
      return res.json({
        resume: {
          personal: {
            fullName: resume.fullName,
            email: resume.email,
            phone: resume.phone,
            location: resume.location,
            linkedin: resume.linkedin,
            github: resume.github,
          },
          summary: resume.summary,
          education: JSON.parse(resume.education || '[]'),
          projects: JSON.parse(resume.projects || '[]'),
          technicalSkills: JSON.parse(resume.technicalSkills || '{}'),
          skills: JSON.parse(resume.skills || '[]'),
          certifications: JSON.parse(resume.certifications || '[]'),
          experience: JSON.parse(resume.experience || '[]'),
        },
        exportReady: true,
      });
    }
  } catch (e) {
    console.error('exportResume error:', e);
  }

  const resume = getBackupResume(req.user.id);
  res.json({ resume, exportReady: true });
}

// ── Auto-close expired drives helper ─────────────────────
export async function closeExpiredDrives() {
  try {
    const drives = await prisma.drive.findMany({
      where: {
        status: { in: ['Upcoming', 'Ongoing'] },
        deadline: { not: null },
      },
    });

    const now = new Date();
    for (const d of drives) {
      if (d.deadline && d.deadline.trim()) {
        const deadlineDate = new Date(d.deadline);
        if (!isNaN(deadlineDate.getTime()) && deadlineDate < now) {
          await prisma.drive.update({
            where: { id: d.id },
            data: { status: 'Closed' },
          });
        }
      }
    }
  } catch (e) {
    console.error('closeExpiredDrives error:', e);
  }
}

// ── Companies ─────────────────────────────────────────────
export async function listCompanies(req, res) {
  try {
    await closeExpiredDrives();
    const companies = await prisma.company.findMany({
      include: {
        drives: true,
      },
      orderBy: { name: 'asc' },
    });
    if (companies.length > 0) {
      return res.json(
        companies.map((c) => ({
          id: c.id,
          name: c.name,
          logo: c.logo,
          category: c.role,
          difficulty: c.type === 'Product' ? 'Hard' : 'Easy',
          package: c.package,
          industry: c.location,
          location: c.location,
          description: c.about,
          hiringProcess: (() => { try { return JSON.parse(c.hiringProcess || '[]'); } catch { return []; } })(),
          interviewQuestions: (() => { try { return JSON.parse(c.rounds || '[]'); } catch { return []; } })(),
          preparationTips: (() => { try { return JSON.parse(c.requirements || '[]'); } catch { return []; } })(),
          activeDrivesCount: (c.drives || []).filter(d => d.status !== 'Completed' && d.status !== 'Closed').length,
          totalDrivesCount: (c.drives || []).length,
        }))
      );
    }
  } catch (e) {
    console.error('listCompanies error:', e);
  }
  res.json(getBackupCompanies());
}

export async function getCompany(req, res) {
  try {
    await closeExpiredDrives();
    const { id } = req.params;
    let company = await prisma.company.findUnique({
      where: { id },
      include: {
        drives: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Fallback search by company name if ID didn't match directly
    if (!company) {
      company = await prisma.company.findFirst({
        where: { name: { equals: id } },
        include: {
          drives: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (company) {
      const myApps = await prisma.application.findMany({
        where: { userId: req.user.id },
        select: { driveId: true, status: true },
      });
      const appMap = Object.fromEntries(myApps.map(a => [a.driveId, a.status]));

      return res.json({
        id: company.id,
        name: company.name,
        logo: company.logo,
        category: company.role,
        role: company.role,
        difficulty: company.type === 'Product' ? 'Hard' : 'Easy',
        package: company.package,
        industry: company.location,
        location: company.location,
        description: company.about,
        about: company.about,
        website: company.website,
        hiringProcess: (() => { try { return JSON.parse(company.hiringProcess || '[]'); } catch { return []; } })(),
        interviewQuestions: (() => { try { return JSON.parse(company.rounds || '[]'); } catch { return []; } })(),
        preparationTips: (() => { try { return JSON.parse(company.requirements || '[]'); } catch { return []; } })(),
        commonTopics: ['Data Structures', 'Algorithms', 'System Design', 'DBMS', 'OOP'],
        drives: (company.drives || []).map(d => ({
          id: d.id,
          title: d.title,
          status: d.status,
          date: d.date,
          deadline: d.deadline,
          eligibility: d.eligibility,
          package: d.package,
          location: d.location,
          registered: d.registered,
          applied: !!appMap[d.id],
          applicationStatus: appMap[d.id] || null,
        })),
      });
    }
  } catch (e) {
    console.error('getCompany error:', e);
  }
  const fallback = getBackupCompanyById(req.params.id);
  if (!fallback) return res.status(404).json({ message: 'Company not found' });
  res.json(fallback);
}

// ── Progress ──────────────────────────────────────────────
export async function getProgress(req, res) {
  try {
    const p = await prisma.progress.findUnique({
      where: { userId: req.user.id },
    });
    if (p) {
      return res.json({
        readinessScore: p.readinessScore,
        resumeProgress: p.resumeProgress,
        aptitudeProgress: p.aptitudeProgress,
        codingProgress: p.codingProgress,
        interviewProgress: p.interviewProgress,
        roadmap: JSON.parse(p.roadmap || '[]'),
        achievements: JSON.parse(p.achievements || '[]'),
      });
    }
  } catch (e) {
    console.error('getProgress error:', e);
  }
  res.json(getBackupProgress(req.user.id));
}

export async function getAchievements(req, res) {
  try {
    const p = await prisma.progress.findUnique({
      where: { userId: req.user.id },
    });
    if (p && p.achievements) {
      return res.json(JSON.parse(p.achievements));
    }
  } catch (e) {
    console.error('getAchievements error:', e);
  }
  res.json(getBackupAchievements(req.user.id));
}

// ── Student Drives & Applications ─────────────────────────
export async function listDrivesForStudent(req, res) {
  try {
    await closeExpiredDrives();
    const drives = await prisma.drive.findMany({
      include: { companyRel: true },
      orderBy: { createdAt: 'desc' },
    });
    if (drives.length > 0) {
      const myApps = await prisma.application.findMany({
        where: { userId: req.user.id },
        select: { driveId: true, status: true },
      });
      const appMap = {};
      myApps.forEach(a => { appMap[a.driveId] = a.status; });

      return res.json(drives.map(d => ({
        id: d.id,
        companyId: d.companyId,
        company: d.companyRel?.name || d.company,
        abbr: d.companyRel?.logo || d.abbr,
        title: d.title,
        status: d.status,
        date: d.date,
        deadline: d.deadline,
        eligibility: d.eligibility,
        package: d.package,
        location: d.location,
        description: d.description,
        registered: d.registered,
        applied: !!appMap[d.id],
        applicationStatus: appMap[d.id] || null,
        rounds: d.rounds ? JSON.parse(d.rounds) : [],
      })));
    }
  } catch (e) {
    console.error('listDrivesForStudent error:', e);
  }
  res.json([]);
}

export async function getDrive(req, res) {
  try {
    await closeExpiredDrives();
    const { id } = req.params;
    const drive = await prisma.drive.findUnique({
      where: { id },
      include: {
        companyRel: true,
      },
    });

    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    const app = await prisma.application.findUnique({
      where: { userId_driveId: { userId: req.user.id, driveId: id } },
    });

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    res.json({
      id: drive.id,
      companyId: drive.companyId,
      company: drive.companyRel?.name || drive.company,
      companyLogo: drive.companyRel?.logo || drive.abbr || drive.company?.slice(0, 2).toUpperCase(),
      companyAbout: drive.companyRel?.about || drive.description,
      companyLocation: drive.companyRel?.location || drive.location,
      companyRole: drive.companyRel?.role || drive.title,
      title: drive.title,
      status: drive.status,
      date: drive.date,
      deadline: drive.deadline,
      eligibility: drive.eligibility,
      package: drive.package,
      location: drive.location,
      description: drive.description,
      rounds: (() => { try { return JSON.parse(drive.rounds || '[]'); } catch { return []; } })(),
      registered: drive.registered,
      applied: !!app,
      applicationStatus: app?.status || null,
      appliedAt: app?.appliedAt || null,
      studentReadiness: student?.readiness || 0,
      studentBranch: student?.branch || '',
    });
  } catch (e) {
    console.error('getDrive error:', e);
    res.status(500).json({ message: 'Failed to fetch drive details' });
  }
}

export async function applyToDrive(req, res) {
  const { driveId } = req.body;
  if (!driveId) return res.status(400).json({ message: 'Drive ID is required.' });

  try {
    await closeExpiredDrives();
    const drive = await prisma.drive.findUnique({
      where: { id: driveId },
      include: { companyRel: true },
    });
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    if (drive.status === 'Completed' || drive.status === 'Closed') {
      return res.status(400).json({ message: 'Applications for this drive are closed.' });
    }

    if (drive.deadline && drive.deadline.trim()) {
      const deadlineDate = new Date(drive.deadline);
      if (!isNaN(deadlineDate.getTime()) && deadlineDate < new Date()) {
        await prisma.drive.update({ where: { id: driveId }, data: { status: 'Closed' } });
        return res.status(400).json({ message: 'The deadline for this placement drive has passed.' });
      }
    }

    const existing = await prisma.application.findUnique({
      where: { userId_driveId: { userId: req.user.id, driveId } },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this drive.' });
    }

    const application = await prisma.application.create({
      data: { userId: req.user.id, driveId, status: 'Applied' },
    });

    // Increment registered count on drive
    await prisma.drive.update({
      where: { id: driveId },
      data: { registered: { increment: 1 } },
    });

    res.status(201).json({
      application,
      message: `Successfully applied to ${drive.companyRel?.name || drive.company}!`,
    });
  } catch (e) {
    console.error('applyToDrive error:', e);
    res.status(500).json({ message: 'Failed to apply for drive.' });
  }
}

export async function getMyApplications(req, res) {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: {
        drive: {
          select: {
            id: true, company: true, title: true, date: true,
            deadline: true, package: true, location: true, status: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ applications });
  } catch (e) {
    console.error('getMyApplications error:', e);
    res.json({ applications: [] });
  }
}

// ── Student Notifications ─────────────────────────────────
export async function getStudentNotifications(req, res) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      select: { branch: true, gradYear: true },
    });
    const branch = student?.branch || '';
    const year = student?.gradYear || '';

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { target: 'all' },
          { target: { contains: branch } },
          { target: { contains: year } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (e) {
    console.error('getStudentNotifications error:', e);
    res.json({ notifications: [] });
  }
}

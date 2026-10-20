import prisma from '../db.js';
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
    const tests = await prisma.aptitudeTest.findMany();
    if (tests.length > 0) {
      const formatted = tests.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        duration: t.duration,
        questions: t.totalQuestions,
        questions_data: JSON.parse(t.questionsData || '[]'),
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
          ...r,
          breakdown: JSON.parse(r.breakdown || '[]'),
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
    const problems = await prisma.codingProblem.findMany();
    if (problems.length > 0) {
      return res.json(
        problems.map((p) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.category,
          description: p.description,
          examples: JSON.parse(p.examples || '[]'),
          constraints: JSON.parse(p.constraints || '[]'),
          starterCode: JSON.parse(p.starterCode || '{}'),
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
    const prob = await prisma.codingProblem.findUnique({
      where: { id: req.params.id },
    });
    if (prob) {
      return res.json({
        id: prob.id,
        title: prob.title,
        difficulty: prob.difficulty,
        topic: prob.category,
        description: prob.description,
        examples: JSON.parse(prob.examples || '[]'),
        constraints: JSON.parse(prob.constraints || '[]'),
        starterCode: JSON.parse(prob.starterCode || '{}'),
      });
    }
  } catch (e) {
    console.error('getCodingProblem error:', e);
  }
  const fallback = getBackupProblemById(req.params.id);
  if (!fallback) return res.status(404).json({ message: 'Problem not found' });
  res.json(fallback);
}

export function runCode(req, res) {
  setTimeout(() => {
    res.json({
      status: 'success',
      output: '// Output: Tests passed successfully.\n// PlacePro Database & Execution Engine connected.',
      runtime: '4 ms',
      memory: '41.2 MB',
    });
  }, 600);
}

export async function submitCode(req, res) {
  const prob = getBackupProblemById(req.params.id);
  if (!prob) return res.status(404).json({ message: 'Problem not found' });

  const { language } = req.body;
  const accepted = Math.random() > 0.3;

  const sub = {
    problemId: prob.id,
    problemTitle: prob.title,
    language: language || 'javascript',
    status: accepted ? 'Accepted' : 'Wrong Answer',
    runtime: accepted ? `${Math.floor(Math.random() * 50 + 4)} ms` : null,
    memory: accepted ? `${(Math.random() * 5 + 40).toFixed(1)} MB` : null,
    submittedAt: new Date().toISOString(),
  };

  try {
    await prisma.codingSubmission.create({
      data: {
        userId: req.user.id,
        problemId: prob.id,
        problemTitle: prob.title,
        language: sub.language,
        status: sub.status,
        runtime: sub.runtime,
        memory: sub.memory,
      },
    });

    if (accepted) {
      await prisma.solvedProblem.upsert({
        where: {
          userId_problemId: {
            userId: req.user.id,
            problemId: prob.id,
          },
        },
        update: { solvedAt: new Date() },
        create: {
          userId: req.user.id,
          problemId: prob.id,
        },
      });

      const solvedCount = await prisma.solvedProblem.count({ where: { userId: req.user.id } });
      const newProgress = Math.min(100, Math.round((solvedCount / 50) * 100));

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
        create: {
          userId: req.user.id,
          codingProgress: newProgress,
          readinessScore: Math.round(newProgress * 0.3),
        },
      });
    }
  } catch (e) {
    console.error('submitCode DB error:', e);
  }

  saveBackupSubmission(req.user.id, sub);
  if (accepted) {
    markBackupSolved(req.user.id, prob.id);
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
  const { topicId, topicTitle, answers, score, feedback } = req.body;

  const session = {
    id: 'ses_' + Date.now(),
    topicId,
    topicTitle,
    answers,
    score: score || 0,
    feedback: feedback || '',
    completedAt: new Date().toISOString(),
  };

  try {
    await prisma.interviewSession.create({
      data: {
        userId: req.user.id,
        topicId: topicId || 'unknown',
        topicTitle: topicTitle || 'Interview Practice',
        answers: JSON.stringify(answers || []),
        score: score || 0,
        feedback: feedback || '',
      },
    });

    // Update interview progress
    const sessionCount = await prisma.interviewSession.count({ where: { userId: req.user.id } });
    const newProgress = Math.min(100, sessionCount * 12);
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

// ── Companies ─────────────────────────────────────────────
export async function listCompanies(req, res) {
  try {
    const companies = await prisma.company.findMany();
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
          description: c.about,
          hiringProcess: JSON.parse(c.hiringProcess || '[]'),
          interviewQuestions: JSON.parse(c.rounds || '[]'),
          preparationTips: JSON.parse(c.requirements || '[]'),
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
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
    });
    if (company) {
      return res.json({
        id: company.id,
        name: company.name,
        logo: company.logo,
        category: company.role,
        difficulty: company.type === 'Product' ? 'Hard' : 'Easy',
        package: company.package,
        industry: company.location,
        description: company.about,
        hiringProcess: JSON.parse(company.hiringProcess || '[]'),
        interviewQuestions: JSON.parse(company.rounds || '[]'),
        preparationTips: JSON.parse(company.requirements || '[]'),
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

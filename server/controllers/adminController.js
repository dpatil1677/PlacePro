import prisma from '../db.js';

/* ─── Helpers ─────────────────────────────────────────────── */

async function logActivity(adminId, action, entity, entityId = null, details = null) {
  try {
    await prisma.activityLog.create({
      data: { adminId, action, entity, entityId: entityId ? String(entityId) : null, details },
    });
  } catch (_) { /* non-critical */ }
}

/* ─────────────── DASHBOARD / ANALYTICS ─────────────── */

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      placedStudents,
      activeStudents,
      totalDrives,
      activeDrives,
      upcomingDrives,
      totalCompanies,
      totalApplications,
      totalQuestions,
      recentStudents,
      recentDrives,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { placed: true } }),
      prisma.student.count({ where: { status: 'Active' } }),
      prisma.drive.count(),
      prisma.drive.count({ where: { status: 'Ongoing' } }),
      prisma.drive.count({ where: { status: 'Upcoming' } }),
      prisma.company.count(),
      prisma.application.count(),
      prisma.question.count(),
      prisma.student.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, branch: true, readiness: true, status: true, placed: true } }),
      prisma.drive.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, company: true, title: true, status: true, date: true, registered: true } }),
    ]);

    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // Branch-wise stats
    const allStudents = await prisma.student.findMany({ select: { branch: true, placed: true } });
    const branchMap = {};
    allStudents.forEach(s => {
      const b = s.branch || 'Other';
      if (!branchMap[b]) branchMap[b] = { total: 0, placed: 0 };
      branchMap[b].total++;
      if (s.placed) branchMap[b].placed++;
    });
    const branchStats = Object.entries(branchMap).map(([branch, v]) => ({
      branch, total: v.total, placed: v.placed,
      rate: v.total > 0 ? Math.round((v.placed / v.total) * 100) : 0,
    }));

    // Package stats from placed students
    const placedList = await prisma.student.findMany({ where: { placed: true }, select: { package: true } });
    const packages = placedList
      .map(s => parseFloat(s.package))
      .filter(p => !isNaN(p) && p > 0);
    const avgPackage = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1) : '0';
    const highestPackage = packages.length > 0 ? Math.max(...packages).toFixed(1) : '0';

    // Readiness distribution
    const allProgress = await prisma.progress.findMany({ select: { readinessScore: true } });
    const dist = [
      { range: '0-20', count: allProgress.filter(p => p.readinessScore <= 20).length },
      { range: '21-40', count: allProgress.filter(p => p.readinessScore > 20 && p.readinessScore <= 40).length },
      { range: '41-60', count: allProgress.filter(p => p.readinessScore > 40 && p.readinessScore <= 60).length },
      { range: '61-80', count: allProgress.filter(p => p.readinessScore > 60 && p.readinessScore <= 80).length },
      { range: '81-100', count: allProgress.filter(p => p.readinessScore > 80).length },
    ];

    res.json({
      totalStudents,
      placedStudents,
      activeStudents,
      placementRate,
      totalDrives,
      activeDrives,
      upcomingDrives,
      totalCompanies,
      totalApplications,
      totalQuestions,
      avgPackage: avgPackage + ' LPA',
      highestPackage: highestPackage + ' LPA',
      branchStats,
      readinessDistribution: dist,
      recentStudents,
      recentDrives,
    });
  } catch (e) {
    console.error('getDashboardStats error:', e);
    res.status(500).json({ message: 'Failed to load dashboard stats.' });
  }
};

/* ─────────────── STUDENTS ─────────────── */

export const listStudents = async (req, res) => {
  const { search, status, branch } = req.query;
  try {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { branch: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (branch) where.branch = { contains: branch };

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ students });
  } catch (e) {
    console.error('listStudents error:', e);
    res.status(500).json({ message: 'Failed to load students.', students: [] });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    let targetUserId = student.userId;
    if (!targetUserId) {
      const user = await prisma.user.findUnique({ where: { email: student.email } });
      if (user) targetUserId = user.id;
    }

    let progress = null;
    let performance = null;
    let applications = [];

    if (targetUserId) {
      progress = await prisma.progress.findUnique({ where: { userId: targetUserId } });

      const [aptitudeResults, codingSubmissions, interviewSessions, solvedProblems] = await Promise.all([
        prisma.aptitudeResult.findMany({ where: { userId: targetUserId }, orderBy: { date: 'desc' }, take: 10 }),
        prisma.codingSubmission.findMany({ where: { userId: targetUserId }, orderBy: { submittedAt: 'desc' }, take: 10 }),
        prisma.interviewSession.findMany({ where: { userId: targetUserId }, orderBy: { completedAt: 'desc' }, take: 5 }),
        prisma.solvedProblem.count({ where: { userId: targetUserId } }),
      ]);

      const avgAptitude = aptitudeResults.length
        ? Math.round(aptitudeResults.reduce((a, r) => a + r.score, 0) / aptitudeResults.length)
        : 0;

      const avgInterview = interviewSessions.length
        ? Math.round(interviewSessions.reduce((a, s) => a + (s.score || 0), 0) / interviewSessions.length)
        : 0;

      performance = {
        solvedProblems,
        avgAptitude,
        avgInterview,
        aptitudeResults: aptitudeResults.map(r => ({
          ...r,
          breakdown: (() => { try { return JSON.parse(r.breakdown); } catch { return []; } })(),
        })),
        codingSubmissions,
        interviewSessions: interviewSessions.map(s => ({
          ...s,
          feedback: (() => { try { return JSON.parse(s.feedback || '{}'); } catch { return {}; } })(),
        })),
      };

      applications = await prisma.application.findMany({
        where: { userId: targetUserId },
        include: { drive: { select: { company: true, title: true, date: true } } },
      });
    }

    res.json({ student, progress, performance, applications });
  } catch (e) {
    console.error('getStudent error:', e);
    res.status(404).json({ message: 'Student not found.' });
  }
};

export const addStudent = async (req, res) => {
  const { name, email, branch, gradYear, status } = req.body;
  if (!name || !email || !branch || !gradYear) {
    return res.status(400).json({ message: 'Name, email, branch and graduation year are required.' });
  }
  try {
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'A student with this email already exists.' });

    const student = await prisma.student.create({
      data: {
        name,
        email,
        branch,
        gradYear,
        status: status || 'Active',
        readiness: 0,
        avatar: name[0]?.toUpperCase() || 'S',
      },
    });
    await logActivity(req.user.id, 'CREATE', 'Student', student.id, `Added ${name}`);
    res.status(201).json({ student });
  } catch (e) {
    console.error('addStudent error:', e);
    res.status(500).json({ message: 'Failed to create student.' });
  }
};

export const editStudent = async (req, res) => {
  try {
    // Sanitize update fields
    const allowed = ['name', 'email', 'branch', 'gradYear', 'status', 'readiness', 'placed', 'package', 'placedAt'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    const updated = await prisma.student.update({ where: { id: req.params.id }, data });
    await logActivity(req.user.id, 'UPDATE', 'Student', req.params.id, `Updated ${updated.name}`);
    res.json({ student: updated });
  } catch (e) {
    console.error('editStudent error:', e);
    res.status(404).json({ message: 'Student not found or update failed.' });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const s = await prisma.student.findUnique({ where: { id: req.params.id } });
    await prisma.student.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'Student', req.params.id, `Removed ${s?.name}`);
    res.json({ message: 'Student removed.' });
  } catch (e) {
    console.error('removeStudent error:', e);
    res.status(404).json({ message: 'Student not found.' });
  }
};

/* ─────────────── DRIVES ─────────────── */

export const listDrives = async (req, res) => {
  try {
    // Auto-close expired drives
    const now = new Date();
    const activeWithDeadline = await prisma.drive.findMany({
      where: {
        status: { in: ['Upcoming', 'Ongoing'] },
        deadline: { not: null },
      },
    });
    for (const d of activeWithDeadline) {
      if (d.deadline && d.deadline.trim()) {
        const dl = new Date(d.deadline);
        if (!isNaN(dl.getTime()) && dl < now) {
          await prisma.drive.update({ where: { id: d.id }, data: { status: 'Closed' } });
        }
      }
    }

    const drives = await prisma.drive.findMany({
      include: {
        companyRel: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach application counts
    const withCounts = await Promise.all(drives.map(async d => {
      const counts = await prisma.application.groupBy({
        by: ['status'],
        where: { driveId: d.id },
        _count: true,
      });
      const statusMap = {};
      counts.forEach(c => { statusMap[c.status] = c._count; });
      return {
        ...d,
        company: d.companyRel?.name || d.company,
        companyId: d.companyId,
        rounds: d.rounds ? JSON.parse(d.rounds) : [],
        applicationCounts: statusMap,
        totalApplications: Object.values(statusMap).reduce((a, b) => a + b, 0),
      };
    }));
    res.json({ drives: withCounts });
  } catch (e) {
    console.error('listDrives error:', e);
    res.status(500).json({ message: 'Failed to load drives.', drives: [] });
  }
};

export const getDrive = async (req, res) => {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: req.params.id },
      include: {
        companyRel: true,
      },
    });
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    const applications = await prisma.application.findMany({
      where: { driveId: drive.id },
      include: { user: { select: { id: true, name: true, email: true, branch: true } } },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({
      drive: {
        ...drive,
        company: drive.companyRel?.name || drive.company,
        companyId: drive.companyId,
        rounds: drive.rounds ? JSON.parse(drive.rounds) : [],
      },
      applications,
    });
  } catch (e) {
    console.error('getDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

export const addDrive = async (req, res) => {
  const { company, companyId, title, date, deadline, eligibility, package: pkg, status, location, description, rounds } = req.body;
  if ((!company && !companyId) || !title || !date) {
    return res.status(400).json({ message: 'Company, title and date are required.' });
  }
  try {
    let resolvedCompany = null;
    if (companyId) {
      resolvedCompany = await prisma.company.findUnique({ where: { id: companyId } });
    }
    const compName = (company || resolvedCompany?.name || '').trim();
    if (!resolvedCompany && compName) {
      resolvedCompany = await prisma.company.findFirst({
        where: { name: compName }
      });
      if (!resolvedCompany) {
        resolvedCompany = await prisma.company.create({
          data: {
            name: compName,
            role: title || 'Software Engineer',
            package: pkg || 'Competitive',
            location: location || 'Multiple Locations',
            type: 'Product',
            about: description || `Placement opportunities at ${compName}`,
            eligible: true,
            logo: compName.slice(0, 2).toUpperCase(),
          }
        });
      }
    }

    const companyName = resolvedCompany ? resolvedCompany.name : compName;
    const finalCompanyId = resolvedCompany ? resolvedCompany.id : null;
    const abbr = companyName.slice(0, 2).toUpperCase();

    const drive = await prisma.drive.create({
      data: {
        company: companyName,
        companyId: finalCompanyId,
        abbr,
        title,
        date,
        deadline: deadline || null,
        eligibility: eligibility || null,
        package: pkg || null,
        status: status || 'Upcoming',
        location: location || null,
        description: description || null,
        rounds: rounds ? JSON.stringify(rounds) : null,
        registered: 0,
      },
      include: {
        companyRel: { select: { id: true, name: true, logo: true } }
      }
    });

    await logActivity(req.user.id, 'CREATE', 'Drive', drive.id, `Created drive for ${companyName}`);
    res.status(201).json({ drive: { ...drive, rounds: rounds || [] } });
  } catch (e) {
    console.error('addDrive error:', e);
    res.status(500).json({ message: 'Failed to create drive.' });
  }
};

export const editDrive = async (req, res) => {
  try {
    const { rounds, company, companyId, ...rest } = req.body;
    const data = { ...rest };
    if (rounds !== undefined) data.rounds = JSON.stringify(rounds);

    if (company !== undefined || companyId !== undefined) {
      let resolvedCompany = null;
      if (companyId) {
        resolvedCompany = await prisma.company.findUnique({ where: { id: companyId } });
      }
      const compName = (company || resolvedCompany?.name || '').trim();
      if (!resolvedCompany && compName) {
        resolvedCompany = await prisma.company.findFirst({ where: { name: compName } });
        if (!resolvedCompany) {
          resolvedCompany = await prisma.company.create({
            data: {
              name: compName,
              role: rest.title || 'Software Engineer',
              package: rest.package || 'Competitive',
              location: rest.location || 'Multiple Locations',
              type: 'Product',
              about: rest.description || `Placement opportunities at ${compName}`,
              eligible: true,
              logo: compName.slice(0, 2).toUpperCase(),
            }
          });
        }
      }
      if (resolvedCompany) {
        data.company = resolvedCompany.name;
        data.companyId = resolvedCompany.id;
        data.abbr = resolvedCompany.name.slice(0, 2).toUpperCase();
      } else if (compName) {
        data.company = compName;
        data.abbr = compName.slice(0, 2).toUpperCase();
      }
    }

    const updated = await prisma.drive.update({
      where: { id: req.params.id },
      data,
      include: {
        companyRel: { select: { id: true, name: true, logo: true } }
      }
    });
    await logActivity(req.user.id, 'UPDATE', 'Drive', req.params.id, `Updated ${updated.company} drive`);
    res.json({ drive: { ...updated, rounds: updated.rounds ? JSON.parse(updated.rounds) : [] } });
  } catch (e) {
    console.error('editDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

export const removeDrive = async (req, res) => {
  try {
    const d = await prisma.drive.findUnique({ where: { id: req.params.id } });
    await prisma.drive.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'Drive', req.params.id, `Deleted ${d?.company} drive`);
    res.json({ message: 'Drive deleted.' });
  } catch (e) {
    console.error('removeDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

/* ─────────────── APPLICATIONS ─────────────── */

export const listApplications = async (req, res) => {
  const { driveId, status, search } = req.query;
  try {
    const where = {};
    if (driveId) where.driveId = driveId;
    if (status) where.status = status;
    if (search) {
      where.user = { OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ]};
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, branch: true, gradYear: true } },
        drive: { select: { id: true, company: true, title: true, package: true, date: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ applications });
  } catch (e) {
    console.error('listApplications error:', e);
    res.status(500).json({ message: 'Failed to load applications.', applications: [] });
  }
};

export const updateApplication = async (req, res) => {
  const { status, round, notes } = req.body;
  try {
    const app = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(round !== undefined && { round }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        drive: { select: { company: true, title: true } },
      },
    });

    // If selected, mark student as placed
    if (status === 'Selected' && app.user) {
      await prisma.student.updateMany({
        where: { userId: app.userId },
        data: { placed: true, placedAt: new Date().toISOString().split('T')[0] },
      });
    }
    if (status === 'Rejected' && app.user) {
      // Only remove placed status if no other selected applications
      const otherSelected = await prisma.application.count({
        where: { userId: app.userId, status: 'Selected', id: { not: app.id } },
      });
      if (otherSelected === 0) {
        await prisma.student.updateMany({
          where: { userId: app.userId },
          data: { placed: false },
        });
      }
    }

    await logActivity(req.user.id, 'UPDATE', 'Application', app.id, `${status} - ${app.user?.name} for ${app.drive?.company}`);
    res.json({ application: app });
  } catch (e) {
    console.error('updateApplication error:', e);
    res.status(404).json({ message: 'Application not found.' });
  }
};

export const bulkUpdateApplications = async (req, res) => {
  const { ids, status } = req.body;
  if (!ids || !ids.length || !status) {
    return res.status(400).json({ message: 'IDs and status are required.' });
  }
  try {
    await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    if (status === 'Selected') {
      const apps = await prisma.application.findMany({ where: { id: { in: ids } }, select: { userId: true } });
      for (const app of apps) {
        await prisma.student.updateMany({
          where: { userId: app.userId },
          data: { placed: true, placedAt: new Date().toISOString().split('T')[0] },
        });
      }
    }
    await logActivity(req.user.id, 'BULK_UPDATE', 'Application', null, `Bulk ${status} for ${ids.length} applications`);
    res.json({ message: `${ids.length} applications updated to ${status}.` });
  } catch (e) {
    console.error('bulkUpdateApplications error:', e);
    res.status(500).json({ message: 'Failed to bulk update applications.' });
  }
};

/* ─────────────── COMPANIES ─────────────── */

export const listCompanies = async (req, res) => {
  const { search } = req.query;
  try {
    const companies = await prisma.company.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { role: { contains: search } },
          { location: { contains: search } },
        ],
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ companies: companies.map(c => ({
      ...c,
      hiringProcess: c.hiringProcess ? JSON.parse(c.hiringProcess) : [],
      rounds: c.rounds ? JSON.parse(c.rounds) : [],
      requirements: c.requirements ? JSON.parse(c.requirements) : [],
    }))});
  } catch (e) {
    console.error('listCompanies error:', e);
    res.status(500).json({ message: 'Failed to load companies.', companies: [] });
  }
};

export const getCompany = async (req, res) => {
  try {
    const c = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ message: 'Company not found.' });
    res.json({ company: {
      ...c,
      hiringProcess: c.hiringProcess ? JSON.parse(c.hiringProcess) : [],
      rounds: c.rounds ? JSON.parse(c.rounds) : [],
      requirements: c.requirements ? JSON.parse(c.requirements) : [],
    }});
  } catch (e) {
    res.status(404).json({ message: 'Company not found.' });
  }
};

export const addCompany = async (req, res) => {
  const { name, role, package: pkg, location, type, about, eligible, hiringProcess, rounds, requirements, website } = req.body;
  if (!name || !role || !pkg || !location) {
    return res.status(400).json({ message: 'Name, role, package and location are required.' });
  }
  try {
    const company = await prisma.company.create({
      data: {
        name, role, package: pkg, location,
        type: type || 'Product',
        about: about || null,
        eligible: eligible !== false,
        hiringProcess: hiringProcess ? JSON.stringify(hiringProcess) : null,
        rounds: rounds ? JSON.stringify(rounds) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        website: website || null,
        logo: name.slice(0, 2).toUpperCase(),
      },
    });
    await logActivity(req.user.id, 'CREATE', 'Company', company.id, `Added ${name}`);
    res.status(201).json({ company: { ...company, hiringProcess: hiringProcess || [], rounds: rounds || [], requirements: requirements || [] } });
  } catch (e) {
    console.error('addCompany error:', e);
    res.status(500).json({ message: 'Failed to create company.' });
  }
};

export const editCompany = async (req, res) => {
  try {
    const { hiringProcess, rounds, requirements, ...rest } = req.body;
    const data = { ...rest };
    if (hiringProcess !== undefined) data.hiringProcess = JSON.stringify(hiringProcess);
    if (rounds !== undefined) data.rounds = JSON.stringify(rounds);
    if (requirements !== undefined) data.requirements = JSON.stringify(requirements);

    const updated = await prisma.company.update({ where: { id: req.params.id }, data });
    await logActivity(req.user.id, 'UPDATE', 'Company', req.params.id, `Updated ${updated.name}`);
    res.json({ company: {
      ...updated,
      hiringProcess: updated.hiringProcess ? JSON.parse(updated.hiringProcess) : [],
      rounds: updated.rounds ? JSON.parse(updated.rounds) : [],
      requirements: updated.requirements ? JSON.parse(updated.requirements) : [],
    }});
  } catch (e) {
    console.error('editCompany error:', e);
    res.status(404).json({ message: 'Company not found.' });
  }
};

export const removeCompany = async (req, res) => {
  try {
    const c = await prisma.company.findUnique({ where: { id: req.params.id } });
    await prisma.company.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'Company', req.params.id, `Removed ${c?.name}`);
    res.json({ message: 'Company deleted.' });
  } catch (e) {
    console.error('removeCompany error:', e);
    res.status(404).json({ message: 'Company not found.' });
  }
};

/* ─────────────── QUESTIONS ─────────────── */

export const listQuestions = async (req, res) => {
  const { search, category, type, difficulty } = req.query;
  try {
    const where = {};
    if (search) where.OR = [{ question: { contains: search } }, { category: { contains: search } }];
    if (category) where.category = category;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ questions: questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }))});
  } catch (e) {
    console.error('listQuestions error:', e);
    res.status(500).json({ message: 'Failed to load questions.', questions: [] });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const q = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!q) return res.status(404).json({ message: 'Question not found.' });
    res.json({ question: { ...q, options: q.options ? JSON.parse(q.options) : null } });
  } catch (e) {
    res.status(404).json({ message: 'Question not found.' });
  }
};

export const addQuestion = async (req, res) => {
  const { category, difficulty, question, options, answer, explanation, type } = req.body;
  if (!category || !difficulty || !question) {
    return res.status(400).json({ message: 'Category, difficulty and question are required.' });
  }
  try {
    const created = await prisma.question.create({
      data: {
        category, difficulty, question,
        options: options ? JSON.stringify(options) : null,
        answer: answer || null,
        explanation: explanation || null,
        type: type || 'Technical',
      },
    });
    await logActivity(req.user.id, 'CREATE', 'Question', created.id, `Added ${type || 'Technical'} question`);
    res.status(201).json({ question: { ...created, options: options || null } });
  } catch (e) {
    console.error('addQuestion error:', e);
    res.status(500).json({ message: 'Failed to create question.' });
  }
};

export const editQuestion = async (req, res) => {
  try {
    const { options, ...rest } = req.body;
    const data = { ...rest };
    if (options !== undefined) data.options = JSON.stringify(options);

    const updated = await prisma.question.update({ where: { id: req.params.id }, data });
    res.json({ question: { ...updated, options: updated.options ? JSON.parse(updated.options) : null } });
  } catch (e) {
    console.error('editQuestion error:', e);
    res.status(404).json({ message: 'Question not found.' });
  }
};

export const removeQuestion = async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ message: 'Question deleted.' });
  } catch (e) {
    console.error('removeQuestion error:', e);
    res.status(404).json({ message: 'Question not found.' });
  }
};

/* ─────────────── NOTIFICATIONS ─────────────── */

export const listNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notifications });
  } catch (e) {
    console.error('listNotifications error:', e);
    res.status(500).json({ message: 'Failed to load notifications.', notifications: [] });
  }
};

export const createNotification = async (req, res) => {
  const { title, message, type, target } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }
  try {
    const notif = await prisma.notification.create({
      data: {
        title, message,
        type: type || 'general',
        target: target || 'all',
      },
    });
    await logActivity(req.user.id, 'CREATE', 'Notification', notif.id, `Published: ${title}`);
    res.status(201).json({ notification: notif });
  } catch (e) {
    console.error('createNotification error:', e);
    res.status(500).json({ message: 'Failed to create notification.' });
  }
};

export const removeNotification = async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: 'Notification deleted.' });
  } catch (e) {
    res.status(404).json({ message: 'Notification not found.' });
  }
};

/* ─────────────── REPORTS ─────────────── */

export const fetchReports = async (req, res) => {
  try {
    const [totalStudents, placedStudents, totalDrives, activeDrives, totalCompanies, totalQuestions] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { placed: true } }),
      prisma.drive.count(),
      prisma.drive.count({ where: { status: 'Ongoing' } }),
      prisma.company.count(),
      prisma.question.count(),
    ]);

    // Branch-wise
    const allStudents = await prisma.student.findMany({ select: { branch: true, placed: true, package: true } });
    const branchMap = {};
    allStudents.forEach(s => {
      const b = s.branch || 'Other';
      if (!branchMap[b]) branchMap[b] = { total: 0, placed: 0 };
      branchMap[b].total++;
      if (s.placed) branchMap[b].placed++;
    });
    const branchWisePlacementRate = Object.entries(branchMap).map(([branch, v]) => ({
      branch, placed: v.placed, total: v.total,
    }));

    // Package stats
    const packages = allStudents.filter(s => s.placed && s.package).map(s => parseFloat(s.package)).filter(p => !isNaN(p));
    const avgPkg = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1) + ' LPA' : 'N/A';
    const highPkg = packages.length > 0 ? Math.max(...packages).toFixed(1) + ' LPA' : 'N/A';

    // Company-wise offers from applications
    const selectedApps = await prisma.application.findMany({
      where: { status: 'Selected' },
      include: { drive: { select: { company: true } } },
    });
    const companyOfferMap = {};
    selectedApps.forEach(a => {
      const co = a.drive?.company || 'Unknown';
      companyOfferMap[co] = (companyOfferMap[co] || 0) + 1;
    });
    const companyWiseOffers = Object.entries(companyOfferMap)
      .map(([company, offers]) => ({ company, offers }))
      .sort((a, b) => b.offers - a.offers)
      .slice(0, 8);

    // Monthly trend (last 6 months from applications)
    const now = new Date();
    const historicalTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await prisma.application.count({
        where: { status: 'Selected', appliedAt: { gte: start, lte: end } },
      });
      historicalTrend.push({ month: monthName, placed: count });
    }

    res.json({
      summary: {
        totalStudents,
        placedStudents,
        placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) + '%' : '0%',
        averagePackage: avgPkg,
        highestPackage: highPkg,
        activeDrives,
        totalCompanies,
        totalQuestions,
      },
      totalEligible: totalStudents,
      totalPlaced: placedStudents,
      averagePackage: avgPkg,
      highestPackage: highPkg,
      branchWisePlacementRate,
      companyWiseOffers: companyWiseOffers.length ? companyWiseOffers : [
        { company: 'No Data', offers: 0 },
      ],
      historicalTrend,
    });
  } catch (e) {
    console.error('fetchReports error:', e);
    res.status(500).json({ message: 'Failed to load reports.' });
  }
};

/* ─────────────── ACTIVITY LOGS ─────────────── */

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ logs });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load activity logs.', logs: [] });
  }
};

/* ─────────────── ADMIN SETTINGS ─────────────── */

export const getAdminProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load profile.' });
  }
};

export const updateAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    await prisma.user.update({ where: { id: req.user.id }, data: { password: newPassword } });
    await logActivity(req.user.id, 'UPDATE', 'AdminPassword', req.user.id, 'Password changed');
    res.json({ message: 'Password updated successfully.' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update password.' });
  }
};

/* ─────────────── APTITUDE TEST MANAGEMENT ─────────────── */

export const listAptitudeTests = async (req, res) => {
  try {
    const tests = await prisma.aptitudeTest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ tests: tests.map(t => ({
      ...t,
      questionsData: (() => { try { return JSON.parse(t.questionsData || '[]'); } catch { return []; } })(),
    })) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load tests.', tests: [] });
  }
};

export const createAptitudeTest = async (req, res) => {
  const { title, category, difficulty, duration, questionsData } = req.body;
  if (!title || !category || !questionsData) {
    return res.status(400).json({ message: 'Title, category, and questions are required.' });
  }
  try {
    const test = await prisma.aptitudeTest.create({
      data: {
        title,
        category,
        difficulty: difficulty || 'Medium',
        duration: parseInt(duration) || 15,
        totalQuestions: questionsData.length,
        questionsData: JSON.stringify(questionsData),
      },
    });
    await logActivity(req.user.id, 'CREATE', 'AptitudeTest', test.id, `Created test: ${title}`);
    res.status(201).json({ test });
  } catch (e) {
    console.error('createAptitudeTest error:', e);
    res.status(500).json({ message: 'Failed to create test.' });
  }
};

export const updateAptitudeTest = async (req, res) => {
  const { title, category, difficulty, duration, questionsData } = req.body;
  try {
    const updated = await prisma.aptitudeTest.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(duration && { duration: parseInt(duration) }),
        ...(questionsData && {
          questionsData: JSON.stringify(questionsData),
          totalQuestions: questionsData.length,
        }),
      },
    });
    await logActivity(req.user.id, 'UPDATE', 'AptitudeTest', req.params.id, `Updated: ${updated.title}`);
    res.json({ test: updated });
  } catch (e) {
    res.status(404).json({ message: 'Test not found.' });
  }
};

export const deleteAptitudeTest = async (req, res) => {
  try {
    await prisma.aptitudeTest.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'AptitudeTest', req.params.id, 'Deleted aptitude test');
    res.json({ message: 'Test deleted.' });
  } catch (e) {
    res.status(404).json({ message: 'Test not found.' });
  }
};

export const getAptitudeTestResults = async (req, res) => {
  try {
    const results = await prisma.aptitudeResult.findMany({
      where: req.params.testId ? { testId: req.params.testId } : undefined,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' },
      take: 100,
    });
    res.json({ results: results.map(r => ({
      ...r,
      breakdown: (() => { try { return JSON.parse(r.breakdown || '[]'); } catch { return []; } })(),
      studentName: r.user?.name || 'Unknown',
      studentEmail: r.user?.email || '',
    })) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load results.', results: [] });
  }
};

/* ─────────────── CODING PROBLEM MANAGEMENT ─────────────── */

export const listCodingProblems = async (req, res) => {
  try {
    const problems = await prisma.codingProblem.findMany({ orderBy: { createdAt: 'asc' } });
    const [solvedCounts, submissionCounts] = await Promise.all([
      prisma.solvedProblem.groupBy({ by: ['problemId'], _count: { userId: true } }),
      prisma.codingSubmission.groupBy({ by: ['problemId'], _count: { id: true } }),
    ]);
    const solvedMap = Object.fromEntries(solvedCounts.map(s => [s.problemId, s._count.userId]));
    const subMap = Object.fromEntries(submissionCounts.map(s => [s.problemId, s._count.id]));

    res.json({ problems: problems.map(p => ({
      ...p,
      examples: (() => { try { return JSON.parse(p.examples || '[]'); } catch { return []; } })(),
      constraints: (() => { try { return JSON.parse(p.constraints || '[]'); } catch { return []; } })(),
      starterCode: (() => { try { return JSON.parse(p.starterCode || '{}'); } catch { return {}; } })(),
      testCases: (() => { try { return JSON.parse(p.testCases || '[]'); } catch { return []; } })(),
      companies: (() => { try { return JSON.parse(p.companies || '[]'); } catch { return []; } })(),
      solvedCount: solvedMap[p.id] || 0,
      submissionCount: subMap[p.id] || 0,
    })) });
  } catch (e) {
    console.error('admin listCodingProblems error:', e);
    res.status(500).json({ message: 'Failed to load problems.', problems: [] });
  }
};

export const createCodingProblem = async (req, res) => {
  const { title, difficulty, category, description, examples, constraints, starterCode, testCases, companies, acceptance } = req.body;
  if (!title || !difficulty || !category || !description) {
    return res.status(400).json({ message: 'Title, difficulty, category, and description are required.' });
  }
  try {
    const problem = await prisma.codingProblem.create({
      data: {
        title, difficulty, category, description,
        examples: JSON.stringify(examples || []),
        constraints: JSON.stringify(constraints || []),
        starterCode: JSON.stringify(starterCode || {}),
        testCases: JSON.stringify(testCases || []),
        companies: JSON.stringify(companies || []),
        acceptance: acceptance || null,
      },
    });
    await logActivity(req.user.id, 'CREATE', 'CodingProblem', problem.id, `Created: ${title}`);
    res.status(201).json({ problem });
  } catch (e) {
    console.error('createCodingProblem error:', e);
    res.status(500).json({ message: 'Failed to create problem.' });
  }
};

export const updateCodingProblem = async (req, res) => {
  const { title, difficulty, category, description, examples, constraints, starterCode, testCases, companies, acceptance } = req.body;
  try {
    const updated = await prisma.codingProblem.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
        ...(description && { description }),
        ...(examples !== undefined && { examples: JSON.stringify(examples) }),
        ...(constraints !== undefined && { constraints: JSON.stringify(constraints) }),
        ...(starterCode !== undefined && { starterCode: JSON.stringify(starterCode) }),
        ...(testCases !== undefined && { testCases: JSON.stringify(testCases) }),
        ...(companies !== undefined && { companies: JSON.stringify(companies) }),
        ...(acceptance !== undefined && { acceptance }),
      },
    });
    await logActivity(req.user.id, 'UPDATE', 'CodingProblem', req.params.id, `Updated: ${updated.title}`);
    res.json({ problem: updated });
  } catch (e) {
    res.status(404).json({ message: 'Problem not found.' });
  }
};

export const deleteCodingProblem = async (req, res) => {
  try {
    await prisma.codingProblem.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'CodingProblem', req.params.id, 'Deleted coding problem');
    res.json({ message: 'Problem deleted.' });
  } catch (e) {
    res.status(404).json({ message: 'Problem not found.' });
  }
};

/* ─────────────── INTERVIEW TOPIC MANAGEMENT ─────────────── */

export const listInterviewTopics = async (req, res) => {
  try {
    const topics = await prisma.interviewTopic.findMany({ orderBy: { createdAt: 'desc' } });
    const sessionCounts = await prisma.interviewSession.groupBy({ by: ['topicId'], _count: { id: true } });
    const sessionMap = Object.fromEntries(sessionCounts.map(s => [s.topicId, s._count.id]));
    res.json({ topics: topics.map(t => ({
      ...t,
      questions: (() => { try { return JSON.parse(t.questions || '[]'); } catch { return []; } })(),
      sessionCount: sessionMap[t.id] || 0,
    })) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load topics.', topics: [] });
  }
};

export const createInterviewTopic = async (req, res) => {
  const { title, category, icon, questions } = req.body;
  if (!title || !category || !questions?.length) {
    return res.status(400).json({ message: 'Title, category, and at least one question are required.' });
  }
  try {
    const topic = await prisma.interviewTopic.create({
      data: {
        title, category,
        icon: icon || '💬',
        questionCount: questions.length,
        questions: JSON.stringify(questions),
      },
    });
    await logActivity(req.user.id, 'CREATE', 'InterviewTopic', topic.id, `Created topic: ${title}`);
    res.status(201).json({ topic });
  } catch (e) {
    console.error('createInterviewTopic error:', e);
    res.status(500).json({ message: 'Failed to create topic.' });
  }
};

export const updateInterviewTopic = async (req, res) => {
  const { title, category, icon, questions } = req.body;
  try {
    const updated = await prisma.interviewTopic.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(category && { category }),
        ...(icon && { icon }),
        ...(questions !== undefined && { questions: JSON.stringify(questions), questionCount: questions.length }),
      },
    });
    await logActivity(req.user.id, 'UPDATE', 'InterviewTopic', req.params.id, `Updated: ${updated.title}`);
    res.json({ topic: updated });
  } catch (e) {
    res.status(404).json({ message: 'Topic not found.' });
  }
};

export const deleteInterviewTopic = async (req, res) => {
  try {
    await prisma.interviewTopic.delete({ where: { id: req.params.id } });
    await logActivity(req.user.id, 'DELETE', 'InterviewTopic', req.params.id, 'Deleted interview topic');
    res.json({ message: 'Topic deleted.' });
  } catch (e) {
    res.status(404).json({ message: 'Topic not found.' });
  }
};

/* ─────────────── STUDENT PERFORMANCE TRACKING ─────────────── */

export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    let targetUserId = studentId;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
      if (student.userId) {
        targetUserId = student.userId;
      } else {
        const u = await prisma.user.findUnique({ where: { email: student.email } });
        if (u) targetUserId = u.id;
      }
    }

    const [aptitudeResults, codingSubmissions, interviewSessions, progress, solvedProblems] = await Promise.all([
      prisma.aptitudeResult.findMany({ where: { userId: targetUserId }, orderBy: { date: 'desc' } }),
      prisma.codingSubmission.findMany({ where: { userId: targetUserId }, orderBy: { submittedAt: 'desc' }, take: 20 }),
      prisma.interviewSession.findMany({ where: { userId: targetUserId }, orderBy: { completedAt: 'desc' } }),
      prisma.progress.findUnique({ where: { userId: targetUserId } }),
      prisma.solvedProblem.count({ where: { userId: targetUserId } }),
    ]);

    const avgAptitude = aptitudeResults.length
      ? Math.round(aptitudeResults.reduce((a, r) => a + r.score, 0) / aptitudeResults.length)
      : 0;

    const avgInterview = interviewSessions.length
      ? Math.round(interviewSessions.reduce((a, s) => a + (s.score || 0), 0) / interviewSessions.length)
      : 0;

    res.json({
      progress,
      solvedProblems,
      avgAptitude,
      avgInterview,
      aptitudeResults: aptitudeResults.slice(0, 10).map(r => ({
        ...r,
        breakdown: (() => { try { return JSON.parse(r.breakdown); } catch { return []; } })(),
      })),
      codingSubmissions: codingSubmissions.map(s => ({ ...s })),
      interviewSessions: interviewSessions.slice(0, 5).map(s => ({
        ...s,
        feedback: (() => { try { return JSON.parse(s.feedback || '{}'); } catch { return {}; } })(),
      })),
    });
  } catch (e) {
    console.error('getStudentPerformance error:', e);
    res.status(500).json({ message: 'Failed to load student performance.' });
  }
};


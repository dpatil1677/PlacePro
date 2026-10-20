import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { getAllStudents } from '../data/students.js';
import { getAllDrives } from '../data/drives.js';
import { getAllQuestions } from '../data/questions.js';
import { companies } from '../data/companies.js';
import { problems } from '../data/coding.js';
import { tests } from '../data/aptitude.js';
import { topics } from '../data/interviews.js';
import { getResumeByUserId } from '../data/resumes.js';
import { getProgressByUserId } from '../data/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Users
  const usersPath = join(__dirname, '../data/users.json');
  const rawUsers = JSON.parse(readFileSync(usersPath, 'utf-8'));

  for (const u of rawUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        role: u.role,
        college: u.college,
        branch: u.branch,
        gradYear: u.gradYear,
      },
      create: {
        id: String(u.id),
        email: u.email,
        password: u.password,
        role: u.role,
        name: u.name,
        college: u.college,
        branch: u.branch,
        gradYear: u.gradYear,
      },
    });
  }
  console.log(`✅ Seeded ${rawUsers.length} users`);

  // 2. Resumes
  const userIdsWithResumes = ['1', '1791262201154'];
  for (const uid of userIdsWithResumes) {
    const resData = getResumeByUserId(uid);
    if (resData) {
      const user = await prisma.user.findUnique({ where: { id: uid } });
      if (user) {
        await prisma.resume.upsert({
          where: { userId: uid },
          update: {
            fullName: resData.personal?.fullName || user.name,
            email: resData.personal?.email || user.email,
            phone: resData.personal?.phone || '',
            location: resData.personal?.location || '',
            linkedin: resData.personal?.linkedin || '',
            github: resData.personal?.github || '',
            summary: resData.summary || '',
            education: JSON.stringify(resData.education || []),
            projects: JSON.stringify(resData.projects || []),
            technicalSkills: JSON.stringify(resData.technicalSkills || {}),
            skills: JSON.stringify(resData.skills || []),
            certifications: JSON.stringify(resData.certifications || []),
            experience: JSON.stringify(resData.experience || []),
          },
          create: {
            userId: uid,
            fullName: resData.personal?.fullName || user.name,
            email: resData.personal?.email || user.email,
            phone: resData.personal?.phone || '',
            location: resData.personal?.location || '',
            linkedin: resData.personal?.linkedin || '',
            github: resData.personal?.github || '',
            summary: resData.summary || '',
            education: JSON.stringify(resData.education || []),
            projects: JSON.stringify(resData.projects || []),
            technicalSkills: JSON.stringify(resData.technicalSkills || {}),
            skills: JSON.stringify(resData.skills || []),
            certifications: JSON.stringify(resData.certifications || []),
            experience: JSON.stringify(resData.experience || []),
          },
        });
      }
    }
  }
  console.log(`✅ Seeded resumes`);

  // 3. Progress
  for (const uid of userIdsWithResumes) {
    const prog = getProgressByUserId(uid);
    if (prog) {
      const user = await prisma.user.findUnique({ where: { id: uid } });
      if (user) {
        await prisma.progress.upsert({
          where: { userId: uid },
          update: {
            readinessScore: prog.readinessScore || 0,
            resumeProgress: prog.resumeProgress || 0,
            aptitudeProgress: prog.aptitudeProgress || 0,
            codingProgress: prog.codingProgress || 0,
            interviewProgress: prog.interviewProgress || 0,
            roadmap: JSON.stringify(prog.roadmap || []),
            achievements: JSON.stringify(prog.achievements || []),
          },
          create: {
            userId: uid,
            readinessScore: prog.readinessScore || 0,
            resumeProgress: prog.resumeProgress || 0,
            aptitudeProgress: prog.aptitudeProgress || 0,
            codingProgress: prog.codingProgress || 0,
            interviewProgress: prog.interviewProgress || 0,
            roadmap: JSON.stringify(prog.roadmap || []),
            achievements: JSON.stringify(prog.achievements || []),
          },
        });
      }
    }
  }
  console.log(`✅ Seeded progress data`);

  // 4. Students Directory
  const allStudents = getAllStudents();
  for (const s of allStudents) {
    await prisma.student.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        branch: s.branch,
        gradYear: s.gradYear,
        readiness: s.readiness || 0,
        status: s.status || 'Active',
        avatar: s.avatar || s.name[0],
      },
      create: {
        id: s.id,
        name: s.name,
        email: s.email,
        branch: s.branch,
        gradYear: s.gradYear,
        readiness: s.readiness || 0,
        status: s.status || 'Active',
        avatar: s.avatar || s.name[0],
      },
    });
  }
  console.log(`✅ Seeded ${allStudents.length} directory students`);

  // 5. Drives
  const allDrives = getAllDrives();
  for (const d of allDrives) {
    await prisma.drive.upsert({
      where: { id: d.id },
      update: {
        company: d.company,
        abbr: d.abbr,
        title: d.title,
        status: d.status,
        date: d.date,
        eligibility: d.eligibility,
        package: d.package,
        registered: d.registered || 0,
      },
      create: {
        id: d.id,
        company: d.company,
        abbr: d.abbr,
        title: d.title,
        status: d.status,
        date: d.date,
        eligibility: d.eligibility,
        package: d.package,
        registered: d.registered || 0,
      },
    });
  }
  console.log(`✅ Seeded ${allDrives.length} recruitment drives`);

  // 6. Questions
  const allQuestions = getAllQuestions();
  for (const q of allQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        category: q.category,
        difficulty: q.difficulty,
        question: q.question,
      },
      create: {
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        question: q.question,
      },
    });
  }
  console.log(`✅ Seeded ${allQuestions.length} questions`);

  // 7. Companies
  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        logo: c.logo,
        role: c.category || 'Software Engineer',
        package: c.package || '4-10 LPA',
        location: c.industry || 'Pan-India',
        type: c.difficulty === 'Hard' ? 'Product' : 'Service',
        about: c.description,
        hiringProcess: JSON.stringify(c.hiringProcess || []),
        rounds: JSON.stringify(c.interviewQuestions || []),
        requirements: JSON.stringify(c.preparationTips || []),
      },
      create: {
        id: c.id,
        name: c.name,
        logo: c.logo,
        role: c.category || 'Software Engineer',
        package: c.package || '4-10 LPA',
        location: c.industry || 'Pan-India',
        type: c.difficulty === 'Hard' ? 'Product' : 'Service',
        about: c.description,
        hiringProcess: JSON.stringify(c.hiringProcess || []),
        rounds: JSON.stringify(c.interviewQuestions || []),
        requirements: JSON.stringify(c.preparationTips || []),
      },
    });
  }
  console.log(`✅ Seeded ${companies.length} companies`);

  // 8. Coding Problems
  for (const p of problems) {
    await prisma.codingProblem.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        difficulty: p.difficulty,
        category: p.topic,
        description: p.description,
        examples: JSON.stringify(p.examples || []),
        constraints: JSON.stringify(p.constraints || []),
        starterCode: JSON.stringify(p.starterCode || {}),
      },
      create: {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        category: p.topic,
        description: p.description,
        examples: JSON.stringify(p.examples || []),
        constraints: JSON.stringify(p.constraints || []),
        starterCode: JSON.stringify(p.starterCode || {}),
      },
    });
  }
  console.log(`✅ Seeded ${problems.length} coding problems`);

  // 9. Aptitude Tests
  for (const t of tests) {
    await prisma.aptitudeTest.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        category: t.category,
        duration: t.duration || 15,
        totalQuestions: t.questions || (t.questions_data ? t.questions_data.length : 10),
        questionsData: JSON.stringify(t.questions_data || []),
      },
      create: {
        id: t.id,
        title: t.title,
        category: t.category,
        duration: t.duration || 15,
        totalQuestions: t.questions || (t.questions_data ? t.questions_data.length : 10),
        questionsData: JSON.stringify(t.questions_data || []),
      },
    });
  }
  console.log(`✅ Seeded ${tests.length} aptitude tests`);

  // 10. Interview Topics
  for (const top of topics) {
    await prisma.interviewTopic.upsert({
      where: { id: top.id },
      update: {
        title: top.title,
        category: top.category,
        icon: top.icon,
        questionCount: top.questions ? top.questions.length : 5,
        questions: JSON.stringify(top.questions || []),
      },
      create: {
        id: top.id,
        title: top.title,
        category: top.category,
        icon: top.icon,
        questionCount: top.questions ? top.questions.length : 5,
        questions: JSON.stringify(top.questions || []),
      },
    });
  }
  console.log(`✅ Seeded ${topics.length} interview topics`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

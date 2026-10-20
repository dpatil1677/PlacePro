import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Save,
  CheckCircle,
  Award,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { resumeApi } from '../services/studentService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/student.css';

const TABS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'summary', label: 'Summary' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Technical Skills' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'experience', label: 'Experience' },
];

const SAMPLE_DHRUV_RESUME = {
  personal: {
    fullName: 'Dhruv Patil',
    email: 'dhruvpatil1677@gmail.com',
    phone: '+91 9328027022',
    location: '',
    linkedin: 'linkedin.com/in/dhruv-patil-6154803b1',
    github: 'github.com/dpatil1677',
  },
  summary:
    'Computer Engineering student (9.22/10 CGPA) and aspiring Full-Stack Web Developer with hands-on experience building web applications using React, Node.js, Express, Laravel, PHP, and MySQL. Skilled in designing RESTful APIs, relational database schemas, JWT authentication, and responsive user interfaces. Focused on clean software architecture, backend API design, and delivering scalable web platforms.',
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
    'JavaScript (ES6+)',
    'PHP',
    'SQL',
    'HTML5',
    'CSS3',
    'Python',
    'React.js',
    'Tailwind CSS',
    'Bootstrap',
    'Node.js',
    'Express.js',
    'Laravel',
    'MySQL',
    'MongoDB',
    'Git',
    'GitHub',
    'Postman',
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
};

function normalizeResumeData(data) {
  if (!data) return SAMPLE_DHRUV_RESUME;
  return {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      ...(data.personal || {}),
    },
    summary: data.summary || '',
    education: Array.isArray(data.education) ? data.education : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    technicalSkills: {
      languages: '',
      frontend: '',
      backend: '',
      databases: '',
      tools: '',
      ...(data.technicalSkills || {}),
    },
    skills: Array.isArray(data.skills) ? data.skills : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
  };
}

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [resumeData, setResumeData] = useState(SAMPLE_DHRUV_RESUME);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const resumePreviewRef = useRef(null);

  useEffect(() => {
    resumeApi
      .get()
      .then((data) => {
        if (data && (data.personal?.fullName || data.education?.length > 0 || data.projects?.length > 0)) {
          setResumeData(normalizeResumeData(data));
        } else {
          setResumeData(SAMPLE_DHRUV_RESUME);
        }
      })
      .catch(() => {
        setResumeData(SAMPLE_DHRUV_RESUME);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChangePersonal = (field, val) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: val },
    }));
  };

  // Education Handlers
  const handleAddEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: 'edu_' + Date.now(),
          institution: '',
          degree: '',
          field: '',
          startYear: '',
          endYear: '',
          cgpa: '',
          bullets: [''],
        },
      ],
    }));
  };

  const handleUpdateEducation = (index, field, val) => {
    setResumeData((prev) => {
      const list = [...prev.education];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, education: list };
    });
  };

  const handleUpdateEducationBullets = (index, text) => {
    const bullets = text.split('\n');
    setResumeData((prev) => {
      const list = [...prev.education];
      list[index] = { ...list[index], bullets };
      return { ...prev, education: list };
    });
  };

  const handleRemoveEducation = (index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Projects Handlers
  const handleAddProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: 'proj_' + Date.now(),
          title: '',
          techStack: '',
          bullets: [''],
        },
      ],
    }));
  };

  const handleUpdateProject = (index, field, val) => {
    setResumeData((prev) => {
      const list = [...prev.projects];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, projects: list };
    });
  };

  const handleUpdateProjectBullets = (index, text) => {
    const bullets = text.split('\n');
    setResumeData((prev) => {
      const list = [...prev.projects];
      list[index] = { ...list[index], bullets };
      return { ...prev, projects: list };
    });
  };

  const handleRemoveProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Technical Skills Handlers
  const handleUpdateTechnicalSkills = (category, val) => {
    setResumeData((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        [category]: val,
      },
    }));
  };

  // Skill tags Handlers
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
        setResumeData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill.trim()],
        }));
        setNewSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Certifications Handlers
  const handleAddCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: 'cert_' + Date.now(),
          name: '',
          issuer: '',
          date: '',
        },
      ],
    }));
  };

  const handleUpdateCertification = (index, field, val) => {
    setResumeData((prev) => {
      const list = [...prev.certifications];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, certifications: list };
    });
  };

  const handleRemoveCertification = (index) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: 'exp_' + Date.now(),
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
          bullets: [''],
        },
      ],
    }));
  };

  const handleUpdateExperience = (index, field, val) => {
    setResumeData((prev) => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: val };
      return { ...prev, experience: exp };
    });
  };

  const handleUpdateExperienceBullets = (index, text) => {
    const bullets = text.split('\n');
    setResumeData((prev) => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], bullets };
      return { ...prev, experience: exp };
    });
  };

  const handleRemoveExperience = (index) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await resumeApi.update(resumeData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('Failed to save resume draft');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSample = () => {
    if (window.confirm('Load sample resume data (Dhruv Patil template)? Any unsaved edits will be replaced.')) {
      setResumeData(SAMPLE_DHRUV_RESUME);
    }
  };

  // High-Resolution PDF Download
  const handleExport = async () => {
    const input = document.getElementById('resume-preview-doc');
    if (!input) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const filename = `${(resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(filename);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF. Please use "Print / Save as PDF" button as a quick alternative.');
    } finally {
      setExporting(false);
    }
  };

  // Native Vector Browser Print / PDF
  const handlePrint = () => {
    const input = document.getElementById('resume-preview-doc');
    if (!input) return;

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.personal.fullName || 'Resume'} - Resume</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0.42in;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Segoe UI', 'Calibri', 'Arial', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
              color: #000000;
              background: #ffffff;
              font-size: 11.5px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .ats-resume-sheet {
              width: 100%;
              max-width: 100%;
              padding: 0;
              border: none !important;
              box-shadow: none !important;
            }
            .ats-resume-header {
              text-align: center;
              margin-bottom: 12px;
            }
            .ats-resume-name {
              font-size: 22px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              color: #000000;
              margin-bottom: 4px;
            }
            .ats-resume-contact {
              font-size: 11px;
              color: #222222;
              margin-bottom: 12px;
            }
            .ats-contact-link {
              color: #0a66c2;
              text-decoration: none;
            }
            .ats-contact-sep {
              margin: 0 5px;
              color: #333333;
            }
            .ats-resume-section {
              margin-bottom: 9px;
            }
            .ats-section-heading {
              font-size: 12.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              color: #000000;
              margin-bottom: 2px;
            }
            .ats-section-divider {
              border-bottom: 1.2px solid #000000;
              margin-bottom: 5px;
            }
            .ats-summary-text {
              font-size: 11.3px;
              line-height: 1.42;
              color: #111827;
              text-align: justify;
            }
            .ats-entry {
              margin-bottom: 6px;
            }
            .ats-entry-header {
              font-size: 11.5px;
              line-height: 1.35;
              margin-bottom: 2px;
              color: #000000;
            }
            .ats-entry-title {
              font-weight: 700;
              color: #000000;
            }
            .ats-entry-pipe {
              margin: 0 4px;
              color: #333333;
            }
            .ats-entry-meta {
              color: #222222;
            }
            .ats-entry-meta-italic {
              font-style: italic;
              color: #374151;
            }
            .ats-entry-desc {
              font-size: 11.3px;
              line-height: 1.38;
              color: #1f2937;
              margin-top: 2px;
            }
            .ats-bullets {
              list-style-type: disc;
              margin: 2px 0 4px 17px;
              padding: 0;
            }
            .ats-bullets li {
              font-size: 11.3px;
              line-height: 1.38;
              color: #111827;
              margin-bottom: 2px;
            }
            .ats-skills-content {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .ats-skill-row {
              font-size: 11.3px;
              line-height: 1.42;
              color: #111827;
            }
            .ats-skill-label {
              font-weight: 700;
              color: #000000;
            }
            .ats-skill-text {
              color: #111827;
            }
          </style>
        </head>
        <body>
          ${input.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    printIframe.contentWindow.focus();
    setTimeout(() => {
      printIframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 1500);
    }, 300);
  };

  // Calculate ATS Score
  const computeATS = () => {
    let score = 0;
    const { personal, summary, experience, education, projects, technicalSkills, skills } = resumeData;
    if (personal?.fullName && personal?.email && personal?.phone) score += 20;
    if (personal?.linkedin || personal?.github) score += 10;
    if (summary && summary.trim().length > 30) score += 15;
    if (projects && projects.length > 0) score += 20;
    if (experience && experience.length > 0) score += 10;
    if (education && education.length > 0) score += 15;
    const hasTechSkills =
      (technicalSkills && Object.values(technicalSkills).some((v) => v && v.trim().length > 0)) ||
      (skills && skills.length >= 5);
    if (hasTechSkills) score += 10;
    return Math.min(100, score);
  };

  const atsScore = computeATS();

  // Prepare contact items for header
  const contactParts = [];
  if (resumeData.personal.email) {
    contactParts.push({
      label: resumeData.personal.email,
      href: `mailto:${resumeData.personal.email}`,
      isLink: false,
    });
  }
  if (resumeData.personal.phone) {
    contactParts.push({
      label: resumeData.personal.phone,
      href: `tel:${resumeData.personal.phone}`,
      isLink: false,
    });
  }
  if (resumeData.personal.location) {
    contactParts.push({
      label: resumeData.personal.location,
      href: '',
      isLink: false,
    });
  }
  if (resumeData.personal.linkedin) {
    const raw = resumeData.personal.linkedin.replace(/^https?:\/\//i, '');
    contactParts.push({
      label: raw,
      href: `https://${raw}`,
      isLink: true,
    });
  }
  if (resumeData.personal.github) {
    const raw = resumeData.personal.github.replace(/^https?:\/\//i, '');
    contactParts.push({
      label: raw,
      href: `https://${raw}`,
      isLink: true,
    });
  }

  const hasCategorizedSkills =
    resumeData.technicalSkills &&
    Object.values(resumeData.technicalSkills).some((val) => val && val.trim().length > 0);

  return (
    <StudentLayout>
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">CAREER TOOLS</div>
          <h1 className="page-title">ATS Resume Builder</h1>
          <p className="page-subtitle">
            Format matches the standard single-page engineering ATS resume format.
          </p>
        </div>
        <div className="page-header-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn-outline"
            onClick={handleLoadSample}
            title="Load the standard template format shown in the example"
          >
            <Sparkles size={14} color="#0284c7" /> Example Template
          </button>
          <button className="btn-outline" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            className="btn-outline"
            onClick={handlePrint}
            title="Open browser print dialog for 100% crisp vector PDF with real selectable text"
          >
            <Printer size={14} /> Print / Save as PDF
          </button>
          <button className="btn-primary" onClick={handleExport} disabled={exporting}>
            <Download size={14} /> {exporting ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            background: '#dcfce7',
            color: '#15803d',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
          }}
        >
          <CheckCircle size={16} /> Resume saved successfully!
        </div>
      )}

      {loading ? (
        <div className="sp-loading">Loading resume...</div>
      ) : (
        <div className="resume-layout">
          {/* Left Column: Form Controls */}
          <div>
            <div className="resume-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`resume-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="sp-card">
              <div className="sp-card-body">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Full Name</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. Dhruv Patil"
                        value={resumeData.personal.fullName || ''}
                        onChange={(e) => handleChangePersonal('fullName', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="resume-form-field">
                        <label className="resume-form-label">Email</label>
                        <input
                          type="email"
                          className="resume-form-input"
                          placeholder="dhruvpatil1677@gmail.com"
                          value={resumeData.personal.email || ''}
                          onChange={(e) => handleChangePersonal('email', e.target.value)}
                        />
                      </div>
                      <div className="resume-form-field">
                        <label className="resume-form-label">Phone</label>
                        <input
                          type="text"
                          className="resume-form-input"
                          placeholder="+91 9328027022"
                          value={resumeData.personal.phone || ''}
                          onChange={(e) => handleChangePersonal('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="resume-form-field">
                        <label className="resume-form-label">LinkedIn Profile URL</label>
                        <input
                          type="text"
                          className="resume-form-input"
                          placeholder="linkedin.com/in/dhruv-patil-6154803b1"
                          value={resumeData.personal.linkedin || ''}
                          onChange={(e) => handleChangePersonal('linkedin', e.target.value)}
                        />
                      </div>
                      <div className="resume-form-field">
                        <label className="resume-form-label">GitHub Profile URL</label>
                        <input
                          type="text"
                          className="resume-form-input"
                          placeholder="github.com/dpatil1677"
                          value={resumeData.personal.github || ''}
                          onChange={(e) => handleChangePersonal('github', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="resume-form-field">
                      <label className="resume-form-label">Location (Optional)</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. Rajkot, Gujarat, India (leave empty to omit from header)"
                        value={resumeData.personal.location || ''}
                        onChange={(e) => handleChangePersonal('location', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Professional Summary</label>
                      <textarea
                        className="resume-form-textarea"
                        rows={6}
                        placeholder="Computer Engineering student (9.22/10 CGPA) and aspiring Full-Stack Web Developer with hands-on experience..."
                        value={resumeData.summary || ''}
                        onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                        Highlight your degree, CGPA, target engineering roles, core backend/frontend frameworks, and database expertise.
                      </span>
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div>
                    {resumeData.education.map((edu, i) => (
                      <div key={edu.id || i} className="resume-entry">
                        <div className="resume-entry-header">
                          <div className="resume-entry-title">Education #{i + 1}</div>
                          <button className="btn-remove" onClick={() => handleRemoveEducation(i)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="resume-form-field">
                          <label className="resume-form-label">Degree / Program</label>
                          <input
                            type="text"
                            className="resume-form-input"
                            placeholder="e.g. Diploma in Computer Engineering or Secondary Education (10th Grade)"
                            value={edu.degree || ''}
                            onChange={(e) => handleUpdateEducation(i, 'degree', e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                          <div className="resume-form-field">
                            <label className="resume-form-label">Institution / School</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              placeholder="e.g. RK University or Saint Francis School"
                              value={edu.institution || ''}
                              onChange={(e) => handleUpdateEducation(i, 'institution', e.target.value)}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div className="resume-form-field">
                              <label className="resume-form-label">Start</label>
                              <input
                                type="text"
                                className="resume-form-input"
                                placeholder="2024"
                                value={edu.startYear || ''}
                                onChange={(e) => handleUpdateEducation(i, 'startYear', e.target.value)}
                              />
                            </div>
                            <div className="resume-form-field">
                              <label className="resume-form-label">End</label>
                              <input
                                type="text"
                                className="resume-form-input"
                                placeholder="2027"
                                value={edu.endYear || ''}
                                onChange={(e) => handleUpdateEducation(i, 'endYear', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="resume-form-field" style={{ marginBottom: 0 }}>
                          <label className="resume-form-label">
                            Grade / Highlights Bullet (1 bullet per line)
                          </label>
                          <textarea
                            className="resume-form-textarea"
                            rows={2}
                            placeholder="Average CGPA: 9.22 / 10&#10;Percentage: 93.13%"
                            value={
                              Array.isArray(edu.bullets)
                                ? edu.bullets.join('\n')
                                : edu.cgpa
                                ? `Average CGPA: ${edu.cgpa}`
                                : ''
                            }
                            onChange={(e) => handleUpdateEducationBullets(i, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <button className="btn-add" onClick={handleAddEducation}>
                      <Plus size={15} /> Add Education
                    </button>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div>
                    {resumeData.projects.map((proj, i) => (
                      <div key={proj.id || i} className="resume-entry">
                        <div className="resume-entry-header">
                          <div className="resume-entry-title">Project #{i + 1}</div>
                          <button className="btn-remove" onClick={() => handleRemoveProject(i)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="resume-form-field">
                          <label className="resume-form-label">Project Title & Subtitle</label>
                          <input
                            type="text"
                            className="resume-form-input"
                            placeholder="e.g. PlacementPro – Smart Placement Portal"
                            value={proj.title || ''}
                            onChange={(e) => handleUpdateProject(i, 'title', e.target.value)}
                          />
                        </div>
                        <div className="resume-form-field">
                          <label className="resume-form-label">Tech Stack (comma-separated)</label>
                          <input
                            type="text"
                            className="resume-form-input"
                            placeholder="e.g. React.js, Node.js, Express.js, MySQL/MongoDB, REST APIs"
                            value={proj.techStack || ''}
                            onChange={(e) => handleUpdateProject(i, 'techStack', e.target.value)}
                          />
                        </div>
                        <div className="resume-form-field" style={{ marginBottom: 0 }}>
                          <label className="resume-form-label">
                            Bullet Points (Press Enter for each bullet •)
                          </label>
                          <textarea
                            className="resume-form-textarea"
                            rows={4}
                            placeholder="Built a full-stack web application to automate campus placement workflows...&#10;Implemented secure user authentication and authorization using JWT with RBAC...&#10;Developed interactive administrative dashboards for automated student eligibility..."
                            value={Array.isArray(proj.bullets) ? proj.bullets.join('\n') : ''}
                            onChange={(e) => handleUpdateProjectBullets(i, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <button className="btn-add" onClick={handleAddProject}>
                      <Plus size={15} /> Add Project
                    </button>
                  </div>
                )}

                {/* Technical Skills Tab */}
                {activeTab === 'skills' && (
                  <div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Languages</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. JavaScript (ES6+), PHP, SQL, HTML5, CSS3, Python"
                        value={resumeData.technicalSkills?.languages || ''}
                        onChange={(e) => handleUpdateTechnicalSkills('languages', e.target.value)}
                      />
                    </div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Frontend</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. React.js, Tailwind CSS, Bootstrap, Responsive Web Design, DOM Manipulation"
                        value={resumeData.technicalSkills?.frontend || ''}
                        onChange={(e) => handleUpdateTechnicalSkills('frontend', e.target.value)}
                      />
                    </div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Backend</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. Node.js, Express.js, Laravel, Core PHP, RESTful APIs, JWT Authentication"
                        value={resumeData.technicalSkills?.backend || ''}
                        onChange={(e) => handleUpdateTechnicalSkills('backend', e.target.value)}
                      />
                    </div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Databases</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. MySQL, MongoDB, Database Schema Design"
                        value={resumeData.technicalSkills?.databases || ''}
                        onChange={(e) => handleUpdateTechnicalSkills('databases', e.target.value)}
                      />
                    </div>
                    <div className="resume-form-field">
                      <label className="resume-form-label">Tools & Platforms</label>
                      <input
                        type="text"
                        className="resume-form-input"
                        placeholder="e.g. Git, GitHub, Postman, VS Code, npm"
                        value={resumeData.technicalSkills?.tools || ''}
                        onChange={(e) => handleUpdateTechnicalSkills('tools', e.target.value)}
                      />
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                      <label className="resume-form-label">Additional ATS Keyword Tags</label>
                      <div className="resume-skill-tags">
                        {resumeData.skills.map((skill, i) => (
                          <div key={i} className="resume-skill-tag">
                            <span>{skill}</span>
                            <button onClick={() => handleRemoveSkill(skill)}>×</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="resume-form-input"
                          placeholder="Type a keyword and press Enter..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={handleAddSkill}
                        />
                        <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={handleAddSkill}>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certifications Tab */}
                {activeTab === 'certifications' && (
                  <div>
                    {resumeData.certifications.map((cert, i) => (
                      <div key={cert.id || i} className="resume-entry">
                        <div className="resume-entry-header">
                          <div className="resume-entry-title">Certification #{i + 1}</div>
                          <button className="btn-remove" onClick={() => handleRemoveCertification(i)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="resume-form-field">
                          <label className="resume-form-label">Certification Name</label>
                          <input
                            type="text"
                            className="resume-form-input"
                            placeholder="e.g. Introduction to Python"
                            value={cert.name || ''}
                            onChange={(e) => handleUpdateCertification(i, 'name', e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 0 }}>
                          <div className="resume-form-field" style={{ marginBottom: 0 }}>
                            <label className="resume-form-label">Issuer / Organization</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              placeholder="e.g. Infosys"
                              value={cert.issuer || ''}
                              onChange={(e) => handleUpdateCertification(i, 'issuer', e.target.value)}
                            />
                          </div>
                          <div className="resume-form-field" style={{ marginBottom: 0 }}>
                            <label className="resume-form-label">Date / Month</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              placeholder="e.g. July 2026"
                              value={cert.date || ''}
                              onChange={(e) => handleUpdateCertification(i, 'date', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-add" onClick={handleAddCertification}>
                      <Plus size={15} /> Add Certification
                    </button>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div>
                    {resumeData.experience.map((exp, i) => (
                      <div key={exp.id || i} className="resume-entry">
                        <div className="resume-entry-header">
                          <div className="resume-entry-title">Experience #{i + 1}</div>
                          <button className="btn-remove" onClick={() => handleRemoveExperience(i)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="resume-form-field">
                            <label className="resume-form-label">Company</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              value={exp.company || ''}
                              onChange={(e) => handleUpdateExperience(i, 'company', e.target.value)}
                            />
                          </div>
                          <div className="resume-form-field">
                            <label className="resume-form-label">Role</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              value={exp.role || ''}
                              onChange={(e) => handleUpdateExperience(i, 'role', e.target.value)}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="resume-form-field">
                            <label className="resume-form-label">Start Date</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              placeholder="2024-05"
                              value={exp.startDate || ''}
                              onChange={(e) => handleUpdateExperience(i, 'startDate', e.target.value)}
                            />
                          </div>
                          <div className="resume-form-field">
                            <label className="resume-form-label">End Date</label>
                            <input
                              type="text"
                              className="resume-form-input"
                              placeholder="2024-07 or Present"
                              value={exp.endDate || ''}
                              onChange={(e) => handleUpdateExperience(i, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="resume-form-field" style={{ marginBottom: 0 }}>
                          <label className="resume-form-label">Responsibilities / Impact Bullets</label>
                          <textarea
                            className="resume-form-textarea"
                            rows={3}
                            placeholder="Developed responsive UI components...&#10;Integrated REST APIs..."
                            value={
                              Array.isArray(exp.bullets) && exp.bullets.length > 0
                                ? exp.bullets.join('\n')
                                : exp.description || ''
                            }
                            onChange={(e) => handleUpdateExperienceBullets(i, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <button className="btn-add" onClick={handleAddExperience}>
                      <Plus size={15} /> Add Experience
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live ATS Preview & ATS Score */}
          <div>
            {/* ATS Score Card */}
            <div className="sp-card" style={{ marginBottom: '20px' }}>
              <div className="sp-card-header">
                <div className="sp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#0284c7" /> ATS Compatibility Score
                </div>
              </div>
              <div className="sp-card-body">
                <div className="ats-score-row">
                  <div className="ats-score-big">
                    {atsScore}
                    <span className="ats-score-denom">/100</span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: atsScore >= 80 ? '#16a34a' : atsScore >= 50 ? '#d97706' : '#dc2626',
                    }}
                  >
                    {atsScore >= 80 ? 'Optimal ATS Match' : atsScore >= 50 ? 'Moderate Match' : 'Needs Improvement'}
                  </div>
                </div>

                <div className="ats-bar-item">
                  <div className="ats-bar-label-row">
                    <span className="ats-bar-label">Readiness</span>
                    <span className="ats-bar-pct">{atsScore}%</span>
                  </div>
                  <div className="ats-bar-track">
                    <div className="ats-bar-fill" style={{ width: `${atsScore}%` }} />
                  </div>
                </div>

                <div className="ats-suggestions">
                  <div className="ats-suggestions-title">ATS Optimization Checklist</div>
                  {(!resumeData.personal.fullName || !resumeData.personal.email) && (
                    <div className="ats-suggestion-item">
                      <div className="ats-suggestion-dot" />
                      Add your full name and primary email.
                    </div>
                  )}
                  {(!resumeData.personal.linkedin && !resumeData.personal.github) && (
                    <div className="ats-suggestion-item">
                      <div className="ats-suggestion-dot" />
                      Add your LinkedIn and GitHub profiles for technical recruiters.
                    </div>
                  )}
                  {(!resumeData.summary || resumeData.summary.length < 30) && (
                    <div className="ats-suggestion-item">
                      <div className="ats-suggestion-dot" />
                      Include a crisp professional summary highlighting core stack & CGPA.
                    </div>
                  )}
                  {(!resumeData.projects || resumeData.projects.length === 0) && (
                    <div className="ats-suggestion-item">
                      <div className="ats-suggestion-dot" />
                      Add at least 2 full-stack projects with metric-driven bullet points.
                    </div>
                  )}
                  {!hasCategorizedSkills && (
                    <div className="ats-suggestion-item">
                      <div className="ats-suggestion-dot" />
                      Fill in categorized technical skills (Languages, Frontend, Backend, Databases, Tools).
                    </div>
                  )}
                  {atsScore >= 80 && (
                    <div className="ats-suggestion-item" style={{ color: '#16a34a' }}>
                      <div className="ats-suggestion-dot" style={{ background: '#16a34a' }} />
                      Your resume format strictly adheres to campus placement & ATS screening standards!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Document Preview Card */}
            <div className="sp-card">
              <div
                className="sp-card-header"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div className="sp-card-title">Live Resume Preview (Standard A4 Format)</div>
                <button
                  onClick={handlePrint}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Printer size={13} /> Print Preview
                </button>
              </div>

              <div className="sp-card-body" style={{ padding: '20px', background: '#f8fafc', overflowX: 'auto' }}>
                {/* ═══ THE EXACT ATS RESUME DOCUMENT SHEET ═══ */}
                <div id="resume-preview-doc" ref={resumePreviewRef} className="ats-resume-sheet">
                  {/* Header */}
                  <div className="ats-resume-header">
                    <h1 className="ats-resume-name">
                      {resumeData.personal.fullName || 'YOUR NAME'}
                    </h1>
                    <div className="ats-resume-contact">
                      {contactParts.map((item, idx) => (
                        <span key={idx} className="ats-contact-part">
                          {idx > 0 && <span className="ats-contact-sep"> | </span>}
                          {item.isLink ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="ats-contact-link"
                            >
                              {item.label}
                            </a>
                          ) : (
                            <span>{item.label}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SUMMARY */}
                  {resumeData.summary && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">SUMMARY</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content">
                        <p className="ats-summary-text">{resumeData.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* EDUCATION */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">EDUCATION</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content">
                        {resumeData.education.map((edu, i) => (
                          <div key={edu.id || i} className="ats-entry">
                            <div className="ats-entry-header">
                              <span className="ats-entry-title">
                                {edu.degree || 'Degree'}
                              </span>
                              {(edu.institution || edu.startYear || edu.endYear) && (
                                <>
                                  <span className="ats-entry-pipe"> | </span>
                                  <span className="ats-entry-meta">
                                    {edu.institution || ''}
                                    {edu.startYear || edu.endYear
                                      ? ` (${[edu.startYear, edu.endYear].filter(Boolean).join(' – ')})`
                                      : ''}
                                  </span>
                                </>
                              )}
                            </div>
                            {edu.bullets && edu.bullets.filter(Boolean).length > 0 ? (
                              <ul className="ats-bullets">
                                {edu.bullets
                                  .filter(Boolean)
                                  .map((b, bi) => (
                                    <li key={bi}>{b}</li>
                                  ))}
                              </ul>
                            ) : edu.cgpa ? (
                              <ul className="ats-bullets">
                                <li>
                                  {edu.cgpa.toLowerCase().includes('cgpa') ||
                                  edu.cgpa.toLowerCase().includes('percentage') ||
                                  edu.cgpa.includes('%')
                                    ? edu.cgpa
                                    : `Average CGPA: ${edu.cgpa}`}
                                </li>
                              </ul>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WEB DEVELOPMENT PROJECTS */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">WEB DEVELOPMENT PROJECTS</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content">
                        {resumeData.projects.map((proj, i) => (
                          <div key={proj.id || i} className="ats-entry">
                            <div className="ats-entry-header">
                              <span className="ats-entry-title">
                                {proj.title || 'Project Title'}
                              </span>
                              {proj.techStack && (
                                <>
                                  <span className="ats-entry-pipe"> | </span>
                                  <span className="ats-entry-meta-italic">{proj.techStack}</span>
                                </>
                              )}
                            </div>
                            {proj.bullets && proj.bullets.filter(Boolean).length > 0 && (
                              <ul className="ats-bullets">
                                {proj.bullets
                                  .filter(Boolean)
                                  .map((b, bi) => (
                                    <li key={bi}>{b}</li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE (if student has internships/work experience) */}
                  {resumeData.experience && resumeData.experience.length > 0 && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">EXPERIENCE</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content">
                        {resumeData.experience.map((exp, i) => (
                          <div key={exp.id || i} className="ats-entry">
                            <div className="ats-entry-header">
                              <span className="ats-entry-title">
                                {exp.role || 'Role'}
                              </span>
                              {(exp.company || exp.startDate || exp.endDate) && (
                                <>
                                  <span className="ats-entry-pipe"> | </span>
                                  <span className="ats-entry-meta">
                                    {exp.company || ''}
                                    {exp.startDate || exp.endDate
                                      ? ` (${[exp.startDate, exp.endDate].filter(Boolean).join(' – ')})`
                                      : ''}
                                  </span>
                                </>
                              )}
                            </div>
                            {exp.bullets && exp.bullets.filter(Boolean).length > 0 ? (
                              <ul className="ats-bullets">
                                {exp.bullets
                                  .filter(Boolean)
                                  .map((b, bi) => (
                                    <li key={bi}>{b}</li>
                                  ))}
                              </ul>
                            ) : exp.description ? (
                              <p className="ats-entry-desc">{exp.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL SKILLS */}
                  {(hasCategorizedSkills || (resumeData.skills && resumeData.skills.length > 0)) && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">TECHNICAL SKILLS</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content ats-skills-content">
                        {hasCategorizedSkills ? (
                          <>
                            {resumeData.technicalSkills?.languages && (
                              <div className="ats-skill-row">
                                <span className="ats-skill-label">Languages: </span>
                                <span className="ats-skill-text">
                                  {resumeData.technicalSkills.languages}
                                </span>
                              </div>
                            )}
                            {resumeData.technicalSkills?.frontend && (
                              <div className="ats-skill-row">
                                <span className="ats-skill-label">Frontend: </span>
                                <span className="ats-skill-text">
                                  {resumeData.technicalSkills.frontend}
                                </span>
                              </div>
                            )}
                            {resumeData.technicalSkills?.backend && (
                              <div className="ats-skill-row">
                                <span className="ats-skill-label">Backend: </span>
                                <span className="ats-skill-text">
                                  {resumeData.technicalSkills.backend}
                                </span>
                              </div>
                            )}
                            {resumeData.technicalSkills?.databases && (
                              <div className="ats-skill-row">
                                <span className="ats-skill-label">Databases: </span>
                                <span className="ats-skill-text">
                                  {resumeData.technicalSkills.databases}
                                </span>
                              </div>
                            )}
                            {resumeData.technicalSkills?.tools && (
                              <div className="ats-skill-row">
                                <span className="ats-skill-label">Tools & Platforms: </span>
                                <span className="ats-skill-text">
                                  {resumeData.technicalSkills.tools}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="ats-skill-row">
                            <span className="ats-skill-label">Skills: </span>
                            <span className="ats-skill-text">
                              {resumeData.skills.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CERTIFICATIONS */}
                  {resumeData.certifications && resumeData.certifications.length > 0 && (
                    <div className="ats-resume-section">
                      <div className="ats-section-heading">CERTIFICATIONS</div>
                      <div className="ats-section-divider" />
                      <div className="ats-section-content">
                        <ul className="ats-bullets">
                          {resumeData.certifications.map((cert, i) => (
                            <li key={cert.id || i}>
                              <strong style={{ fontWeight: 700, color: '#000' }}>
                                {cert.name || 'Certification Name'}
                              </strong>
                              {(cert.issuer || cert.date) && (
                                <span>
                                  {cert.issuer ? ` – ${cert.issuer}` : ''}
                                  {cert.date ? ` (${cert.date})` : ''}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

// server/models/resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeTitle: {
    type: String,
    default: 'My Resume'
  },
  templateId: {
    type: String,
    default: 'template-ats'
  },
  atsScore: {
    type: Number,
    default: 0
  },

  // Flexible Object & Array Schema (Prevents Mongoose 500 Validation Crashes)
  personalInfo: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  summary: { type: String, default: '' },

  education: [{
    degree: { type: String },
    course: { type: String },
    institute: { type: String },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    score: { type: String },
    isCurrent: { type: Boolean, default: false }
  }],

  experience: [{
    role: { type: String },
    company: { type: String },
    location: { type: String },
    type: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    isCurrent: { type: Boolean, default: false },
    responsibilities: [{ type: String }]
  }],

  projects: [{
    name: { type: String },
    techStack: [{ type: String }],
    description: { type: String },
    github: { type: String },
    liveLink: { type: String },
    achievements: [{ type: String }]
  }],

  skills: [{ type: String }],

  certifications: [{
    name: { type: String },
    organization: { type: String },
    issueDate: { type: String },
    link: { type: String }
  }],

  languages: [{
    name: { type: String },
    level: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
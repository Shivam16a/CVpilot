// server/models/resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personalInfo: {
        fullName: { type: String, required: true }, 
        title: { type: String, required: true }, 
        email: { type: String, required: true }, 
        phone: { type: String, required: true }, 
        location: { type: String, required: true }, 
        linkedin: { type: String }, 
        github: { type: String }, 
        portfolio: { type: String }
    },
    summary: { type: String, required: true }, 
    education: [{
        degree: { type: String, required: true }, 
    course: { type: String, required: true }, 
    institute: { type: String, required: true }, 
    location: { type: String }, 
    startDate: { type: String, required: true }, 
    endDate: { type: String }, 
    score: { type: String }, 
    isCurrent: { type: Boolean, default: false }
}],
    experience: [{
        role: { type: String, required: true }, 
    company: { type: String, required: true },
    location: { type: String }, 
    type: { type: String }, 
    startDate: { type: String, required: true }, 
    endDate: { type: String }, 
    isCurrent: { type: Boolean, default: false }, 
    responsibilities: [{ type: String }]
  }],
projects: [{
    name: { type: String, required: true }, 
techStack: [{ type: String }], 
description: { type: String, required: true }, 
github: { type: String }, 
liveLink: { type: String }, 
achievements: [{ type: String }]
  }],
skills: [{ type: String }], 
certifications: [{
    name: { type: String }, 
organization: { type: String }, 
issueDate: { type: String } 
  }],
languages: [{
    name: { type: String }, 
level: { type: String } 
  }],
templateId: { type: String, default: 'simple-ats' }, 
atsScore: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
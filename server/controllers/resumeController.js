// server/controllers/resumeController.js
const Resume = require('../models/resume');

// Personal Info ko save ya update karne ka controller
const savePersonalInfo = async (req, res) => {
    try {
        const userId = req.user.id; // authMiddleware se milega
        const personalInfoData = req.body;

        // Check karo agar user ka resume pehle se hai
        let resume = await Resume.findOne({ userId });

        if (resume) {
            // Agar hai, to sirf personalInfo update karo
            resume.personalInfo = personalInfoData;
            await resume.save();
            return res.status(200).json({ success: true, message: "Personal info updated successfully", resume });
        } else {
            // Agar nahi hai, to naya resume document banao (baki fields khali rahengi)
            resume = new Resume({
                userId,
                personalInfo: personalInfoData,
                summary: 'Professional Summary...', // Initial placeholder text taaki validation fail na ho
            });
            await resume.save();
            return res.status(201).json({ success: true, message: "Resume created with personal info", resume });
        }
    } catch (error) {
        console.error("Error saving personal info:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Inn functions ko controllers/resumeController.js ke niche append karo

const saveSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { summary } = req.body;

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.summary = summary;
        await resume.save();
        return res.status(200).json({ success: true, message: "Summary saved successfully", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const saveSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skills } = req.body;

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.skills = skills;
        await resume.save();
        return res.status(200).json({ success: true, message: "Skills saved successfully", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Education
const saveEducation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { education } = req.body;

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.education = education;
        await resume.save();
        return res.status(200).json({ success: true, message: "Education parsed successfully", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const saveExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const { experience } = req.body;

        // Line breaks (\n) ko structural array system map array points me convert karne ke liye parser filter:
        const formattedExperience = experience.map(exp => ({
            ...exp,
            responsibilities: exp.responsibilities.split('\n').filter(p => p.trim() !== '')
        }));

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.experience = formattedExperience;
        await resume.save();
        return res.status(200).json({ success: true, message: "Experience loaded successfully", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const saveProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const { projects } = req.body;

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.projects = projects;
        await resume.save();
        return res.status(200).json({ success: true, message: "Projects loaded", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const saveAdditional = async (req, res) => {
    try {
        const userId = req.user.id;
        const { certifications, languages } = req.body;

        let resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

        resume.certifications = certifications;
        resume.languages = languages;
        await resume.save();
        return res.status(200).json({ success: true, message: "Metadata compiled successfully", resume });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    savePersonalInfo, saveSummary, saveSkills, saveEducation, saveExperience, saveProjects, saveAdditional
};
// server/controllers/resumeController.js
const Resume = require('../models/resume');
const User = require('../models/users');
const mongoose = require('mongoose');

const getValidUserId = (id) => {
    if (!id) return null;
    return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
};

// 1. MASTER SAVE CONTROLLER (Creates/Updates document on "Save to Profile")
const saveMasterResume = async (req, res) => {
    try {
        const rawUserId = req.user.id || req.user._id;
        const userIdObj = getValidUserId(rawUserId);

        if (!rawUserId) {
            return res.status(400).json({ success: false, message: "Authentication required" });
        }

        let fullResumeData = JSON.parse(JSON.stringify(req.body));
        const resumeDocId = fullResumeData._id;

        delete fullResumeData._id;
        delete fullResumeData.__v;
        delete fullResumeData.createdAt;
        delete fullResumeData.updatedAt;

        const cleanSubDocs = (arr) => {
            if (!Array.isArray(arr)) return [];
            return arr.map(item => {
                if (typeof item === 'object' && item !== null) {
                    const newItem = { ...item };
                    delete newItem._id;
                    return newItem;
                }
                return item;
            });
        };

        if (fullResumeData.projects) fullResumeData.projects = cleanSubDocs(fullResumeData.projects);
        if (fullResumeData.education) fullResumeData.education = cleanSubDocs(fullResumeData.education);
        if (fullResumeData.experience) fullResumeData.experience = cleanSubDocs(fullResumeData.experience);
        if (fullResumeData.certifications) fullResumeData.certifications = cleanSubDocs(fullResumeData.certifications);
        if (fullResumeData.languages) fullResumeData.languages = cleanSubDocs(fullResumeData.languages);

        let savedResume;

        if (resumeDocId && mongoose.Types.ObjectId.isValid(resumeDocId)) {
            // Update existing resume
            savedResume = await Resume.findByIdAndUpdate(
                resumeDocId,
                {
                    $set: {
                        ...fullResumeData,
                        userId: userIdObj,
                        resumeTitle: fullResumeData.resumeTitle || 'My Resume',
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after', runValidators: false }
            );
        } else {
            // Create new resume entry in DB
            savedResume = await Resume.create({
                ...fullResumeData,
                userId: userIdObj,
                resumeTitle: fullResumeData.resumeTitle || 'My Resume'
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume saved successfully to cloud profile!",
            resume: savedResume
        });

    } catch (error) {
        console.error("Save Error:", error);
        return res.status(500).json({ success: false, message: "Storage failed: " + error.message });
    }
};

// 2. FETCH SPECIFIC RESUME BY ID (OR FALLBACK TO LATEST UPDATED) 🚀 [UPDATED]
const getResumeData = async (req, res) => {
    try {
        const rawUserId = req.user.id || req.user._id;
        const userIdObj = getValidUserId(rawUserId);
        const { id } = req.query; // 🚀 Extract ID from URL query param if present

        let resume = null;

        // Agar client ne explicit ID pass ki hai toh DB se wahi specific resume nikalo
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            resume = await Resume.findOne({
                _id: id,
                $or: [{ userId: userIdObj }, { userId: String(rawUserId) }]
            });
        }

        // Fallback: Agar koi ID pass nahi ki ya requested ID nahi mili, tab sabse recent wala nikalo
        if (!resume) {
            resume = await Resume.findOne({
                $or: [{ userId: userIdObj }, { userId: String(rawUserId) }]
            }).sort({ updatedAt: -1 });
        }

        if (!resume) {
            return res.status(200).json({ success: false, message: "No previous resume found" });
        }
        return res.status(200).json({ success: true, resume });
    } catch (error) {
        console.error("Fetch Resume Error:", error);
        return res.status(500).json({ success: false, message: "Database retrieval failed" });
    }
};

// 3. DASHBOARD & USER RESUMES CONTROLLER
const getUserDashboardData = async (req, res) => {
    try {
        const rawUserId = req.user.id || req.user._id;
        const userIdObj = getValidUserId(rawUserId);

        const user = await User.findById(userIdObj).select("-password");
        const resumes = await Resume.find({
            $or: [{ userId: userIdObj }, { userId: String(rawUserId) }]
        }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            user,
            totalResumes: resumes.length,
            resumes
        });
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load profile dashboard data" });
    }
};

const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Resume.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Resume deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Delete operation failed" });
    }
};

// Section-wise Fallback Aliases (Points to master save)
const savePersonalInfo = saveMasterResume;
const saveSummary = saveMasterResume;
const saveSkills = saveMasterResume;
const saveEducation = saveMasterResume;
const saveExperience = saveMasterResume;
const saveProjects = saveMasterResume;
const saveAdditional = saveMasterResume;

module.exports = {
    savePersonalInfo,
    saveSummary,
    saveSkills,
    saveEducation,
    saveExperience,
    saveProjects,
    saveAdditional,
    getResumeData,
    saveMasterResume,
    getUserDashboardData,
    deleteResume
};
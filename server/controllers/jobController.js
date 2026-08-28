// server/controllers/jobController.js
const axios = require('axios');

// 1. 🚀 ZERO-KEY SECURE LIVE JOB FETCHER
const getLiveJobs = async (req, res) => {
    try {
        const { role = 'Software Developer' } = req.query;

        // Open API Endpoint (No Secret Key Required)
        const targetUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}&limit=10`;

        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000 // 5 sec timeout safety
        });

        const rawJobs = response.data?.jobs || [];

        // Common Tech Keywords Extractor
        const commonTechKeywords = [
            'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python',
            'Java', 'MongoDB', 'SQL', 'Docker', 'AWS', 'Express',
            'HTML', 'CSS', 'Redux', 'Git', 'REST API', 'GraphQL', 'Next.js'
        ];

        const formattedJobs = rawJobs.slice(0, 8).map((job, index) => {
            const desc = job.description || '';

            // Auto extract matching skills from description
            const matchedSkills = commonTechKeywords.filter(kw =>
                new RegExp(`\\b${kw}\\b`, 'i').test(desc)
            );

            return {
                id: job.id || `job-${index}`,
                title: job.title || `${role}`,
                company: job.company_name || 'Global Tech Partner',
                location: job.candidate_required_location || 'Remote',
                salary: job.salary || 'Competitive / Market Standard',
                description: desc.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 160) + '...',
                skillsRequired: matchedSkills.length > 0 ? matchedSkills : ['JavaScript', 'Web Development'],
                redirectUrl: job.url
            };
        });

        return res.status(200).json({
            success: true,
            isKeyless: true,
            jobs: formattedJobs
        });

    } catch (error) {
        console.error("Keyless Job Fetch Error:", error.message);

        // Dynamic Fallback response if network fails
        return res.status(200).json({
            success: true,
            isKeyless: true,
            jobs: [
                {
                    id: 'fallback-1',
                    title: `${req.query.role || 'Full Stack'} Developer`,
                    company: 'Enterprise Tech',
                    location: 'Remote',
                    salary: 'Market Standard',
                    description: 'Hiring developers proficient in React, Node.js, Express, and Cloud databases.',
                    skillsRequired: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
                    redirectUrl: 'https://linkedin.com/jobs'
                }
            ]
        });
    }
};

// 2. Auto Keyword Inserter into Resume Skills
const autoInsertKeywords = async (req, res) => {
    try {
        const { currentSkills = [], jobKeywords = [] } = req.body;

        const missingKeywords = jobKeywords.filter(
            kw => !currentSkills.some(s => s.toLowerCase() === kw.toLowerCase())
        );

        const updatedSkills = Array.from(new Set([...currentSkills, ...missingKeywords]));

        return res.status(200).json({
            success: true,
            message: `${missingKeywords.length} missing keywords auto-inserted!`,
            insertedKeywords: missingKeywords,
            updatedSkills
        });
    } catch (error) {
        console.error("Keyword Inserter Error:", error);
        return res.status(500).json({ success: false, message: "Auto insertion failed." });
    }
};

module.exports = { getLiveJobs, autoInsertKeywords };
// server/controllers/aiController.js

// Helper function to handle delays for retries
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function with Auto-Retry and Robust Error Handling
const callGeminiAPI = async (prompt, retries = 2) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    // Model target
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        // Handle 503 High Demand Service Unavailable with Retries
        if (response.status === 503 || data.error?.code === 503) {
            if (retries > 0) {
                console.warn(`⚠️ Gemini API 503 Service Unavailable. Retrying... (${retries} attempts left)`);
                await wait(2000); // 2-second delay
                return callGeminiAPI(prompt, retries - 1);
            }
        }

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Gemini Raw Error Response:", JSON.stringify(data));
            throw new Error(data.error?.message || "AI Response format mismatch");
        }
    } catch (error) {
        if (retries > 0 && error.message?.includes('503')) {
            await wait(2000);
            return callGeminiAPI(prompt, retries - 1);
        }
        throw error;
    }
};

// 1. Professional Summary Generator
const generateSummary = async (req, res) => {
    try {
        const { title, skills } = req.body;

        const skillsString = Array.isArray(skills) ? skills.join(', ') : (skills || 'software development');
        const prompt = `You are an expert ATS resume writer. Write a professional, impactful 3-line summary for a ${title || 'Software Developer'} who has skills in ${skillsString}. Output ONLY the summary string, no quotes, no extra text.`;

        const aiText = await callGeminiAPI(prompt);
        // Clean markdown if present
        const cleanSummary = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        return res.status(200).json({ success: true, summary: cleanSummary });
    } catch (error) {
        console.error("Summary AI Error:", error.message || error);
        return res.status(500).json({ 
            success: false, 
            message: "AI Summary generation failed. Please try again." 
        });
    }
};

// 2. Project Description Enhancer
const generateProjectDesc = async (req, res) => {
    try {
        const { projectName, techStack, rawDesc } = req.body;

        const prompt = `You are an expert resume reviewer. Optimize this project description for an ATS scanner. Project Name: ${projectName || 'Project'}, Tech Stack: ${techStack || 'Web Tech'}. Raw Description: ${rawDesc || ''}. Rewrite it into 2 single-line sentences using action verbs and quantifiable impact metrics (e.g., 'Optimized database queries reducing loading time by 30%'). Output ONLY the text description, no bullet symbols.`;

        const aiText = await callGeminiAPI(prompt);
        const cleanDesc = aiText.replace(/```/g, '').trim();

        return res.status(200).json({ success: true, description: cleanDesc });
    } catch (error) {
        console.error("Project Desc AI Error:", error.message || error);
        return res.status(500).json({ 
            success: false, 
            message: "AI Project description enhancement failed." 
        });
    }
};

// 3. AI Skill Suggestions based on Job Title
const suggestSkills = async (req, res) => {
    try {
        const { title } = req.body;

        const prompt = `List exactly 8 top technical skills or keywords relevant for an ATS-friendly resume for the job profile: "${title || 'Developer'}". Return ONLY a valid JSON array of strings, like ["React", "TypeScript"]. Do not wrap in markdown or code blocks.`;

        const aiText = await callGeminiAPI(prompt);

        // Advanced Sanitization & Fallback Parsing
        let cleanText = aiText.trim();
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();

        let skillsArray = [];
        try {
            skillsArray = JSON.parse(cleanText);
        } catch (parseErr) {
            console.warn("Regex extraction fallback triggered for skills JSON...");
            const matches = cleanText.match(/"([^"]+)"/g);
            if (matches) {
                skillsArray = matches.map(m => m.replace(/"/g, ''));
            } else {
                skillsArray = cleanText.split('\n').map(s => s.replace(/^[-*0-9.]+\s*/, '').trim()).filter(Boolean);
            }
        }

        return res.status(200).json({ success: true, skills: skillsArray });
    } catch (error) {
        console.error("Skill Suggestion AI Error:", error.message || error);
        return res.status(500).json({ 
            success: false, 
            message: "AI Skill suggestions failed." 
        });
    }
};

module.exports = { generateSummary, generateProjectDesc, suggestSkills };
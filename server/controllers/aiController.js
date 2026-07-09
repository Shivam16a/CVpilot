// server/controllers/aiController.js

// Helper function taaki baar-baar fetch request ka boring code na likhna pade
const callGeminiAPI = async (prompt) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Yahan hum model to gemini-2.5-flash par target kar rahe hain
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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

    if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text.trim();
    } else {
        console.error("Gemini Error Raw Response:", data);
        throw new Error("AI Response format mismatch");
    }
};

// 1. Professional Summary Generator
const generateSummary = async (req, res) => {
    try {
        const { title, skills } = req.body;

        const prompt = `You are an expert ATS resume writer. Write a professional, impactful 3-line summary for a ${title} who has skills in ${skills ? skills.join(', ') : 'software development'}. Output ONLY the summary string, no quotes, no extra text.`;

        const aiText = await callGeminiAPI(prompt);
        return res.status(200).json({ success: true, summary: aiText });
    } catch (error) {
        console.error("Summary AI Error:", error);
        return res.status(500).json({ success: false, message: "AI Summary failed to generate" });
    }
};

// 2. Project Description Enhancer (ATS Metrics Integration)
const generateProjectDesc = async (req, res) => {
    try {
        const { projectName, techStack, rawDesc } = req.body;

        const prompt = `You are an expert resume reviewer. Optimize this project description for an ATS scanner. Project Name: ${projectName}, Tech Stack: ${techStack}. Raw Description: ${rawDesc}. Rewrite it into 2 single-line sentences using action verbs and quantifiable impact metrics (e.g., 'Optimized database queries reducing loading time by 30%'). Output ONLY the text description, no bullet symbols.`;

        const aiText = await callGeminiAPI(prompt);
        return res.status(200).json({ success: true, description: aiText });
    } catch (error) {
        console.error("Project Desc AI Error:", error);
        return res.status(500).json({ success: false, message: "AI Project description enhancement failed" });
    }
};

// 3. AI Skill Suggestions based on Job Title
const suggestSkills = async (req, res) => {
    try {
        const { title } = req.body;

        const prompt = `List exactly 8 top technical skills or keywords relevant for an ATS-friendly resume for the job profile: "${title}". Return ONLY a valid JSON array of strings, like ["React", "TypeScript"]. Do not wrap in markdown or code blocks.`;

        const aiText = await callGeminiAPI(prompt);

        // Markdown blocks cleaning matrix
        let cleanText = aiText;
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace('```json', '').replace('```', '');
        if (cleanText.startsWith('```')) cleanText = cleanText.replace(/```/g, '');

        const skillsArray = JSON.parse(cleanText.trim());
        return res.status(200).json({ success: true, skills: skillsArray });
    } catch (error) {
        console.error("Skill Suggestion AI Error:", error);
        return res.status(500).json({ success: false, message: "AI Skill suggestions failed" });
    }
};

module.exports = { generateSummary, generateProjectDesc, suggestSkills };
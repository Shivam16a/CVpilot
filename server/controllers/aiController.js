// server/controllers/aiController.js

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callGeminiAPI = async (prompt) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    // Models sequence (Agar 3.6-flash busy ho to backup models par switch hoga)
    const models = [
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            });

            const data = await response.json();

            // 503 (High Demand) ya 429 (Rate Limit) milne par next fallback model par switch karein
            if (response.status === 503 || response.status === 429 || data.error?.code === 503) {
                console.warn(`⚠️ Gemini API 503/429 on ${model}. Trying fallback model...`);
                lastError = data.error?.message || "Service Unavailable (503)";
                await wait(1000);
                continue;
            }

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                console.error(`Gemini Raw Error Response (${model}):`, JSON.stringify(data));
                lastError = data.error?.message || "AI Response format mismatch";
            }
        } catch (error) {
            console.warn(`⚠️ Network/Fetch error on ${model}: ${error.message}`);
            lastError = error.message;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`);
};

// 1. Professional Summary Generator (with Fallback)
const generateSummary = async (req, res) => {
    const { title, skills } = req.body;
    const role = title || 'Full-Stack Developer';
    const skillsString = Array.isArray(skills) ? skills.join(', ') : (skills || 'React, Node.js, Cloud APIs');

    try {
        const prompt = `You are an expert ATS resume writer. Write a professional, impactful 3-line summary for a ${role} who has skills in ${skillsString}. Output ONLY the summary string, no quotes, no extra text.`;
        const aiText = await callGeminiAPI(prompt);
        const cleanSummary = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        return res.status(200).json({ success: true, summary: cleanSummary });
    } catch (error) {
        console.warn("⚠️ Gemini Summary Failed. Using Smart Fallback Data. Error:", error.message);

        // Dynamic Fallback Summary
        const fallbackSummary = `Results-oriented ${role} with strong expertise in ${skillsString}. Proven record of engineering scalable, high-performance web applications, optimizing backend architectures, and collaborating with cross-functional teams to deliver enterprise software solutions. Dedicated to continuous optimization, clean code design, and modern development best practices.`;

        return res.status(200).json({
            success: true,
            summary: fallbackSummary,
            isFallback: true
        });
    }
};

// 2. Project Description Enhancer (with Fallback)
const generateProjectDesc = async (req, res) => {
    const { projectName, techStack, rawDesc } = req.body;
    const project = projectName || 'Web Application';
    const stack = techStack || 'MERN Stack';

    try {
        const prompt = `You are an expert resume reviewer. Optimize this project description for an ATS scanner. Project Name: ${project}, Tech Stack: ${stack}. Raw Description: ${rawDesc || ''}. Rewrite it into 2 single-line sentences using action verbs and quantifiable impact metrics. Output ONLY the text description, no bullet symbols.`;

        const aiText = await callGeminiAPI(prompt);
        const cleanDesc = aiText.replace(/```/g, '').trim();

        return res.status(200).json({ success: true, description: cleanDesc });
    } catch (error) {
        console.warn("⚠️ Gemini Project Desc Failed. Using Smart Fallback Data. Error:", error.message);

        // Fallback Description
        const fallbackDesc = `Architected and deployed ${project} leveraging ${stack}, boosting system responsiveness by 35% and automating state workflows. Streamlined RESTful data exchanges and reinforced endpoint security, reducing API latency and enhancing end-user experience.`;

        return res.status(200).json({
            success: true,
            description: fallbackDesc,
            isFallback: true
        });
    }
};

// 3. AI Skill Suggestions (with Fallback)
const suggestSkills = async (req, res) => {
    const { title } = req.body;
    const role = title || 'Full-Stack Developer';

    try {
        const prompt = `List exactly 8 top technical skills or keywords relevant for an ATS-friendly resume for the job profile: "${role}". Return ONLY a valid JSON array of strings, like ["React", "TypeScript"]. Do not wrap in markdown or code blocks.`;

        const aiText = await callGeminiAPI(prompt);
        let cleanText = aiText.trim().replace(/```json/g, '').replace(/```/g, '').trim();

        let skillsArray = JSON.parse(cleanText);
        return res.status(200).json({ success: true, skills: skillsArray });
    } catch (error) {
        console.warn("⚠️ Gemini Skill Suggestion Failed. Using Smart Fallback Data. Error:", error.message);

        // Role-targeted Fallback Skills
        let fallbackSkills = ["React.js", "Node.js", "MongoDB", "Express.js", "REST APIs", "Git/GitHub", "JavaScript (ES6+)", "Cloud Deployment"];
        if (role.toLowerCase().includes("python") || role.toLowerCase().includes("data")) {
            fallbackSkills = ["Python", "Pandas", "NumPy", "SQL", "Machine Learning", "Data Visualization", "Git", "API Integration"];
        } else if (role.toLowerCase().includes("java")) {
            fallbackSkills = ["Java", "Spring Boot", "Microservices", "Hibernate", "PostgreSQL", "REST APIs", "Docker", "JUnit"];
        }

        return res.status(200).json({
            success: true,
            skills: fallbackSkills,
            isFallback: true
        });
    }
};

// 4. REAL GEMINI AI ATS SCORE & RESUME ANALYZER (with Fallback)
const analyzeAtsScore = async (req, res) => {
    try {
        const resumeData = req.body;

        if (!resumeData || !resumeData.personalInfo) {
            return res.status(400).json({ success: false, message: "Invalid resume data provided." });
        }

        const resumeContent = `
        Candidate Name: ${resumeData.personalInfo?.fullName || 'N/A'}
        Job Title: ${resumeData.personalInfo?.title || 'N/A'}
        Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : 'N/A'}
        Work Experience: ${JSON.stringify(resumeData.experience || [])}
        Projects: ${JSON.stringify(resumeData.projects || [])}
        Education: ${JSON.stringify(resumeData.education || [])}
        `;

        const prompt = `You are a professional ATS Auditor. Analyze this resume content.
${resumeContent}

Return ONLY valid JSON (no markdown):
{
  "score": <number between 55 and 95>,
  "summaryRating": "<Short 3-4 word rating, e.g. 'Strong ATS Match 🎯'>",
  "feedback": ["<3-4 bullet points on keyword and metric improvements>"],
  "criticalFixes": ["<0-2 critical suggestions>"]
}`;

        const aiResponseText = await callGeminiAPI(prompt);
        let cleanJsonText = aiResponseText.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanJsonText);

        return res.status(200).json({
            success: true,
            score: parsedResult.score || 82,
            summaryRating: parsedResult.summaryRating || "Strong ATS Match 🎯",
            feedback: parsedResult.feedback || [],
            criticalFixes: parsedResult.criticalFixes || []
        });

    } catch (error) {
        console.warn("⚠️ Gemini ATS Analysis Failed. Using Smart Fallback Data. Error:", error.message);

        // Realistic Fallback Report
        return res.status(200).json({
            success: true,
            score: 84,
            summaryRating: "Strong ATS Profile 🎯",
            feedback: [
                "Incorporate quantifiable metrics (percentages, numbers) in your core experience bullet points.",
                "Ensure industry-standard tech stack keywords match target job descriptions directly.",
                "Maintain a concise 3-line professional summary emphasizing your key architecture skills."
            ],
            criticalFixes: [
                "Verify that live demo and GitHub URLs are actively hyperlinked in your projects section."
            ],
            isFallback: true
        });
    }
};

// 5. JOB DESCRIPTION (JD) MATCHER (with Fallback)
const matchJobDescription = async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ success: false, message: "Job description text is required." });
        }

        const prompt = `Compare candidate resume with JD.
Resume: ${JSON.stringify(resumeData)}
JD: ${jobDescription}

Return ONLY a valid JSON object:
{
  "matchPercentage": <number between 40 and 95>,
  "missingKeywords": ["keyword1", "keyword2"],
  "matchingSkills": ["skill1", "skill2"],
  "tailoredSummary": "<optimized 3-line professional summary>",
  "recommendations": ["point 1", "point 2"]
}`;

        const aiText = await callGeminiAPI(prompt);
        let cleanText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const matchResult = JSON.parse(cleanText);

        return res.status(200).json({ success: true, data: matchResult });

    } catch (error) {
        console.warn("⚠️ Gemini JD Matcher Failed. Using Smart Fallback Data. Error:", error.message);

        // Fallback JD Match Response
        const fallbackMatch = {
            matchPercentage: 78,
            missingKeywords: ["CI/CD Pipelines", "Docker", "Unit Testing", "System Design"],
            matchingSkills: ["React.js", "Node.js", "REST APIs", "MongoDB", "JavaScript"],
            tailoredSummary: "Experienced Software Engineer with a solid foundation in modern full-stack development, distributed architecture, and responsive UI design. Proven ability to translate product specs into clean, performant code.",
            recommendations: [
                "Add cloud deployment or containerization experience if you have worked with Docker or AWS.",
                "Emphasize test-driven development (TDD) or agile sprint cycles in your project highlights."
            ]
        };

        return res.status(200).json({
            success: true,
            data: fallbackMatch,
            isFallback: true
        });
    }
};

// 6. AI COVER LETTER GENERATOR (with Fallback)
const generateCoverLetter = async (req, res) => {
    const { resumeData, jobTitle, companyName, jobDescription } = req.body;
    const candidateName = resumeData?.personalInfo?.fullName || "Candidate";
    const targetRole = jobTitle?.trim() || "Software Engineer";
    const targetCompany = companyName?.trim() || "Your Organization";

    try {
        if (!resumeData || !resumeData.personalInfo) {
            return res.status(400).json({ success: false, message: "Resume data with personalInfo is required." });
        }

        const skillsList = Array.isArray(resumeData.skills)
            ? resumeData.skills.join(', ')
            : (resumeData.skills?.skillsList?.join(', ') || 'Full-Stack Development, Problem Solving');

        const prompt = `Write a high-converting professional cover letter for ${candidateName} applying for "${targetRole}" at "${targetCompany}".
Skills: ${skillsList}
Start with: "Dear Hiring Team at ${targetCompany},"
Closing: "Sincerely,\n${candidateName}"
Output raw text only. No markdown.`;

        const aiText = await callGeminiAPI(prompt);
        let cleanCoverLetter = aiText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
        cleanCoverLetter = cleanCoverLetter.replace(/^(here is|certainly|sure thing).*?\n\n/i, '').trim();

        return res.status(200).json({ success: true, coverLetter: cleanCoverLetter });

    } catch (error) {
        console.warn("⚠️ Gemini Cover Letter Failed. Using Smart Fallback Data. Error:", error.message);

        // Fallback High-Quality Cover Letter
        const fallbackLetter = `Dear Hiring Team at ${targetCompany},

I am writing to express my strong enthusiasm for the ${targetRole} position at ${targetCompany}. With a comprehensive background in full-stack web architecture, scalable database design, and responsive user experiences, I am confident in my ability to deliver immediate value to your engineering team.

Throughout my software projects, I have specialized in building performant frontend interfaces and robust backend APIs that improve application velocity and operational resilience. My technical proficiencies align directly with your technical requirements, and I am driven by the opportunity to engineer reliable solutions that support your organizational growth.

I welcome the opportunity to discuss how my technical execution and collaborative approach can contribute to ${targetCompany}'s ongoing success. Thank you for your time and consideration.

Sincerely,
${candidateName}`;

        return res.status(200).json({
            success: true,
            coverLetter: fallbackLetter,
            isFallback: true
        });
    }
};

// 7. CVPILOT AI AGENT CHATBOT (with Fallback)
const handleChatAgent = async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: "Query message is required." });
    }

    try {
        const userName = req.user?.username || req.user?.name || 'Friend';
        const systemPrompt = `You are CVPilot AI Assistant. Keep answers direct and friendly. User: ${userName}. Question: ${message}`;

        const aiResponse = await callGeminiAPI(systemPrompt);
        const cleanResponse = aiResponse.replace(/```/g, '').trim();

        return res.status(200).json({ success: true, reply: cleanResponse });

    } catch (error) {
        console.warn("⚠️ Gemini Chat Agent Failed. Using Smart Fallback Data. Error:", error.message);

        // Fallback Response based on keywords
        let fallbackReply = "👋 I am your **CVPilot Copilot**. You can use CVPilot to build ATS-compliant resumes, evaluate your match score against job postings, and export clean PDF templates! How can I assist your career journey today?";

        const query = message.toLowerCase();
        if (query.includes("ats") || query.includes("score")) {
            fallbackReply = "🎯 **ATS Optimization Tip:** Ensure your resume uses standard single-column layouts, includes measurable action metrics (e.g. 'boosted speeds by 30%'), and avoids nested text boxes or rasterized graphics that confuse automated ATS parsers.";
        } else if (query.includes("cover letter")) {
            fallbackReply = "📝 **Cover Letter Guidance:** You can generate a tailored cover letter directly inside the **Cover Letter** tab by entering your target company name and role!";
        }

        return res.status(200).json({
            success: true,
            reply: fallbackReply,
            isFallback: true
        });
    }
};

module.exports = {
    generateSummary,
    generateProjectDesc,
    suggestSkills,
    analyzeAtsScore,
    matchJobDescription,
    generateCoverLetter,
    handleChatAgent,
    callGeminiAPI
};
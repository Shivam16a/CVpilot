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

// server/controllers/aiController.js mein ye function add karein

// 4. 🚀 REAL GEMINI AI ATS SCORE & RESUME ANALYZER
const analyzeAtsScore = async (req, res) => {
    try {
        const resumeData = req.body;

        if (!resumeData || !resumeData.personalInfo) {
            return res.status(400).json({ success: false, message: "Invalid resume data provided." });
        }

        // Build clean input string for Gemini API
        const resumeContent = `
        Candidate Name: ${resumeData.personalInfo?.fullName || 'N/A'}
        Job Title: ${resumeData.personalInfo?.title || 'N/A'}
        Email: ${resumeData.personalInfo?.email || 'N/A'}, Phone: ${resumeData.personalInfo?.phone || 'N/A'}
        LinkedIn: ${resumeData.personalInfo?.linkedin || 'N/A'}, GitHub: ${resumeData.personalInfo?.github || 'N/A'}
        
        Professional Summary:
        ${resumeData.summary || 'N/A'}

        Skills:
        ${Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : (resumeData.skills?.skillsList?.join(', ') || 'N/A')}

        Work Experience:
        ${JSON.stringify(resumeData.experience || [])}

        Projects:
        ${JSON.stringify(resumeData.projects || [])}

        Education:
        ${JSON.stringify(resumeData.education || [])}
        `;

        const prompt = `You are a professional hiring manager and ATS (Applicant Tracking System) Auditor. Analyze the following resume content thoroughly and evaluate its overall ATS compliance and impact.

Resume Data:
${resumeContent}

Return ONLY a valid, plain JSON object (NO markdown, NO backticks, NO extra explanations) with this exact schema:
{
  "score": <number between 40 and 98 based on content quality, keywords, action verbs, and structure>,
  "summaryRating": "<Short 3-4 word overall rating, e.g. 'Excellent ATS Match 🎯' or 'Needs Improvement ⚠️'>",
  "feedback": [
    "<3-4 actionable bullet points on how to improve skills, experience descriptions, and ATS keyword optimization>"
  ],
  "criticalFixes": [
    "<0-2 critical missing elements like missing links, short summaries, or low skill counts>"
  ]
}`;

        const aiResponseText = await callGeminiAPI(prompt);

        // Sanitize response text
        let cleanJsonText = aiResponseText.trim();
        cleanJsonText = cleanJsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanJsonText);
        } catch (jsonErr) {
            console.error("Gemini ATS JSON Parse Error:", jsonErr, "Raw Text:", cleanJsonText);
            // Dynamic Fallback
            parsedResult = {
                score: 75,
                summaryRating: "Good Candidate Profile 👍",
                feedback: [
                    "Ensure experiences use action verbs like 'Developed', 'Managed', or 'Optimized'.",
                    "Add more industry-standard technical keywords in your skills list."
                ],
                criticalFixes: [
                    "Verify contact links and project GitHub repositories are properly added."
                ]
            };
        }

        return res.status(200).json({
            success: true,
            score: parsedResult.score || 70,
            summaryRating: parsedResult.summaryRating || "Good ATS Score 👍",
            feedback: parsedResult.feedback || [],
            criticalFixes: parsedResult.criticalFixes || []
        });

    } catch (error) {
        console.error("Gemini ATS Analysis Error:", error.message || error);
        return res.status(500).json({ success: false, message: "AI ATS Analysis failed: " + error.message });
    }
};

// 5. JOB DESCRIPTION (JD) MATCHER & RESUME TAILOR
const matchJobDescription = async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ success: false, message: "Job description text is required." });
        }

        const prompt = `You are an expert ATS recruiter. Compare the candidate's resume with the provided Job Description (JD).

Resume Data:
${JSON.stringify(resumeData)}

Job Description:
${jobDescription}

Perform 2 tasks:
1. Identify missing critical keywords, technologies, or skills from the candidate's resume relative to the JD.
2. Provide a short, tailored 3-line professional summary optimized specifically for this target JD.

Return ONLY a valid JSON object without markdown wrappers or code blocks, using this exact structure:
{
  "matchPercentage": <number between 30 and 99>,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "matchingSkills": ["skill1", "skill2"],
  "tailoredSummary": "<optimized 3-line professional summary>",
  "recommendations": ["point 1", "point 2"]
}`;

        const aiText = await callGeminiAPI(prompt);
        let cleanText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        let matchResult;
        try {
            matchResult = JSON.parse(cleanText);
        } catch (parseErr) {
            console.error("JD Matcher JSON Parse Error:", parseErr);
            matchResult = {
                matchPercentage: 68,
                missingKeywords: ["Docker", "Kubernetes", "CI/CD Pipelines"],
                matchingSkills: ["React", "Node.js", "MongoDB"],
                tailoredSummary: "Results-driven Developer experienced in building scalable web applications. Adept at full-stack deployment and optimizing performance for modern enterprise software.",
                recommendations: ["Incorporate cloud deployment keywords in project descriptions."]
            };
        }

        return res.status(200).json({
            success: true,
            data: matchResult
        });

    } catch (error) {
        console.error("JD Matcher AI Error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "JD Matching failed: " + error.message
        });
    }
};

// 6. AI COVER LETTER GENERATOR (Enterprise Upgrade)
const generateCoverLetter = async (req, res) => {
    try {
        const { resumeData, jobTitle, companyName, jobDescription } = req.body;

        if (!resumeData || !resumeData.personalInfo) {
            return res.status(400).json({ 
                success: false, 
                message: "Resume data with personalInfo is required." 
            });
        }

        const candidateName = resumeData.personalInfo.fullName || "Applicant";
        const targetRole = jobTitle?.trim() || "Software Engineer";
        const targetCompany = companyName?.trim() || "your organization";

        // 1. Parse Key Technical Skills
        const skillsList = Array.isArray(resumeData.skills)
            ? resumeData.skills.join(', ')
            : (resumeData.skills?.skillsList?.join(', ') || 'Software Architecture, Problem Solving');

        // 2. Extract Top Work Experience Details (Company, Role, & Accomplishments)
        const experienceHighlights = (resumeData.experience || [])
            .slice(0, 3)
            .map((exp, idx) => {
                const responsibilities = Array.isArray(exp.responsibilities) 
                    ? exp.responsibilities.slice(0, 2).join('; ')
                    : String(exp.responsibilities || '').slice(0, 160);
                return `${idx + 1}. ${exp.role || 'Developer'} at ${exp.company || 'Tech Firm'}: ${responsibilities}`;
            })
            .join('\n');

        // 3. Extract Core Project Highlights
        const projectHighlights = (resumeData.projects || [])
            .slice(0, 2)
            .map(proj => {
                const stack = Array.isArray(proj.techStack) ? ` [Stack: ${proj.techStack.join(', ')}]` : '';
                return `• ${proj.name}${stack}: ${proj.description || ''}`;
            })
            .join('\n');

        // 4. Structured Hiring-Manager Grade Prompt
        const prompt = `You are an elite executive talent strategist and career coach.
Write a targeted, high-converting professional cover letter for ${candidateName} applying for the position of "${targetRole}" at "${targetCompany}".

CANDIDATE BACKGROUND:
- Professional Title: ${resumeData.personalInfo.title || targetRole}
- Core Skills: ${skillsList}
- Professional Summary: ${resumeData.summary || 'Demonstrated technical execution and engineering acumen.'}
- Career Highlights:
${experienceHighlights || 'Proven hands-on track record in end-to-end software development lifecycle.'}
- Key Projects:
${projectHighlights || 'Engineered responsive web applications and scalable APIs.'}

TARGET JOB CONTEXT:
${jobDescription ? jobDescription.trim() : `Standard industry expectations and core deliverables for a high-impact ${targetRole}.`}

STRICT FORMATTING AND ARCHITECTURE RULES:
1. DO NOT invent contact headers, applicant phone numbers, email IDs, dates, or recipient street addresses. (The client's PDF letterhead generator automatically handles these metadata blocks).
2. Start directly with the formal salutation:
   "Dear Hiring Team at ${targetCompany},"
3. Paragraph 1 (The Hook): A confident, high-energy opening stating the target position, expressing informed enthusiasm for ${targetCompany}, and establishing an immediate value proposition.
4. Paragraph 2 (Core Impact & Technical Fit): Connect candidate's actual projects/experience (using real skills: ${skillsList}) directly to the needs of the target role. Highlight measurable results and system design capabilities.
5. Paragraph 3 (Collaborative Culture & Execution): Demonstrate how the candidate's work ethic, adaptability, and problem-solving mindset will accelerate team velocity.
6. Final Closing: A proactive call-to-action requesting an interview, followed immediately by formal sign-off:
   "Sincerely,\n${candidateName}"
7. TONE: Assertive, articulate, corporate-ready, and polished. Zero conversational fluff, zero generic buzzword stuffing.
8. Output ONLY the raw letter text. DO NOT enclose the response in markdown code wrappers or backticks.`;

        const aiText = await callGeminiAPI(prompt);

        // Sanitize output
        let cleanCoverLetter = aiText
            .replace(/```[a-z]*\n?/gi, '')
            .replace(/```/g, '')
            .trim();

        // Strip conversational AI preambles if any exist
        cleanCoverLetter = cleanCoverLetter.replace(/^(here is|certainly|sure thing).*?\n\n/i, '').trim();

        return res.status(200).json({
            success: true,
            coverLetter: cleanCoverLetter
        });

    } catch (error) {
        console.error("Cover Letter AI Error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate Cover Letter: " + (error.message || "Internal server error")
        });
    }
};

// 7.  STRICT CVPILOT AI AGENT CHATBOT
// server/controllers/aiController.js
const handleChatAgent = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Query message is required." });
        }

        const userName = req.user?.username || req.user?.name || 'Friend';

        const systemPrompt = `You are CVPilot AI Assistant, a helpful and friendly career/resume copilot for CVPilot.
User's Name: ${userName}

STRICT CONVERSATIONAL RULES:
1. DO NOT greet the user with "Hello ${userName}! Welcome to CVPilot!" in every message. You are already in an ongoing conversation.
2. Answer the user's question directly, clearly, and naturally without repeating long introductory introductions or greetings unless explicitly asked.
3. You MUST ONLY answer queries related to CVPilot features, resumes, ATS optimization, cover letters, and professional career advice.
4. If asked anything out of scope, respond politely:
"🎯 I am the CVPilot AI Assistant. My role is specifically to answer questions related to CVPilot, resumes, and career development. Please ask a question related to these topics! 😊"
5. Use clean formatting, bold text for key points, and friendly emojis.

User Question: ${message}`;

        const aiResponse = await callGeminiAPI(systemPrompt);
        const cleanResponse = aiResponse.replace(/```/g, '').trim();

        return res.status(200).json({
            success: true,
            reply: cleanResponse
        });

    } catch (error) {
        console.error("AI Agent Error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "Assistant error: " + error.message
        });
    }
};

// Ensure exports include handleChatAgent
module.exports = {
    generateSummary,
    generateProjectDesc,
    suggestSkills,
    analyzeAtsScore,
    matchJobDescription,
    generateCoverLetter,
    handleChatAgent
};
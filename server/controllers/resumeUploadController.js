// server/controllers/resumeUploadController.js
const pdfModule = require('pdf-parse');
const { callGeminiAPI } = require('./aiController');

// 🚀 Universal Buffer-to-Text Parser
const extractTextFromPDF = async (buffer) => {
    if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        if (typeof parser.destroy === 'function') {
            await parser.destroy();
        }
        return result?.text || '';
    }

    if (typeof pdfModule === 'function') {
        const result = await pdfModule(buffer);
        return result?.text || '';
    }

    if (pdfModule.default && typeof pdfModule.default === 'function') {
        const result = await pdfModule.default(buffer);
        return result?.text || '';
    }

    try {
        const directLib = require('pdf-parse/lib/pdf-parse');
        if (typeof directLib === 'function') {
            const result = await directLib(buffer);
            return result?.text || '';
        }
    } catch (err) { }

    throw new Error("Could not find a supported PDF text extraction method in installed pdf-parse.");
};

// 1. Upload & AI Parse Resume into CVPilot Store Schema
const parseUploadedResume = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Please upload a valid PDF resume file."
            });
        }

        let rawText = '';
        try {
            rawText = await extractTextFromPDF(req.file.buffer);
        } catch (parseErr) {
            console.error("PDF Parsing Library Error:", parseErr.message || parseErr);
            return res.status(400).json({
                success: false,
                message: "Unable to read text from PDF. Ensure it is a text-based PDF and not a scanned image."
            });
        }

        if (!rawText || rawText.trim().length < 30) {
            return res.status(400).json({
                success: false,
                message: "Could not extract sufficient text from the uploaded PDF. Please make sure the PDF has selectable text."
            });
        }

        // 🚀 UPGRADED GEMINI PROMPT (Explicit Focus on Institute, School, CGPA, Percentage, Marks)
        const prompt = `You are an expert resume parsing AI. Extract and structure the following raw resume text into the exact JSON schema required by CVPilot.

CRITICAL INSTRUCTIONS FOR EDUCATION:
- Look very carefully at the EDUCATION section or tables.
- For EVERY degree/course (e.g., B.Tech, Class XII / Intermediate, Class X / Matriculation):
  1. Extract the FULL Institute/College/School name (e.g. university name, college name, or school name). NEVER leave it blank if present.
  2. Extract any Marks, Percentage, or CGPA (e.g. "8.4 CGPA", "85%", "78.4%"). Put it in the "score" / "percentage" field.
  3. Extract passing or enrolled year (e.g. "2021 - 2025", "2021", "2019").

RAW RESUME TEXT:
${rawText.slice(0, 9000)}

STRICT JSON OUTPUT FORMAT (Return ONLY a single valid JSON object, NO markdown backticks, NO \`\`\`json wrappers):
{
  "personalInfo": {
    "fullName": "Full Name",
    "title": "Title (e.g. Full Stack Developer)",
    "email": "email or empty string",
    "phone": "phone or empty string",
    "location": "City, State, Country or empty string",
    "linkedin": "LinkedIn URL or empty string",
    "github": "GitHub URL or empty string",
    "portfolio": "Portfolio URL or empty string"
  },
  "summary": "Professional summary",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    {
      "company": "Company / Project Organization",
      "role": "Role Title",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ],
  "education": [
    {
      "institution": "Full Institute / College / School Name",
      "school": "Full Institute / College / School Name",
      "degree": "Degree / Qualification (e.g. B.Tech, Class XII, Class X)",
      "field": "Specialization or Stream (e.g. Computer Science, Science, PCM)",
      "graduationYear": "Passing Year or Year Range",
      "year": "Passing Year or Year Range",
      "score": "CGPA / Percentage / Marks (e.g. 8.2 CGPA or 84%)",
      "percentage": "CGPA / Percentage / Marks",
      "cgpa": "CGPA / Percentage / Marks"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": ["Tech1", "Tech2"],
      "description": "Short description",
      "link": "URL or empty string"
    }
  ],
  "additional": {
    "certifications": ["Cert 1"],
    "languages": ["English", "Hindi"]
  }
}`;

        const aiResponse = await callGeminiAPI(prompt);

        // Sanitize markdown fences
        const cleanJsonStr = aiResponse
            .replace(/```json/gi, '')
            .replace(/```/gi, '')
            .trim();

        let parsedData = JSON.parse(cleanJsonStr);

        // server/controllers/resumeUploadController.js ke education map function me:
        if (Array.isArray(parsedData.education)) {
            parsedData.education = parsedData.education.map(edu => {
                const instName = edu.institute || edu.institution || edu.school || edu.college || edu.university || '';
                const scoreValue = edu.score || edu.percentage || edu.cgpa || edu.marks || edu.grade || '';
                const yearVal = edu.endDate || edu.graduationYear || edu.year || '';

                return {
                    ...edu,
                    institute: instName,       
                    institution: instName,
                    school: instName,
                    college: instName,
                    degree: edu.degree || '',
                    score: scoreValue,         
                    percentage: scoreValue,
                    cgpa: scoreValue,
                    endDate: yearVal,          
                    graduationYear: yearVal
                };
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume parsed successfully into CVPilot workspace!",
            resumeData: parsedData
        });
    } catch (error) {
        console.error("Resume Parse Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to parse resume: " + (error.message || "Internal server error")
        });
    }
};

// 2. One-Page Fit Optimizer with AI
const optimizeToOnePage = async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) {
            return res.status(400).json({ success: false, message: "Resume data is required." });
        }

        const prompt = `You are a high-end executive resume editor specializing in the strict "1-Page Modern Tech Resume" rule.
Condense and sharpen the following resume content so it fits cleanly on a single page while preserving all education institutes, degrees, and scores:

${JSON.stringify(resumeData)}

RULES:
1. Do NOT delete institution names or marks/scores in education.
2. Shorten bullet points to 1-2 impactful lines using active verbs.
3. Trim summary to exactly 2-3 high-voltage lines.
4. Keep top 10-12 most relevant skills.
5. Output ONLY valid JSON matching the exact schema provided. No markdown backticks.`;

        const aiResponse = await callGeminiAPI(prompt);
        const cleanJsonStr = aiResponse
            .replace(/```json/gi, '')
            .replace(/```/gi, '')
            .trim();

        let optimizedData = JSON.parse(cleanJsonStr);

        // Normalize education in optimized data as well
        if (Array.isArray(optimizedData.education)) {
            optimizedData.education = optimizedData.education.map(edu => {
                const instName = edu.institution || edu.school || edu.college || '';
                const scoreValue = edu.score || edu.percentage || edu.cgpa || '';
                return {
                    ...edu,
                    institution: instName,
                    school: instName,
                    score: scoreValue,
                    percentage: scoreValue,
                    cgpa: scoreValue
                };
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume optimized for clean 1-page fit!",
            resumeData: optimizedData
        });
    } catch (error) {
        console.error("1-Page Optimizer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Optimization failed: " + (error.message || "Internal server error")
        });
    }
};

module.exports = { parseUploadedResume, optimizeToOnePage };
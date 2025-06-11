"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const combine_1 = require("../combine");
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const cloudinary_1 = __importDefault(require("../cloudinary"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const pdfParse = require("pdf-parse");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
// Enable CORS
app.use((0, cors_1.default)({
    origin: "*", // or ["http://localhost:3000", "https://yourdomain.com"]
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
// Enable JSON body parsing (for non-file requests)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configure Multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// ✅ REST API: File Upload Endpoint
app.post("/upload-parse-resume", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required!" });
        }
        if (!req.body.userId) {
            return res.status(400).json({ error: "User ID is required!" });
        }
        const { originalname, buffer } = req.file;
        const { userId } = req.body;
        const filenameWithoutExt = originalname.replace(/\.[^/.]+$/, "");
        const editedFilename = filenameWithoutExt.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
        // Upload to Cloudinary
        const uploadedResponse = yield new Promise((resolve, reject) => {
            cloudinary_1.default.uploader.upload_stream({
                folder: "resumes",
                resource_type: "image",
                format: "pdf",
                public_id: editedFilename,
                use_filename: true,
                unique_filename: false,
            }, (error, result) => {
                if (error)
                    return reject(error);
                return resolve(result);
            }).end(buffer);
        });
        if (!uploadedResponse) {
            return res.status(500).json({ error: "File upload failed!" });
        }
        // Parse PDF
        const data = yield pdfParse(buffer);
        const prompt = `
      You are an expert at analyzing resumes. Take the following raw resume data and clean it into a structured JSON format with the following sections:
      - Name
      - Education (list of degrees and schools)
      - Experience (list of jobs with role, company, duration, and key points)
      - Projects (list of projects with technologies and short descriptions)
      - Skills (with tags like programmingLanguages, frameworksAndTools, databases , areasOfInterest)
      - Achievements (list of accomplishments)
      - Positions of Responsibility (list of roles like team lead, club positions, etc.)
      
      Raw Resume Data:
      """${data.text}"""
      
      Return only JSON format, no extra text, no explanations.
    `;
        const response = yield callDeepSeek_for_parsing_resume(prompt);
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
        }
        let parsedResumeData;
        try {
            parsedResumeData = JSON.parse(cleanedResponse);
        }
        catch (parseErr) {
            console.error("JSON Parse Error from DeepSeek:", parseErr);
            return res.status(500).json({ error: "Failed to parse resume JSON from AI response." });
        }
        // Save all info to DB
        const savedResume = yield prisma.resume.create({
            data: {
                fileUrl: uploadedResponse.secure_url,
                userId,
                resume_data: parsedResumeData, // Ensure `parsedData` is a JSON field in your Prisma model
            },
        });
        return res.status(200).json({ message: "Resume uploaded and parsed successfully", resume: savedResume });
    }
    catch (error) {
        console.error("Upload & Parse Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// now cleaning the resume data by calling the deepseek function 
const Deepseek = process.env.DEEPSEEK_API_KEY;
// DeepSeek API call function
const callDeepSeek_for_parsing_resume = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Deepseek}`,
                "HTTP-Referer": "",
                "X-Title": "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const data = yield response.json();
        return data.choices[0].message.content;
    }
    catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw new Error("Failed to fetch data from DeepSeek API");
    }
});
// generating the cover letter for the job description and the resume parsed via deepseek
// yeh waala original hh bro
// app.post("/cover_letter", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "File is required!" });
//     }
//     const buffer = req.file.buffer;
//     if (buffer) {
//       const data = await pdfParse(buffer);
//       const userId = req.body?.userId;
//       const jobId = req.body?.jobId;
//       const job_description = await prisma.job.findFirst({
//         where: { id: jobId,userId:userId },
//         select: { title: true, description: true, company: true,
//           url:true, location: true },
//       });
//       const formattedDate = new Date().toLocaleDateString("en-GB", { 
//         day: "numeric", 
//         month: "long", 
//         year: "numeric" 
//       }).replace(/(\d+)(?=\s)/, (d) => {
//         const day = Number(d); // Explicitly convert to number
//         const suffix = ["st", "nd", "rd"][(day % 10) - 1] || "th";
//         return `${day}${(day % 100 >= 11 && day % 100 <= 13) ? "th" : suffix}`; // Handle 11th, 12th, 13th
//       });
//       const prompt = `
//         You are an expert in writing personalized, impactful cover letters. 
// Using the raw resume data provided below, craft a compelling, tailored cover letter that highlights the candidate's relevant skills, experiences, and achievements. Ensure the cover letter is professional, engaging, and customized to the job description — no generic phrases or resume formatting.
// Raw Resume Data:
// """${data.text}"""
// Job Data:
// - Title: ${job_description?.title}
// - Description: ${job_description?.description}
// - Company: ${job_description?.company}
// - Location: ${job_description?.location}
// Write the cover letter for Date as : ${formattedDate}  in paragraph format with proper structure:
// - Intro: Express excitement for the role and alignment with the company's mission.
// - Experience: Connect past achievements and projects from the raw resume data to job requirements.
// - Skills & Value: Highlight relevant technologies and how they align with the company's goals.
// - Closing: Reinforce enthusiasm and request an interview.
// Keep the tone professional yet enthusiastic, ensuring a clean, readable output and make it concise , don't provide any note just the cover-letter content.
//       `;
//       try {
//         const response = await call_deepseek_for_cover_letter(prompt);
//         let cleanedResponse = response.trim();
//         // Remove markdown formatting and extra symbols
//         cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();
//         // Split the response into lines
//         const lines = cleanedResponse.split("\n");
//         // Format the top (header) and bottom (sign-off) with spacing
//         const header = lines.slice(0, 7).join("\n"); // First 7 lines as header, spaced nicely
//         const body = lines.slice(7, -2).join(" "); // Body stays tight, combining into paragraphs
//         const footer = lines.slice(-2).join("\n"); // Last 2 lines (sign-off) spaced nicely
//         const formattedResponse = `${header}\n\n${body}\n\n${footer}`;
//        const cover_letter= await prisma.coverLetter.create({
//           data:{
//             userId:req.body.userId,
//             data:formattedResponse,
//             fileUrl:job_description?.url
//           }
//         })
//         return res.json({ coverLetter: formattedResponse ,cover_letter });
//       } catch (error) {
//         console.error("Failed to process DeepSeek response:", error);
//         return res.status(500).json({ error: "Failed to format cover letter" });
//       }
//     } else {
//       res.status(400).json({ message: "No file uploaded" });
//     }
//   } catch (err) {
//     console.error("Parse route error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });
// app.post("/cover_letter", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "File is required!" });
//     const buffer = req.file.buffer;
//     const data = await pdfParse(buffer);
//     const userId = req.body?.userId;
//     const userTemplate = req.body?.template;
//     const job_description = await prisma.job.findMany({
//       where: { userId },
//       select: { title: true, description: true, company: true, url: true, location: true },
//     });
//     const formattedDate = new Date().toLocaleDateString("en-GB", {
//       day: "numeric", month: "long", year: "numeric"
//     }).replace(/(\d+)(?=\s)/, (d) => {
//       const day = Number(d);
//       const suffix = ["st", "nd", "rd"][(day % 10) - 1] || "th";
//       return `${day}${(day % 100 >= 11 && day % 100 <= 13) ? "th" : suffix}`;
//     });
//     const defaultPrompt = `
// You are an expert in writing personalized, impactful cover letters.
// Using the resume and job data below, craft a concise and compelling cover letter.
// Resume:
// """${data.text}"""
// Job:
// - Title: ${job_description[0].title}
// - Description: ${job_description[0].description}
// - Company: ${job_description[0].company}
// - Location: ${job_description[0].location}
// - Date: ${formattedDate}
// Return only the cover letter in paragraph format.
//     `;
//     const userPrompt = userTemplate
//       ? `
// You are an expert in writing cover letters.
// Fill in this user-provided template using resume and job data.
// Template:
// """${userTemplate}"""
// Resume:
// """${data.text}"""
// Job:
// - Title: ${job_description[0].title}
// - Description: ${job_description[0].description}
// - Company: ${job_description[0].company}
// - Location: ${job_description[0].location}
// - Date: ${formattedDate}
// Return the completed cover letter only, no markdown or extra symbols.
//       `
//       : null;
//     let finalContent = "";
//     try {
//       if (userPrompt) {
//         const userResponse = await call_deepseek_for_cover_letter(userPrompt);
//         const cleaned = userResponse.replace(/```json|```|###|\*\*/g, "").trim();
//         if (!cleaned || cleaned.length < 100) throw new Error("Invalid user template response");
//         finalContent = cleaned;
//       } else {
//         throw new Error("No user template provided");
//       }
//     } catch (error:unknown) {
//       if (error instanceof Error) {
//       console.warn("⚠ Falling back to default cover letter prompt:", error.message);
//       const fallbackResponse = await call_deepseek_for_cover_letter(defaultPrompt);
//       finalContent = fallbackResponse.replace(/```json|```|###|\*\*/g, "").trim();
//     }
//     else {
//     console.error("Unknown error generating learning roadmap:", error);
//   }
//   throw new Error("Failed to generate learning roadmap");
// }
//     const cover_letter = await prisma.coverLetter.create({
//       data: {
//         userId,
//         data: finalContent,
//         fileUrl: job_description[0].url,
//       },
//     });
//     return res.json({ coverLetter: finalContent, cover_letter });
//   } catch (err) {
//     console.error("Cover letter error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });
app.post("/cover_letter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, jobId, resumeId } = req.body;
        if (!userId || !jobId || !resumeId) {
            return res.status(400).json({ error: "userId, jobId, and resumeId are required!" });
        }
        // Get parsed resume data from DB
        const resume = yield prisma.resume.findUnique({
            where: { id: resumeId },
            select: { resume_data: true },
        });
        if (!resume || !resume.resume_data) {
            return res.status(404).json({ error: "Resume data not found!" });
        }
        const jobDescription = yield prisma.job.findFirst({
            where: { id: jobId, userId: userId },
            select: { title: true, description: true, company: true, url: true, location: true },
        });
        if (!jobDescription) {
            return res.status(404).json({ error: "Job not found!" });
        }
        const formattedDate = new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).replace(/(\d+)(?=\s)/, (d) => {
            const day = Number(d);
            const suffix = ["st", "nd", "rd"][(day % 10) - 1] || "th";
            return `${day}${(day % 100 >= 11 && day % 100 <= 13) ? "th" : suffix}`;
        });
        // Prompt using parsedData instead of raw buffer
        const prompt = `
You are an expert in writing personalized, impactful cover letters.

Using the parsed resume JSON data provided below, craft a compelling, tailored cover letter that highlights the candidate's relevant skills, experiences, and achievements. Ensure the cover letter is professional, engaging, and customized to the job description — no generic phrases or resume formatting.

Parsed Resume Data (JSON):
${JSON.stringify(resume.resume_data, null, 2)}

Job Data:
- Title: ${jobDescription.title}
- Description: ${jobDescription.description}
- Company: ${jobDescription.company}
- Location: ${jobDescription.location}

Write the cover letter for Date as: ${formattedDate} in paragraph format with proper structure:
- Intro: Express excitement for the role and alignment with the company's mission.
- Experience: Connect past achievements and projects to job requirements.
- Skills & Value: Highlight relevant technologies and how they align with the company's goals.
- Closing: Reinforce enthusiasm and request an interview.
Also give a relevant suitable small title to it as well in the title field.

Keep the tone professional yet enthusiastic. Provide clean output only (no explanations).
`;
        const response = yield call_deepseek_for_cover_letter(prompt);
        let cleanedResponse = response.trim();
        cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();
        const lines = cleanedResponse.split("\n");
        const header = lines.slice(0, 7).join("\n");
        const body = lines.slice(7, -2).join(" ");
        const footer = lines.slice(-2).join("\n");
        const formattedResponse = `${header}\n\n${body}\n\n${footer}`;
        const savedCoverLetter = yield prisma.coverLetter.create({
            data: {
                userId,
                data: formattedResponse,
                fileUrl: jobDescription.url,
            },
        });
        return res.json({ coverLetter: formattedResponse, savedCoverLetter });
    }
    catch (error) {
        console.error("Cover Letter Generation Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
const call_deepseek_for_cover_letter = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Deepseek}`,
                "HTTP-Referer": "",
                "X-Title": "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const data = yield response.json();
        return ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
    }
    catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw new Error("Failed to fetch data from DeepSeek API");
    }
});
// app.post("/cold_email", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "File is required!" });
//     const buffer = req.file.buffer;
//     const data = await pdfParse(buffer);
//     const userId = req.body?.userId;
//     const userTemplate = req.body?.template;
//     const defaultPrompt = `
// You are an expert in writing compelling cold emails.
// Craft a cold email using the resume data below with this structure:
// - Subject
// - Introduction
// - Experience
// - Call to Action
// - Closing
// Resume:
// """${data.text}"""
// Return only the email body text.
//     `;
//     const userPrompt = userTemplate
//       ? `
// You are an expert in writing cold outreach emails.
// Fill the following user-provided cold email template using the resume content.
// Template:
// """${userTemplate}"""
// Resume:
// """${data.text}"""
// Return only the final email content. No markdown or extra formatting.
//       `
//       : null;
//     let finalContent = "";
//     try {
//       if (userPrompt) {
//         const userResponse = await call_deepseek_for_cold_email(userPrompt);
//         const cleaned = userResponse.replace(/```json|```|###|\*\*/g, "").trim();
//         if (!cleaned || cleaned.length < 50) throw new Error("Invalid user template email response");
//         finalContent = cleaned;
//       } else {
//         throw new Error("No user template provided");
//       }
//     } catch (error:unknown) {
//       if (error instanceof Error) {
//       console.warn("⚠ Falling back to default cold email prompt:", error.message);
//       const fallbackResponse = await call_deepseek_for_cold_email(defaultPrompt);
//       finalContent = fallbackResponse.replace(/```json|```|###|\*\*/g, "").trim();
//     }
//     else {
//     console.error("Unknown error generating learning roadmap:", error);
//   }
// }
//     return res.json({ coldEmailTemplate: finalContent });
//   } catch (err) {
//     console.error("Cold email route error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });
// origianl waala hh
// app.post("/cold_email", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "File is required!" });
//     }
//     const buffer = req.file.buffer;
//     if (buffer) {
//       const data = await pdfParse(buffer);
//       const userId = req.body?.userId;
//       const jobId = req.body?.jobId;
//       const job_description = await prisma.job.findFirst({
//         where: { id: jobId,userId:userId },
//         select: { title: true, description: true, company: true,
//           url:true, location: true },
//       });
//       // const prompt = `
//       //   You are an expert in writing compelling cold emails. 
//       //   Using the raw resume data provided below, craft a cold email template aimed at introducing the candidate to a potential employer. The email should highlight the candidate's relevant skills, experience, and express interest in discussing opportunities. The tone should be polite, professional, and engaging.
//       //   Raw Resume Data:
//       //   """${data.text}"""
//       //   Write a cold email template, with the following structure:
//       //   - Subject: A catchy subject line.
//       //   - Introduction: A brief introduction of the candidate.
//       //   - Experience: Relevant experience and skills.
//       //   - Call to action: Invite the recipient for a meeting or a follow-up conversation.
//       //   - Closing: Polite, professional closing.
//       //   Keep the email concise, personalized, and engaging.
//       // `;
// const prompt = `
// You are an expert in writing professional, personalized cold emails.
// Using the candidate's resume data and the job opportunity details below, write a concise and compelling cold email introducing the candidate to the company. The tone should be professional, enthusiastic, and focused on aligning the candidate's experience with the job opportunity.
// Resume:
// """${data.text}"""
// Job Opportunity:
// - Title: ${job_description?.title}
// - Description: ${job_description?.description}
// - Company: ${job_description?.company}
// - Location: ${job_description?.location}
// Structure the cold email like this:
// - Subject: A catchy and relevant subject line.
// - Introduction: A brief self-introduction and why they’re reaching out to the company.
// - Alignment: Clearly connect the candidate’s relevant experience, skills, and interests to the specific job role.
// - Call to Action: Express interest in discussing the opportunity and request a follow-up or meeting.
// - Closing: Professional closing with gratitude.
// Return only the cold email body text with no extra notes or markdown formatting.
// `;
//       const response = await call_deepseek_for_cold_email(prompt);
//       let cleanedResponse = response.trim();
//       cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();
//         const cold_email= await prisma.coldEmail.create({
//           data:{
//             userId:req.body.userId,
//             data:cleanedResponse,
//             fileUrl:job_description?.url
//           }
//         })
//       return res.json({ coldEmailTemplate: cleanedResponse });
//     } else {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//   } catch (err) {
//     console.error("Cold email route error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });
// DeepSeek API call for cold email
app.post("/cold_email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, jobId, resumeId } = req.body;
        if (!userId || !jobId || !resumeId) {
            return res.status(400).json({ error: "userId, jobId, and resumeId are required!" });
        }
        // Get parsed resume data from DB
        const resume = yield prisma.resume.findUnique({
            where: { id: resumeId },
            select: { resume_data: true },
        });
        if (!resume || !resume.resume_data) {
            return res.status(404).json({ error: "Resume data not found!" });
        }
        // Get job details
        const jobDescription = yield prisma.job.findFirst({
            where: { id: jobId, userId },
            select: { title: true, description: true, company: true, url: true, location: true },
        });
        if (!jobDescription) {
            return res.status(404).json({ error: "Job not found!" });
        }
        // Build prompt for cold email
        const prompt = `
You are an expert in writing professional, personalized cold emails.

Using the candidate's resume data and the job opportunity details below, write a concise and compelling cold email introducing the candidate to the company. The tone should be professional, enthusiastic, and focused on aligning the candidate's experience with the job opportunity.

Resume:
${JSON.stringify(resume.resume_data, null, 2)}

Job Opportunity:
- Title: ${jobDescription.title}
- Description: ${jobDescription.description}
- Company: ${jobDescription.company}
- Location: ${jobDescription.location}

Structure the cold email like this:
- Subject: A catchy and relevant subject line.
- Introduction: A brief self-introduction and why they’re reaching out to the company.
- Alignment: Clearly connect the candidate’s relevant experience, skills, and interests to the specific job role.
- Call to Action: Express interest in discussing the opportunity and request a follow-up or meeting.
- Closing: Professional closing with gratitude.
Also give a relevant suitable small title to it as well in the title field.

Return only the cold email body text with no extra notes or markdown formatting.
`;
        const response = yield call_deepseek_for_cold_email(prompt);
        let cleanedResponse = response.trim();
        cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();
        const coldEmail = yield prisma.coldEmail.create({
            data: {
                userId,
                data: cleanedResponse,
                fileUrl: jobDescription.url,
            },
        });
        return res.json({ coldEmailTemplate: cleanedResponse, coldEmail });
    }
    catch (err) {
        console.error("Cold email route error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
const call_deepseek_for_cold_email = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Deepseek}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const data = yield response.json();
        return ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
    }
    catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw new Error("Failed to fetch data from DeepSeek API");
    }
});
// Skill Gap and Learning Roadmap Endpoint
app.post("/skill_gap", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required!" });
        }
        const buffer = req.file.buffer;
        if (buffer) {
            // Parse PDF
            const data = yield pdfParse(buffer);
            const userId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId;
            // Ensure userId is a string, not null
            if (userId === null || userId === undefined) {
                return res.status(400).json({ error: "User ID is required!" });
            }
            // Fetch job description
            const jobDescription = yield prisma.job.findMany({
                where: { userId: userId },
                select: { title: true, description: true },
            });
            if (jobDescription.length === 0) {
                return res.status(400).json({ error: "No job description found for this user" });
            }
            // Extract skills using AI
            const requiredSkills = yield extractSkillsFromJobDescription((_c = (_b = jobDescription[0]) === null || _b === void 0 ? void 0 : _b.description) !== null && _c !== void 0 ? _c : "");
            const resumeSkills = yield extractSkillsFromResume(data.text);
            // Identify missing skills
            const missingSkills = requiredSkills.filter(skill => !resumeSkills.some(resumeSkill => resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(resumeSkill.toLowerCase())));
            // If missing skills are identified, generate a learning roadmap
            if (missingSkills.length > 0) {
                const roadmap = yield generateLearningRoadmap(missingSkills);
                return res.json({
                    requiredSkills,
                    resumeSkills,
                    missingSkills,
                    learningRoadmap: roadmap
                });
            }
            else {
                return res.json({
                    message: "No missing skills identified",
                    requiredSkills,
                    resumeSkills
                });
            }
        }
        else {
            return res.status(400).json({ message: "No file uploaded" });
        }
    }
    catch (err) {
        console.error("Skill gap route error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// Extract skills from job description using AI
const extractSkillsFromJobDescription = (description) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `
    You are an expert at identifying technical skills and requirements from job descriptions.
    Extract ONLY the technical skills, programming languages, frameworks, tools, and technologies mentioned in the following job description.
    Return the skills as a JSON array of strings, with no additional text or explanation.
    
    Job Description:
    """${description}"""
  `;
    try {
        const response = yield callDeepSeek_for_parsing_resume(prompt);
        let cleanedResponse = response.trim();
        // Remove any markdown formatting if present
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
        }
        const skills = JSON.parse(cleanedResponse);
        return Array.isArray(skills) ? skills : [];
    }
    catch (error) {
        console.error("Error extracting skills from job description:", error);
        return [];
    }
});
// Extract skills from resume using AI
const extractSkillsFromResume = (resumeText) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `
    You are an expert at identifying technical skills from resumes.
    Extract ONLY the technical skills, programming languages, frameworks, tools, and technologies mentioned in the following resume.
    Return the skills as a JSON array of strings, with no additional text or explanation.
    
    Resume Text:
    """${resumeText}"""
  `;
    try {
        const response = yield callDeepSeek_for_parsing_resume(prompt);
        let cleanedResponse = response.trim();
        // Remove any markdown formatting if present
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
        }
        const skills = JSON.parse(cleanedResponse);
        return Array.isArray(skills) ? skills : [];
    }
    catch (error) {
        console.error("Error extracting skills from resume:", error);
        return [];
    }
});
// Generate learning roadmap for missing skills
const generateLearningRoadmap = (missingSkills) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roadmap = [];
        for (const skill of missingSkills) {
            const resources = yield findLearningResources(skill);
            roadmap.push({ skill, resources });
        }
        return roadmap;
    }
    catch (error) {
        console.error("Error generating learning roadmap:", error);
        throw new Error("Failed to generate learning roadmap");
    }
});
const findLearningResources = (skill) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Launch headless browser
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        // Go to YouTube search page
        const searchQuery = `learn ${skill} tutorial`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        // Navigate to the YouTube search page
        yield page.goto(youtubeUrl, { waitUntil: 'domcontentloaded' });
        // Scrape the results
        const results = yield page.evaluate(() => {
            const items = [];
            const videoElements = document.querySelectorAll('ytd-video-renderer');
            videoElements.forEach((video) => {
                var _a, _b, _c, _d, _e;
                const title = (_b = (_a = video.querySelector('#video-title')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                const link = (_c = video.querySelector('#video-title')) === null || _c === void 0 ? void 0 : _c.getAttribute('href');
                const description = (_e = (_d = video.querySelector('#description-text')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim();
                if (title && link) {
                    items.push({
                        title,
                        link: `https://www.youtube.com${link}`,
                        description: description || '',
                    });
                }
            });
            return items;
        });
        yield browser.close();
        return results;
    }
    catch (error) {
        console.error('Error fetching resources:', error);
        throw new Error('Failed to fetch learning resources');
    }
});
// ✅ Start Apollo GraphQL Server
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = new apollo_server_express_1.ApolloServer({ typeDefs: combine_1.typeDefs, resolvers: combine_1.resolvers });
    yield server.start();
    server.applyMiddleware({ app });
    app.listen(8000, () => {
        console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`);
    });
});
init();

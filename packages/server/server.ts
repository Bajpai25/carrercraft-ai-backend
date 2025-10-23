import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "../combine";
import multer from "multer";
import cors from "cors";
import cloudinary from "../cloudinary";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
// import { CLIENT_RENEG_LIMIT } from "tls";
// import { CONNREFUSED } from "dns";
const pdfParse = require("pdf-parse");

dotenv.config();


const prisma = new PrismaClient();
const app = express();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = Number(process.env.PORT) || 8000

// Enable CORS
app.use(cors({
  origin: "*", // or ["http://localhost:3000", "https://yourdomain.com"]
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Add interface for YouTube video result
interface YouTubeVideoResult {
  title: string;
  link: string;
  description: string;
}

interface SkillGap{
  userId:string;
  resumeId:string;
  jobId:string
}

// Enable JSON body parsing (for non-file requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ REST API: File Upload Endpoint
app.post("/upload-parse-resume", upload.single("file"), async (req, res) => {
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
    const uploadedResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "resumes",
          resource_type: "image",
          format: "pdf",
          public_id: editedFilename,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      ).end(buffer);
    });

    if (!uploadedResponse) {
      return res.status(500).json({ error: "File upload failed!" });
    }

    // Parse PDF
    const data = await pdfParse(buffer);

const prompt = `
Extract structured JSON from the resume text below.
Only output JSON. No comments or text. Use "" for missing strings and [] for missing lists. No nulls.
Format:
{
  "Name": "",
  "Education": [{ "degree": "", "details": "", "duration": "", "school": "" }],
  "Experience": [{ "title": "", "company": "", "duration": "", "description": "", "keyPoints": [] }],
  "Projects": [{ "name": "", "description": "", "technologies": [] }],
  "Skills": {
    "programmingLanguages": [],"frameworksAndTools": [],"databases": [],"areasOfInterest": []},
  "Achievements": [],
  "PositionsOfResponsibility": [{ "title": "", "role": "", "organization": "", "duration": "", "description": "" }]}
Resume:${data.text}
`;

    const response = await callGemini_for_parsing_resume(prompt);

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
    }

    let parsedResumeData;
    try {
      parsedResumeData = JSON.parse(cleanedResponse);
    } catch (parseErr) {
      console.error("JSON Parse Error from DeepSeek:", parseErr);
      return res.status(500).json({ error: "Failed to parse resume JSON from AI response." });
    }

    const userExists = await prisma.user.findUnique({
  where: { id: userId },
});

if (!userExists) {
  return res.status(400).json({ error: "Invalid userId: User not found in database." });
}

    // Save all info to DB
    const savedResume = await prisma.resume.create({
      data: {
        fileUrl: (uploadedResponse as any).secure_url,
        userId,
        resume_data: parsedResumeData, // Ensure `parsedData` is a JSON field in Prisma model
      },
    });

    return res.status(200).json({ message: "Resume uploaded and parsed successfully", resume: savedResume });

  } catch (error) {
    console.error("Upload & Parse Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



// now cleaning the resume data by calling the deepseek function 
const Gemini=process.env.GEMINI_API_KEY;
// DeepSeek API call function
const callGemini_for_parsing_resume = async (prompt: string): Promise<any> => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent", {
      method: "POST",
      headers: {
         "x-goog-api-key": process.env.GEMINI_API_KEY || "",  //  Use your Gemini Pro key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    // ✅ Gemini response format check
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Invalid Gemini response:", data);
      throw new Error("Gemini API returned an unexpected response format.");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini Pro API:", error);
    throw new Error("Failed to fetch data from Gemini Pro API");
  }
};



app.post("/cover_letter", async (req, res) => {
  try {
    const { userId, jobId, resumeId } = req.body;

    if (!userId || !jobId || !resumeId) {
      return res.status(400).json({ error: "userId, jobId, and resumeId are required!" });
    }

    // Get parsed resume data from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { resume_data: true },
    });

    if (!resume || !resume.resume_data) {
      return res.status(404).json({ error: "Resume data not found!" });
    }

    const jobDescription = await prisma.job.findFirst({
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

    const response = await gemini_for_cover_letter(prompt);
    let cleanedResponse = response.trim();
    cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();

    const lines = cleanedResponse.split("\n");
    const header = lines.slice(0, 7).join("\n");
    const body = lines.slice(7, -2).join(" ");
    const footer = lines.slice(-2).join("\n");

    const formattedResponse = `${header}\n\n${body}\n\n${footer}`;

    const savedCoverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        data: formattedResponse,
        fileUrl: jobDescription.url,
      },
    });

    return res.json({ coverLetter: formattedResponse, savedCoverLetter });
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



const gemini_for_cover_letter = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
         "x-goog-api-key": process.env.GEMINI_API_KEY || "",  // 👈 use your Gemini API key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // ✅ Safe check for Gemini response
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch data from Gemini API");
  }
};




// DeepSeek API call for cold email

app.post("/cold_email", async (req, res) => {
  try {
    const { userId, jobId, resumeId } = req.body;

    if (!userId || !jobId || !resumeId) {
      return res.status(400).json({ error: "userId, jobId, and resumeId are required!" });
    }

    // Get parsed resume data from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { resume_data: true },
    });

    if (!resume || !resume.resume_data) {
      return res.status(404).json({ error: "Resume data not found!" });
    }

    // Get job details
    const jobDescription = await prisma.job.findFirst({
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

    const response = await gemini_for_cold_email(prompt);

    let cleanedResponse = response.trim();
    cleanedResponse = cleanedResponse.replace(/```json|```|###|\*\*/g, "").trim();

    const coldEmail = await prisma.coldEmail.create({
      data: {
        userId,
        data: cleanedResponse,
        fileUrl: jobDescription.url,
      },
    });

    return res.json({ coldEmailTemplate: cleanedResponse, coldEmail });
  } catch (err) {
    console.error("Cold email route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});



const gemini_for_cold_email = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY || "", // 👈 Your Gemini key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error calling Gemini API (Cold Email):", error);
    throw new Error("Failed to fetch data from Gemini API (Cold Email)");
  }
};


// Skill Gap and Learning Roadmap Endpoint
app.post("/skill_gap", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required!" });
    }

    const buffer = req.file.buffer;
    if (buffer) {
      // Parse PDF
      const data = await pdfParse(buffer);
      const userId = req.body?.userId;

      // Ensure userId is a string, not null
      if (userId === null || userId === undefined) {
        return res.status(400).json({ error: "User ID is required!" });
      }

      // Fetch job description
      const jobDescription = await prisma.job.findMany({
        where: { userId: userId },
        select: { title: true, description: true },
      });

      if (jobDescription.length === 0) {
        return res.status(400).json({ error: "No job description found for this user" });
      }

      // Extract skills using AI
      const requiredSkills = await extractSkillsFromJobDescription(jobDescription[0]?.description ?? "");
      const resumeSkills = await extractSkillsFromResume(data.text);

      // Identify missing skills
      const missingSkills = requiredSkills.filter(skill => 
        !resumeSkills.some(resumeSkill => 
          resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(resumeSkill.toLowerCase())
        )
      );

      // If missing skills are identified, generate a learning roadmap
      if (missingSkills.length > 0) {
        const roadmap = await generateLearningRoadmap(missingSkills);
        return res.json({ 
          requiredSkills,
          resumeSkills,
          missingSkills, 
          learningRoadmap: roadmap 
        });
      } else {
        return res.json({ 
          message: "No missing skills identified",
          requiredSkills,
          resumeSkills
        });
      }
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }
  } catch (err) {
    console.error("Skill gap route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Extract skills from job description using AI
const extractSkillsFromJobDescription = async (description: string): Promise<string[]> => {
  const prompt = `
    You are an expert at identifying technical skills and requirements from job descriptions.
    Extract ONLY the technical skills, programming languages, frameworks, tools, and technologies mentioned in the following job description.
    Return the skills as a JSON array of strings, with no additional text or explanation.
    
    Job Description:
    """${description}"""
  `;

  try {
    const response = await callGemini_for_parsing_resume(prompt);
    let cleanedResponse = response.trim();
    
    // Remove any markdown formatting if present
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
    }
    
    const skills = JSON.parse(cleanedResponse);
    return Array.isArray(skills) ? skills : [];
  } catch (error) {
    console.error("Error extracting skills from job description:", error);
    return [];
  }
};

// Extract skills from resume using AI
const extractSkillsFromResume = async (resumeText: string): Promise<string[]> => {
  const prompt = `
    You are an expert at identifying technical skills from resumes.
    Extract ONLY the technical skills, programming languages, frameworks, tools, and technologies mentioned in the following resume.
    Return the skills as a JSON array of strings, with no additional text or explanation.
    
    Resume Text:
    """${resumeText}"""
  `;

  try {
    const response = await callGemini_for_parsing_resume(prompt);
    let cleanedResponse = response.trim();
    
    // Remove any markdown formatting if present
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
    }
    
    const skills = JSON.parse(cleanedResponse);
    return Array.isArray(skills) ? skills : [];
  } catch (error) {
    console.error("Error extracting skills from resume:", error);
    return [];
  }
};

// Generate learning roadmap for missing skills
const generateLearningRoadmap = async (missingSkills: string[]): Promise<any> => {
  try {
    const roadmap = [];
    for (const skill of missingSkills) {
      const resources = await findLearningResources(skill);
      roadmap.push({ skill, resources });
    }
    return roadmap;
  } catch (error) {
    console.error("Error generating learning roadmap:", error);
    throw new Error("Failed to generate learning roadmap");
  }
};



const findLearningResources = async (skill: string): Promise<YouTubeVideoResult[]> => {
  try {
    // Launch headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to YouTube search page
    const searchQuery = `learn ${skill} tutorial`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    // Navigate to the YouTube search page
    await page.goto(youtubeUrl, { waitUntil: 'domcontentloaded' });

    // Scrape the results
    const results = await page.evaluate(() => {
      const items: YouTubeVideoResult[] = [];
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      videoElements.forEach((video) => {
        const title = video.querySelector('#video-title')?.textContent?.trim();
        const link = video.querySelector('#video-title')?.getAttribute('href');
        const description = video.querySelector('#description-text')?.textContent?.trim();

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

    await browser.close();
    return results;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw new Error('Failed to fetch learning resources');
  }
};


// code to analyze the skill gap according to the job description and the resume




const SkillGap = async (req: any, res: any) => {
  console.log(req.body)
  const { userId, jobId, resumeId } = req.body; // or req.query or req.params

  if (!userId || !jobId || !resumeId) {
    return res.status(400).json({
      message: "All fields are required: userId, jobId, resumeId."
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) return res.status(404).json({ message: "Resume not found" });
  

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ message: "Job description not found" });
  const formattedResume = formatResume(resume.resume_data);

   const prompt = `
You are an advanced career coach and ATS (Applicant Tracking System) expert.

You will be given:
1. The text of a job description.
2. The text of a candidate's resume.

Your tasks:
- Analyze the resume and job description carefully.
- Identify the key skills, experiences, and qualifications required for the job.
- Compare these with what is present in the resume.
- Calculate an estimated percentage match score between the resume and the job description.
- List clearly:
   - Skills and qualifications that are a strong match (present in the resume).
   - Skills and qualifications that are missing or weak (not clearly demonstrated).
- Provide constructive feedback on what the candidate can improve in their resume to better match the job.
- Be honest, specific, and actionable.

Return your answer in this JSON format:
{
  "match_percentage": "<calculated percentage>",
  "matching_skills": [ "Skill 1", "Skill 2", ... ],
  "missing_skills": [ "Skill A", "Skill B", ... ],
  "feedback": "<Your detailed feedback>"
}

Job Description:
"""
${job?.description}
"""

Resume:
"""
${formattedResume}
"""
`;

  try {
    const response = await gemini_for_skill_gap(prompt);
    let cleanedResponse = response.trim();
    
    // Remove any markdown formatting if present
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```json|```/g, "").trim();
    }
    
    console.log(typeof(cleanedResponse) , "this is the cleaned response")

    const skill_response=JSON.parse(cleanedResponse)

    const skill_data=await prisma.skillAnalysis.create({
      data: {userId:userId , jobId:jobId , resumeId:resumeId ,  match_percentage:skill_response.match_percentage ?? "" ,matching_skills:skill_response.matching_skills ?? [] , missing_skills:skill_response.missing_skills ?? [],
        feedback:skill_response.feedback ?? ""
         },
    })

    console.log(skill_data)
    return res.status(200).json({
      message:skill_data
    })
  } catch (error) {
    console.error("Error getting the skill analysis from the AI model , Try again later!!", error);
    return [];
  }

};

function formatResume(resume: any): string {
  let output = `Name: ${resume.Name}\n\n`;

  output += `Education:\n`;
  resume.Education.forEach((edu: any) => {
    output += `- ${edu.degree} from ${edu.school} (${edu.duration}), Details: ${edu.details}\n`;
  });

  output += `\nExperience:\n`;
  resume.Experience.forEach((exp: any) => {
    output += `- ${exp.title} at ${exp.company} (${exp.duration})\n`;
    exp.keyPoints.forEach((point: string) => {
      output += `   • ${point}\n`;
    });
  });

  output += `\nProjects:\n`;
  resume.Projects.forEach((proj: any) => {
    output += `- ${proj.name}: ${proj.description}\n  Tech: ${proj.technologies.join(', ')}\n`;
  });

  output += `\nSkills:\n`;
  output += `- Databases: ${resume.Skills.databases.join(', ')}\n`;
  output += `- Areas of Interest: ${resume.Skills.areasOfInterest.join(', ')}\n`;
  output += `- Frameworks/Tools: ${resume.Skills.frameworksAndTools.join(', ')}\n`;
  output += `- Programming Languages: ${resume.Skills.programmingLanguages.join(', ')}\n`;
//  console.log(output)
  return output;
}




const gemini_for_skill_gap = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error calling Gemini API (Skill Gap):", error);
    throw new Error("Failed to fetch data from Gemini API (Skill Gap)");
  }
};

app.post("/skill_analysis",SkillGap)




// ✅ Start Apollo GraphQL Server
const init = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  // Use the PORT variable you defined at the top
  const host = '0.0.0.0'; // <-- Add this
  
  // Use PORT and host variables here
  app.listen(PORT, host, () => {
    console.log(`🚀 Server ready at http://${host}:${PORT}${server.graphqlPath}`);
  });
};

init();


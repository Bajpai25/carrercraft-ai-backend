import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const prisma=new PrismaClient();

// now cleaning the resume data by calling the deepseek function 
// const Deepseek=process.env.DEEPSEEK_API_KEY;



// type ResumeJSON = {
//   name: string;
//   skills: {
//     programmingLanguages: string[];
//     frameworksAndTools: string[];
//     databases: string[];
//     areasOfInterest: string[];
//   };
//   projects: {
//     name: string;
//     description: string;
//     technologies: string[];
//   }[];
//   experience: {
//     role: string;
//     company: string;
//     duration: string;
//     location: string;
//     keyPoints: string[];
//   }[];
//   education: {
//     degree: string;
//     school: string;
//     details: string;
//     duration: string;
//   }[];
//   achievements: string[];
//   positionsOfResponsibility: {
//     role: string;
//     duration: string;
//     organization: string;
//   }[];
// };

export type ResumeJSON = {
  Name?: string;

  Achievements?: string[];


  Education?: {
    degree?: string;
    details?: string;
    duration?: string;
    school?: string;
  }[];
  

  Experience?: {
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
    keyPoints?: string[];
  }[];
  

  Projects?: {
    name?: string;
    description?: string;
    technologies?: string;
    link?: string;
  }[];
  

  Skills?: {
    databases?: string[];
    areasOfInterest?: string[];
    frameworksAndTools?: string[];
    programmingLanguages?: string[];
  };
  

  PositionsOfResponsibility?: {
    title?: string;
    role?: string;
    organization?: string;
    duration?: string;
    description?: string;
  }[];
  
};

const DeepSeek=process.env.DEEPSEEK_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const callOpenAI_for_parsing_resume = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DeepSeek}`,
         "HTTP-Referer": "",
        "X-Title": "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: "gpt-4", // or "gpt-3.5-turbo" for cheaper/faster option
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: prompt }],
        // temperature: 0.7,
      }),
    });

    const data = await response.json();

    // ✅ Add safe check to prevent crash
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Invalid OpenAI response:", data);
      throw new Error("OpenAI API returned an unexpected response format.");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to fetch data from OpenAI API");
  }
};


// DeepSeek API call function
// export const callDeepSeek_for_parsing_resume = async (prompt: string): Promise<any> => {
//   try {
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${Deepseek}`,
//         "HTTP-Referer": "",
//         "X-Title": "",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "deepseek/deepseek-r1:free",
//         messages: [{ role: "user", content: prompt }],
//       }),
//     });

//     const data = await response.json();
//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error("Error calling DeepSeek API:", error);
//     throw new Error("Failed to fetch data from DeepSeek API");
//   }
// };

// export function convertResumeJSONToText(json:ResumeJSON):string {
//   const lines = [];

//   lines.push(`Name: ${json.name}`);
//   lines.push(`Skills: ${[
//     ...json.skills.programmingLanguages,
//     ...json.skills.frameworksAndTools,
//     ...json.skills.databases,
//   ].join(", ")}`);

//   lines.push(`Areas of Interest: ${json.skills.areasOfInterest.join(", ")}`);

//   lines.push("Projects:");
//   json.projects.forEach(project => {
//     lines.push(`- ${project.name}: ${project.description}. Technologies: ${project.technologies.join(", ")}`);
//   });

//   lines.push("Experience:");
//   json.experience.forEach(exp => {
//     lines.push(`- ${exp.role} at ${exp.company} (${exp.duration}, ${exp.location})`);
//     exp.keyPoints.forEach(point => lines.push(`  • ${point}`));
//   });

//   lines.push("Education:");
//   json.education.forEach(edu => {
//     lines.push(`- ${edu.degree} at ${edu.school} (${edu.duration}) - ${edu.details}`);
//   });

//   lines.push("Achievements:");
//   json.achievements.forEach(ach => lines.push(`- ${ach}`));

//   lines.push("Positions of Responsibility:");
//   json.positionsOfResponsibility.forEach(pos => {
//     lines.push(`- ${pos.role} at ${pos.organization} (${pos.duration})`);
//   });

//   return lines.join("\n");
// }
export function convertResumeJSONToText(json: ResumeJSON): string {
  const lines: string[] = [];

  // Name
  lines.push(`Name: ${ json.Name || "N/A"}`);

  // Skills
  const skills =  json.Skills;
  if (skills) {
    const allSkills = [
      ...(skills.programmingLanguages || []),
      ...(skills.frameworksAndTools || []),
      ...(skills.databases || []),
    ];
    lines.push(`Skills: ${allSkills.join(", ") || "N/A"}`);
    lines.push(`Areas of Interest: ${(skills.areasOfInterest || []).join(", ") || "N/A"}`);
  }

  // Projects
  const projects = json.Projects;
  if (projects?.length) {
    lines.push("Projects:");
    projects.forEach(project => {
      const techStack = Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : project.technologies || "N/A";
      lines.push(`- ${project.name || "Unnamed Project"}: ${project.description || "No description"}. Technologies: ${techStack}`);
    });
  }

  // Experience
  const experiences = json.Experience;
  if (experiences?.length) {
    lines.push("Experience:");
    experiences.forEach(exp => {
      lines.push(`- ${exp.title  || "Unknown Role"} at ${exp.company || "Unknown Company"} (${exp.duration || "N/A"})`);
      (exp.keyPoints || []).forEach(point => lines.push(`  • ${point}`));
    });
  }

  // Education
  const education =  json.Education;
  if (education?.length) {
    lines.push("Education:");
    education.forEach(edu => {
      lines.push(`- ${edu.degree || "Unknown Degree"} at ${edu.school || "Unknown School"} (${edu.duration || "N/A"}) - ${edu.details || "N/A"}`);
    });
  }

  // Achievements
  const achievements = json.Achievements;
  if (achievements?.length) {
    lines.push("Achievements:");
    achievements.forEach(ach => lines.push(`- ${ach}`));
  }

  // Positions of Responsibility
  const positions =  json.PositionsOfResponsibility ;
  if (positions?.length) {
    lines.push("Positions of Responsibility:");
    positions.forEach(pos => {
      lines.push(`- ${pos.role || "Unknown Role"} at ${pos.organization || "Unknown Org"} (${pos.duration || "N/A"})`);
    });
  }

  return lines.join("\n");
}

export const atsresolver={
    Query:{

    },
    Mutation:{
          runATSAnalysis: async(_parent:any , args:{resumeId:string,userId:string})=>{
                const {resumeId,userId} = args;
                const resumedata=await prisma.resume.findUnique({
                    where :{
                        id:resumeId
                    }
                })
                console.log(resumedata);

                if(!resumedata){
                    throw new Error("Resume not found");
                }
                // Convert the resume JSON to text format
                const resumeText = convertResumeJSONToText(resumedata?.resume_data as ResumeJSON );

                const prompt = `

You are an ATS (Applicant Tracking System) resume analysis assistant.

Your task is to carefully analyze the following resume text and return a comprehensive JSON output suitable for storing in a database. You must extract the following:

1. "score" — An ATS score out of 100 based on formatting, keyword matching, and industry standards.
2. "missingSkills" — A JSON array of important technical or soft skills that are missing or underrepresented in the resume.
3. "Issues" — A single string summarizing key issues or weaknesses found in the resume (e.g., poor formatting, generic wording, lack of measurable results).
4. "suggestions" — A single string with actionable suggestions for improving the resume (e.g., add more technical skills, quantify project impact, improve structure).
5. "atsResultData" — A JSON object summarizing your reasoning and analysis steps in a structured form. This includes things like formatting quality, keyword density, readability score, and resume structure evaluation.

Please format your response in **strict JSON** like the following example also provide clean output only (no explanations) , remove the unnecessary text and comments and  backticks:

{
  "score": 84,
  "missingSkills": ["GraphQL", "Docker", "CI/CD", "Unit Testing"],
  "Issues": "The resume lacks specific accomplishments, does not include key DevOps tools, and is overly generic in project descriptions.",
  "suggestions": "Include quantified project outcomes, add missing DevOps tools, and tailor the resume more to the target job roles.",
  "atsResultData": {
    "formatting": "Good",
    "keywordDensity": "Moderate",
    "readability": "High",
    "structure": "Chronological",
    "sectionCoverage": ["Summary", "Work Experience", "Education", "Skills"]
  }

Resume:
"""
${resumeText}
"""`
                // const rawAnalysis = await callDeepSeek_for_parsing_resume(prompt);
                const rawAnalysis=await callOpenAI_for_parsing_resume(prompt);

                if(!rawAnalysis){
                    throw new Error("Failed to analyze the resume");
                }
                const cleaned = rawAnalysis.replace(/```json|```/g, "").trim();
                const atsAnalysis=JSON.parse(cleaned)
                console.log(typeof(atsAnalysis));
                 console.log(
  atsAnalysis.score,
  atsAnalysis.missingSkills,
  atsAnalysis.suggestions,
  atsAnalysis.Issues,
  atsAnalysis.atsResultData
);


                // return {
                //     score: atsAnalysis.score,
                //     missingSkills: atsAnalysis.missingSkills,
                //     suggestions: atsAnalysis.suggestions,
                //     Issues: atsAnalysis.Issues,
                //     atsResultData: atsAnalysis.atsResultData,
                // };
                if(atsAnalysis){
                  const atsresult = await prisma.aTSResult.create({
  data: {
    resumeId: resumeId,
    score: atsAnalysis.score,
    missingSkills: atsAnalysis.missingSkills,
    atsResultData: atsAnalysis.atsResultData,
    suggestions: atsAnalysis.suggestions,
    Issues: atsAnalysis.Issues,
    userId: userId,
  }
});

// Return only the fields declared in RunATSOutput
return {
  id: atsresult.id,
  resumeId: atsresult.resumeId,
  score: atsresult.score,
  missingSkills: atsresult.missingSkills,
  atsResultData: atsresult.atsResultData,
  Issues: atsresult.Issues,
  suggestions: atsresult.suggestions,
  userId: atsresult.userId,
};
                }
                else{
                    throw new Error("Failed to analyze the resume");
                }
          }      
    }
}

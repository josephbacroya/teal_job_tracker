"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
const pdfParse = require("pdf-parse");
import rateLimit from "../rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function matchJobs(formData: FormData) {
  try {
    // Basic rate limit check based on a static token for demo purposes.
    // In production, use user ID or IP address.
    await limiter.check(5, "CACHE_TOKEN");
  } catch {
    return { error: "Rate limit exceeded. Please try again later." };
  }

  const file = formData.get("resume") as File | null;
  const text = formData.get("resumeText") as string | null;

  let resumeText = "";

  if (file && file.size > 0) {
    if (file.type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else {
      resumeText = await file.text();
    }
  } else if (text) {
    resumeText = text;
  }

  if (!resumeText || resumeText.trim() === "") {
    return { error: "No resume content provided. Please upload a PDF or paste your resume text." };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      error: "GEMINI_API_KEY is not set. Please add it to your environment variables.",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are an expert technical recruiter and AI job matchmaker.
      Analyze the following resume and return a JSON object with this exact structure:
      {
        "level": "Fresh Grad" | "Entry Level" | "Mid Level" | "Senior Level",
        "coreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "recommendedJobs": [
          {
            "title": "Job Title",
            "company": "Fictional Company Name",
            "matchPercentage": 95,
            "reasoning": "A short sentence explaining why this is a good match based on their skills."
          }
        ]
      }
      
      Generate exactly 4 highly relevant fictional job recommendations.
      Return ONLY valid JSON. Do not include markdown formatting (like \`\`\`json) or any other text.
      
      Resume text:
      ${resumeText.substring(0, 5000)} // Limit to 5000 chars to save tokens
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResult = response.text().trim();
    
    // Strip markdown code block if present
    if (textResult.startsWith("\`\`\`json")) {
        textResult = textResult.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (textResult.startsWith("\`\`\`")) {
        textResult = textResult.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    try {
      const parsedData = JSON.parse(textResult);
      return { success: true, data: parsedData };
    } catch {
      console.error("Failed to parse Gemini response:", textResult);
      return { error: "Failed to parse AI response. Please try again." };
    }
  } catch (error) {
    console.error("AI Matchmaker Error:", error);
    return { error: "An error occurred while matching jobs. Please try again." };
  }
}

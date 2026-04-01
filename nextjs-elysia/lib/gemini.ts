import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ParsedResume {
  name: string;
  headline: string;
  summary: string;
  experiences: {
    company: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string | null;
    startDate: string;
    endDate: string | null;
    gpa: string | null;
  }[];
  skills: {
    name: string;
    category: string;
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    liveUrl: string | null;
    sourceUrl: string | null;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string | null;
    url: string | null;
  }[];
}

export async function parseResume(pdfBuffer: Buffer): Promise<ParsedResume> {
  const base64Pdf = pdfBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            text: `Parse this resume PDF and extract structured data. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact schema:

{
  "name": "Full Name",
  "headline": "Professional headline / job title",
  "summary": "Brief professional summary (2-3 sentences)",
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "description": "Description of responsibilities and achievements",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null if current",
      "location": "City, State or null"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type (e.g. Bachelor of Science)",
      "field": "Field of Study or null",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null",
      "gpa": "GPA value or null"
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "category": "Category (e.g. Programming Languages, Frameworks, Tools, Soft Skills)"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Project description",
      "techStack": ["Tech1", "Tech2"],
      "liveUrl": "URL or null",
      "sourceUrl": "URL or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "issueDate": "YYYY-MM-DD or null",
      "url": "URL or null"
    }
  ]
}

For dates, use the first day of the month if only month/year is provided (e.g. "Jan 2023" becomes "2023-01-01").
If a section has no data, return an empty array.
Return ONLY the JSON object, nothing else.`,
          },
        ],
      },
    ],
  });

  const text = response.text?.trim() ?? "";

  // Strip potential markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as ParsedResume;
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

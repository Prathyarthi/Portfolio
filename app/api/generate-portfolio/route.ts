import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

function getAiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are a portfolio content generator. Given a user's description, generate a complete, realistic portfolio JSON object.

Return ONLY valid JSON matching this exact schema. No markdown, no code fences.

{
  "portfolio": {
    "title": "Full Name",
    "headline": "Professional title / role",
    "summary": "2-3 sentence professional bio",
    "avatarUrl": null,
    "contactEmail": "email or null",
    "phone": null,
    "location": "City, Country or null",
    "websiteUrl": null,
    "customization": {}
  },
  "experiences": [
    {
      "id": "exp_1",
      "company": "Company Name",
      "role": "Job Title",
      "description": "Key responsibilities and achievements",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null (null if current)",
      "location": "City or null"
    }
  ],
  "educations": [
    {
      "id": "edu_1",
      "institution": "University Name",
      "degree": "Degree",
      "field": "Field of Study or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "gpa": null
    }
  ],
  "skills": [
    { "id": "skill_1", "name": "Skill", "category": "Category", "level": null }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": "Project Name",
      "description": "What it does and why it's interesting",
      "imageUrl": null,
      "liveUrl": null,
      "sourceUrl": null,
      "techStack": ["Tech1", "Tech2"],
      "featured": true,
      "githubStars": null,
      "githubForks": null,
      "language": null
    }
  ],
  "articles": [],
  "socialProfiles": [
    { "platform": "github", "url": "https://github.com/username", "username": "username", "cachedStats": null }
  ],
  "certifications": [],
  "achievements": [],
  "customSections": []
}

Generate realistic, detailed content. Include 2-4 experiences, 1-2 educations, 8-15 skills across categories, and 2-4 projects.`;

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_CHAT_PRIMARY_MODEL!,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser description:\n${prompt}`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)?.[0]?.trim() ?? cleaned;
    const data = JSON.parse(jsonMatch);

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

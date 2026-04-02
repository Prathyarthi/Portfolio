import { GoogleGenAI } from "@google/genai";

function getAiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

export interface ParsedResume {
  name: string;
  headline: string;
  summary: string;
  experiences: {
    company: string;
    role: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string | null;
    startDate: string | null;
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
  achievements: string[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string | null;
    url: string | null;
  }[];
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizeString(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  return String(v);
}

function normalizeDescription(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
      .filter(Boolean)
      .join("\n");
  }
  return String(v);
}

function normalizeEndDateField(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (/^(present|current|now|ongoing|till date|to date)$/i.test(s)) return null;
  return s;
}

/**
 * Coerce model output into ParsedResume: alternate keys, null descriptions,
 * and non-array sections from Gemini are common reasons imports silently fail validation.
 */
export function normalizeParsedResume(raw: unknown): ParsedResume {
  const o = asRecord(raw);
  if (!o) {
    return {
      name: "",
      headline: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      achievements: [],
      certifications: [],
    };
  }

  let experienceRaw: unknown[] = Array.isArray(o.experiences)
    ? o.experiences
    : [];
  if (experienceRaw.length === 0) {
    const alt =
      o.workExperience ??
      o.work_experience ??
      o.employment ??
      o.jobs ??
      o.jobHistory;
    if (Array.isArray(alt)) experienceRaw = alt;
  }
  console.log("Raw experience entries found:", experienceRaw.length);

  const experiences: ParsedResume["experiences"] = [];
  for (const item of experienceRaw) {
    const e = asRecord(item) ?? {};
    const company = normalizeString(e.company ?? e.employer ?? e.organization);
    const role = normalizeString(e.role ?? e.title ?? e.position ?? e.jobTitle);
    const startDate = normalizeString(e.startDate ?? e.start ?? e.from).trim();

    console.log("Processing experience entry:", JSON.stringify({ company, role, startDate, hasDescription: !!e.description }));
    if (!company || !role) {
      console.log("❌ SKIPPED - Missing company or role");
      continue;
    }

    console.log("✓ Added to experiences array");
    experiences.push({
      company,
      role,
      description: normalizeDescription(
        e.description ?? e.summary ?? e.highlights ?? e.responsibilities ?? e.details
      ),
      startDate: startDate || null,
      endDate: normalizeEndDateField(e.endDate ?? e.end ?? e.to),
      location:
        e.location == null || String(e.location).trim() === ""
          ? null
          : normalizeString(e.location),
    });
  }
  console.log("✅ Total experiences after normalization:", experiences.length);

  let educationRaw: unknown[] = Array.isArray(o.education) ? o.education : [];
  if (educationRaw.length === 0) {
    const alt = o.educations ?? o.academic ?? o.academics;
    if (Array.isArray(alt)) educationRaw = alt;
  }

  const education: ParsedResume["education"] = [];
  for (const item of educationRaw) {
    const e = asRecord(item) ?? {};
    const institution = normalizeString(e.institution ?? e.school ?? e.university);
    const degree = normalizeString(e.degree);
    const startDate = normalizeString(e.startDate ?? e.start ?? e.from).trim();

    if (!institution || !degree) continue;

    education.push({
      institution,
      degree,
      field:
        e.field == null || String(e.field).trim() === ""
          ? null
          : normalizeString(e.field),
      startDate: startDate || null,
      endDate: normalizeEndDateField(e.endDate ?? e.end ?? e.to),
      gpa:
        e.gpa == null || String(e.gpa).trim() === ""
          ? null
          : normalizeString(e.gpa),
    });
  }

  const skillsRaw: unknown[] = Array.isArray(o.skills) ? o.skills : [];
  const skills: ParsedResume["skills"] = skillsRaw
    .map((item) => {
      const s = asRecord(item) ?? {};
      return {
        name: normalizeString(s.name ?? s.skill),
        category: normalizeString(s.category ?? "General") || "General",
      };
    })
    .filter((s: ParsedResume["skills"][number]) => s.name.trim() !== "");

  const projectsRaw: unknown[] = Array.isArray(o.projects) ? o.projects : [];
  const projects: ParsedResume["projects"] = [];
  for (const item of projectsRaw) {
    const p = asRecord(item) ?? {};
    const title = normalizeString(p.title ?? p.name);
    if (!title) continue;
    let tech: unknown = p.techStack ?? p.tech_stack ?? p.technologies;
    if (!Array.isArray(tech)) tech = [];
    projects.push({
      title,
      description: normalizeDescription(p.description),
      techStack: (tech as unknown[]).map((x) => String(x)),
      liveUrl:
        p.liveUrl == null || String(p.liveUrl).trim() === ""
          ? null
          : normalizeString(p.liveUrl),
      sourceUrl:
        p.sourceUrl == null || String(p.sourceUrl).trim() === ""
          ? null
          : normalizeString(p.sourceUrl),
    });
  }

  let achievementsRaw: unknown = o.achievements ?? o.accomplishments ?? o.awards;
  let achievements: string[] = [];
  if (Array.isArray(achievementsRaw)) {
    achievements = achievementsRaw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        const a = asRecord(item);
        if (a) {
          return normalizeString(
            a.title ?? a.name ?? a.description ?? a.achievement
          );
        }
        return String(item);
      })
      .filter((text) => text.trim() !== "");
  } else if (typeof achievementsRaw === "string") {
    achievements = achievementsRaw
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  let certRaw: unknown[] = Array.isArray(o.certifications)
    ? o.certifications
    : [];
  if (certRaw.length === 0) {
    const alt = o.certification ?? o.certs;
    if (Array.isArray(alt)) certRaw = alt;
  }
  const certifications: ParsedResume["certifications"] = [];
  for (const item of certRaw) {
    const c = asRecord(item) ?? {};
    const name = normalizeString(c.name ?? c.title);
    if (!name) continue;
    certifications.push({
      name,
      issuer: normalizeString(c.issuer ?? c.organization ?? c.org ?? ""),
      issueDate:
        c.issueDate == null || String(c.issueDate).trim() === ""
          ? null
          : normalizeString(c.issueDate),
      url:
        c.url == null || String(c.url).trim() === "" ? null : normalizeString(c.url),
    });
  }

  return {
    name: normalizeString(o.name),
    headline: normalizeString(o.headline),
    summary: normalizeString(o.summary),
    experiences,
    education,
    skills,
    projects,
    achievements,
    certifications,
  };
}

export async function parseResume(pdfBuffer: Buffer): Promise<ParsedResume> {
  const ai = getAiClient();
  const base64Pdf = pdfBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_CHAT_PRIMARY_MODEL!,
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
            text: `Parse this resume PDF and extract ALL structured data. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. 

CRITICAL: Extract ALL work experience entries from the resume. Look for job titles, company names, employment history, work experience section, or professional experience section.

Use this exact schema:

{
  "name": "Full Name",
  "headline": "Professional headline / job title",
  "summary": "Brief professional summary (2-3 sentences)",
  "experiences": [
    {
      "company": "Company Name (REQUIRED)",
      "role": "Job Title (REQUIRED)",
      "description": "Description of responsibilities and achievements (or empty string)",
      "startDate": "YYYY-MM-DD (extract if available, otherwise null)",
      "endDate": "YYYY-MM-DD or null if current position",
      "location": "City, State or null"
    }
  ],
  "education": [
    {
      "institution": "University Name (REQUIRED)",
      "degree": "Degree Type (REQUIRED, e.g. Bachelor of Science)",
      "field": "Field of Study or null",
      "startDate": "YYYY-MM-DD (extract if available, otherwise null)",
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
  "achievements": [
    "Achievement or award description (string)",
    "Another achievement"
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

IMPORTANT RULES:
- Extract dates if available. For month/year only (e.g. "Jan 2023"), use "2023-01-01"
- If dates are not present in the resume, use null - DO NOT invent dates
- Extract ALL experience entries, even if dates are missing
- If a section has no data, return an empty array []
- Return ONLY the JSON object, nothing else`,
          },
        ],
      },
    ],
  });

  const text = response.text?.trim() ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  // Strip potential markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  const jsonCandidate =
    cleaned.match(/\{[\s\S]*\}/)?.[0]?.trim() ?? cleaned;

  if (!jsonCandidate) {
    throw new Error("Gemini response did not contain JSON");
  }

  try {
    const parsed: unknown = JSON.parse(jsonCandidate);
    return normalizeParsedResume(parsed);
  } catch {
    const preview =
      jsonCandidate.length > 300
        ? `${jsonCandidate.slice(0, 300)}...`
        : jsonCandidate;

    throw new Error(`Failed to parse Gemini response as JSON: ${preview}`);
  }
}

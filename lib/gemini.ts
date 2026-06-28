import { generateOpenRouterText } from "@/lib/openrouter";
import { normalizeMultilineText, stripBulletPrefix } from "@/lib/text";
import { normalizeSocialProfiles } from "@/lib/social-profile";

export interface ParsedCustomSection {
  sectionType: string;
  label: string;
  items: Record<string, unknown>[];
}

export interface ParsedResume {
  name: string;
  headline: string;
  summary: string;
  contact: {
    email: string | null;
    phone: string | null;
    websiteUrl: string | null;
    location: string | null;
  };
  socialProfiles: {
    platform: string;
    url: string | null;
    username: string | null;
  }[];
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
  customSections: ParsedCustomSection[];
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
  if (typeof v === "string") return normalizeMultilineText(v);
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? stripBulletPrefix(x) : String(x)))
      .filter(Boolean)
      .join("\n");
  }
  return normalizeMultilineText(String(v));
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
 * and non-array sections from AI output are common reasons imports silently fail validation.
 */
export function normalizeParsedResume(raw: unknown): ParsedResume {
  const o = asRecord(raw);
  if (!o) {
    return {
      name: "",
      headline: "",
      summary: "",
      contact: { email: null, phone: null, websiteUrl: null, location: null },
      socialProfiles: [],
      customSections: [],
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

  const experiences: ParsedResume["experiences"] = [];
  for (const item of experienceRaw) {
    const e = asRecord(item) ?? {};
    const company = normalizeString(e.company ?? e.employer ?? e.organization);
    const role = normalizeString(e.role ?? e.title ?? e.position ?? e.jobTitle);
    const startDate = normalizeString(e.startDate ?? e.start ?? e.from).trim();

    if (!company || !role) continue;

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

  const achievementsRaw: unknown = o.achievements ?? o.accomplishments ?? o.awards;
  let achievements: string[] = [];
  if (Array.isArray(achievementsRaw)) {
    achievements = achievementsRaw
      .map((item) => {
        if (typeof item === "string") return stripBulletPrefix(item);
        const a = asRecord(item);
        if (a) {
          return stripBulletPrefix(
            normalizeString(
              a.title ?? a.name ?? a.description ?? a.achievement
            )
          );
        }
        return stripBulletPrefix(String(item));
      })
      .filter((text) => text.trim() !== "");
  } else if (typeof achievementsRaw === "string") {
    achievements = achievementsRaw
      .split(/\n+/)
      .map(stripBulletPrefix)
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

  // Normalize custom sections
  const customSectionsRaw: unknown[] = Array.isArray(o.customSections)
    ? o.customSections
    : [];
  const customSections: ParsedCustomSection[] = [];
  for (const item of customSectionsRaw) {
    const s = asRecord(item);
    if (!s) continue;
    const sectionType = normalizeString(s.sectionType ?? s.section_type ?? s.type);
    const label = normalizeString(s.label ?? s.title ?? s.name);
    if (!sectionType || !label) continue;
    const items: Record<string, unknown>[] = [];
    const rawItems = Array.isArray(s.items) ? s.items : [];
    for (const entry of rawItems) {
      if (typeof entry === "string") {
        items.push({ title: entry });
      } else {
        const rec = asRecord(entry);
        if (rec) items.push(rec as Record<string, unknown>);
      }
    }
    if (items.length > 0) {
      customSections.push({ sectionType, label, items });
    }
  }

  function emptyToNull(v: unknown): string | null {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s || /^unknown$/i.test(s)) return null;
    return s;
  }

  const contactRaw = asRecord(o.contact) ?? {};
  const contact: ParsedResume["contact"] = {
    email: emptyToNull(contactRaw.email),
    phone: emptyToNull(contactRaw.phone),
    websiteUrl: emptyToNull(contactRaw.websiteUrl ?? contactRaw.website ?? contactRaw.url),
    location: emptyToNull(contactRaw.location ?? contactRaw.address ?? contactRaw.city),
  };

  const socialRaw: unknown[] = Array.isArray(o.socialProfiles)
    ? o.socialProfiles
    : Array.isArray(o.social_profiles)
      ? o.social_profiles
      : Array.isArray(o.socials)
        ? o.socials
        : [];
  const socialProfiles: ParsedResume["socialProfiles"] = [];
  for (const item of socialRaw) {
    const s = asRecord(item) ?? {};
    const platform = normalizeString(s.platform ?? s.network ?? "unknown").toLowerCase().trim();
    const url = emptyToNull(s.url ?? s.link);
    const username = emptyToNull(s.username ?? s.handle ?? s.user);
    if (!url && !username) continue;
    socialProfiles.push({ platform: platform || "unknown", url, username });
  }

  const resolvedSocialProfiles = normalizeSocialProfiles(socialProfiles);

  return {
    name: normalizeString(o.name),
    headline: normalizeString(o.headline),
    summary: normalizeString(o.summary),
    contact,
    socialProfiles: resolvedSocialProfiles,
    experiences,
    education,
    skills,
    projects,
    achievements,
    certifications,
    customSections,
  };
}

function buildPrompt(rawText: string): string {
  return `You are a resume parser. Below is raw text extracted from a resume PDF. Structure ALL of it into JSON.

CRITICAL RULES:
- Do NOT skip any information. Every piece of data in the resume must appear in your output.
- MULTI-LINE DESCRIPTIONS: For experiences, projects, and similar fields with multiple points, put each point on its own line (newline-separated). Do NOT prefix lines with bullet characters (•, -, *, etc.) — the portfolio template adds bullets automatically. Strip bullet markers from the source text; keep the words only.
- For well-known sections, use the schemas below.
- For ANY information that does NOT fit the well-known schemas, put it in "customSections". This includes: volunteer work, publications, languages, interests, hobbies, references, awards, honors, courses, trainings, or anything else NOT covered by the schemas. Do NOT use customSections for contact info or social profiles — those have their own fields.
- DO NOT duplicate. If a piece of information fits a well-known schema field (e.g. a school percentage fits "gpa", a project description fits "projects[].description", an email fits "contact.email", a LinkedIn URL fits "socialProfiles"), put it there ONLY. Never repeat the same fact in customSections.
- PRESERVE TEXT EXACTLY. For emails, phone numbers, handles, URLs, and any verbatim values from the resume — copy them character-for-character. Do NOT paraphrase, normalize formatting, strip leading "@" or "/", or invent wrapper keys like "type"/"value"/"handle". Use the schema field names exactly as defined below.
- PLATFORM IDENTIFICATION (for socialProfiles): only set "platform" if you can identify it from a URL domain (github.com → "github", linkedin.com → "linkedin", x.com or twitter.com → "twitter", instagram.com → "instagram", medium.com → "medium", dribbble.com → "dribbble", leetcode.com → "leetcode"). If you only see a bare handle like "@username" or "/username" with no URL or unambiguous platform label nearby, set "platform": "unknown" and put the raw text in "username". Do NOT guess.
- Extract dates if available. For month/year only (e.g. "Jan 2023"), use "2023-01-01". If no date, use null.
- Do NOT invent data. If a field isn't in the resume, use null (or "" for required strings like headline/summary, or skip the entry if a REQUIRED field is missing). Never guess company names, dates, GPAs, or any other facts.
- Return ONLY valid JSON, no markdown, no code fences.

Schema:
{
  "name": "Full Name",
  "headline": "Professional headline / job title",
  "summary": "Brief professional summary (2-3 sentences)",
  "contact": {
    "email": "primary email exactly as written, or null",
    "phone": "primary phone exactly as written (including +country, parentheses, dashes), or null",
    "websiteUrl": "personal website or portfolio URL exactly as written, or null",
    "location": "city/state/country as written, or null"
  },
  "socialProfiles": [
    { "platform": "github | linkedin | twitter | instagram | medium | dribbble | leetcode | unknown", "url": "full URL exactly as written, or null", "username": "handle exactly as written including any leading @ or /, or null" }
  ],
  "experiences": [
    {
      "company": "Company Name (REQUIRED)",
      "role": "Job Title (REQUIRED)",
      "description": "Responsibilities and achievements — one point per line, newline-separated, no bullet characters (or empty string)",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null if current position",
      "location": "City, State or null"
    }
  ],
  "education": [
    {
      "institution": "University Name (REQUIRED)",
      "degree": "Degree Type (REQUIRED)",
      "field": "Field of Study or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "gpa": "GPA value or null"
    }
  ],
  "skills": [
    { "name": "Skill Name", "category": "Category (e.g. Programming Languages, Frameworks, Tools)" }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Project description — one point per line, newline-separated, no bullet characters. Can also be an array of plain strings",
      "techStack": ["Tech1", "Tech2"],
      "liveUrl": "URL or null",
      "sourceUrl": "URL or null"
    }
  ],
  "achievements": ["Plain achievement text — no bullet characters"],
  "certifications": [
    { "name": "Certification Name", "issuer": "Issuing Organization", "issueDate": "YYYY-MM-DD or null", "url": "URL or null" }
  ],
  "customSections": [
    {
      "sectionType": "snake_case_key (e.g. contact_info, social_profiles, volunteer_work)",
      "label": "Human-readable label (e.g. Contact Information, Social Profiles, Volunteer Work)",
      "items": [
        { "title": "Item title", "description": "Item description", "date": "date or null", ...any other relevant fields }
      ]
    }
  ]
}

If a section has no data, return an empty array [].

RESUME TEXT:
${rawText}`;
}

export async function structureResumeWithAi(
  rawText: string,
): Promise<ParsedResume> {
  const text = await generateOpenRouterText({
    messages: [
      {
        role: "user",
        content: buildPrompt(rawText),
      },
    ],
  });

  // Strip potential markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  const jsonCandidate =
    cleaned.match(/\{[\s\S]*\}/)?.[0]?.trim() ?? cleaned;

  if (!jsonCandidate) {
    throw new Error("OpenRouter response did not contain JSON");
  }

  try {
    const parsed: unknown = JSON.parse(jsonCandidate);
    return normalizeParsedResume(parsed);
  } catch {
    const preview =
      jsonCandidate.length > 300
        ? `${jsonCandidate.slice(0, 300)}...`
        : jsonCandidate;

    throw new Error(`Failed to parse OpenRouter response as JSON: ${preview}`);
  }
}

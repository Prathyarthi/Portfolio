import { generateOpenRouterResumeText } from "@/lib/openrouter";
import {
  RESUME_PARSER_SYSTEM,
  buildResumeUserMessage,
} from "@/lib/resume-parser-prompt";
import { normalizeMultilineText, stripBulletPrefix } from "@/lib/text";
import { normalizeSocialProfiles } from "@/lib/social-profile";
import type { SectionKey } from "@/features/templates/section-labels";

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
  /** Original resume section headings mapped to canonical keys. */
  sectionLabels?: Partial<Record<SectionKey, string>>;
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

  const sectionLabelsRaw = asRecord(o.sectionLabels) ?? asRecord(o.section_labels);
  const sectionLabels: ParsedResume["sectionLabels"] = {};
  if (sectionLabelsRaw) {
    for (const [key, value] of Object.entries(sectionLabelsRaw)) {
      if (typeof value === "string" && value.trim()) {
        sectionLabels[key as SectionKey] = value.trim();
      }
    }
  }

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
    ...(Object.keys(sectionLabels).length > 0 ? { sectionLabels } : {}),
  };
}

export async function structureResumeWithAi(
  rawText: string,
): Promise<ParsedResume> {
  const text = await generateOpenRouterResumeText(
    buildResumeUserMessage(rawText),
    RESUME_PARSER_SYSTEM,
  );

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

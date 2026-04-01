import { PortfolioData } from "../types";
import {
  formatDateRange,
  groupSkillsByCategory,
  getPlatformIcon,
} from "../utils";

/* ------------------------------------------------------------------ */
/*  CORPORATE TEMPLATE                                                 */
/*  Professional, recruiter-optimized two-column portfolio / resume.   */
/*  Navy / slate palette  |  Tailwind CSS only  |  No shadcn           */
/* ------------------------------------------------------------------ */

export function CorporateTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, experiences, educations, skills, projects, socialProfiles, certifications } =
    data;

  const skillsByCategory = groupSkillsByCategory(skills);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* ====================== TWO-COLUMN LAYOUT ====================== */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col shadow-xl lg:flex-row">
        {/* =================== LEFT SIDEBAR (1/3) =================== */}
        <aside className="w-full shrink-0 bg-slate-900 px-8 py-12 text-slate-200 lg:w-[340px]">
          {/* ---------- Avatar ---------- */}
          {portfolio.avatarUrl && (
            <div className="mb-6 flex justify-center">
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.title}
                className="h-36 w-36 rounded-full border-4 border-slate-700 object-cover shadow-lg"
              />
            </div>
          )}

          {/* ---------- Name & Headline ---------- */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {portfolio.title}
            </h1>
            {portfolio.headline && (
              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-sky-400">
                {portfolio.headline}
              </p>
            )}
          </div>

          {/* ---------- Contact Info ---------- */}
          <SidebarSection title="Contact">
            <ul className="space-y-3 text-sm">
              {portfolio.contactEmail && (
                <ContactRow label="Email">
                  <a
                    href={`mailto:${portfolio.contactEmail}`}
                    className="break-all text-sky-400 hover:underline"
                  >
                    {portfolio.contactEmail}
                  </a>
                </ContactRow>
              )}
              {portfolio.phone && (
                <ContactRow label="Phone">
                  <a
                    href={`tel:${portfolio.phone}`}
                    className="text-sky-400 hover:underline"
                  >
                    {portfolio.phone}
                  </a>
                </ContactRow>
              )}
              {portfolio.location && (
                <ContactRow label="Location">
                  <span>{portfolio.location}</span>
                </ContactRow>
              )}
              {portfolio.websiteUrl && (
                <ContactRow label="Website">
                  <a
                    href={portfolio.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sky-400 hover:underline"
                  >
                    {portfolio.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </ContactRow>
              )}
            </ul>
          </SidebarSection>

          {/* ---------- Skills grouped by category ---------- */}
          {skills.length > 0 && (
            <SidebarSection title="Skills">
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, names]) => (
                  <div key={category}>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {names.map((name) => (
                        <span
                          key={name}
                          className="inline-block rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* ---------- Social Links ---------- */}
          {socialProfiles.length > 0 && (
            <SidebarSection title="Profiles">
              <ul className="space-y-2 text-sm">
                {socialProfiles.map((sp) => (
                  <li key={sp.url}>
                    <a
                      href={sp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-slate-300 hover:text-sky-400"
                    >
                      <span className="font-medium">
                        {getPlatformIcon(sp.platform)}
                      </span>
                      {sp.username && (
                        <span className="text-slate-400 group-hover:text-sky-400">
                          @{sp.username}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* ---------- Certifications ---------- */}
          {certifications.length > 0 && (
            <SidebarSection title="Certifications">
              <ul className="space-y-3 text-sm">
                {certifications.map((cert) => (
                  <li key={cert.id}>
                    <p className="font-semibold text-white">
                      {cert.url ? (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-sky-400 hover:underline"
                        >
                          {cert.name}
                        </a>
                      ) : (
                        cert.name
                      )}
                    </p>
                    <p className="text-slate-400">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Issued{" "}
                        {new Date(cert.issueDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}
        </aside>

        {/* =================== MAIN CONTENT (2/3) =================== */}
        <main className="flex-1 bg-white px-10 py-12">
          {/* ---------- Professional Summary ---------- */}
          {portfolio.summary && (
            <section className="mb-10">
              <SectionHeading>Professional Summary</SectionHeading>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {portfolio.summary}
              </p>
            </section>
          )}

          {/* ---------- Work Experience ---------- */}
          {experiences.length > 0 && (
            <section className="mb-10">
              <SectionHeading>Work Experience</SectionHeading>
              <div className="space-y-8">
                {experiences.map((exp) => (
                  <article key={exp.id} className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-navy-600 before:content-[''] after:absolute after:left-[4.5px] after:top-5 after:h-[calc(100%-12px)] after:w-px after:bg-slate-200 after:content-[''] last:after:hidden">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="text-base font-bold text-slate-900">
                        {exp.role}
                      </h3>
                      <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-sky-700">
                      {exp.company}
                      {exp.location && (
                        <span className="font-normal text-slate-400">
                          {" "}
                          &middot; {exp.location}
                        </span>
                      )}
                    </p>
                    {exp.description && (
                      <div className="mt-2 text-sm leading-relaxed text-slate-600">
                        <DescriptionList text={exp.description} />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Education ---------- */}
          {educations.length > 0 && (
            <section className="mb-10">
              <SectionHeading>Education</SectionHeading>
              <div className="space-y-6">
                {educations.map((edu) => (
                  <article key={edu.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="text-base font-bold text-slate-900">
                        {edu.institution}
                      </h3>
                      <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {edu.degree}
                      {edu.field && <span> in {edu.field}</span>}
                      {edu.gpa && (
                        <span className="ml-2 text-slate-400">
                          &middot; GPA: {edu.gpa}
                        </span>
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Projects ---------- */}
          {projects.length > 0 && (
            <section className="mb-10">
              <SectionHeading>Projects</SectionHeading>
              <div className="grid gap-5 sm:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-5 transition-shadow hover:shadow-md"
                  >
                    {/* Project image */}
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="mb-4 h-36 w-full rounded object-cover"
                      />
                    )}

                    <h3 className="text-sm font-bold text-slate-900">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {project.description}
                      </p>
                    )}

                    {/* Tech stack */}
                    {project.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-800"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* GitHub stats */}
                    {(project.githubStars !== null || project.githubForks !== null) && (
                      <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
                        {project.githubStars !== null && (
                          <span>{project.githubStars} stars</span>
                        )}
                        {project.githubForks !== null && (
                          <span>{project.githubForks} forks</span>
                        )}
                        {project.language && (
                          <span className="ml-auto">{project.language}</span>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    {(project.liveUrl || project.sourceUrl) && (
                      <div className="mt-3 flex items-center gap-4 border-t border-slate-200 pt-3 text-xs font-medium">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 hover:underline"
                          >
                            Live Demo
                          </a>
                        )}
                        {project.sourceUrl && (
                          <a
                            href={project.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:underline"
                          >
                            Source Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ====================== FOOTER ====================== */}
      <footer className="mx-auto max-w-6xl border-t border-slate-200 bg-white px-10 py-6 text-center text-xs text-slate-400 shadow-xl">
        <p>
          &copy; {new Date().getFullYear()} {portfolio.title}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INTERNAL HELPER COMPONENTS                                         */
/* ------------------------------------------------------------------ */

/** Section heading used in the main content area. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b-2 border-slate-900 pb-2 text-lg font-bold uppercase tracking-wide text-slate-900">
      {children}
    </h2>
  );
}

/** Sidebar section with a divider-like title. */
function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 border-b border-slate-700 pb-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Renders a label + value row inside the contact block. */
function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className="mt-0.5">{children}</span>
    </li>
  );
}

/**
 * Splits a description into bullet points.
 * If the text contains newline-separated lines it renders each as a bullet;
 * otherwise it renders the text as a single paragraph.
 */
function DescriptionList({ text }: { text: string }) {
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p>{text}</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-4 marker:text-slate-300">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

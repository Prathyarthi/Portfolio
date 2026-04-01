import { PortfolioData } from "../types";
import {
  formatDateRange,
  groupSkillsByCategory,
  getPlatformIcon,
} from "../utils";

export function ModernTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, experiences, educations, skills, projects, socialProfiles, certifications } =
    data;
  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 pb-20 pt-24 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          {portfolio.avatarUrl && (
            <img
              src={portfolio.avatarUrl}
              alt={portfolio.title}
              className="mb-6 h-32 w-32 rounded-full border-4 border-white/30 object-cover shadow-xl"
            />
          )}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {portfolio.title}
          </h1>
          {portfolio.headline && (
            <p className="mt-3 max-w-lg text-lg text-blue-100">
              {portfolio.headline}
            </p>
          )}
          {portfolio.location && (
            <p className="mt-2 text-sm font-medium text-blue-200">
              {portfolio.location}
            </p>
          )}

          {socialProfiles.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {socialProfiles.map((sp) => (
                <a
                  key={sp.platform}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  {getPlatformIcon(sp.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* ── About ── */}
        {portfolio.summary && (
          <section className="mb-16">
            <SectionHeading>About Me</SectionHeading>
            <div className="rounded-xl border-l-4 border-indigo-500 bg-white p-6 shadow-sm">
              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {portfolio.summary}
              </p>
            </div>
          </section>
        )}

        {/* ── Experience ── */}
        {experiences.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="relative flex gap-5 rounded-xl bg-white p-6 shadow-sm"
                >
                  {/* Timeline dot + connector */}
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                    {idx < experiences.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-indigo-200" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                        <p className="text-sm font-medium text-indigo-600">{exp.company}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>{formatDateRange(exp.startDate, exp.endDate)}</p>
                        {exp.location && <p>{exp.location}</p>}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Education ── */}
        {educations.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Education</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900">
                    {edu.degree}
                    {edu.field && <span className="font-normal text-slate-500"> in {edu.field}</span>}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-indigo-600">
                    {edu.institution}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                  {edu.gpa && (
                    <p className="mt-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Skills</SectionHeading>
            <div className="space-y-5">
              {Object.entries(groupedSkills).map(([category, names]) => (
                <div key={category}>
                  <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    {category}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {names.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Projects ── */}
        {projects.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Projects</SectionHeading>
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {project.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {project.featured && (
                        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow">
                          Featured
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                      {!project.imageUrl && project.featured && (
                        <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {project.description}
                      </p>
                    )}

                    {project.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.githubStars !== null || project.githubForks !== null || project.language) && (
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        {project.githubStars !== null && (
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>
                            {project.githubStars}
                          </span>
                        )}
                        {project.githubForks !== null && (
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM8 13.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 1.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .414.336.75.75.75Z" /></svg>
                            {project.githubForks}
                          </span>
                        )}
                        {project.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                            {project.language}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.sourceUrl && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Certifications ── */}
        {certifications.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Certifications</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900">
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {cert.name}
                      </a>
                    ) : (
                      cert.name
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{cert.issuer}</p>
                  {cert.issueDate && (
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Contact CTA ── */}
      {(portfolio.contactEmail || portfolio.phone || portfolio.websiteUrl) && (
        <footer className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Get in Touch</h2>
          <p className="mx-auto mt-3 max-w-md text-blue-100">
            Interested in working together? Feel free to reach out.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {portfolio.contactEmail && (
              <a
                href={`mailto:${portfolio.contactEmail}`}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-indigo-700 shadow transition-colors hover:bg-blue-50"
              >
                {portfolio.contactEmail}
              </a>
            )}
            {portfolio.phone && (
              <a
                href={`tel:${portfolio.phone}`}
                className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                {portfolio.phone}
              </a>
            )}
            {portfolio.websiteUrl && (
              <a
                href={portfolio.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Website
              </a>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

/* ── Shared Section Heading ── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

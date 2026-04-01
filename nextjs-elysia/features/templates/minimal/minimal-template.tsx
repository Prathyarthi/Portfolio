import { PortfolioData } from "../types";
import {
  formatDateRange,
  groupSkillsByCategory,
  getPlatformIcon,
} from "../utils";

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, experiences, educations, skills, projects, socialProfiles, certifications } =
    data;
  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* ── Hero ── */}
      <header className="flex flex-col items-center px-6 pb-16 pt-24">
        {portfolio.avatarUrl && (
          <img
            src={portfolio.avatarUrl}
            alt={portfolio.title}
            className="mb-6 h-28 w-28 rounded-full object-cover ring-2 ring-stone-200"
          />
        )}
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {portfolio.title}
        </h1>
        {portfolio.headline && (
          <p className="mt-3 max-w-md text-center text-lg text-stone-500">
            {portfolio.headline}
          </p>
        )}
        {portfolio.location && (
          <p className="mt-2 text-sm tracking-wide text-stone-400">
            {portfolio.location}
          </p>
        )}
      </header>

      <div className="mx-auto max-w-2xl px-6 pb-24">
        {/* ── About ── */}
        {portfolio.summary && (
          <section className="mb-20">
            <SectionHeading>About</SectionHeading>
            <p className="whitespace-pre-line leading-relaxed text-stone-600">
              {portfolio.summary}
            </p>
          </section>
        )}

        {/* ── Experience ── */}
        {experiences.length > 0 && (
          <section className="mb-20">
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-10">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-6 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-px before:bg-stone-200">
                  <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-stone-400" />
                  <p className="text-xs uppercase tracking-widest text-stone-400">
                    {formatDateRange(exp.startDate, exp.endDate)}
                    {exp.location && <span> &middot; {exp.location}</span>}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">
                    {exp.role}
                  </h3>
                  <p className="text-sm text-stone-500">{exp.company}</p>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Education ── */}
        {educations.length > 0 && (
          <section className="mb-20">
            <SectionHeading>Education</SectionHeading>
            <div className="space-y-10">
              {educations.map((edu) => (
                <div key={edu.id} className="relative pl-6 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-px before:bg-stone-200">
                  <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-stone-400" />
                  <p className="text-xs uppercase tracking-widest text-stone-400">
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">
                    {edu.degree}
                    {edu.field && <span> in {edu.field}</span>}
                  </h3>
                  <p className="text-sm text-stone-500">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="mt-1 text-xs text-stone-400">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <section className="mb-20">
            <SectionHeading>Skills</SectionHeading>
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([category, names]) => (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-400">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {names.map((name) => (
                      <span
                        key={name}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600"
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
          <section className="mb-20">
            <SectionHeading>Projects</SectionHeading>
            <div className="space-y-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-stone-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      {project.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-700"
                        >
                          Live
                        </a>
                      )}
                      {project.sourceUrl && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-700"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {project.description}
                    </p>
                  )}
                  {project.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.githubStars !== null || project.githubForks !== null) && (
                    <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
                      {project.githubStars !== null && (
                        <span>{project.githubStars} stars</span>
                      )}
                      {project.githubForks !== null && (
                        <span>{project.githubForks} forks</span>
                      )}
                      {project.language && <span>{project.language}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Certifications ── */}
        {certifications.length > 0 && (
          <section className="mb-20">
            <SectionHeading>Certifications</SectionHeading>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-stone-900">
                      {cert.url ? (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-stone-600"
                        >
                          {cert.name}
                        </a>
                      ) : (
                        cert.name
                      )}
                    </h3>
                    <p className="text-sm text-stone-500">{cert.issuer}</p>
                  </div>
                  {cert.issueDate && (
                    <p className="shrink-0 text-xs text-stone-400">
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

        {/* ── Footer / Contact ── */}
        <footer className="border-t border-stone-200 pt-10 text-center">
          {socialProfiles.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-4">
              {socialProfiles.map((sp) => (
                <a
                  key={sp.platform}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 underline underline-offset-2 transition-colors hover:text-stone-700"
                >
                  {getPlatformIcon(sp.platform)}
                </a>
              ))}
            </div>
          )}

          <div className="space-y-1 text-sm text-stone-400">
            {portfolio.contactEmail && (
              <p>
                <a
                  href={`mailto:${portfolio.contactEmail}`}
                  className="underline underline-offset-2 hover:text-stone-600"
                >
                  {portfolio.contactEmail}
                </a>
              </p>
            )}
            {portfolio.phone && <p>{portfolio.phone}</p>}
            {portfolio.websiteUrl && (
              <p>
                <a
                  href={portfolio.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-stone-600"
                >
                  {portfolio.websiteUrl}
                </a>
              </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ── Shared Section Heading ── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-stone-900">
      {children}
    </h2>
  );
}

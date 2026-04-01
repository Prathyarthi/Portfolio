import type { PortfolioData } from "../types";
import {
  ContactChips,
  DescriptionBlock,
  ProjectActions,
  SocialPills,
  StatStrip,
} from "../shared";
import { formatDateRange, groupSkillsByCategory } from "../utils";

export function CorporateTemplate({ data }: { data: PortfolioData }) {
  const {
    portfolio,
    experiences,
    educations,
    skills,
    projects,
    socialProfiles,
    certifications,
  } = data;
  const skillsByCategory = groupSkillsByCategory(skills);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <header className="overflow-hidden rounded-[2rem] bg-[#0f172a] text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">
                Executive Portfolio
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
                {portfolio.title}
              </h1>
              {portfolio.headline && (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
                  {portfolio.headline}
                </p>
              )}

              <div className="mt-6">
                <ContactChips
                  portfolio={portfolio}
                  chipClassName="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-300"
                />
              </div>

              {socialProfiles.length > 0 && (
                <div className="mt-6">
                  <SocialPills
                    profiles={socialProfiles}
                    showUsername
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/10"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-gradient-to-br from-sky-500/20 via-transparent to-white/5 p-8 lg:border-l lg:border-t-0 md:p-12">
              {portfolio.avatarUrl ? (
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.title}
                  className="h-72 w-full rounded-[1.75rem] object-cover"
                />
              ) : (
                <div className="h-72 rounded-[1.75rem] bg-gradient-to-br from-sky-400/30 to-slate-700/40" />
              )}
            </div>
          </div>
        </header>

        <div className="mt-8">
          <StatStrip
            items={[
              { label: "Experience", value: `${experiences.length} roles` },
              { label: "Projects", value: `${projects.length} launches` },
              { label: "Skills", value: `${skills.length} listed` },
              { label: "Certifications", value: `${certifications.length}` },
            ]}
            className="lg:grid-cols-4"
            valueClassName="text-2xl font-semibold text-slate-900"
            labelClassName="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <main className="space-y-8">
            {portfolio.summary && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Professional Summary</SectionHeading>
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="whitespace-pre-line text-base leading-8 text-slate-600"
                  listClassName="space-y-3 pl-5 text-base leading-8 text-slate-600 marker:text-slate-300"
                />
              </section>
            )}

            {experiences.length > 0 && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Experience</SectionHeading>
                <div className="space-y-5">
                  {experiences.map((exp) => (
                    <article
                      key={exp.id}
                      className="rounded-[1.4rem] border border-slate-200 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {exp.role}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-sky-800">
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className="mt-1 text-sm text-slate-500">{exp.location}</p>
                          )}
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </p>
                      </div>
                      {exp.description && (
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mt-4 text-sm leading-7 text-slate-600"
                          listClassName="mt-4 space-y-2 pl-5 text-sm leading-7 text-slate-600 marker:text-slate-300"
                        />
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {visibleProjects.length > 0 && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Selected Work</SectionHeading>
                <div className="grid gap-5 sm:grid-cols-2">
                  {visibleProjects.map((project) => (
                    <article
                      key={project.id}
                      className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50"
                    >
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="h-44 w-full object-cover"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {project.title}
                              </h3>
                              {project.featured && (
                                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white">
                                  Featured
                                </span>
                              )}
                            </div>
                            {project.language && (
                              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                                {project.language}
                              </p>
                            )}
                          </div>
                        </div>

                        {project.description && (
                          <p className="mt-4 text-sm leading-7 text-slate-600">
                            {project.description}
                          </p>
                        )}

                        {project.techStack.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {(project.githubStars !== null || project.githubForks !== null) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.githubStars !== null && (
                              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                                {project.githubStars} stars
                              </span>
                            )}
                            {project.githubForks !== null && (
                              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                                {project.githubForks} forks
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-5">
                          <ProjectActions
                            liveUrl={project.liveUrl}
                            sourceUrl={project.sourceUrl}
                            liveClassName="rounded-full bg-sky-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800"
                            sourceClassName="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-8">
            {skills.length > 0 && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Capabilities</SectionHeading>
                <div className="space-y-6">
                  {Object.entries(skillsByCategory).map(([category, names]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {names.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
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

            {educations.length > 0 && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Education</SectionHeading>
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <article key={edu.id} className="rounded-[1.4rem] border border-slate-200 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {edu.degree}
                        {edu.field && <span className="text-slate-500"> in {edu.field}</span>}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">{edu.institution}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                      {edu.gpa && <p className="mt-3 text-xs text-slate-500">GPA: {edu.gpa}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm">
                <SectionHeading>Certifications</SectionHeading>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <article key={cert.id} className="rounded-[1.4rem] border border-slate-200 p-5">
                      <h3 className="text-base font-semibold text-slate-900">
                        {cert.url ? (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-sky-700"
                          >
                            {cert.name}
                          </a>
                        ) : (
                          cert.name
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                          {new Date(cert.issueDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">{children}</h2>
  );
}

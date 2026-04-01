import type { PortfolioData } from "../types";
import {
  ContactChips,
  DescriptionBlock,
  ProjectActions,
  SocialPills,
} from "../shared";
import { formatDateRange, groupSkillsByCategory } from "../utils";

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const {
    portfolio,
    experiences,
    educations,
    skills,
    projects,
    socialProfiles,
    certifications,
  } = data;
  const groupedSkills = groupSkillsByCategory(skills);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = featuredProjects.length > 0 ? featuredProjects : projects;

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-stone-800">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-10 md:pt-14">
        <header className="rounded-[2rem] border border-stone-200/80 bg-[#fbf8f1] p-8 shadow-[0_20px_80px_rgba(120,113,108,0.08)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                Minimal Portfolio
              </p>
              <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight text-stone-900 md:text-7xl">
                {portfolio.title}
              </h1>
              {portfolio.headline && (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
                  {portfolio.headline}
                </p>
              )}

              <div className="mt-6">
                <ContactChips
                  portfolio={portfolio}
                  chipClassName="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-sm text-stone-500"
                />
              </div>

              {socialProfiles.length > 0 && (
                <div className="mt-6">
                  <SocialPills
                    profiles={socialProfiles}
                    showUsername
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {portfolio.avatarUrl ? (
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.title}
                  className="h-72 w-full rounded-[1.75rem] object-cover"
                />
              ) : (
                <div className="h-72 rounded-[1.75rem] bg-gradient-to-br from-stone-200 via-[#f7efe2] to-stone-100" />
              )}
              <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Focus
                </p>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  A restrained, editorial portfolio for people who want their work
                  and writing to carry the page.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <main className="space-y-10">
            {portfolio.summary && (
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>About</SectionHeading>
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="whitespace-pre-line text-base leading-8 text-stone-600"
                  listClassName="space-y-3 pl-5 text-base leading-8 text-stone-600 marker:text-stone-300"
                />
              </section>
            )}

            {visibleProjects.length > 0 && (
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>Selected Work</SectionHeading>
                <div className="grid gap-5">
                  {visibleProjects.map((project) => (
                    <article
                      key={project.id}
                      className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8]"
                    >
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="h-52 w-full object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-2xl font-semibold text-stone-900">
                                {project.title}
                              </h3>
                              {project.featured && (
                                <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-100">
                                  Featured
                                </span>
                              )}
                            </div>
                            {project.language && (
                              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-400">
                                {project.language}
                              </p>
                            )}
                          </div>

                          <ProjectActions
                            liveUrl={project.liveUrl}
                            sourceUrl={project.sourceUrl}
                            liveClassName="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-stone-100 transition-colors hover:bg-stone-700"
                            sourceClassName="rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
                          />
                        </div>

                        {project.description && (
                          <p className="mt-4 text-sm leading-7 text-stone-600">
                            {project.description}
                          </p>
                        )}

                        {(project.techStack.length > 0 ||
                          project.githubStars !== null ||
                          project.githubForks !== null) && (
                          <div className="mt-5 flex flex-wrap items-center gap-2">
                            {project.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.githubStars !== null && (
                              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                                {project.githubStars} stars
                              </span>
                            )}
                            {project.githubForks !== null && (
                              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                                {project.githubForks} forks
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {experiences.length > 0 && (
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>Experience</SectionHeading>
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <article
                      key={exp.id}
                      className="rounded-[1.25rem] border border-stone-200 bg-[#fffdf8] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-stone-900">
                            {exp.role}
                          </h3>
                          <p className="mt-1 text-sm text-stone-500">
                            {exp.company}
                            {exp.location ? ` · ${exp.location}` : ""}
                          </p>
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </p>
                      </div>
                      {exp.description && (
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mt-4 text-sm leading-7 text-stone-600"
                          listClassName="mt-4 space-y-2 pl-5 text-sm leading-7 text-stone-600 marker:text-stone-300"
                        />
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-10">
            {skills.length > 0 && (
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>Skills</SectionHeading>
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([category, names]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-stone-400">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {names.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600"
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
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>Education</SectionHeading>
                <div className="space-y-5">
                  {educations.map((edu) => (
                    <article key={edu.id} className="rounded-[1.25rem] bg-[#fffdf8] p-5">
                      <h3 className="font-serif text-lg font-semibold text-stone-900">
                        {edu.degree}
                        {edu.field && <span className="text-stone-500"> in {edu.field}</span>}
                      </h3>
                      <p className="mt-2 text-sm text-stone-500">{edu.institution}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                      {edu.gpa && <p className="mt-3 text-xs text-stone-500">GPA: {edu.gpa}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-8">
                <SectionHeading>Certifications</SectionHeading>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <article key={cert.id} className="rounded-[1.25rem] bg-[#fffdf8] p-5">
                      <h3 className="font-medium text-stone-900">
                        {cert.url ? (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-stone-600"
                          >
                            {cert.name}
                          </a>
                        ) : (
                          cert.name
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400">
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
    <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight text-stone-900">
      {children}
    </h2>
  );
}

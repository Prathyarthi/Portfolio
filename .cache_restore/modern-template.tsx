import type { PortfolioData } from "../types";
import { Trophy } from "lucide-react";
import {
  buildTemplateSections,
  ContactChips,
  DescriptionBlock,
  HeroProfileButtons,
  ProfileLinksSection,
  ProjectActions,
  SocialPills,
  StatStrip,
  TemplateNavbar,
} from "../shared";
import { formatDateRange, groupSkillsByCategory } from "../utils";

export function ModernTemplate({ data }: { data: PortfolioData }) {
  const {
    portfolio,
    experiences,
    educations,
    skills,
    projects,
    socialProfiles,
    certifications,
    achievements,
  } = data;
  const groupedSkills = groupSkillsByCategory(skills);
  const featuredProjects = projects.filter((project) => project.featured);
  const leadProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);
  const { hasProfiles, navbarEnabled, sections } = buildTemplateSections(data);

  return (
    <div className="min-h-screen bg-[#070b16] text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[24rem] w-[24rem] rounded-full bg-cyan-400/14 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-16">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Modern Portfolio
                </p>
                <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
                  {portfolio.title}
                </h1>
                {portfolio.headline && (
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
                    {portfolio.headline}
                  </p>
                )}

                <div className="mt-6">
                  <ContactChips
                    portfolio={portfolio}
                    chipClassName="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-400"
                  />
                </div>

                <div className="mt-4">
                  <HeroProfileButtons
                    profiles={socialProfiles}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.09]"
                  />
                </div>

                {socialProfiles.length > 0 && (
                  <div className="mt-6">
                    <SocialPills
                      profiles={socialProfiles}
                      showUsername
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.09]"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/6 to-cyan-400/10 p-5">
                  {portfolio.avatarUrl ? (
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.title}
                      className="h-72 w-full rounded-[1.4rem] object-cover"
                    />
                  ) : (
                    <div className="h-72 rounded-[1.4rem] bg-gradient-to-br from-violet-400/30 to-cyan-300/20" />
                  )}
                </div>

                <StatStrip
                  className="md:grid-cols-3"
                  items={[
                    {
                      label: "Experience",
                      value: experiences.length > 0 ? `${experiences.length} roles` : null,
                    },
                    {
                      label: "Projects",
                      value: projects.length > 0 ? `${projects.length} builds` : null,
                    },
                    {
                      label: "Certifications",
                      value: certifications.length > 0 ? `${certifications.length}` : null,
                    },
                  ]}
                  valueClassName="text-lg font-semibold text-white"
                  labelClassName="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500"
                />
              </div>
            </div>
          </header>

          {navbarEnabled && (
            <div className="mt-6">
              <TemplateNavbar
                items={sections}
                className="rounded-full border-white/10 bg-white/[0.05]"
                linkClassName="rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              />
            </div>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <main className="space-y-10">
              {portfolio.summary && (
                <section
                  id="about"
                  className="scroll-mt-24 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
                >
                  <SectionHeading>Overview</SectionHeading>
                  <DescriptionBlock
                    text={portfolio.summary}
                    paragraphClassName="whitespace-pre-line text-base leading-8 text-zinc-300"
                    listClassName="space-y-3 pl-5 text-base leading-8 text-zinc-300 marker:text-zinc-600"
                  />
                </section>
              )}

              {leadProjects.length > 0 && (
                <section
                  id="work"
                  className="scroll-mt-24 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
                >
                  <SectionHeading>Selected Projects</SectionHeading>
                  <div className="grid gap-5">
                    {leadProjects.map((project) => (
                      <article
                        key={project.id}
                        className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20"
                      >
                        {project.imageUrl && (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-52 w-full object-cover"
                          />
                        )}

                        <div className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-semibold text-white">
                                  {project.title}
                                </h3>
                                {project.featured && (
                                  <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white">
                                    Featured
                                  </span>
                                )}
                              </div>
                              {project.language && (
                                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                                  {project.language}
                                </p>
                              )}
                            </div>

                            <ProjectActions
                              liveUrl={project.liveUrl}
                              sourceUrl={project.sourceUrl}
                              liveClassName="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-zinc-200"
                              sourceClassName="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/6"
                            />
                          </div>

                          {project.description && (
                            <p className="mt-4 text-sm leading-7 text-zinc-300">
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
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.githubStars !== null && (
                                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                                  {project.githubStars} stars
                                </span>
                              )}
                              {project.githubForks !== null && (
                                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
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
                <section
                  id="experience"
                  className="scroll-mt-24 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
                >
                  <SectionHeading>Experience</SectionHeading>
                  <div className="space-y-5">
                    {experiences.map((exp) => (
                      <article
                        key={exp.id}
                        className="rounded-[1.4rem] border border-white/10 bg-black/20 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{exp.role}</h3>
                            <p className="mt-1 text-sm text-cyan-300">{exp.company}</p>
                            {exp.location && (
                              <p className="mt-1 text-sm text-zinc-500">{exp.location}</p>
                            )}
                          </div>
                          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </p>
                        </div>
                        {exp.description && (
                          <DescriptionBlock
                            text={exp.description}
                            paragraphClassName="mt-4 text-sm leading-7 text-zinc-300"
                            listClassName="mt-4 space-y-2 pl-5 text-sm leading-7 text-zinc-300 marker:text-zinc-600"
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
                <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                  <SectionHeading>Skills</SectionHeading>
                  <div className="space-y-6">
                    {Object.entries(groupedSkills).map(([category, names]) => (
                      <div key={category}>
                        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {names.map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-300"
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
                <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                  <SectionHeading>Education</SectionHeading>
                  <div className="space-y-4">
                    {educations.map((edu) => (
                      <article key={edu.id} className="rounded-[1.4rem] bg-black/20 p-5">
                        <h3 className="text-lg font-semibold text-white">
                          {edu.degree}
                          {edu.field && <span className="text-zinc-400"> in {edu.field}</span>}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-300">{edu.institution}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </p>
                        {edu.gpa && <p className="mt-3 text-xs text-zinc-400">GPA: {edu.gpa}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                  <SectionHeading>Certifications</SectionHeading>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <article key={cert.id} className="rounded-[1.4rem] bg-black/20 p-5">
                        <h3 className="text-base font-semibold text-white">
                          {cert.url ? (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors hover:text-cyan-300"
                            >
                              {cert.name}
                            </a>
                          ) : (
                            cert.name
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
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

              {achievements.length > 0 && (
                <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                  <SectionHeading>Achievements</SectionHeading>
                  <div className="space-y-3">
                    {achievements.map((ach) => (
                      <article key={ach.id} className="flex items-start gap-3 rounded-[1.4rem] bg-black/20 p-5">
                        <Trophy className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-relaxed">{ach.title}</p>
                          {ach.date && (
                            <p className="mt-1 text-xs text-zinc-500">
                              {new Date(ach.date).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {hasProfiles && (
                <section
                  id="profiles"
                  className="scroll-mt-24 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
                >
                  <SectionHeading>Profiles</SectionHeading>
                  <ProfileLinksSection
                    portfolio={portfolio}
                    profiles={socialProfiles}
                    chipClassName="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-400"
                    pillClassName="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.09]"
                    titleClassName="text-white"
                    textClassName="text-zinc-400"
                  />
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white">{children}</h2>;
}

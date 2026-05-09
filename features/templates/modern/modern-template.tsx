import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Trophy } from "lucide-react";
import {
  buildTemplateSections,
  ContactChips,
  DescriptionBlock,
  HeroProfileButtons,
  ProfileLinksSection,
  ProjectActions,
  SocialPills,
  TemplateNavbar,
} from "../shared";
import { formatDateRange, groupSkillsByCategory } from "../utils";
import { log } from "node:console";

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
  const githubProfile = socialProfiles.find(
    (profile) => profile.platform.toLowerCase() === "github"
  );
  const githubStats = githubProfile?.cachedStats as Record<string, unknown> | null;
  const contributionCalendar = parseContributionCalendar(
    githubStats?.contributionCalendar
  );
  const featuredProjects = projects.filter((project) => project.featured);
  const leadProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);
  const { hasProfiles, navbarEnabled, sections } = buildTemplateSections(data);
  const quickFacts = [
    { label: "Projects", value: leadProjects.length },
    { label: "Roles", value: experiences.length },
    { label: "Skills", value: skills.length },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-[#060816] text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute -left-40 -top-32 h-112 w-md rounded-full bg-violet-500/16 blur-3xl" />
        <div className="absolute -right-32 top-20 h-96 w-[24rem] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-6 md:px-10 md:pb-24 md:pt-16">
          <header className="rounded-[2.1rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_100px_rgba(6,8,22,0.48)] backdrop-blur-2xl md:p-10">
            <div className="grid gap-8 md:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Modern Interface
                </p>
                <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">
                  {portfolio.title}
                </h1>
                {portfolio.headline && (
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300/95">
                    {portfolio.headline}
                  </p>
                )}

                <div className="mt-6">
                  <ContactChips
                    portfolio={portfolio}
                    chipClassName="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-zinc-400"
                  />
                </div>

                <div className="mt-4">
                  <HeroProfileButtons
                    profiles={socialProfiles}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.1]"
                  />
                </div>

                {socialProfiles.length > 0 && (
                  <div className="mt-6">
                    <SocialPills
                      profiles={socialProfiles}
                      showUsername
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.1]"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                {portfolio.avatarUrl && (
                  <div className="overflow-hidden rounded-[1.85rem] border border-white/10 bg-linear-to-br from-violet-500/14 via-white/[0.06] to-cyan-400/10 p-5 shadow-[0_18px_60px_rgba(76,29,149,0.18)]">
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.title}
                      className="h-72 w-full rounded-[1.4rem] object-cover"
                    />
                  </div>
                )}
                {quickFacts.length > 0 && (
                  <div className="rounded-[1.55rem] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        Snapshot
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                        Current
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {quickFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-3"
                        >
                          <p className="text-lg font-semibold text-white">{fact.value}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                            {fact.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {navbarEnabled && (
            <div className="mt-6">
              <TemplateNavbar
                items={sections}
              className="rounded-full border-white/10 bg-white/[0.05] shadow-[0_14px_40px_rgba(6,8,22,0.32)]"
              linkClassName="rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.1] hover:text-white"
              />
            </div>
          )}

          <div className="mt-8 grid gap-8 md:mt-10 md:gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <main className="space-y-8 md:space-y-10">
              {portfolio.summary && (
                <section
                  id="about"
                  className="scroll-mt-24 rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8"
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
                  className="scroll-mt-24 rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8"
                >
                  <SectionHeading>Selected Projects</SectionHeading>
                  <div className="grid gap-5">
                    {leadProjects.map((project) => (
                      <article
                        key={project.id}
                        className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 shadow-[0_16px_50px_rgba(2,6,23,0.36)] transition-transform duration-300 hover:-translate-y-1"
                      >
                        {project.imageUrl && (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-52 w-full object-cover"
                          />
                        )}

                        <div className="p-5 md:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-semibold text-white">
                                  {project.title}
                                </h3>
                                {project.featured && (
                                  <span className="rounded-full border border-cyan-300/20 bg-linear-to-r from-violet-500 to-cyan-400 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white">
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
                              sourceClassName="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08]"
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
                                    className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-400"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.githubStars !== null && (
                                  <span className="rounded-full bg-white/4 px-3 py-1 text-xs text-zinc-400">
                                    {project.githubStars} stars
                                  </span>
                                )}
                                {project.githubForks !== null && (
                                  <span className="rounded-full bg-white/4 px-3 py-1 text-xs text-zinc-400">
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
                  className="scroll-mt-24 rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8"
                >
                  <SectionHeading>Experience</SectionHeading>
                  <div className="space-y-5">
                    {experiences.map((exp) => (
                      <article
                        key={exp.id}
                        className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[0_12px_36px_rgba(2,6,23,0.28)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{exp.role}</h3>
                            <p className="mt-1 text-sm text-cyan-300">{exp.company}</p>
                            {exp.location && (
                              <p className="mt-1 text-sm text-zinc-500">{exp.location}</p>
                            )}
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                              {formatDateRange(exp.startDate, exp.endDate)}
                            </p>
                          )}
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

            <aside className="space-y-8 md:space-y-10">
              {skills.length > 0 && (
                <section className="rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8">
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
                              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-zinc-300"
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
                <section className="rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8">
                  <SectionHeading>Education</SectionHeading>
                  <div className="space-y-4">
                    {educations.map((edu) => (
                      <article
                        key={edu.id}
                        className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[0_12px_36px_rgba(2,6,23,0.28)]"
                      >
                        <h3 className="text-lg font-semibold text-white">
                          {edu.degree}
                          {edu.field && <span className="text-zinc-400"> in {edu.field}</span>}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-300">{edu.institution}</p>
                        {(edu.startDate || edu.endDate) && (
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                            {formatDateRange(edu.startDate, edu.endDate)}
                          </p>
                        )}
                        {edu.gpa && <p className="mt-3 text-xs text-zinc-400">GPA: {edu.gpa}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8">
                  <SectionHeading>Certifications</SectionHeading>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <article
                        key={cert.id}
                        className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[0_12px_36px_rgba(2,6,23,0.28)]"
                      >
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
                <section className="rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8">
                  <SectionHeading>Achievements</SectionHeading>
                  <div className="space-y-3">
                    {achievements.map((ach) => (
                      <article
                        key={ach.id}
                        className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[0_12px_36px_rgba(2,6,23,0.28)]"
                      >
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
                  className="scroll-mt-24 rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:p-8"
                >
                  <SectionHeading>Profiles</SectionHeading>
                  <ProfileLinksSection
                    portfolio={portfolio}
                    profiles={socialProfiles}
                    chipClassName="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-zinc-400"
                    pillClassName="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.1]"
                    titleClassName="text-white"
                    textClassName="text-zinc-400"
                  />
                </section>
              )}
            </aside>
          </div>

          {contributionCalendar && (
            <section className="mt-8 rounded-[1.85rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_60px_rgba(6,8,22,0.24)] backdrop-blur-2xl md:mt-10 md:p-8">
              <SectionHeading>GitHub Activity</SectionHeading>
              <GitHubContributionHeatmap
                calendar={contributionCalendar}
                profileUrl={githubProfile?.url}
                username={githubProfile?.username}
                variant="modern"
                label="GitHub Contribution Calendar"
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white md:mb-6 md:text-3xl">
      <span className="h-px w-8 bg-white/18" />
      {children}
    </h2>
  );
}

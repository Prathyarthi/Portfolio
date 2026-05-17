import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "@/features/templates/github-contribution-heatmap";
import {
  buildTemplateSections,
  ContactChips,
  DescriptionBlock,
  CustomSectionItems,
  HeroProfileButtons,
  ProfileLinksSection,
  ProjectActions,
  SocialPills,
  TemplateNavbar,
} from "@/features/templates/shared";
import type { PortfolioData } from "@/features/templates/types";
import { formatDate, formatDateRange, groupSkillsByCategory } from "@/features/templates/utils";
import { Trophy } from "lucide-react";

export default function CreativeTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, experiences, educations, skills, projects, socialProfiles, certifications, achievements, customSections } =
    data;
  const skillsByCategory = groupSkillsByCategory(skills);
  const githubProfile = socialProfiles.find(
    (profile) => profile.platform.toLowerCase() === "github"
  );
  const githubStats = githubProfile?.cachedStats as Record<string, unknown> | null;
  const contributionCalendar = parseContributionCalendar(
    githubStats?.contributionCalendar
  );
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = featuredProjects.length > 0 ? featuredProjects : projects;
  const { hasProfiles, navbarEnabled, sections } = buildTemplateSections(data);
  const quickFacts = [
    { label: "Projects", value: visibleProjects.length },
    { label: "Roles", value: experiences.length },
    { label: "Skills", value: skills.length },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff7fb_45%,#ffffff_100%)] text-stone-900 selection:bg-rose-200/50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-orange-100/45 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-64 h-72 w-72 rounded-full bg-fuchsia-100/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 md:px-10 md:pb-24 md:pt-14">
          <header className="overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/75 p-6 shadow-[0_24px_80px_rgba(190,24,93,0.08)] backdrop-blur-xl md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-rose-400">
                  Creative Portfolio
                </p>
                <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950 md:text-7xl">
                  {portfolio.title}
                </h1>
                {portfolio.headline && (
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
                    {portfolio.headline}
                  </p>
                )}

                <div className="mt-7">
                  <ContactChips
                    portfolio={portfolio}
                    chipClassName="rounded-full border border-rose-100 bg-rose-50/80 px-3.5 py-1.5 text-sm text-stone-600"
                  />
                </div>

                <div className="mt-4">
                  <HeroProfileButtons
                    profiles={socialProfiles}
                    className="rounded-full border border-rose-200 bg-stone-950 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-800"
                  />
                </div>

                {socialProfiles.length > 0 && (
                  <div className="mt-6">
                    <SocialPills
                      profiles={socialProfiles}
                      showUsername
                      className="rounded-full border border-rose-100 bg-white/90 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-rose-200 hover:text-stone-900"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:pl-6">
                {portfolio.avatarUrl && (
                  <div className="rounded-[2rem] border border-rose-100/80 bg-linear-to-br from-rose-50 via-white to-orange-50 p-3 shadow-[0_18px_50px_rgba(190,24,93,0.08)]">
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.title}
                      className="h-80 w-full rounded-[1.6rem] object-cover"
                    />
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  {quickFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-[1.2rem] border border-rose-100/80 bg-white/85 px-4 py-4"
                    >
                      <p className="text-xl font-semibold text-stone-950">{fact.value}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone-400">
                        {fact.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {navbarEnabled && (
            <div className="mt-6">
              <TemplateNavbar
                items={sections}
                className="rounded-full border-white/90 bg-white/85 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                linkClassName="rounded-full px-4 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-950 hover:text-white"
              />
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <main className="space-y-8">
              {portfolio.summary && (
                <section
                  id="about"
                  className="scroll-mt-24 rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8"
                >
                  <SectionHeading accent="rose">About</SectionHeading>
                  <DescriptionBlock
                    text={portfolio.summary}
                    paragraphClassName="whitespace-pre-line text-base leading-8 text-stone-600"
                    listClassName="space-y-3 pl-5 text-base leading-8 text-stone-600 marker:text-rose-300"
                  />
                </section>
              )}

              {visibleProjects.length > 0 && (
                <section
                  id="work"
                  className="scroll-mt-24 rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8"
                >
                  <SectionHeading accent="orange">Selected Work</SectionHeading>
                  <div className="grid gap-5">
                    {visibleProjects.map((project, index) => (
                      <article
                        key={project.id}
                        className="overflow-hidden rounded-[1.6rem] border border-rose-100/80 bg-[#fffaf7] shadow-[0_14px_40px_rgba(190,24,93,0.05)]"
                      >
                        {project.imageUrl && (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className={`w-full object-cover ${
                              index % 3 === 0 ? "h-72" : "h-56"
                            }`}
                          />
                        )}
                        <div className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
                                  {project.title}
                                </h3>
                                {project.featured && (
                                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-rose-500">
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
                              liveClassName="rounded-full bg-stone-950 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800"
                              sourceClassName="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-rose-300 hover:text-stone-900"
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
                                    className="rounded-full border border-rose-100 bg-white px-3 py-1 text-xs text-stone-500"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.githubStars !== null && (
                                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs text-stone-500">
                                    {project.githubStars} stars
                                  </span>
                                )}
                                {project.githubForks !== null && (
                                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-stone-500">
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
                  className="scroll-mt-24 rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8"
                >
                  <SectionHeading accent="amber">Experience</SectionHeading>
                  <div className="space-y-5">
                    {experiences.map((exp) => (
                      <article
                        key={exp.id}
                        className="rounded-[1.55rem] border border-orange-100/80 bg-[#fffaf7] p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-stone-950">{exp.role}</h3>
                            <p className="mt-1 text-sm font-medium text-rose-500">
                              {exp.company}
                              {exp.location ? ` · ${exp.location}` : ""}
                            </p>
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                              {formatDateRange(exp.startDate, exp.endDate)}
                            </p>
                          )}
                        </div>
                        {exp.description && (
                          <DescriptionBlock
                            text={exp.description}
                            paragraphClassName="mt-4 text-sm leading-7 text-stone-600"
                            listClassName="mt-4 space-y-2 pl-5 text-sm leading-7 text-stone-600 marker:text-rose-300"
                          />
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="space-y-8">
              {skills.length > 0 && (
                <section className="rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
                  <SectionHeading accent="fuchsia">Skills</SectionHeading>
                  <div className="space-y-6">
                    {Object.entries(skillsByCategory).map(([category, names]) => (
                      <div key={category}>
                        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-stone-400">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {names.map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1.5 text-sm text-stone-700"
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
                <section className="rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
                  <SectionHeading accent="rose">Education</SectionHeading>
                  <div className="space-y-4">
                    {educations.map((edu) => (
                      <article
                        key={edu.id}
                        className="rounded-[1.55rem] border border-rose-100/80 bg-[#fffaf7] p-5"
                      >
                        <h3 className="text-lg font-semibold text-stone-950">
                          {edu.degree}
                          {edu.field && <span className="text-stone-500"> in {edu.field}</span>}
                        </h3>
                        <p className="mt-2 text-sm text-stone-600">{edu.institution}</p>
                        {(edu.startDate || edu.endDate) && (
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-400">
                            {formatDateRange(edu.startDate, edu.endDate)}
                          </p>
                        )}
                        {edu.gpa && <p className="mt-3 text-xs text-stone-500">GPA: {edu.gpa}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
                  <SectionHeading accent="orange">Certifications</SectionHeading>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <article
                        key={cert.id}
                        className="rounded-[1.55rem] border border-orange-100/80 bg-[#fffaf7] p-5"
                      >
                        <h3 className="text-base font-semibold text-stone-950">
                          {cert.url ? (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors hover:text-rose-500"
                            >
                              {cert.name}
                            </a>
                          ) : (
                            cert.name
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-400">
                            {formatDate(cert.issueDate)}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {customSections.map((cs) => (
                <section key={cs.id} className="rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
                  <SectionHeading accent="fuchsia">{cs.label}</SectionHeading>
                  <CustomSectionItems
                    items={cs.items}
                    titleClassName="font-medium text-stone-900"
                    textClassName="text-sm text-stone-500"
                    chipClassName="rounded-full border border-rose-100 bg-rose-50/80 px-2.5 py-1 text-xs text-stone-500"
                  />
                </section>
              ))}

              {achievements.length > 0 && (
                <section className="rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
                  <SectionHeading accent="amber">Achievements</SectionHeading>
                  <div className="space-y-3">
                    {achievements.map((ach) => (
                      <article
                        key={ach.id}
                        className="flex items-start gap-3 rounded-[1.55rem] border border-orange-100/80 bg-[#fffaf7] p-5"
                      >
                        <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-relaxed text-stone-900">{ach.title}</p>
                          {ach.date && (
                            <p className="mt-1 text-xs text-stone-500">
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
                  className="scroll-mt-24 rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8"
                >
                  <SectionHeading accent="fuchsia">Profiles</SectionHeading>
                  <ProfileLinksSection
                    portfolio={portfolio}
                    profiles={socialProfiles}
                    chipClassName="rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1.5 text-sm text-stone-500"
                    pillClassName="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-rose-200 hover:text-stone-900"
                    titleClassName="text-stone-950"
                    textClassName="text-stone-500"
                  />
                </section>
              )}
            </aside>
          </div>

          {contributionCalendar && (
            <section className="mt-8 rounded-[1.9rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-8">
              <SectionHeading accent="rose">GitHub Activity</SectionHeading>
              <div className="rounded-[1.5rem] border border-rose-100/80 bg-[#fffaf7] p-4 md:p-6">
                <GitHubContributionHeatmap
                  calendar={contributionCalendar}
                  profileUrl={githubProfile?.url}
                  username={githubProfile?.username}
                  variant="creative"
                  label="GitHub Contribution Calendar"
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: "rose" | "orange" | "amber" | "fuchsia";
}) {
  const accents = {
    rose: "bg-rose-300",
    orange: "bg-orange-300",
    amber: "bg-amber-300",
    fuchsia: "bg-fuchsia-300",
  };

  return (
    <h2 className="mb-5 flex items-center gap-3 text-2xl font-semibold tracking-tight text-stone-950 md:mb-6 md:text-3xl">
      <span className={`h-px w-8 ${accents[accent]}`} />
      {children}
    </h2>
  );
}

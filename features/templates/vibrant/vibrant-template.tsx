import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Trophy, Sparkles } from "lucide-react";
import {
  buildTemplateSections,
  ContactChips,
  CustomSectionItems,
  DescriptionBlock,
  HeroProfileButtons,
  ProfileLinksSection,
  ProjectActions,
  SocialPills,
  TemplateNavbar,
} from "../shared";
import { CollapsibleList } from "../collapsible-list";
import { formatDateRange, groupSkillsByCategory } from "../utils";
import { LivePreviewImage } from "@/components/live-preview-image";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";

export function VibrantTemplate({ data }: { data: PortfolioData }) {
  const {
    portfolio,
    experiences,
    educations,
    skills,
    projects,
    articles,
    socialProfiles,
    certifications,
    achievements,
    customSections,
    livePreviewProjectIds,
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
  const visibleProjects =
    featuredProjects.length > 0
      ? [...featuredProjects, ...projects.filter((p) => !p.featured)]
      : projects;
  const { hasProfiles, navbarEnabled, sections } = buildTemplateSections(data);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-16 relative z-10">
        {navbarEnabled && (
          <div className="mb-12 flex justify-center sticky top-6 z-50">
            <TemplateNavbar
              items={sections}
              className="rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-2 py-2"
              linkClassName="px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/10 rounded-full"
            />
          </div>
        )}

        <header className="relative flex flex-col items-center text-center mb-20 md:mb-32">
          {portfolio.avatarUrl && (
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 rounded-full bg-linear-to-r from-fuchsia-500 via-violet-500 to-cyan-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.title}
                className="relative h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-2 border-slate-900 shadow-2xl"
              />
            </div>
          )}

          <div className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-sm font-medium text-fuchsia-300 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Portfolio
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 mb-6">
            {portfolio.title}
          </h1>

          {portfolio.headline && (
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mb-10 leading-relaxed">
              {portfolio.headline}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <ContactChips
              portfolio={portfolio}
              chipClassName="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            />
            <HeroProfileButtons
              profiles={socialProfiles}
              className="rounded-full bg-linear-to-r from-fuchsia-600 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105"
            />
          </div>

          {socialProfiles.length > 0 && (
            <div className="mt-8">
              <SocialPills
                profiles={socialProfiles}
                showUsername
                className="rounded-full border border-white/5 bg-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white hover:bg-white/5"
              />
            </div>
          )}
        </header>

        <div className="space-y-24 md:space-y-32">
          {portfolio.summary && (
            <section id="about" className="scroll-mt-32">
              <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                <SectionHeading>About Me</SectionHeading>
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="text-lg leading-relaxed text-slate-300"
                  listClassName="space-y-2 pl-5 text-lg leading-relaxed text-slate-300 marker:text-cyan-400"
                />
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section id="work" className="scroll-mt-32">
              <SectionHeading>Featured Work</SectionHeading>
              <CollapsibleList
                initial={4}
                wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
                buttonClassName="col-span-full mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className="group rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-fuchsia-500/50 hover:shadow-[0_0_40px_rgba(217,70,239,0.15)] hover:-translate-y-2 flex flex-col"
                  >
                    {project.liveUrl ? (
                      <div className="relative h-64 w-full overflow-hidden bg-slate-800">
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60" />
                        <LivePreviewImage
                          liveUrl={project.liveUrl}
                          enabled={isLivePreviewEnabledForProject(
                            project.id,
                            livePreviewProjectIds
                          )}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                          fallbackSrc="https://placehold.co/1440x900/1e293b/94a3b8?text=No+Preview"
                        />
                      </div>
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-slate-800/50 relative">
                        <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/10 to-cyan-500/10" />
                        <span className="text-sm font-medium uppercase tracking-widest text-slate-500 z-10">
                          No Preview
                        </span>
                      </div>
                    )}
                    <div className="p-8 flex flex-col grow relative z-20">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                          {project.title}
                        </h3>
                        <ProjectActions
                          liveUrl={project.liveUrl}
                          sourceUrl={project.sourceUrl}
                          liveClassName="rounded-full bg-white/10 p-2 text-white hover:bg-fuchsia-500 hover:text-white transition-colors"
                          sourceClassName="rounded-full bg-white/5 p-2 text-slate-300 hover:bg-white/20 transition-colors"
                        />
                      </div>

                      {project.description && (
                        <p className="text-slate-400 leading-relaxed mb-6 grow">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-cyan-300 border border-cyan-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {experiences.length > 0 && (
              <section id="experience" className="scroll-mt-32">
                <SectionHeading>Experience</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-6"
                  buttonClassName="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {experiences.map((exp) => (
                    <article
                      key={exp.id}
                      className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 transition-all hover:bg-slate-800/60"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {exp.role}
                          </h3>
                          <p className="text-fuchsia-400 font-medium mt-1">
                            {exp.company}
                            {exp.location ? <span className="text-slate-500"> · {exp.location}</span> : ""}
                          </p>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 border border-white/10">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </span>
                        )}
                      </div>
                      {exp.description && (
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="text-slate-400 leading-relaxed"
                          listClassName="space-y-2 pl-5 text-slate-400 leading-relaxed marker:text-fuchsia-500"
                        />
                      )}
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}

            <div className="space-y-12">
              {skills.length > 0 && (
                <section>
                  <SectionHeading>Skills</SectionHeading>
                  <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8">
                    <div className="space-y-8">
                      {Object.entries(groupedSkills).map(([category, names]) => (
                        <div key={category}>
                          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {names.map((name) => (
                              <span
                                key={name}
                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 border border-white/5 hover:border-violet-500/50 hover:text-white transition-colors cursor-default"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {educations.length > 0 && (
                <section>
                  <SectionHeading>Education</SectionHeading>
                  <CollapsibleList
                    initial={4}
                    wrapperClassName="space-y-4"
                    buttonClassName="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {educations.map((edu) => (
                      <article
                        key={edu.id}
                        className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6"
                      >
                        <h3 className="text-lg font-bold text-white">
                          {edu.degree}
                          {edu.field && <span className="text-slate-400 font-normal"> in {edu.field}</span>}
                        </h3>
                        <p className="text-cyan-400 mt-1">{edu.institution}</p>
                        <div className="flex items-center justify-between mt-4">
                          {(edu.startDate || edu.endDate) && (
                            <span className="text-sm text-slate-500">
                              {formatDateRange(edu.startDate, edu.endDate)}
                            </span>
                          )}
                          {edu.gpa && <span className="text-sm font-medium text-slate-300">GPA: {edu.gpa}</span>}
                        </div>
                      </article>
                    ))}
                  </CollapsibleList>
                </section>
              )}
            </div>
          </div>

          {/* Certifications and Achievements */}
          {(certifications.length > 0 || achievements.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {certifications.length > 0 && (
                <section>
                  <SectionHeading>Certifications</SectionHeading>
                  <CollapsibleList
                    initial={4}
                    wrapperClassName="space-y-4"
                    buttonClassName="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {certifications.map((cert) => (
                      <article
                        key={cert.id}
                        className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {cert.url ? (
                              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                                {cert.name}
                              </a>
                            ) : (
                              cert.name
                            )}
                          </h3>
                          <p className="text-slate-400 mt-1">{cert.issuer}</p>
                        </div>
                        {cert.issueDate && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 border border-white/10 shrink-0">
                            {new Date(cert.issueDate).getFullYear()}
                          </span>
                        )}
                      </article>
                    ))}
                  </CollapsibleList>
                </section>
              )}

              {achievements.length > 0 && (
                <section>
                  <SectionHeading>Achievements</SectionHeading>
                  <CollapsibleList
                    initial={4}
                    wrapperClassName="space-y-4"
                    buttonClassName="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {achievements.map((ach) => (
                      <article
                        key={ach.id}
                        className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 flex items-start gap-4"
                      >
                        <div className="rounded-full bg-fuchsia-500/20 p-2 text-fuchsia-400 shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-snug">{ach.title}</h3>
                          {ach.date && (
                            <p className="text-sm text-slate-400 mt-1">
                              {new Date(ach.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </CollapsibleList>
                </section>
              )}
            </div>
          )}

          {articles.length > 0 && (
            <section id="writing" className="scroll-mt-32">
              <SectionHeading>Writing</SectionHeading>
              <CollapsibleList
                initial={4}
                wrapperClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                buttonClassName="col-span-full mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 transition-all hover:bg-slate-800/60 hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-bold text-white mb-3">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {article.title}
                      </a>
                    </h3>
                    {article.description && (
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                        {article.description}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {article.publishedAt && (
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {article.readTime != null && <span>{article.readTime} min read</span>}
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {customSections.length > 0 && customSections.map((cs) => (
            <section key={cs.id} className="scroll-mt-32">
              <SectionHeading>{cs.label}</SectionHeading>
              <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl">
                <CustomSectionItems
                  items={cs.items}
                  titleClassName="text-xl font-bold text-white mb-2"
                  textClassName="text-slate-400 leading-relaxed"
                  chipClassName="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-cyan-300 border border-cyan-500/20"
                />
              </div>
            </section>
          ))}

          {hasProfiles && (
            <section id="profiles" className="scroll-mt-32">
              <div className="rounded-3xl bg-linear-to-br from-fuchsia-600/20 to-violet-600/20 backdrop-blur-xl border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <h2 className="text-3xl font-bold text-white mb-8 relative z-10">Connect</h2>
                <div className="flex justify-center relative z-10">
                  <ProfileLinksSection
                    portfolio={portfolio}
                    profiles={socialProfiles}
                    chipClassName="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    pillClassName="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    titleClassName="text-white font-bold"
                    textClassName="text-slate-400"
                  />
                </div>
              </div>
            </section>
          )}

          {contributionCalendar && (
            <section className="scroll-mt-32">
              <SectionHeading>GitHub Activity</SectionHeading>
              <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 overflow-x-auto custom-scrollbar">
                <GitHubContributionHeatmap
                  calendar={contributionCalendar}
                  profileUrl={githubProfile?.url}
                  username={githubProfile?.username}
                  variant="modern"
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 text-3xl md:text-4xl font-bold text-white flex items-center">
      {children}
      <span className="ml-4 h-px grow bg-linear-to-r from-white/20 to-transparent" />
    </h2>
  );
}

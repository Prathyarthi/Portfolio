import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Trophy, ArrowUpRight } from "lucide-react";
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

export function BentoTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-12">
        {navbarEnabled && (
          <div className="mb-8 flex justify-center">
            <TemplateNavbar
              items={sections}
              className="rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-zinc-200/50"
              linkClassName="px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 hover:bg-zinc-100/50 rounded-xl"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          {/* Hero Bento Box */}
          <header className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Available for work
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-4">
                {portfolio.title}
              </h1>
              {portfolio.headline && (
                <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mb-8">
                  {portfolio.headline}
                </p>
              )}
            </div>
            <div className="relative z-10 flex flex-wrap items-center gap-4 mt-auto">
              <ContactChips
                portfolio={portfolio}
                chipClassName="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow"
              />
              <HeroProfileButtons
                profiles={socialProfiles}
                className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md"
              />
            </div>
          </header>

          {/* Avatar Bento Box */}
          {portfolio.avatarUrl && (
            <div className="col-span-1 row-span-1 md:row-span-2 rounded-3xl bg-white shadow-sm border border-zinc-200/50 overflow-hidden relative group">
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* About Bento Box */}
          {portfolio.summary && (
            <section id="about" className="col-span-1 md:col-span-3 lg:col-span-2 row-span-1 rounded-3xl bg-zinc-900 text-zinc-50 p-8 shadow-sm overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center">
                <span className="w-2 h-2 rounded-full bg-zinc-500 mr-2" />
                About
              </h2>
              <DescriptionBlock
                text={portfolio.summary}
                paragraphClassName="text-base leading-relaxed text-zinc-300"
                listClassName="space-y-2 pl-5 text-base leading-relaxed text-zinc-300 marker:text-zinc-500"
              />
            </section>
          )}

          {/* Social Links Bento Box */}
          {socialProfiles.length > 0 && (
            <div className="col-span-1 lg:col-span-2 row-span-1 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50 flex flex-col justify-center">
              <h2 className="text-lg font-semibold text-zinc-400 mb-4 flex items-center">
                <span className="w-2 h-2 rounded-full bg-zinc-300 mr-2" />
                Connect
              </h2>
              <SocialPills
                profiles={socialProfiles}
                showUsername
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-white hover:shadow-sm"
              />
            </div>
          )}

          {/* Work Bento Box (Spans full width) */}
          {visibleProjects.length > 0 && (
            <section id="work" className="col-span-1 md:col-span-3 lg:col-span-4 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                  Selected Work
                </h2>
              </div>
              
              <CollapsibleList
                initial={4}
                wrapperClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                buttonClassName="col-span-full mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
              >
                {visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className="group flex flex-col rounded-2xl border border-zinc-200/60 bg-zinc-50/50 overflow-hidden transition-all hover:shadow-md hover:bg-white hover:border-zinc-300/80"
                  >
                    {project.liveUrl ? (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="relative h-48 w-full overflow-hidden bg-zinc-200 block">
                        <LivePreviewImage
                          liveUrl={project.liveUrl}
                          enabled={isLivePreviewEnabledForProject(
                            project.id,
                            livePreviewProjectIds
                          )}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          fallbackSrc="https://placehold.co/1440x900/e7e5e4/a8a29e?text=No+Preview"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 flex items-center justify-center">
                          <div className="opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 bg-white text-zinc-900 rounded-full p-2 shadow-lg">
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-zinc-100 border-b border-zinc-200/50">
                        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                          No Preview
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex flex-col grow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {/* Experience Bento Box */}
          {experiences.length > 0 && (
            <section id="experience" className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-3" />
                Experience
              </h2>
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-zinc-200 before:to-transparent"
                buttonClassName="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
              >
                {experiences.map((exp) => (
                  <article key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-zinc-200 group-hover:bg-purple-500 text-zinc-500 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300 z-10 absolute left-0 md:left-1/2 -translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 hover:bg-white hover:shadow-sm transition-all ml-8 md:ml-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-zinc-900">{exp.role}</h3>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md whitespace-nowrap">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-purple-600 mb-2">{exp.company}</p>
                      {exp.description && (
                        <div className="text-sm text-zinc-600 line-clamp-3">
                          <DescriptionBlock
                            text={exp.description}
                            paragraphClassName="text-sm text-zinc-600"
                            listClassName="space-y-1 pl-4 text-sm text-zinc-600 marker:text-zinc-400"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {/* Skills Bento Box */}
          {skills.length > 0 && (
            <section className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-3xl bg-blue-600 p-8 shadow-sm text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20" />
              <h2 className="text-xl font-bold text-white mb-6 relative z-10">Skills & Tools</h2>
              <div className="flex flex-wrap gap-2 relative z-10">
                {Object.values(groupedSkills).flat().map((name) => (
                  <span
                    key={name}
                    className="rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30 transition-colors"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education Bento Box */}
          {educations.length > 0 && (
            <section className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-orange-500 mr-3" />
                Education
              </h2>
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-4"
                buttonClassName="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
              >
                {educations.map((edu) => (
                  <article key={edu.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <h3 className="font-bold text-zinc-900">
                      {edu.degree}
                      {edu.field && <span className="text-zinc-500 font-medium"> in {edu.field}</span>}
                    </h3>
                    <p className="text-sm font-medium text-orange-600 mt-1">{edu.institution}</p>
                    <div className="flex items-center justify-between mt-2">
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-xs font-medium text-zinc-500">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </p>
                      )}
                      {edu.gpa && <p className="text-xs font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded">GPA: {edu.gpa}</p>}
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {/* Articles Bento Box */}
          {articles.length > 0 && (
            <section id="writing" className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                Writing
              </h2>
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-4"
                buttonClassName="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
              >
                {articles.map((article) => (
                  <article key={article.id} className="group">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200/60">
                      <h3 className="font-bold text-zinc-900 group-hover:text-green-600 transition-colors flex items-center justify-between">
                        <span className="truncate pr-4">{article.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-green-600" />
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-zinc-500">
                        {article.publishedAt && (
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        {article.readTime != null && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                            {article.readTime} min read
                          </span>
                        )}
                      </div>
                    </a>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {/* GitHub Activity Bento Box */}
          {contributionCalendar && (
            <section className="col-span-1 md:col-span-3 lg:col-span-4 rounded-3xl bg-zinc-900 p-8 shadow-sm text-white">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-zinc-500 mr-3" />
                GitHub Activity
              </h2>
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <GitHubContributionHeatmap
                  calendar={contributionCalendar}
                  profileUrl={githubProfile?.url}
                  username={githubProfile?.username}
                  variant="minimal"
                  label="GitHub Contribution Calendar"
                />
              </div>
            </section>
          )}

          {/* Certifications and Achievements */}
          {(certifications.length > 0 || achievements.length > 0) && (
             <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col gap-4">
                {certifications.length > 0 && (
                  <section className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
                      Certifications
                    </h2>
                    <CollapsibleList
                      initial={4}
                      wrapperClassName="space-y-3"
                      buttonClassName="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
                    >
                      {certifications.map((cert) => (
                        <article key={cert.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                          <div>
                            <h3 className="font-semibold text-zinc-900 text-sm">
                              {cert.url ? <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{cert.name}</a> : cert.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">{cert.issuer}</p>
                          </div>
                          {cert.issueDate && (
                            <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                              {new Date(cert.issueDate).getFullYear()}
                            </span>
                          )}
                        </article>
                      ))}
                    </CollapsibleList>
                  </section>
                )}

                {achievements.length > 0 && (
                  <section className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-3" />
                      Achievements
                    </h2>
                    <CollapsibleList
                      initial={4}
                      wrapperClassName="space-y-3"
                      buttonClassName="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-white hover:border-zinc-300"
                    >
                      {achievements.map((ach) => (
                        <article key={ach.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                          <div className="mt-0.5 bg-red-100 p-1.5 rounded-lg text-red-600">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 text-sm">{ach.title}</p>
                            {ach.date && (
                              <p className="text-xs text-zinc-500 mt-0.5">
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

          {/* Custom Sections */}
          {customSections.length > 0 && customSections.map((cs) => (
            <section key={cs.id} className="col-span-1 md:col-span-2 lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/50">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-teal-500 mr-3" />
                {cs.label}
              </h2>
              <CustomSectionItems
                items={cs.items}
                titleClassName="font-semibold text-zinc-900"
                textClassName="text-sm text-zinc-500"
                chipClassName="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
              />
            </section>
          ))}

        </div>
      </div>
    </div>
  );
}

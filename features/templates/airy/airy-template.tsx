"use client";

import type { PortfolioData } from "../types";
import { ExternalLink, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollapsibleList } from "../collapsible-list";
import {
  DescriptionBlock,
  TemplateNavbar,
  buildTemplateSections,
  SocialPills,
  ContactChips,
  CustomSectionItems,
  PROJECT_CARD,
  PROJECT_CARD_BODY,
  PROJECT_CARD_HEADER,
  PROJECT_CARD_TITLE,
  PROJECTS_GRID_2,
  STACKED_SECTIONS,
  TEMPLATE_CONTAINER,
} from "../shared";
import { LivePreviewImage } from "@/components/live-preview-image";
import { formatDateRange, groupSkillsByCategory } from "../utils";
import { GitHubContributionHeatmap, parseContributionCalendar } from "../github-contribution-heatmap";
import { motion } from "motion/react";

export function AiryTemplate({ data }: { data: PortfolioData }) {
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
  const { navbarEnabled, sections } = buildTemplateSections(data);
  const groupedSkills = groupSkillsByCategory(skills);

  const githubProfile = socialProfiles.find((p) => p.platform.toLowerCase() === "github");
  const githubStats = githubProfile?.cachedStats as Record<string, unknown> | null;
  const contributionCalendar = parseContributionCalendar(githubStats?.contributionCalendar);

  return (
    <div className={cn(TEMPLATE_CONTAINER, "min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden relative")}>
      <div className="absolute top-0 right-0 w-full h-[600px] bg-linear-to-b from-sky-100/50 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-12 md:py-24">
        {navbarEnabled && (
          <nav className="mb-16 sticky top-4 z-50 rounded-full border border-sky-100 bg-white/80 p-2 shadow-xs backdrop-blur-md transition-all">
            <TemplateNavbar
              items={sections}
              className="justify-center gap-2 md:gap-6 border-none"
              linkClassName="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-all"
            />
          </nav>
        )}

        <header className="mb-24 flex min-w-0 w-full flex-col items-center text-center">
          {portfolio.avatarUrl && (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={portfolio.avatarUrl}
              alt={portfolio.title}
              className="mb-8 h-32 w-32 rounded-3xl object-cover shadow-md border-4 border-white"
            />
          )}
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 min-w-0 text-balance [overflow-wrap:anywhere] text-2xl @sm:text-3xl @md:text-4xl @lg:text-6xl font-extrabold tracking-tight text-slate-800"
          >
            {portfolio.title}
          </motion.h1>
          {portfolio.headline && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl text-base @md:text-lg @lg:text-xl text-slate-600 font-medium"
            >
              {portfolio.headline}
            </motion.p>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <ContactChips portfolio={portfolio} chipClassName="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-xs border border-slate-100" />
            <SocialPills profiles={socialProfiles} className="bg-white hover:bg-sky-50 text-sky-600 border border-sky-100 rounded-full px-4 py-2 shadow-xs transition-all" />
          </div>
        </header>

        <main className="space-y-24">
          {portfolio.summary && (
            <section id="about" className="scroll-mt-32">
              <div className="rounded-[2.5rem] bg-white p-8 md:p-12 shadow-xs border border-slate-100 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-100/50 rounded-full blur-3xl" />
                <h2 className="mb-6 text-2xl font-bold text-slate-800">About Me</h2>
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="text-lg leading-relaxed text-slate-600"
                  listClassName="space-y-2 pl-5 text-lg text-slate-600 marker:text-sky-400"
                />
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section id="work" className="scroll-mt-32">
              <h2 className="mb-8 text-3xl font-bold text-slate-800 px-2">Projects</h2>
              <CollapsibleList initial={4} wrapperClassName={PROJECTS_GRID_2} buttonClassName="mt-6 mx-auto bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                {projects.map((project) => (
                  <article key={project.id} className={cn(PROJECT_CARD, "group rounded-3xl border border-slate-100 bg-white shadow-xs transition-all hover:shadow-md")}>
                    <LivePreviewImage
                      liveUrl={project.liveUrl ?? null}
                      projectId={project.id}
                      livePreviewProjectIds={livePreviewProjectIds}
                      alt={project.title}
                      loading="lazy"
                      containerClassName="overflow-hidden border-b border-slate-50 bg-slate-50"
                      placeholderClassName="bg-slate-50 [&_p]:text-sm [&_p]:font-medium [&_p]:text-slate-500"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className={PROJECT_CARD_BODY}>
                      <h3 className={cn(PROJECT_CARD_TITLE, "text-xl font-bold text-slate-800 mb-2")}>{project.title}</h3>
                      {project.description && (
                        <p className="mb-4 text-sm leading-relaxed text-slate-600">{project.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600">
                            View Live
                          </a>
                        )}
                        {project.sourceUrl && (
                          <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          {experiences.length > 0 && (
            <section id="experience" className="scroll-mt-32">
              <h2 className="mb-8 text-3xl font-bold text-slate-800 px-2">Experience</h2>
              <CollapsibleList initial={3} wrapperClassName="space-y-6" buttonClassName="mt-6 mx-auto bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                {experiences.map((exp) => (
                  <div key={exp.id} className="rounded-3xl bg-white border border-slate-100 p-8 shadow-xs hover:shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{exp.role}</h3>
                        <p className="text-lg text-sky-600 font-medium mt-1">{exp.company}</p>
                      </div>
                      <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <DescriptionBlock text={exp.description} paragraphClassName="text-slate-600 leading-relaxed" />
                    )}
                  </div>
                ))}
              </CollapsibleList>
            </section>
          )}

          <div className={STACKED_SECTIONS}>
            {skills.length > 0 && (
              <section className="scroll-mt-32">
                <h2 className="mb-8 text-2xl font-bold text-slate-800 px-2">Skills</h2>
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([category, items]) => (
                    <div key={category} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-sky-400">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((skill) => (
                          <span key={skill} className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {educations.length > 0 && (
              <section className="scroll-mt-32">
                <h2 className="mb-8 text-2xl font-bold text-slate-800 px-2">Education</h2>
                <CollapsibleList initial={3} wrapperClassName="space-y-6" buttonClassName="mt-4 bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                  {educations.map((edu) => (
                    <div key={edu.id} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xs">
                      <h3 className="text-lg font-bold text-slate-800">
                        {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                      </h3>
                      <p className="text-sky-600 font-medium mt-1">{edu.institution}</p>
                      <p className="mt-2 text-sm text-slate-500">{formatDateRange(edu.startDate, edu.endDate)}</p>
                    </div>
                  ))}
                </CollapsibleList>
              </section>
            )}
          </div>

          {(certifications.length > 0 || achievements.length > 0) && (
            <div className={STACKED_SECTIONS}>
              {certifications.length > 0 && (
                <section>
                  <h2 className="mb-8 text-2xl font-bold text-slate-800 px-2">Certifications</h2>
                  <CollapsibleList initial={3} wrapperClassName="space-y-4" buttonClassName="mt-4 bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-xs">
                        <h3 className="font-bold text-slate-800">
                          {cert.url ? (
                            <a href={cert.url} target="_blank" rel="noreferrer" className="hover:text-sky-500 hover:underline">{cert.name}</a>
                          ) : cert.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{cert.issuer}</p>
                      </div>
                    ))}
                  </CollapsibleList>
                </section>
              )}

              {achievements.length > 0 && (
                <section>
                  <h2 className="mb-8 text-2xl font-bold text-slate-800 px-2">Achievements</h2>
                  <CollapsibleList initial={3} wrapperClassName="space-y-4" buttonClassName="mt-4 bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="flex gap-4 rounded-2xl bg-white border border-slate-100 p-5 shadow-xs">
                        <Trophy className="h-6 w-6 text-yellow-400 shrink-0" />
                        <div>
                          <h3 className="font-bold text-slate-800">{ach.title}</h3>
                          {ach.date && (
                            <p className="text-sm text-slate-500 mt-1">
                              {new Date(ach.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleList>
                </section>
              )}
            </div>
          )}

          {articles.length > 0 && (
            <section id="articles" className="scroll-mt-32">
              <h2 className="mb-8 text-3xl font-bold text-slate-800 px-2">Articles</h2>
              <CollapsibleList initial={3} wrapperClassName="grid gap-6 md:grid-cols-2" buttonClassName="mt-6 mx-auto bg-white border border-sky-100 text-sky-600 px-6 py-2 rounded-full font-medium hover:bg-sky-50 transition-colors">
                {articles.map((article) => (
                  <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="block rounded-3xl bg-white border border-slate-100 p-6 shadow-xs hover:border-sky-200 hover:shadow-md transition-all">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{article.title}</h3>
                    {article.description && <p className="text-slate-600 text-sm mb-4 line-clamp-2">{article.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map(tag => (
                        <span key={tag} className="bg-slate-50 px-2 py-1 rounded-md text-xs font-medium text-slate-600">{tag}</span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      {article.publishedAt && article.readTime && " · "}
                      {article.readTime && `${article.readTime} min read`}
                    </div>
                  </a>
                ))}
              </CollapsibleList>
            </section>
          )}

          {customSections.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2">
              {customSections.map((cs) => (
                <section key={cs.id} className="rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xs">
                  <h2 className="mb-6 text-2xl font-bold text-slate-800">{cs.label}</h2>
                  <CustomSectionItems
                    items={cs.items}
                    titleClassName="font-bold text-slate-800"
                    textClassName="text-sm text-slate-600 mt-1"
                    chipClassName="inline-block mt-2 mr-2 rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700"
                  />
                </section>
              ))}
            </div>
          )}

          {contributionCalendar && (
            <section className="rounded-[2.5rem] bg-white p-8 md:p-12 border border-slate-100 shadow-xs overflow-x-auto">
              <h2 className="mb-8 text-2xl font-bold text-slate-800">GitHub Activity</h2>
              <div className="min-w-[700px]">
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

        </main>
      </div>
    </div>
  );
}
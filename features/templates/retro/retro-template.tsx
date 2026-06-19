import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Trophy } from "lucide-react";
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

export function RetroTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-[#f4f0ea] font-mono text-black">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-14">
        <header className="relative border-4 border-black bg-[#ff90e8] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-10">
          <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
            <div>
              <div className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Retro Edition
              </div>
              <h1 className="mt-6 font-sans text-5xl font-black uppercase tracking-tight text-black md:text-7xl">
                {portfolio.title}
              </h1>
              {portfolio.headline && (
                <p className="mt-5 max-w-2xl border-l-4 border-black pl-4 text-lg font-bold leading-relaxed text-black md:text-xl">
                  {portfolio.headline}
                </p>
              )}

              <div className="mt-7">
                <ContactChips
                  portfolio={portfolio}
                  chipClassName="border-2 border-black bg-[#ffc900] px-3.5 py-1.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="mt-6">
                <HeroProfileButtons
                  profiles={socialProfiles}
                  className="border-2 border-black bg-[#23a094] px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {socialProfiles.length > 0 && (
                <div className="mt-6">
                  <SocialPills
                    profiles={socialProfiles}
                    showUsername
                    className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {portfolio.avatarUrl && (
                <div className="border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src={portfolio.avatarUrl}
                    alt={portfolio.title}
                    className="h-64 w-full border-2 border-black object-cover grayscale filter"
                  />
                </div>
              )}
              {portfolio.summary && (
                <div className="border-4 border-black bg-[#90bcff] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-sm font-medium leading-relaxed text-black">
                    {portfolio.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {navbarEnabled && (
          <div className="mt-8">
            <TemplateNavbar
              items={sections}
              className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              linkClassName="px-4 py-2 text-sm font-bold uppercase text-black transition-colors hover:bg-[#ff90e8]"
            />
          </div>
        )}

        <div className="mt-10 flex flex-col gap-10">
          <main className="space-y-10">
            {portfolio.summary && (
              <section
                id="about"
                className="scroll-mt-24 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8"
              >
                <SectionHeading>About</SectionHeading>
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="whitespace-pre-line text-base font-medium leading-8 text-black"
                  listClassName="space-y-3 pl-5 text-base font-medium leading-8 text-black marker:text-black"
                />
              </section>
            )}

            {visibleProjects.length > 0 && (
              <section
                id="work"
                className="scroll-mt-24 border-4 border-black bg-[#ffc900] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8"
              >
                <SectionHeading>Work</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
                  buttonClassName="mt-4 border-4 border-black bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                    {visibleProjects.map((project) => (
                      <article
                        key={project.id}
                        className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2"
                      >
                        {project.liveUrl ? (
                          <div className="relative h-48 w-full border-b-4 border-black bg-gray-100 sm:h-64">
                            <LivePreviewImage
                              liveUrl={project.liveUrl}
                              enabled={isLivePreviewEnabledForProject(
                                project.id,
                                livePreviewProjectIds
                              )}
                              alt={project.title}
                              loading="lazy"
                              className="h-full w-full object-cover object-top filter grayscale transition-all duration-500 hover:grayscale-0"
                              fallbackSrc="https://placehold.co/1440x900/e7e5e4/a8a29e?text=No+Preview"
                            />
                          </div>
                        ) : (
                          <div className="flex h-32 w-full items-center justify-center border-b-4 border-black bg-gray-200">
                            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                              No Preview
                            </span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-sans text-2xl font-black uppercase text-black">
                                  {project.title}
                                </h3>
                                {project.featured && (
                                  <span className="border-2 border-black bg-[#ff90e8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    Featured
                                  </span>
                                )}
                              </div>
                              {project.language && (
                                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-600">
                                  {project.language}
                                </p>
                              )}
                            </div>

                            <ProjectActions
                              liveUrl={project.liveUrl}
                              sourceUrl={project.sourceUrl}
                              liveClassName="border-2 border-black bg-[#23a094] px-4 py-2 text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                              sourceClassName="border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                            />
                          </div>

                          {project.description && (
                            <p className="mt-4 text-sm font-medium leading-7 text-black">
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
                                  className="border-2 border-black bg-[#90bcff] px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.githubStars !== null && (
                                <span className="border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  ★ {project.githubStars}
                                </span>
                              )}
                              {project.githubForks !== null && (
                                <span className="border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  ⑂ {project.githubForks}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                </CollapsibleList>
              </section>
            )}

            {experiences.length > 0 && (
              <section
                id="experience"
                className="scroll-mt-24 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8"
              >
                <SectionHeading>Experience</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-6"
                  buttonClassName="mt-4 border-4 border-black bg-[#ff90e8] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {experiences.map((exp) => (
                    <article
                      key={exp.id}
                      className="border-4 border-black bg-[#f4f0ea] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-xl font-black uppercase text-black">
                            {exp.role}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-gray-700">
                            {exp.company}
                            {exp.location ? ` · ${exp.location}` : ""}
                          </p>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <p className="border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase tracking-widest text-black">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </p>
                        )}
                      </div>
                      {exp.description && (
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mt-4 text-sm font-medium leading-7 text-black"
                          listClassName="mt-4 space-y-2 pl-5 text-sm font-medium leading-7 text-black marker:text-black"
                        />
                      )}
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}

            {articles.length > 0 && (
              <section
                id="writing"
                className="scroll-mt-24 border-4 border-black bg-[#90bcff] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8"
              >
                <SectionHeading>Writing</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-4 border-4 border-black bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {articles.map((article) => (
                    <article
                      key={article.id}
                      className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <h3 className="font-sans text-lg font-black uppercase text-black">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {article.title}
                        </a>
                      </h3>
                      {article.description && (
                        <p className="mt-2 text-sm font-medium leading-7 text-gray-700">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-gray-600">
                        {article.publishedAt && (
                          <span className="border-2 border-black bg-[#ffc900] px-2 py-1 text-black">
                            {new Date(article.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        {article.readTime != null && (
                          <span className="border-2 border-black bg-[#ff90e8] px-2 py-1 text-black">
                            {article.readTime} min read
                          </span>
                        )}
                      </div>
                      {article.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                           <span
                              key={tag}
                              className="border-2 border-black bg-gray-200 px-3 py-1 text-xs font-bold text-black"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}
          </main>

          <aside className="space-y-10">
            {skills.length > 0 && (
              <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <SectionHeading>Skills</SectionHeading>
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([category, names]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {names.map((name) => (
                          <span
                            key={name}
                            className="border-2 border-black bg-[#ffc900] px-3 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff90e8]"
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
              <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <SectionHeading>Education</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-5"
                  buttonClassName="mt-4 border-4 border-black bg-[#90bcff] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {educations.map((edu) => (
                    <article
                      key={edu.id}
                      className="border-4 border-black bg-[#f4f0ea] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <h3 className="font-sans text-lg font-black uppercase text-black">
                        {edu.degree}
                        {edu.field && <span className="text-gray-600"> in {edu.field}</span>}
                      </h3>
                      <p className="mt-2 text-sm font-bold text-gray-700">{edu.institution}</p>
                      {(edu.startDate || edu.endDate) && (
                        <p className="mt-2 inline-block border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase tracking-widest text-black">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </p>
                      )}
                      {edu.gpa && <p className="mt-3 text-xs font-bold text-gray-700">GPA: {edu.gpa}</p>}
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <SectionHeading>Certifications</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-4 border-4 border-black bg-[#ffc900] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {certifications.map((cert) => (
                    <article
                      key={cert.id}
                      className="border-4 border-black bg-[#f4f0ea] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <h3 className="font-sans font-black uppercase text-black">
                        {cert.url ? (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {cert.name}
                          </a>
                        ) : (
                          cert.name
                        )}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-gray-700">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="mt-2 inline-block border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase tracking-widest text-black">
                          {new Date(cert.issueDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}

            {achievements.length > 0 && (
              <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <SectionHeading>Achievements</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-3"
                  buttonClassName="mt-4 border-4 border-black bg-[#23a094] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {achievements.map((ach) => (
                    <article
                      key={ach.id}
                      className="flex items-start gap-3 border-4 border-black bg-[#f4f0ea] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-relaxed text-black">{ach.title}</p>
                        {ach.date && (
                          <p className="mt-2 inline-block border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black">
                            {new Date(ach.date).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}

            {hasProfiles && (
              <section
                id="profiles"
                className="scroll-mt-24 border-4 border-black bg-[#ff90e8] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8"
              >
                <SectionHeading>Profiles</SectionHeading>
                <ProfileLinksSection
                  portfolio={portfolio}
                  profiles={socialProfiles}
                  chipClassName="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  pillClassName="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  titleClassName="font-bold text-black"
                  textClassName="text-black"
                />
              </section>
            )}
          </aside>
        </div>

        {customSections.length > 0 && (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {customSections.map((cs) => (
              <section key={cs.id} className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <SectionHeading>{cs.label}</SectionHeading>
                <CustomSectionItems
                  items={cs.items}
                  titleClassName="font-sans font-black uppercase text-black"
                  textClassName="text-sm font-medium text-gray-700"
                  chipClassName="border-2 border-black bg-[#ffc900] px-2.5 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </section>
            ))}
          </div>
        )}

        {contributionCalendar && (
          <section className="mt-10 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
            <SectionHeading>GitHub Activity</SectionHeading>
            <GitHubContributionHeatmap
              calendar={contributionCalendar}
              profileUrl={githubProfile?.url}
              username={githubProfile?.username}
              variant="minimal"
              label="GitHub Contribution Calendar"
            />
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-3 font-sans text-3xl font-black uppercase tracking-tight text-black md:text-4xl">
      <span className="h-2 w-8 bg-black" />
      {children}
    </h2>
  );
}

import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Terminal, FolderOpen, FileText, Globe } from "lucide-react";
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

export function WindowsTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-[#3a6ea5] text-black font-sans selection:bg-[#000080] selection:text-white pb-16 relative">
      <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8">

        {/* Header Window */}
        <Window title="System Properties">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {portfolio.avatarUrl && (
              <div className="w-32 h-32 shrink-0 win95-inset p-1 bg-white">
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.title}
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
            )}
            <div className="grow">
              <h1 className="text-3xl font-bold mb-2">{portfolio.title}</h1>
              {portfolio.headline && (
                <p className="text-sm mb-4">{portfolio.headline}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <ContactChips
                  portfolio={portfolio}
                  chipClassName="win95-button px-2 py-1 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <HeroProfileButtons
                  profiles={socialProfiles}
                  className="win95-button px-3 py-1 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </Window>

        {/* About Window */}
        {portfolio.summary && (
          <Window id="about" title="Notepad - About.txt" icon={<FileText className="w-4 h-4" />}>
            <div className="bg-white win95-inset p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {portfolio.summary}
            </div>
          </Window>
        )}

        {/* Projects Window */}
        {visibleProjects.length > 0 && (
          <Window id="work" title="Explorer - Projects" icon={<FolderOpen className="w-4 h-4" />}>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
              buttonClassName="col-span-full mt-4 win95-button px-4 py-1 text-sm font-bold mx-auto block"
            >
              {visibleProjects.map((project) => (
                <div key={project.id} className="win95-outset bg-[#c0c0c0] flex flex-col">
                  {project.liveUrl ? (
                    <div className="h-40 win95-inset bg-black m-2 relative group overflow-hidden">
                      <LivePreviewImage
                        liveUrl={project.liveUrl}
                        enabled={isLivePreviewEnabledForProject(
                          project.id,
                          livePreviewProjectIds
                        )}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all"
                        fallbackSrc="https://placehold.co/1440x900/000000/008080?text=No+Preview"
                      />
                    </div>
                  ) : (
                    <div className="h-40 win95-inset bg-black m-2 flex items-center justify-center text-[#00ff00] font-mono text-xs">
                      C:\&gt; No preview available
                    </div>
                  )}
                  <div className="p-3 flex flex-col grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm truncate pr-2">{project.title}</h3>
                      {project.featured && (
                        <span className="bg-[#000080] text-white text-[10px] px-1">★</span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs mb-4 line-clamp-3 grow">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="bg-white win95-inset px-1 text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <ProjectActions
                        liveUrl={project.liveUrl}
                        sourceUrl={project.sourceUrl}
                        liveClassName="win95-button px-2 py-1 text-xs font-bold mr-2"
                        sourceClassName="win95-button px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleList>
          </Window>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experience Window */}
          {experiences.length > 0 && (
            <Window id="experience" title="Task Manager - Experience">
              <CollapsibleList
                initial={3}
                wrapperClassName="space-y-4"
                buttonClassName="mt-4 win95-button px-4 py-1 text-sm font-bold w-full"
              >
                {experiences.map((exp) => (
                  <div key={exp.id} className="win95-inset bg-white p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold">{exp.role}</h3>
                      {(exp.startDate || exp.endDate) && (
                        <span className="text-xs">{formatDateRange(exp.startDate, exp.endDate)}</span>
                      )}
                    </div>
                    <p className="text-[#000080] mb-2">{exp.company}</p>
                    {exp.description && (
                      <div className="text-xs leading-relaxed">
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mb-1"
                          listClassName="list-disc pl-4 space-y-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleList>
            </Window>
          )}

          <div className="space-y-8">
            {/* Skills Window */}
            {skills.length > 0 && (
              <Window title="Control Panel - Skills">
                <div className="win95-inset bg-white p-4 space-y-4">
                  {Object.entries(groupedSkills).map(([category, names]) => (
                    <div key={category}>
                      <h3 className="font-bold text-xs mb-2 border-b border-black pb-1">{category}</h3>
                      <div className="flex flex-wrap gap-1">
                        {names.map((name) => (
                          <span key={name} className="win95-outset bg-[#c0c0c0] px-2 py-0.5 text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Window>
            )}

            {/* Education Window */}
            {educations.length > 0 && (
              <Window title="Registry - Education">
                <CollapsibleList
                  initial={3}
                  wrapperClassName="space-y-2"
                  buttonClassName="mt-4 win95-button px-4 py-1 text-sm font-bold w-full"
                >
                  {educations.map((edu) => (
                    <div key={edu.id} className="win95-inset bg-white p-3 text-sm">
                      <h3 className="font-bold">{edu.degree}</h3>
                      <p className="text-xs mt-1">{edu.institution}</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        {(edu.startDate || edu.endDate) && (
                          <span>{formatDateRange(edu.startDate, edu.endDate)}</span>
                        )}
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </CollapsibleList>
              </Window>
            )}
            {/* Certifications Window */}
            {certifications.length > 0 && (
              <Window title="Certificates.exe">
                <CollapsibleList
                  initial={3}
                  wrapperClassName="space-y-2"
                  buttonClassName="mt-4 win95-button px-4 py-1 text-sm font-bold w-full"
                >
                  {certifications.map((cert) => (
                    <div key={cert.id} className="win95-inset bg-white p-3 text-sm flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">
                          {cert.url ? (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-[#0000ff] underline hover:text-[#ff0000]">
                              {cert.name}
                            </a>
                          ) : (
                            cert.name
                          )}
                        </h3>
                        <p className="text-xs mt-1 text-[#000080]">{cert.issuer}</p>
                      </div>
                      {cert.issueDate && (
                        <span className="text-xs bg-[#c0c0c0] win95-outset px-2 py-1">
                          {new Date(cert.issueDate).getFullYear()}
                        </span>
                      )}
                    </div>
                  ))}
                </CollapsibleList>
              </Window>
            )}

            {/* Achievements Window */}
            {achievements.length > 0 && (
              <Window title="Trophies.sys">
                <CollapsibleList
                  initial={3}
                  wrapperClassName="space-y-2"
                  buttonClassName="mt-4 win95-button px-4 py-1 text-sm font-bold w-full"
                >
                  {achievements.map((ach) => (
                    <div key={ach.id} className="win95-inset bg-white p-3 text-sm flex items-start gap-3">
                      <span className="text-lg">🏆</span>
                      <div>
                        <h3 className="font-bold">{ach.title}</h3>
                        {ach.date && (
                          <p className="text-xs mt-1">
                            {new Date(ach.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleList>
              </Window>
            )}
          </div>
        </div>

        {/* Custom Sections */}
        {customSections.length > 0 && customSections.map((cs) => (
          <Window key={cs.id} title={`Custom - ${cs.label}`}>
            <div className="win95-inset bg-white p-4">
              <CustomSectionItems
                items={cs.items}
                titleClassName="font-bold text-sm"
                textClassName="text-xs mt-1"
                chipClassName="win95-outset bg-[#c0c0c0] px-2 py-0.5 text-[10px]"
              />
            </div>
          </Window>
        ))}

        {/* Articles Window */}
        {articles.length > 0 && (
          <Window id="writing" title="Internet Explorer - Links" icon={<Globe className="w-4 h-4" />}>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
              buttonClassName="col-span-full mt-4 win95-button px-4 py-1 text-sm font-bold mx-auto block"
            >
              {articles.map((article) => (
                <div key={article.id} className="win95-inset bg-white p-3 text-sm flex flex-col">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[#0000ff] underline hover:text-[#ff0000] font-bold mb-2">
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="text-xs mb-2 grow">{article.description}</p>
                  )}
                  <div className="text-[10px] text-gray-600 flex gap-2">
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                    {article.readTime != null && <span>{article.readTime} min</span>}
                  </div>
                </div>
              ))}
            </CollapsibleList>
          </Window>
        )}

        {/* GitHub Activity */}
        {contributionCalendar && (
          <Window title="MS-DOS Prompt - GitHub">
            <div className="win95-inset bg-black text-[#c0c0c0] p-4 overflow-x-auto custom-scrollbar">
              <GitHubContributionHeatmap
                calendar={contributionCalendar}
                profileUrl={githubProfile?.url}
                username={githubProfile?.username}
                variant="minimal"
                label="C:\> GITHUB.EXE"
              />
            </div>
          </Window>
        )}
        {/* Profiles Window */}
        {hasProfiles && (
          <Window id="profiles" title="Network Neighborhood">
            <div className="win95-inset bg-white p-4">
              <ProfileLinksSection
                portfolio={portfolio}
                profiles={socialProfiles}
                chipClassName="win95-button px-3 py-1 text-xs font-bold"
                pillClassName="win95-button px-3 py-1 text-xs font-bold"
                titleClassName="font-bold"
                textClassName="text-xs"
              />
            </div>
          </Window>
        )}
      </div>

      {/* Taskbar */}
      {navbarEnabled && (
        <div className="sticky bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white z-50 flex items-center px-1 gap-1">
          <div className="win95-button px-2 py-1 font-bold flex items-center gap-2 mr-4">
            <div className="w-4 h-4 bg-linear-to-br from-blue-500 via-red-500 to-yellow-500" />
            Start
          </div>
          <div className="w-px h-6 bg-gray-400 border-r border-white mx-1" />
          <TemplateNavbar
            items={sections}
            className="flex gap-1"
            linkClassName="win95-button px-3 py-1 text-xs font-bold active:bg-[#c0c0c0]"
          />
          <div className="ml-auto win95-inset px-2 py-1 text-xs flex items-center">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      {/* Global Win95 Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .win95-outset {
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #000000;
          border-bottom: 2px solid #000000;
          box-shadow: inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf;
        }
        .win95-inset {
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
          box-shadow: inset 1px 1px 0 #000000, inset -1px -1px 0 #dfdfdf;
        }
        .win95-button {
          background: #c0c0c0;
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #000000;
          border-bottom: 2px solid #000000;
          box-shadow: inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf;
          cursor: pointer;
        }
        .win95-button:active {
          border-top: 2px solid #000000;
          border-left: 2px solid #000000;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
          box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf;
          padding-top: calc(0.25rem + 1px);
          padding-left: calc(0.75rem + 1px);
          padding-bottom: calc(0.25rem - 1px);
          padding-right: calc(0.75rem - 1px);
        }
      `}} />
    </div>
  );
}

function Window({ title, children, id, icon }: { title: string; children: React.ReactNode; id?: string; icon?: React.ReactNode }) {
  return (
    <section id={id} className="win95-outset bg-[#c0c0c0] p-[2px] scroll-mt-12">
      <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between mb-[2px]">
        <div className="flex items-center gap-2 font-bold text-sm">
          {icon || <Terminal className="w-4 h-4" />}
          {title}
        </div>
        <div className="flex gap-[2px]">
          <div className="win95-button w-4 h-4 flex items-center justify-center text-[10px] font-bold">_</div>
          <div className="win95-button w-4 h-4 flex items-center justify-center text-[10px] font-bold">□</div>
          <div className="win95-button w-4 h-4 flex items-center justify-center text-[10px] font-bold">×</div>
        </div>
      </div>
      <div className="p-2">
        {children}
      </div>
    </section>
  );
}

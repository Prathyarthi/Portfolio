import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Sun, Music, Zap } from "lucide-react";
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

export function SynthwaveTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-[#0d0221] text-[#00f0ff] font-sans selection:bg-[#ff007f] selection:text-white overflow-hidden relative pb-20">
      {/* Synthwave Sun & Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60vw] max-w-[600px] aspect-square rounded-full bg-linear-to-b from-[#ff007f] via-[#ff7700] to-transparent opacity-80 blur-[2px]" 
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 55%, 100% 55%, 100% 60%, 0 60%, 0 65%, 100% 65%, 100% 72%, 0 72%, 0 80%, 100% 80%, 100% 100%, 0 100%)' }} />
        
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-linear-to-t from-[#26004c] to-transparent" />
        
        <div className="absolute bottom-0 left-[-50%] right-[-50%] h-[50vh]"
             style={{
               backgroundImage: `linear-gradient(#ff007f 2px, transparent 2px), linear-gradient(90deg, #ff007f 2px, transparent 2px)`,
               backgroundSize: '40px 40px',
               transform: 'perspective(500px) rotateX(60deg) translateY(100px) translateZ(200px)',
               opacity: 0.5
             }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 relative z-10 space-y-20">
        
        {navbarEnabled && (
          <div className="sticky top-6 z-50 flex justify-center mb-16">
            <TemplateNavbar
              items={sections}
              className="flex gap-2 bg-[#0d0221]/80 backdrop-blur-md border border-[#ff007f] p-2 rounded-full shadow-[0_0_15px_rgba(255,0,127,0.5)]"
              linkClassName="px-5 py-2 text-sm font-bold text-[#00f0ff] hover:bg-[#ff007f] hover:text-white transition-all rounded-full uppercase tracking-widest"
            />
          </div>
        )}

        <header className="flex flex-col items-center text-center max-w-4xl mx-auto pt-10">
          {portfolio.avatarUrl && (
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-[#00f0ff] rounded-full blur-[20px] opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.title}
                className="relative w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-[#ff007f] shadow-[0_0_30px_rgba(255,0,127,0.8)]"
              />
            </div>
          )}
          
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-[#00f0ff] to-[#ff007f] mb-4 tracking-tighter drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ WebkitTextStroke: '1px #ffffff' }}>
            {portfolio.title}
          </h1>
          
          {portfolio.headline && (
            <p className="text-xl md:text-3xl text-[#ffbc00] font-bold mb-10 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,188,0,0.8)]">
              {portfolio.headline}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <ContactChips
              portfolio={portfolio}
              chipClassName="bg-[#26004c]/80 border border-[#00f0ff] hover:bg-[#00f0ff] hover:text-[#0d0221] px-6 py-3 rounded-none text-sm font-bold text-[#00f0ff] transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] uppercase tracking-widest"
            />
            <HeroProfileButtons
              profiles={socialProfiles}
              className="bg-[#ff007f] text-white px-8 py-3 rounded-none text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,0,127,0.6)] hover:bg-white hover:text-[#ff007f] uppercase tracking-widest border border-[#ff007f]"
            />
          </div>

          {socialProfiles.length > 0 && (
            <div className="mt-4">
              <SocialPills
                profiles={socialProfiles}
                showUsername
                className="text-sm font-bold text-[#ffbc00] hover:text-white transition-colors px-4 py-2 bg-[#26004c]/50 border border-[#ffbc00]/30 rounded-full"
              />
            </div>
          )}
        </header>

        {portfolio.summary && (
          <section id="about" className="scroll-mt-32">
            <div className="bg-[#1a0b2e]/80 backdrop-blur-md border-l-4 border-[#ff007f] p-8 md:p-12 shadow-[0_0_20px_rgba(255,0,127,0.2)]">
              <SectionHeading icon={<Sun className="w-6 h-6 text-[#ffbc00]" />}>Transmission</SectionHeading>
              <DescriptionBlock
                text={portfolio.summary}
                paragraphClassName="text-lg md:text-xl leading-relaxed text-[#e0e0e0] font-medium"
                listClassName="space-y-3 pl-6 text-lg md:text-xl leading-relaxed text-[#e0e0e0] font-medium marker:text-[#00f0ff]"
              />
            </div>
          </section>
        )}

        {visibleProjects.length > 0 && (
          <section id="work" className="scroll-mt-32">
            <SectionHeading icon={<Zap className="w-6 h-6 text-[#00f0ff]" />}>Arcade</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
              buttonClassName="col-span-full mt-10 mx-auto block bg-[#26004c] border border-[#00f0ff] px-8 py-4 text-sm font-bold text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:bg-[#00f0ff] hover:text-[#0d0221] transition-all uppercase tracking-widest"
            >
              {visibleProjects.map((project) => (
                <article key={project.id} className="group bg-[#1a0b2e]/90 border border-[#ff007f]/50 hover:border-[#ff007f] p-1 shadow-[0_0_15px_rgba(255,0,127,0.1)] hover:shadow-[0_0_25px_rgba(255,0,127,0.4)] transition-all duration-300 flex flex-col">
                  <div className="bg-[#0d0221] h-full flex flex-col p-5">
                    {project.liveUrl ? (
                      <div className="relative h-48 overflow-hidden mb-6 border-b-2 border-[#00f0ff]">
                        <LivePreviewImage
                          liveUrl={project.liveUrl}
                          enabled={isLivePreviewEnabledForProject(project.id, livePreviewProjectIds)}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-top filter contrast-125 saturate-150 transition-transform duration-700 group-hover:scale-110"
                          fallbackSrc="https://placehold.co/800x600/1a0b2e/00f0ff?text=VHS_TAPE"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#ff007f]/40 to-transparent mix-blend-overlay" />
                      </div>
                    ) : (
                      <div className="h-48 bg-[#1a0b2e] border-b-2 border-[#00f0ff] flex items-center justify-center mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.1)_50%)] bg-size-[100%_4px]" />
                        <span className="text-sm font-bold text-[#ff007f] uppercase tracking-widest z-10">NO SIGNAL</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col grow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider group-hover:text-[#00f0ff] transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="bg-[#ffbc00] text-[#0d0221] text-xs font-bold px-2 py-1 shrink-0 uppercase tracking-widest">
                            High Score
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-[#b0b0b0] leading-relaxed mb-6 grow font-medium">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="border border-[#ff007f] text-[#ff007f] text-[10px] font-bold px-2 py-1 uppercase tracking-widest bg-[#ff007f]/10">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-[#ff007f]/30">
                        <ProjectActions
                          liveUrl={project.liveUrl}
                          sourceUrl={project.sourceUrl}
                          liveClassName="bg-[#00f0ff] text-[#0d0221] text-xs font-bold px-5 py-2 hover:bg-white transition-colors mr-3 uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                          sourceClassName="border border-[#00f0ff] text-[#00f0ff] text-xs font-bold px-5 py-2 hover:bg-[#00f0ff] hover:text-[#0d0221] transition-colors uppercase tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </CollapsibleList>
          </section>
        )}

        <div className="flex flex-col gap-12">
          {experiences.length > 0 && (
            <section id="experience" className="scroll-mt-32">
              <SectionHeading icon={<Music className="w-5 h-5 text-[#ff007f]" />}>Levels</SectionHeading>
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-6"
                buttonClassName="mt-6 bg-transparent border border-[#ffbc00] px-6 py-3 text-sm font-bold text-[#ffbc00] shadow-[0_0_10px_rgba(255,188,0,0.3)] hover:bg-[#ffbc00] hover:text-[#0d0221] transition-all uppercase tracking-widest"
              >
                {experiences.map((exp) => (
                  <article key={exp.id} className="bg-[#1a0b2e]/80 border-l-4 border-[#00f0ff] p-6 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{exp.role}</h3>
                    <p className="text-[#ff007f] font-bold text-lg mb-3 uppercase tracking-widest">{exp.company}</p>
                    {(exp.startDate || exp.endDate) && (
                      <div className="inline-block bg-[#0d0221] border border-[#ff007f]/50 text-[#00f0ff] text-[10px] font-bold px-3 py-1 mb-4 uppercase tracking-widest">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </div>
                    )}
                    {exp.description && (
                      <div className="text-[#d0d0d0] text-sm leading-relaxed font-medium">
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mb-2"
                          listClassName="list-disc pl-5 space-y-1 marker:text-[#ffbc00]"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          <div className="space-y-12">
            {skills.length > 0 && (
              <section>
                <SectionHeading>Loadout</SectionHeading>
                <div className="bg-[#1a0b2e]/80 border border-[#ff007f]/50 p-8 shadow-[0_0_15px_rgba(255,0,127,0.1)]">
                  <div className="space-y-8">
                    {Object.entries(groupedSkills).map(([category, names]) => (
                      <div key={category}>
                        <h3 className="text-sm font-black text-[#ffbc00] uppercase tracking-widest mb-4 drop-shadow-[0_0_5px_rgba(255,188,0,0.5)]">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {names.map((name) => (
                            <span key={name} className="bg-[#0d0221] border border-[#00f0ff]/50 text-[#00f0ff] text-xs font-bold px-3 py-1.5 uppercase tracking-widest hover:border-[#00f0ff] hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all cursor-default">
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
                <SectionHeading>Training</SectionHeading>
                <CollapsibleList
                  initial={3}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-6 bg-transparent border border-[#00f0ff] px-6 py-3 text-sm font-bold text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:bg-[#00f0ff] hover:text-[#0d0221] transition-all uppercase tracking-widest"
                >
                  {educations.map((edu) => (
                    <article key={edu.id} className="bg-[#1a0b2e]/80 border border-[#00f0ff]/30 p-6 hover:border-[#00f0ff] transition-colors">
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{edu.degree}</h3>
                      <p className="text-[#ff007f] text-sm font-bold mt-1 uppercase tracking-widest">{edu.institution}</p>
                      <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">
                        {(edu.startDate || edu.endDate) && (
                          <span className="bg-[#0d0221] px-2 py-1 border border-[#b0b0b0]/30">{formatDateRange(edu.startDate, edu.endDate)}</span>
                        )}
                        {edu.gpa && <span className="text-[#ffbc00]">GPA {edu.gpa}</span>}
                      </div>
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}
          </div>
        </div>

        {(certifications.length > 0 || achievements.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {certifications.length > 0 && (
              <section>
                <SectionHeading>Badges</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-6 bg-transparent border border-[#ff007f] px-6 py-3 text-sm font-bold text-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.3)] hover:bg-[#ff007f] hover:text-white transition-all uppercase tracking-widest"
                >
                  {certifications.map((cert) => (
                    <article key={cert.id} className="bg-[#1a0b2e]/80 border-l-2 border-[#ffbc00] p-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          {cert.url ? (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#00f0ff] transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                              {cert.name}
                            </a>
                          ) : (
                            cert.name
                          )}
                        </h3>
                        <p className="text-xs font-bold text-[#ff007f] mt-1 uppercase tracking-widest">{cert.issuer}</p>
                      </div>
                      {cert.issueDate && (
                        <span className="bg-[#0d0221] border border-[#ffbc00]/50 text-[#ffbc00] text-[10px] font-bold px-2 py-1 shrink-0">
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
                <SectionHeading>Trophies</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-6 bg-transparent border border-[#00f0ff] px-6 py-3 text-sm font-bold text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:bg-[#00f0ff] hover:text-[#0d0221] transition-all uppercase tracking-widest"
                >
                  {achievements.map((ach) => (
                    <article key={ach.id} className="bg-[#1a0b2e]/80 border border-[#ff007f]/30 p-5 flex items-start gap-4 hover:border-[#ff007f] transition-colors">
                      <div className="text-[#ffbc00] mt-0.5 drop-shadow-[0_0_5px_rgba(255,188,0,0.8)]">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider leading-snug">{ach.title}</h3>
                        {ach.date && (
                          <p className="text-[10px] font-bold text-[#00f0ff] mt-2 uppercase tracking-widest">
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
            <SectionHeading>Cassettes</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              buttonClassName="col-span-full mt-10 mx-auto block bg-transparent border border-[#ffbc00] px-8 py-4 text-sm font-bold text-[#ffbc00] shadow-[0_0_15px_rgba(255,188,0,0.3)] hover:bg-[#ffbc00] hover:text-[#0d0221] transition-all uppercase tracking-widest"
            >
              {articles.map((article) => (
                <article key={article.id} className="bg-[#1a0b2e]/80 border-t-4 border-[#00f0ff] p-6 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex flex-col group">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 group-hover:text-[#ff007f] transition-colors leading-tight drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  {article.description && (
                    <p className="text-[#b0b0b0] text-sm leading-relaxed mb-6 grow font-medium">
                      {article.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#ffbc00] pt-4 border-t border-[#ffbc00]/20 uppercase tracking-widest">
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                    {article.readTime != null && <span>{article.readTime} MIN</span>}
                  </div>
                </article>
              ))}
            </CollapsibleList>
          </section>
        )}

        {customSections.length > 0 && customSections.map((cs) => (
          <section key={cs.id} className="scroll-mt-32">
            <SectionHeading>{cs.label}</SectionHeading>
            <div className="bg-[#1a0b2e]/80 border border-[#ff007f]/50 p-8 shadow-[0_0_15px_rgba(255,0,127,0.1)]">
              <CustomSectionItems
                items={cs.items}
                titleClassName="text-lg font-black text-white uppercase tracking-wider mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                textClassName="text-[#d0d0d0] text-sm font-medium leading-relaxed"
                chipClassName="bg-[#0d0221] border border-[#00f0ff]/50 text-[#00f0ff] text-[10px] font-bold px-2 py-1 uppercase tracking-widest"
              />
            </div>
          </section>
        ))}

        {hasProfiles && (
          <section id="profiles" className="scroll-mt-32">
            <div className="bg-[#1a0b2e]/90 border-2 border-[#ff007f] p-10 md:p-14 text-center shadow-[0_0_30px_rgba(255,0,127,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-transparent via-[#00f0ff] to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#ffbc00] to-transparent" />
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Multiplayer</h2>
              <div className="flex justify-center">
                <ProfileLinksSection
                  portfolio={portfolio}
                  profiles={socialProfiles}
                  chipClassName="bg-[#0d0221] hover:bg-[#ff007f] border border-[#ff007f] px-6 py-3 text-sm font-bold text-[#00f0ff] hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,127,0.3)] uppercase tracking-widest"
                  pillClassName="bg-[#0d0221] hover:bg-[#00f0ff] border border-[#00f0ff] px-6 py-3 text-sm font-bold text-[#ff007f] hover:text-[#0d0221] transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] uppercase tracking-widest"
                  titleClassName="text-white font-black uppercase tracking-wider"
                  textClassName="text-[#b0b0b0]"
                />
              </div>
            </div>
          </section>
        )}

        {contributionCalendar && (
          <section className="scroll-mt-32">
            <SectionHeading>Activity Log</SectionHeading>
            <div className="bg-[#1a0b2e]/80 border border-[#00f0ff]/50 p-8 shadow-[0_0_15px_rgba(0,240,255,0.1)] overflow-x-auto custom-scrollbar">
              <GitHubContributionHeatmap
                calendar={contributionCalendar}
                profileUrl={githubProfile?.url}
                username={githubProfile?.username}
                variant="minimal"
                label="Commits"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#00f0ff] to-[#ff007f] mb-8 flex items-center gap-4 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]">
      {icon && <span className="drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]">{icon}</span>}
      {children}
      <span className="ml-4 h-0.5 grow bg-linear-to-r from-[#ff007f] to-transparent opacity-50" />
    </h2>
  );
}

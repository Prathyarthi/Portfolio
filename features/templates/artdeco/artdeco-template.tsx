import type { PortfolioData } from "../types";
import {
  GitHubContributionHeatmap,
  parseContributionCalendar,
} from "../github-contribution-heatmap";
import { Diamond, Star, Award } from "lucide-react";
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
import { ProjectPreviewMedia } from "@/features/templates/project-preview-media";

export function ArtDecoTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-[#0b132b] text-[#e5e5e5] font-sans selection:bg-[#d4af37] selection:text-[#0b132b] overflow-hidden relative pb-20">
      
      {/* Art Deco Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d4af37 25%, transparent 25%, transparent 75%, #d4af37 75%, #d4af37), repeating-linear-gradient(45deg, #d4af37 25%, #0b132b 25%, #0b132b 75%, #d4af37 75%, #d4af37)`,
          backgroundPosition: `0 0, 20px 20px`,
          backgroundSize: `40px 40px`
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none border-16 border-double border-[#d4af37]/20 m-4 md:m-8" />

      <div className="mx-auto max-w-5xl px-6 md:px-12 py-16 relative z-10 space-y-24">
        
        {navbarEnabled && (
          <div className="sticky top-8 z-50 flex justify-center mb-16">
            <TemplateNavbar
              items={sections}
              className="flex gap-4 bg-[#0b132b] border-y-2 border-[#d4af37] px-8 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              linkClassName="px-2 py-1 text-xs font-bold text-[#d4af37] hover:text-white transition-all uppercase tracking-[0.2em] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#d4af37] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-center"
            />
          </div>
        )}

        <header className="flex flex-col items-center text-center max-w-3xl mx-auto pt-8">
          {portfolio.avatarUrl && (
            <div className="relative mb-12 p-2 border border-[#d4af37]">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]" />
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.title}
                className="relative w-40 h-40 md:w-48 md:h-48 object-cover filter grayscale contrast-125"
              />
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#d4af37]" />
            <Diamond className="w-4 h-4 text-[#d4af37]" />
            <div className="h-px w-12 bg-[#d4af37]" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-[#d4af37] mb-6 tracking-wider uppercase font-light">
            {portfolio.title}
          </h1>
          
          {portfolio.headline && (
            <p className="text-lg md:text-xl text-[#a0a0a0] font-light mb-12 tracking-[0.15em] uppercase max-w-2xl">
              {portfolio.headline}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <ContactChips
              portfolio={portfolio}
              chipClassName="bg-transparent border border-[#d4af37]/50 hover:border-[#d4af37] px-6 py-2 text-xs font-bold text-[#d4af37] transition-all uppercase tracking-[0.15em]"
            />
            <HeroProfileButtons
              profiles={socialProfiles}
              className="bg-[#d4af37] text-[#0b132b] border border-[#d4af37] px-8 py-2 text-xs font-bold transition-all hover:bg-transparent hover:text-[#d4af37] uppercase tracking-[0.15em]"
            />
          </div>

          {socialProfiles.length > 0 && (
            <div className="mt-4 border-t border-[#d4af37]/20 pt-6 w-full max-w-md">
              <SocialPills
                profiles={socialProfiles}
                showUsername
                className="text-xs font-bold text-[#888] hover:text-[#d4af37] transition-colors uppercase tracking-widest"
              />
            </div>
          )}
        </header>

        {portfolio.summary && (
          <section id="about" className="scroll-mt-32">
            <div className="bg-[#111c3d] border border-[#d4af37]/30 p-10 md:p-16 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0b132b] px-4">
                <Diamond className="w-6 h-6 text-[#d4af37]" />
              </div>
              <SectionHeading className="text-center justify-center mb-10">About</SectionHeading>
              <DescriptionBlock
                text={portfolio.summary}
                paragraphClassName="text-lg md:text-xl leading-loose text-[#c0c0c0] font-serif font-light text-center"
                listClassName="space-y-4 pl-0 text-lg md:text-xl leading-loose text-[#c0c0c0] font-serif font-light list-none text-center"
              />
            </div>
          </section>
        )}

        {visibleProjects.length > 0 && (
          <section id="work" className="scroll-mt-32">
            <SectionHeading className="mb-12">Selected Works</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-10"
              buttonClassName="col-span-full mt-12 mx-auto block bg-transparent border border-[#d4af37] px-10 py-3 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
            >
              {visibleProjects.map((project) => (
                <article key={project.id} className="group bg-[#111c3d] border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-500 flex flex-col p-2">
                  <div className="border border-[#d4af37]/10 h-full flex flex-col p-4">
                    <div className="relative h-56 overflow-hidden mb-6 border-b border-[#d4af37]/30 pb-4">
                      <ProjectPreviewMedia
                        projectId={project.id}
                        liveUrl={project.liveUrl}
                        imageUrl={project.imageUrl}
                        livePreviewProjectIds={livePreviewProjectIds}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top filter sepia-[0.3] contrast-125 transition-transform duration-1000 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex flex-col grow">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-serif text-[#d4af37] uppercase tracking-widest">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="border border-[#d4af37] text-[#d4af37] text-[10px] font-bold px-2 py-1 uppercase tracking-[0.2em]">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-[#a0a0a0] leading-relaxed mb-8 grow font-light">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mb-8 justify-center">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="text-[#888] text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                            <span className="w-1 h-1 bg-[#d4af37] rotate-45" />
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-auto pt-6 border-t border-[#d4af37]/20 flex justify-center">
                        <ProjectActions
                          liveUrl={project.liveUrl}
                          sourceUrl={project.sourceUrl}
                          liveClassName="bg-[#d4af37] text-[#0b132b] text-xs font-bold px-6 py-2 hover:bg-white transition-colors mr-4 uppercase tracking-[0.15em]"
                          sourceClassName="border border-[#d4af37] text-[#d4af37] text-xs font-bold px-6 py-2 hover:bg-[#d4af37] hover:text-[#0b132b] transition-colors uppercase tracking-[0.15em]"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </CollapsibleList>
          </section>
        )}

        <div className="flex flex-col gap-16">
          {experiences.length > 0 && (
            <section id="experience" className="scroll-mt-32">
              <SectionHeading className="mb-10">Experience</SectionHeading>
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-8"
                buttonClassName="mt-8 bg-transparent border border-[#d4af37] px-8 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
              >
                {experiences.map((exp) => (
                  <article key={exp.id} className="border-t border-[#d4af37]/30 pt-6">
                    <h3 className="text-xl font-serif text-[#d4af37] uppercase tracking-wider mb-2">{exp.role}</h3>
                    <div className="flex flex-wrap justify-between items-baseline gap-2 mb-4">
                      <p className="text-white font-light tracking-widest uppercase text-sm">{exp.company}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </p>
                      )}
                    </div>
                    {exp.description && (
                      <div className="text-[#a0a0a0] text-sm leading-relaxed font-light">
                        <DescriptionBlock
                          text={exp.description}
                          paragraphClassName="mb-3"
                          listClassName="list-none pl-0 space-y-2"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </CollapsibleList>
            </section>
          )}

          <div className="space-y-16">
            {skills.length > 0 && (
              <section>
                <SectionHeading className="mb-10">Expertise</SectionHeading>
                <div className="bg-[#111c3d] border border-[#d4af37]/20 p-8">
                  <div className="space-y-8">
                    {Object.entries(groupedSkills).map(([category, names]) => (
                      <div key={category}>
                        <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                          <span className="w-8 h-px bg-[#d4af37]/50" />
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 pl-11">
                          {names.map((name) => (
                            <span key={name} className="text-[#e5e5e5] text-sm font-light tracking-wider">
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
                <SectionHeading className="mb-10">Education</SectionHeading>
                <CollapsibleList
                  initial={3}
                  wrapperClassName="space-y-6"
                  buttonClassName="mt-8 bg-transparent border border-[#d4af37] px-8 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
                >
                  {educations.map((edu) => (
                    <article key={edu.id} className="border border-[#d4af37]/20 p-6 bg-[#111c3d]">
                      <h3 className="text-lg font-serif text-[#d4af37] uppercase tracking-wider mb-1">{edu.degree}</h3>
                      <p className="text-white text-sm font-light tracking-widest uppercase mb-4">{edu.institution}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-[#d4af37]/10 text-[10px] font-bold text-[#888] uppercase tracking-[0.2em]">
                        {(edu.startDate || edu.endDate) && (
                          <span>{formatDateRange(edu.startDate, edu.endDate)}</span>
                        )}
                        {edu.gpa && <span className="text-[#d4af37]">GPA {edu.gpa}</span>}
                      </div>
                    </article>
                  ))}
                </CollapsibleList>
              </section>
            )}
          </div>
        </div>

        {(certifications.length > 0 || achievements.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {certifications.length > 0 && (
              <section>
                <SectionHeading className="mb-10">Credentials</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-8 bg-transparent border border-[#d4af37] px-8 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
                >
                  {certifications.map((cert) => (
                    <article key={cert.id} className="border-b border-[#d4af37]/20 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-serif text-[#d4af37] uppercase tracking-wider">
                          {cert.url ? (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                              {cert.name}
                            </a>
                          ) : (
                            cert.name
                          )}
                        </h3>
                        <p className="text-xs font-light text-[#a0a0a0] mt-1 tracking-widest uppercase">{cert.issuer}</p>
                      </div>
                      {cert.issueDate && (
                        <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em]">
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
                <SectionHeading className="mb-10">Honors</SectionHeading>
                <CollapsibleList
                  initial={4}
                  wrapperClassName="space-y-4"
                  buttonClassName="mt-8 bg-transparent border border-[#d4af37] px-8 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
                >
                  {achievements.map((ach) => (
                    <article key={ach.id} className="border-b border-[#d4af37]/20 pb-4 flex items-start gap-4">
                      <Star className="w-4 h-4 text-[#d4af37] mt-1 shrink-0" />
                      <div>
                        <h3 className="text-sm font-serif text-[#d4af37] uppercase tracking-wider leading-snug">{ach.title}</h3>
                        {ach.date && (
                          <p className="text-[10px] font-bold text-[#888] mt-2 uppercase tracking-[0.2em]">
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
            <SectionHeading className="mb-12 text-center justify-center">Publications</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 md:grid-cols-2 gap-10"
              buttonClassName="col-span-full mt-12 mx-auto block bg-transparent border border-[#d4af37] px-10 py-3 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
            >
              {articles.map((article) => (
                <article key={article.id} className="bg-[#111c3d] border border-[#d4af37]/20 p-8 hover:border-[#d4af37] transition-all flex flex-col text-center items-center">
                  <Award className="w-6 h-6 text-[#d4af37] mb-6" />
                  <h3 className="text-xl font-serif text-[#d4af37] uppercase tracking-wider mb-4 leading-snug">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      {article.title}
                    </a>
                  </h3>
                  {article.description && (
                    <p className="text-[#a0a0a0] text-sm leading-relaxed mb-8 grow font-light">
                      {article.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-center gap-4 text-[10px] font-bold text-[#888] pt-6 border-t border-[#d4af37]/20 uppercase tracking-[0.2em] w-full">
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                    {article.readTime != null && (
                      <>
                        <span className="w-1 h-1 bg-[#d4af37] rotate-45" />
                        <span>{article.readTime} MIN</span>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </CollapsibleList>
          </section>
        )}

        {customSections.length > 0 && customSections.map((cs) => (
          <section key={cs.id} className="scroll-mt-32">
            <SectionHeading className="mb-10">{cs.label}</SectionHeading>
            <div className="bg-[#111c3d] border border-[#d4af37]/20 p-8">
              <CustomSectionItems
                items={cs.items}
                titleClassName="text-lg font-serif text-[#d4af37] uppercase tracking-wider mb-2"
                textClassName="text-[#a0a0a0] text-sm font-light leading-relaxed"
                chipClassName="border border-[#d4af37]/50 text-[#888] text-[10px] font-bold px-3 py-1 uppercase tracking-[0.15em]"
              />
            </div>
          </section>
        ))}

        {hasProfiles && (
          <section id="profiles" className="scroll-mt-32">
            <div className="border-y-2 border-[#d4af37] py-16 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0b132b] px-4">
                <Diamond className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#0b132b] px-4">
                <Diamond className="w-6 h-6 text-[#d4af37]" />
              </div>
              <h2 className="text-3xl font-serif text-[#d4af37] uppercase tracking-widest mb-10">Correspondence</h2>
              <div className="flex justify-center">
                <ProfileLinksSection
                  portfolio={portfolio}
                  profiles={socialProfiles}
                  chipClassName="bg-transparent border border-[#d4af37] px-8 py-3 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
                  pillClassName="bg-transparent border border-[#d4af37] px-8 py-3 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b132b] transition-all uppercase tracking-[0.2em]"
                  titleClassName="text-[#d4af37] font-serif uppercase tracking-wider"
                  textClassName="text-[#a0a0a0] font-light"
                />
              </div>
            </div>
          </section>
        )}

        {contributionCalendar && (
          <section className="scroll-mt-32">
            <SectionHeading className="mb-10 text-center justify-center">Chronicle</SectionHeading>
            <div className="bg-[#111c3d] border border-[#d4af37]/20 p-8 overflow-x-auto custom-scrollbar">
              <GitHubContributionHeatmap
                calendar={contributionCalendar}
                profileUrl={githubProfile?.url}
                username={githubProfile?.username}
                variant="minimal"
                label="GitHub Activity"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-2xl md:text-3xl font-serif text-[#d4af37] flex items-center gap-6 uppercase tracking-widest ${className || ''}`}>
      <span className="h-px grow bg-linear-to-r from-transparent to-[#d4af37]/50" />
      {children}
      <span className="h-px grow bg-linear-to-l from-transparent to-[#d4af37]/50" />
    </h2>
  );
}

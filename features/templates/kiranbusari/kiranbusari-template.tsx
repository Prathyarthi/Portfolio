"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioData } from "../types";
import { motion } from "motion/react";
import { ExternalLink, Menu, X } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CollapsibleList } from "../collapsible-list";

const MADE_TOMMY_LINK_ID = "made-tommy-spotlight-font";

const NAV = [
  { name: "home", link: "#top" },
  { name: "projects", link: "#projects" },
  { name: "Achievements", link: "#achievements" },
] as const;

const FILTERS = ["Frontend", "Fullstack", "Freelancing", "Archive"] as const;
type Filter = (typeof FILTERS)[number] | "All";

/**
 * Spotlight-inspired layout with sticky nav, hero, filter pills, project cards,
 * and a timeline section.
 * from the shipped bundle (sticky nav, hero, filter pills, project cards, timeline).
 * Content maps from portfolio fields; optional `customization.kiranProjectCategories`
 * maps project id → string[] for filters; else `language` may be comma-separated tags.
 */
export function SpotlightTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, projects, articles, socialProfiles, certifications, achievements } = data;
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [logoFailed, setLogoFailed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showFloatSocial, setShowFloatSocial] = useState(false);

  const custom =
    portfolio.customization && typeof portfolio.customization === "object"
      ? (portfolio.customization as Record<string, unknown>)
      : {};

  const projectCategoryMap =
    custom.kiranProjectCategories &&
    typeof custom.kiranProjectCategories === "object" &&
    !Array.isArray(custom.kiranProjectCategories)
      ? (custom.kiranProjectCategories as Record<string, string[]>)
      : null;

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(MADE_TOMMY_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = MADE_TOMMY_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/made-tommy";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowFloatSocial(!entry?.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const milestones = useMemo(() => buildMilestones(achievements, certifications), [achievements, certifications]);

  const filteredProjects = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p) => {
      const cats = getProjectCategories(p, projectCategoryMap);
      if (cats.length === 0) return false;
      return cats.includes(filter);
    });
  }, [projects, filter, projectCategoryMap]);

  const headlineLines = splitHeadline(portfolio.headline);

  return (
    <>
      <style>{`
        .spotlight-root .custom-underline {
          position: relative;
          display: inline-block;
          text-decoration: none;
        }
        .spotlight-root .custom-underline:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 3px;
          background-color: #fc3;
          transform: scaleX(0);
          transform-origin: bottom right;
          transition: transform 0.3s ease-in-out;
        }
        .spotlight-root .custom-underline:hover:after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>

      <div
        id="top"
        className="spotlight-root min-h-screen bg-[#fbfffe] text-gray-950"
        style={{
          fontFamily: "'Made Tommy', 'Made Tommy 2', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <header className="sticky top-0 z-20 w-full border-b border-gray-100 bg-[#fbfffe] px-2 md:px-[200px]">
          <nav className="pb-5 pt-5">
            <div className="flex w-full flex-wrap items-center justify-between">
              <a href="#top" className="flex items-center" aria-label="Home">
                {!logoFailed ? (
                  <img
                    src="/logo.svg"
                    alt=""
                    className="h-8 w-auto"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="text-sm font-semibold tracking-tight text-gray-950">
                    {portfolio.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </a>

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="relative block rounded-md p-2 text-gray-950 lg:hidden"
                aria-expanded={menuOpen}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {menuOpen ? (
                <div className="fixed left-0 top-[72px] z-30 flex w-full md:hidden">
                  <div className="absolute mt-2 flex h-48 w-full flex-col items-end text-start">
                    <div className="space-y-5 rounded-lg bg-[#fbfffe] p-6 pr-5 text-[20px] font-semibold shadow-lg">
                      {NAV.map((item) => (
                        <a
                          key={item.name}
                          href={item.link}
                          className="custom-underline relative block font-normal capitalize text-gray-950 underline-offset-8 decoration-[hsl(45,100%,60%)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  "mt-4 w-full lg:mt-0 lg:flex lg:w-auto lg:items-center lg:space-x-12 lg:space-y-0",
                  menuOpen ? "hidden" : "hidden lg:flex"
                )}
              >
                {NAV.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="custom-underline relative block font-normal capitalize text-gray-950 underline-offset-8 decoration-[hsl(45,100%,60%)]"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </header>

        <div className="ml-4 mr-4 min-h-screen lg:ml-[200px] lg:mr-[200px]">
          <div ref={heroRef}>
            <section className="flex h-screen flex-col place-content-center place-items-center gap-y-4 px-2">
              <h1 className="-mt-7 text-center text-4xl font-extrabold leading-[130%] text-gray-950 md:font-semibold lg:mt-0 lg:text-6xl lg:font-semibold lg:leading-[128%]">
                Hey! <br />
                I am {portfolio.title}
                <span className="text-[hsl(45,100%,60%)]">.</span>
              </h1>
              <p
                className="-mt-[140px] h-[256px] w-[3px] rotate-90 rounded-full bg-[hsl(45,100%,60%)]"
                aria-hidden
              />
              <div className="-mt-[125px] text-[20px] text-[rgb(53,53,58)] lg:leading-[140%]">
                <p className="text-balance text-center">
                  {headlineLines[0]}
                  {headlineLines[1] ? (
                    <>
                      <br />
                      {headlineLines[1]}
                    </>
                  ) : null}
                </p>
              </div>

              <HeroSocialRow profiles={socialProfiles} />

              <div className="mt-[150px] animate-bounce">
                <a href="#projects" aria-label="Scroll to projects">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width={22}
                    height={22}
                    viewBox="0 0 21.33 21.33"
                    className="text-[#1B1B1E]"
                  >
                    <g transform="matrix(0,-1,1,0,-21.33,21.33)">
                      <path
                        d="M10.6667,33.33333396911621L10.6667,42.66663396911621L0,32.00003396911621L10.6667,21.33333396911621L10.6667,30.66666396911621L21.3333,30.66666396911621L21.3333,33.33333396911621L10.6667,33.33333396911621Z"
                        fill="currentColor"
                        fillOpacity={1}
                      />
                    </g>
                  </svg>
                </a>
              </div>
            </section>
          </div>

          {projects.length > 0 && (
            <section className="container mx-auto mb-16 px-0">
              <div
                className="-mt-40 flex flex-col pt-32 text-center leading-[150%] text-gray-950 lg:-mt-[157px] lg:pt-[130px] lg:text-left"
                id="projects"
              >
                <h2 className="text-3xl text-[38px] font-extrabold leading-[140%] lg:text-5xl lg:font-medium">
                  Where <span className="text-[hsl(45,100%,60%)]">logic</span>{" "}
                  <span className="m-0 block h-0 p-0 md:block lg:hidden">
                    <br />
                  </span>
                  meets <span className="text-[hsl(45,100%,60%)]">pixel</span>
                  <span>.</span>
                </h2>
              </div>

              <div className="grid grid-cols-3 items-center justify-center gap-2 pb-10 pt-10 sm:gap-4 lg:flex lg:justify-start">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full border border-gray-200 px-4 py-1 text-gray-950 backdrop-blur-sm transition-all duration-300 hover:border-[hsl(45,100%,60%)] sm:px-6 md:font-semibold lg:font-normal",
                      filter === f && "bg-[hsl(45,100%,60%)]",
                      f === "Freelancing" && filter === f && "text-gray-950"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <CollapsibleList
                key={filter}
                initial={4}
                wrapperClassName="mb-16 grid gap-8 sm:grid-cols-1 md:mx-auto md:grid-cols-2 lg:grid-cols-2"
                showLabel={(hidden) => `Show ${hidden} more`}
                buttonClassName="md:col-span-2 rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-950 transition-colors hover:border-[hsl(45,100%,60%)]"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </CollapsibleList>
            </section>
          )}

          {articles.length > 0 && (
            <section className="container mx-auto mb-16 px-0" id="writing">
              <div className="mb-12">
                <h2 className="text-5xl font-medium tracking-wide">
                  Writing
                  <span className="text-[hsl(45,100%,60%)]">.</span>
                </h2>
              </div>
              <CollapsibleList
                initial={4}
                wrapperClassName="grid gap-8 sm:grid-cols-1 md:mx-auto md:grid-cols-2 lg:grid-cols-2"
                showLabel={(hidden) => `Show ${hidden} more`}
                buttonClassName="md:col-span-2 rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-950 transition-colors hover:border-[hsl(45,100%,60%)]"
              >
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-[hsl(45,100%,60%)]"
                  >
                    <h3 className="text-xl font-bold text-gray-950">{article.title}</h3>
                    {article.description && (
                      <p className="mt-2 text-sm text-gray-500">{article.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
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
                    {article.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[hsl(45,100%,60%)]/20 px-2.5 py-1 text-xs capitalize text-gray-950"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </CollapsibleList>
            </section>
          )}

          {milestones.length > 0 && (
            <section className="min-h-auto w-full pb-24 pt-28 text-gray-950" id="achievements">
              <div className="mb-12">
                <h2 className="text-5xl font-medium tracking-wide">
                  Achievements
                  <span className="text-[hsl(45,100%,60%)]">.</span>
                </h2>
              </div>

              <div className="relative">
                <div className="absolute left-4 h-full w-0.5 bg-[hsl(45,100%,60%)] md:left-1/2" />
                <CollapsibleList
                  initial={4}
                  showLabel={(hidden) => `Show ${hidden} more`}
                  buttonClassName="mx-auto mt-4 block rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-950 transition-colors hover:border-[hsl(45,100%,60%)]"
                >
                  {milestones.map((m, t) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: t * 0.1 }}
                      className={cn(
                        "relative mb-12 flex flex-col gap-8 md:flex-row",
                        t % 2 === 0 ? "md:flex-row-reverse" : ""
                      )}
                    >
                      <div className="absolute left-4 mt-1.5 h-4 w-4 -translate-x-2 rounded-full bg-[hsl(45,100%,60%)] md:left-1/2" />
                      <div className="ml-12 p-4 md:ml-0 md:w-1/2">
                        <div className="rounded-lg border border-[hsl(45,100%,60%)] bg-[#fbfffe] p-6 shadow-lg">
                          <span className="font-bold text-[hsl(45,100%,60%)]">{m.year}</span>
                          <h3 className="mt-2 text-xl font-bold text-gray-950">{m.title}</h3>
                          {m.body ? (
                            <p className="mt-2 text-gray-500">{m.body}</p>
                          ) : null}
                          <span className="mt-3 inline-block rounded-full bg-[hsl(45,100%,60%)]/20 px-3 py-1 text-sm capitalize text-gray-950">
                            {m.kind}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CollapsibleList>
              </div>
            </section>
          )}

          {showFloatSocial && socialProfiles.length > 0 && (
            <div className="fixed right-0 top-[290px] z-20 hidden lg:block">
              <div className="relative -z-10 mb-4 justify-center">
                <div className="rounded-lg bg-[#fbfffe] px-3 py-6 shadow-2xl drop-shadow-2xl">
                  <div className="flex flex-col gap-3">
                    {socialProfiles.map((p) => (
                      <a
                        key={`${p.platform}-${p.url}`}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-950 transition-colors duration-300 hover:opacity-70"
                        aria-label={p.platform}
                      >
                        <SocialIcon platform={p.platform} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  const className = "h-7 w-7";
  if (p.includes("github")) return <GithubIcon className={className} />;
  if (p.includes("linkedin")) return <LinkedinIcon className={className} />;
  if (p.includes("instagram")) return <InstagramIcon className={className} />;
  return <ExternalLink className={className} />;
}

function HeroSocialRow({ profiles }: { profiles: PortfolioData["socialProfiles"] }) {
  if (profiles.length === 0) return null;
  return (
    <div className="mb-3 mt-0 flex justify-center space-x-7 lg:justify-start">
      {profiles.map((p) => (
        <a
          key={`${p.platform}-${p.url}`}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-950 transition duration-300 hover:opacity-70"
          aria-label={p.platform}
        >
          <SocialIcon platform={p.platform} />
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioData["projects"][number] }) {
  const hasLinks = Boolean(project.liveUrl || project.sourceUrl);

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(45,100%,60%)] hover:shadow-lg">
      <div className="h-1 w-full bg-[hsl(45,100%,60%)]/70" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-gray-950">{project.title}</h3>
          {hasLinks ? (
            <ExternalLink size={18} className="mt-0.5 shrink-0 text-gray-700 transition-colors group-hover:text-gray-950" />
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-gray-600">
          {project.description || "A private project with implementation details available on request."}
        </p>

        {project.techStack.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium capitalize text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-1">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-gray-950 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-85"
            >
              Live Demo
            </a>
          ) : null}
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:border-gray-300"
            >
              Source
            </a>
          ) : null}
          {!hasLinks ? <span className="text-xs font-medium text-gray-500">Private project</span> : null}
        </div>
      </div>
    </article>
  );
}

function getProjectCategories(
  project: PortfolioData["projects"][number],
  map: Record<string, string[]> | null
): string[] {
  if (map?.[project.id]?.length) return map[project.id];
  const raw = project.language?.trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function splitHeadline(headline: string): [string, string | null] {
  if (!headline) return ["", null];
  const parts = headline.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
  const dot = headline.indexOf(". ");
  if (dot > 0 && dot < headline.length - 2) {
    return [headline.slice(0, dot + 1).trim(), headline.slice(dot + 1).trim()];
  }
  return [headline, null];
}

type Milestone = { id: string; year: string; title: string; body: string; kind: string };

function buildMilestones(
  achievements: PortfolioData["achievements"],
  certifications: PortfolioData["certifications"]
): Milestone[] {
  const items: Milestone[] = [];
  for (const a of achievements) {
    items.push({
      id: `ach-${a.id}`,
      year: yearFromIso(a.date),
      title: a.title,
      body: "",
      kind: inferAchievementKind(a.title),
    });
  }
  for (const c of certifications) {
    items.push({
      id: `cert-${c.id}`,
      year: yearFromIso(c.issueDate),
      title: c.name,
      body: c.issuer,
      kind: "certification",
    });
  }
  items.sort((a, b) => {
    const ya = parseInt(a.year, 10);
    const yb = parseInt(b.year, 10);
    if (!Number.isNaN(ya) && !Number.isNaN(yb) && ya !== yb) return yb - ya;
    return a.id.localeCompare(b.id);
  });
  return items;
}

function yearFromIso(date: string | null): string {
  if (!date) return "—";
  const y = new Date(date).getFullYear();
  return Number.isNaN(y) ? "—" : String(y);
}

function inferAchievementKind(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("hackathon") || t.includes("place") || t.includes("wave")) return "award";
  if (t.includes("cert")) return "certification";
  return "award";
}

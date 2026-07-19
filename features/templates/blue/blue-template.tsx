'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  GitFork,
  Calendar,
  Award,
  BookOpen,
  GraduationCap,
  Code,
  Search,
  Check,
  Copy,
  ArrowUpRight,
  Menu,
  X,
  Cpu,
  Database,
  Terminal,
  Layers,
  Cloud,
  ChevronRight,
  Globe,
  FileCheck,
  Filter
} from 'lucide-react';
import type { PortfolioData } from '../types';

interface AppProps {
  data: PortfolioData;
}

// ---- helpers -------------------------------------------------------------

/** Formats an ISO-ish date string as "MON YYYY", falling back gracefully. */
function formatMonthYear(date: string | null): string {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date.toUpperCase();
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}

/** Extracts just the year from a date string, falling back gracefully. */
function formatYear(date: string | null): string {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());
  return date.slice(0, 4) || 'N/A';
}

/** skills.level is a numeric score (0-5) or null; map it to a display label + color. */
function getSkillLevelDisplay(level: number | null): { label: string; classes: string } {
  if (level === null || level === undefined) {
    return { label: 'N/A', classes: 'bg-slate-900 border border-slate-800 text-slate-400' };
  }
  if (level >= 4) {
    return { label: 'Expert', classes: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' };
  }
  if (level >= 3) {
    return { label: 'Advanced', classes: 'bg-blue-500/10 border border-blue-500/20 text-blue-400' };
  }
  return { label: 'Familiar', classes: 'bg-slate-900 border border-slate-800 text-slate-400' };
}

/** Best-effort label/description extraction from a generic custom-section item. */
function getCustomItemFields(item: Record<string, unknown>): { name: string; description: string } {
  const name =
    (typeof item.name === 'string' && item.name) ||
    (typeof item.title === 'string' && item.title) ||
    (typeof item.label === 'string' && item.label) ||
    'Untitled';
  const description =
    (typeof item.description === 'string' && item.description) ||
    (typeof item.summary === 'string' && item.summary) ||
    (typeof item.value === 'string' && item.value) ||
    '';
  return { name, description };
}

/** cachedStats is Record<string, unknown> | null; read known numeric-ish fields safely. */
function getSocialStatLabel(stats: Record<string, unknown> | null): string | null {
  if (!stats) return null;
  if (stats.followers !== undefined && stats.followers !== null) {
    return `${stats.followers} flwrs`;
  }
  if (stats.connections !== undefined && stats.connections !== null) {
    return `${stats.connections}+ conns`;
  }
  return null;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop';
const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop';

export function AuroraTemplate({ data }: AppProps) {
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
    customSections
  } = data;

  // State management
  const [copiedText, setCopiedText] = useState<'email' | 'phone' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeExperienceTab, setActiveExperienceTab] = useState<string>(experiences[0]?.id ?? '');

  // Nav sections can be toggled off via portfolio.customization.navbar
  const navbarConfig = portfolio.customization?.navbar;
  const isSectionEnabled = (id: 'about' | 'work' | 'experience' | 'profiles') =>
    navbarConfig?.enabled === false ? false : navbarConfig?.sections?.[id] !== false;

  // Copy helper — no-ops gracefully if the value is missing
  const handleCopy = (text: string | null, type: 'email' | 'phone') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Extract unique skill categories
  const skillCategories = useMemo(() => {
    const categories = new Set(skills.map(s => s.category));
    return ['All', ...Array.from(categories)];
  }, [skills]);

  // Filter skills based on selected category
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return skills;
    return skills.filter(s => s.category === selectedCategory);
  }, [skills, selectedCategory]);

  // Get list of all distinct technologies in projects
  const allProjectTechs = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach(p => p.techStack.forEach(t => techs.add(t)));
    return Array.from(techs);
  }, [projects]);

  // Filter projects based on search text and selected technology tag
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(projectSearch.toLowerCase()));
      const matchesTech = selectedTech ? p.techStack.includes(selectedTech) : true;
      return matchesSearch && matchesTech;
    });
  }, [projects, projectSearch, selectedTech]);

  // Skill category icon helper
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'languages':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'runtimes':
        return <Cpu className="w-4 h-4 text-green-400" />;
      case 'frameworks':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'databases':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'orms':
        return <Terminal className="w-4 h-4 text-rose-400" />;
      case 'cloud':
        return <Cloud className="w-4 h-4 text-indigo-400" />;
      default:
        return <Code className="w-4 h-4 text-slate-400" />;
    }
  };

  // Render social profile icon helper
  const getSocialIcon = (platform: string, className = 'w-5 h-5') => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className={className} />;
      case 'linkedin':
        return <Linkedin className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans text-slate-300 selection:bg-blue-600/30 selection:text-white overflow-x-hidden geom-grid-bg">

      {/* Header / Navbar */}
      <header id="header" className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#hero" id="logo" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-none border border-blue-500 bg-slate-900 flex items-center justify-center font-display font-bold text-white group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              AK
            </span>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-white leading-none text-sm tracking-wide group-hover:text-blue-400 transition-colors">
                {portfolio.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                env: production
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
            {isSectionEnabled('experience') && (
              <a href="#experience" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">Experience</a>
            )}
            {isSectionEnabled('work') && (
              <a href="#projects" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">Projects</a>
            )}
            <a href="#skills" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">Skills</a>
            <a href="#certifications" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">Credentials</a>
            <a href="#contact" className="px-4 py-2 rounded-none border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white font-mono uppercase text-xs tracking-wider font-semibold transition-all">
              Get In Touch
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-800 bg-[#0A0C10]"
            >
              <div className="px-4 py-6 space-y-4 flex flex-col">
                {isSectionEnabled('experience') && (
                  <a
                    href="#experience"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-mono uppercase tracking-wider text-slate-300 hover:text-white py-2 border-b border-slate-800/60"
                  >
                    Experience
                  </a>
                )}
                {isSectionEnabled('work') && (
                  <a
                    href="#projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-mono uppercase tracking-wider text-slate-300 hover:text-white py-2 border-b border-slate-800/60"
                  >
                    Projects
                  </a>
                )}
                <a
                  href="#skills"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-mono uppercase tracking-wider text-slate-300 hover:text-white py-2 border-b border-slate-800/60"
                >
                  Skills
                </a>
                <a
                  href="#certifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-mono uppercase tracking-wider text-slate-300 hover:text-white py-2 border-b border-slate-800/60"
                >
                  Credentials
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-none border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white font-mono uppercase text-xs tracking-wider font-semibold transition-colors"
                >
                  Get In Touch
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-24 sm:space-y-32">

        {/* HERO SECTION */}
        <section id="hero" className="relative pt-4 md:pt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left info column */}
            <div className="md:col-span-7 space-y-6 order-2 md:order-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-none bg-blue-500/5 border border-blue-500/30 text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-blue-400 animate-pulse" />
                Available for Senior Roles
              </div>

              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tighter uppercase leading-none">
                {portfolio.title}
              </h1>

              <p id="hero-headline" className="text-sm sm:text-base font-mono font-bold text-blue-500 tracking-widest uppercase mt-2">
                {portfolio.headline}
              </p>

              {portfolio.customization?.heroTagline && (
                <p id="hero-tagline" className="text-lg sm:text-xl text-white font-semibold">
                  {portfolio.customization.heroTagline}
                </p>
              )}

              <p id="hero-summary" className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                {portfolio.summary}
              </p>

              {/* Dynamic stats row */}
              <div id="stats-banner" className="grid grid-cols-3 gap-4 py-4 max-w-md mx-auto md:mx-0 border-t border-b border-slate-800 font-mono">
                <div className="bg-slate-900/40 p-3 border-l-2 border-blue-500">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">EXPERIENCE</div>
                  <div className="text-xl font-bold text-white mt-1">{experiences.length}+</div>
                </div>
                <div className="bg-slate-900/40 p-3 border-l-2 border-slate-700">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">G_STARS</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {projects.reduce((sum, p) => sum + (p.githubStars ?? 0), 0)}+
                  </div>
                </div>
                <div className="bg-slate-900/40 p-3 border-l-2 border-slate-700">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">PROJECTS</div>
                  <div className="text-xl font-bold text-white mt-1">{projects.length}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div id="hero-actions" className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href="#projects"
                  className="px-5 py-2.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all border border-slate-800 hover:border-slate-700 flex items-center gap-2 shadow-sm"
                >
                  View My Work
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                </a>

                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-none bg-blue-600 hover:bg-transparent border border-blue-500 text-white hover:text-blue-400 font-mono font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  Let's Connect
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Social profiles stats & links */}
              {socialProfiles.length > 0 && (
                <div id="hero-socials" className="flex items-center justify-center md:justify-start gap-4 pt-4">
                  {socialProfiles.map((profile) => {
                    const statLabel = getSocialStatLabel(profile.cachedStats);
                    return (
                      <a
                        key={profile.platform}
                        href={profile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-none bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white transition-all flex items-center gap-2 font-mono text-xs group"
                        id={`social-${profile.platform}`}
                      >
                        {getSocialIcon(profile.platform, 'w-4 h-4 text-blue-500')}
                        {profile.username && <span className="hidden sm:inline">@{profile.username}</span>}
                        {statLabel && (
                          <span className="px-1.5 py-0.5 rounded-none bg-slate-950 text-[9px] text-slate-500 border border-slate-800/80 group-hover:text-blue-400 transition-colors">
                            {statLabel}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right avatar column */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-2">
              <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-none border-2 border-blue-500 p-1 bg-[#111418] relative">
                <div className="w-full h-full bg-slate-800 border border-slate-800 overflow-hidden relative">
                  <img
                    src={portfolio.avatarUrl ?? FALLBACK_AVATAR}
                    alt={portfolio.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 hover:scale-102 transition-all duration-500"
                    id="avatar-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent opacity-50" />
                </div>
                {/* Floating details - geometric style */}
                {portfolio.location && (
                  <div className="absolute -bottom-3 left-4 right-4 bg-[#0A0C10] border border-slate-800 p-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-white">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs font-mono uppercase tracking-widest font-bold">{portfolio.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* WORK EXPERIENCE */}
        {experiences.length > 0 && (
          <section id="experience" className="space-y-8 scroll-mt-20">
            <div className="border-l-2 border-blue-500 pl-4">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Work Experience
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-wider">Professional timeline and core contributions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar list for active experience */}
              <div id="experience-tabs" className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-800">
                {experiences.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setActiveExperienceTab(exp.id)}
                    className={`flex-none lg:flex-1 text-left px-4 py-3 border transition-all flex flex-col gap-1 items-start whitespace-nowrap lg:whitespace-normal rounded-none ${
                      activeExperienceTab === exp.id
                        ? 'bg-blue-600/5 border-l-2 border-l-blue-500 border-slate-800 text-white'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                    id={`tab-${exp.id}`}
                  >
                    <span className="font-mono font-bold text-xs uppercase tracking-wider">{exp.role}</span>
                    <span className="text-xs font-mono text-slate-500">{exp.company}</span>
                  </button>
                ))}
              </div>

              {/* Active experience detail container */}
              <div className="lg:col-span-8 min-h-[250px]">
                <AnimatePresence mode="wait">
                  {experiences.map((exp) => exp.id === activeExperienceTab && (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="bg-[#111418] border border-slate-800 p-6 sm:p-8 rounded-none space-y-6"
                      id={`exp-content-${exp.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-mono font-bold text-white flex items-center gap-2 flex-wrap">
                            <span className="text-blue-500 uppercase">{exp.role}</span>
                            <span className="text-slate-500 font-normal">@</span>
                            <span className="text-white uppercase tracking-wide">{exp.company}</span>
                          </h3>
                          {exp.location && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-slate-600" />
                              <span className="uppercase">{exp.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono self-start sm:self-center">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>{formatMonthYear(exp.startDate)}</span>
                          <span>–</span>
                          <span>{exp.endDate ? formatMonthYear(exp.endDate) : 'PRESENT'}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Key Achievements</p>
                        <ul className="space-y-3">
                          {exp.description.split('\n').filter(Boolean).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 bg-blue-500 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        <section id="projects" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-l-2 border-blue-500 pl-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Featured Projects
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-wider">Production architectures and engineering deliverables</p>
            </div>

            {/* Total count badge */}
            <div className="px-3 py-1.5 rounded-none bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              COUNT: {filteredProjects.length} / {projects.length}
            </div>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div id="project-filters-container" className="bg-[#111418] border border-slate-800 p-4 rounded-none space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  id="project-search-input"
                  placeholder="SEARCH PROJECTS BY NAME, DESCRIPTION, TECH..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-none py-2.5 pl-10 pr-4 text-xs font-mono uppercase tracking-wider text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
                {projectSearch && (
                  <button
                    onClick={() => setProjectSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 hover:text-white px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded-none"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Technologies quick select dropdown or filter row */}
              {allProjectTechs.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap flex items-center gap-1 uppercase tracking-wider">
                    <Filter className="w-3 h-3 text-blue-500" /> TECH STACK:
                  </span>
                  <button
                    onClick={() => setSelectedTech(null)}
                    className={`px-2.5 py-1 rounded-none text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                      selectedTech === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    id="filter-tech-all"
                  >
                    ALL TECH
                  </button>
                  {allProjectTechs.map(tech => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech === selectedTech ? null : tech)}
                      className={`px-2.5 py-1 rounded-none text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                        selectedTech === tech
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      id={`filter-tech-${tech}`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          <div id="projects-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-[#111418] border border-slate-800 rounded-none overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                  id={`project-card-${project.id}`}
                >
                  <div>
                    {/* Project Header Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-950 border-b border-slate-800">
                      <img
                        src={project.imageUrl ?? FALLBACK_PROJECT_IMAGE}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500"
                        id={`project-img-${project.id}`}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111418] to-transparent opacity-80" />

                      {/* Tags in header */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        {project.featured ? (
                          <span className="px-2 py-1 rounded-none bg-blue-500/15 border border-blue-500/40 text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1 backdrop-blur-sm">
                            <Star className="w-3 h-3 fill-blue-400" /> FEATURED
                          </span>
                        ) : <span />}

                        {project.language && (
                          <span className="px-2 py-0.5 rounded-none bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                            {project.language}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-mono font-bold text-white uppercase group-hover:text-blue-500 transition-colors">
                          {project.title}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-400 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech Stack list */}
                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.techStack.map(tag => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTech(tag === selectedTech ? null : tag)}
                              className={`px-2 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-wider transition-colors ${
                                selectedTech === tag
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Footer containing Actions and Stats */}
                  <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/65 flex items-center justify-between">
                    {/* GitHub Stats */}
                    <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                      {!!project.githubStars && (
                        <div className="flex items-center gap-1 hover:text-amber-400 transition-colors" title="GitHub Stars">
                          <Star className="w-3.5 h-3.5 text-blue-500" />
                          <span>{project.githubStars}</span>
                        </div>
                      )}
                      {!!project.githubForks && (
                        <div className="flex items-center gap-1 hover:text-blue-400 transition-colors" title="GitHub Forks">
                          <GitFork className="w-3.5 h-3.5 text-blue-500" />
                          <span>{project.githubForks}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-3">
                      {project.sourceUrl && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-none transition-colors"
                          title="View Source Code"
                          id={`source-link-${project.id}`}
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-blue-600 border border-blue-500 hover:bg-transparent text-white hover:text-blue-400 font-semibold text-[10px] font-mono uppercase tracking-widest rounded-none transition-all flex items-center gap-1"
                          id={`live-link-${project.id}`}
                        >
                          <span>LIVE DEMO</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center bg-[#111418] border border-slate-800 rounded-none">
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wide">No projects found matching the selection criteria.</p>
                <button
                  onClick={() => { setProjectSearch(''); setSelectedTech(null); }}
                  className="mt-4 px-4 py-2 bg-blue-600/5 text-blue-400 text-xs font-mono uppercase tracking-widest rounded-none hover:bg-blue-600/10 border border-blue-500/20"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SKILLS SECTION */}
        {skills.length > 0 && (
          <section id="skills" className="space-y-8 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-l-2 border-blue-500 pl-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Technical Skills
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-wider">Expertise mapping and runtimes knowledge</p>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {skillCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-none text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-blue-600/10 border border-blue-500 text-blue-400 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                    id={`skill-category-${cat}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills list layout */}
            <div id="skills-container" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredSkills.map((skill) => {
                  const levelDisplay = getSkillLevelDisplay(skill.level);
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="bg-[#111418] border border-slate-800 p-4 rounded-none flex items-center justify-between hover:border-slate-700 transition-colors group"
                      id={`skill-card-${skill.id}`}
                    >
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1">
                          {getCategoryIcon(skill.category)}
                          {skill.category}
                        </span>
                        <p className="font-mono font-bold text-xs uppercase text-white group-hover:text-blue-500 transition-colors">{skill.name}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-widest font-bold ${levelDisplay.classes}`}>
                        {levelDisplay.label}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* ARTICLES & CERTIFICATIONS & ACHIEVEMENTS */}
        <div id="achievements-section-group" className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Certifications & Achievements */}
          <div className="lg:col-span-7 space-y-12">

            {/* Achievements */}
            {achievements.length > 0 && (
              <section id="achievements" className="space-y-6">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Honors & Achievements
                  </h3>
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Milestones and recognitions</p>
                </div>

                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-[#111418] border border-slate-800 p-5 rounded-none hover:border-slate-700 transition-colors flex items-start gap-4"
                      id={`achievement-card-${achievement.id}`}
                    >
                      <div className="p-2.5 rounded-none bg-blue-500/5 border border-blue-500/20 text-blue-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-mono font-bold text-white text-sm sm:text-base uppercase tracking-wide">
                            {achievement.title}
                          </h4>
                          {achievement.date && (
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              {achievement.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section id="certifications" className="space-y-6 scroll-mt-20">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Certifications
                  </h3>
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Industry certified qualifications</p>
                </div>

                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-[#111418] border border-slate-800 p-5 rounded-none hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
                      id={`cert-card-${cert.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-none bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-white text-sm sm:text-base uppercase tracking-wide">{cert.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5 font-mono uppercase">
                            <span>{cert.issuer}</span>
                            {cert.issueDate && (
                              <>
                                <span className="text-slate-700">•</span>
                                <span>Issued {cert.issueDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-none transition-colors shrink-0"
                          title="Verify Certificate"
                          id={`cert-verify-${cert.id}`}
                        >
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Articles & Custom Sections */}
          <div className="lg:col-span-5 space-y-12">

            {/* Publications */}
            {articles.length > 0 && (
              <section id="publications" className="space-y-6">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Technical Articles
                  </h3>
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Published tech guides and thoughts</p>
                </div>

                <div className="space-y-4">
                  {articles.map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-[#111418] border border-slate-800 p-5 rounded-none hover:border-slate-700 transition-all group"
                      id={`article-card-${article.id}`}
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 uppercase">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          {article.publishedAt ? `Published ${article.publishedAt}` : 'Unpublished'}
                          {article.readTime ? ` · ${article.readTime} min read` : ''}
                        </span>
                        <h4 className="font-mono font-bold text-white text-sm sm:text-base group-hover:text-blue-500 transition-colors leading-snug uppercase tracking-wide">
                          {article.title}
                        </h4>
                        {article.description && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{article.description}</p>
                        )}
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {article.tags.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-none bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-500 uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-blue-500 font-mono pt-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                          <span>Read Article</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Custom Sections (dynamic, shape defined per section) */}
            {customSections.map((sect) => (
              <section key={sect.id} id={`custom-section-${sect.id}`} className="space-y-6">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> {sect.label}
                  </h3>
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">{sect.sectionType}</p>
                </div>

                <div className="space-y-4">
                  {sect.items.map((item, itemIdx) => {
                    const { name, description } = getCustomItemFields(item);
                    return (
                      <div
                        key={itemIdx}
                        className="bg-[#111418] border border-slate-800 p-5 rounded-none"
                        id={`custom-item-${sect.id}-${itemIdx}`}
                      >
                        <h4 className="font-mono font-bold text-blue-500 text-sm sm:text-base mb-1.5 uppercase tracking-wider">{name}</h4>
                        {description && <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Education */}
            {educations.length > 0 && (
              <section id="education" className="space-y-6">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 shrink-0 inline-block" /> Education
                  </h3>
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Academic path</p>
                </div>

                <div className="space-y-4">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-[#111418] border border-slate-800 p-5 rounded-none space-y-3"
                      id={`edu-card-${edu.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-none bg-blue-500/5 border border-blue-500/20 text-blue-400 shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-white text-sm sm:text-base leading-snug uppercase tracking-wide">
                            {edu.institution}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
                            {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono text-slate-500 uppercase">
                        <span>{formatYear(edu.startDate)} – {formatYear(edu.endDate)}</span>
                        {edu.gpa && (
                          <span className="px-2 py-0.5 rounded-none bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                            GPA {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

        </div>

        {/* CONTACT / CALL TO ACTION */}
        <section id="contact" className="scroll-mt-20">
          <div className="bg-[#111418] border border-slate-800 p-8 sm:p-12 rounded-none text-center space-y-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white uppercase tracking-tight">Let's Build Something High-Performance</h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Whether you're looking for a Senior Full-Stack architect, need performance tuning on complex Node.js/Bun applications, or want to discuss caching and indexing strategies, feel free to reach out.
              </p>
            </div>

            {/* Copyable contact card */}
            {(portfolio.contactEmail || portfolio.phone) && (
              <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Email Copier */}
                {portfolio.contactEmail && (
                  <button
                    onClick={() => handleCopy(portfolio.contactEmail, 'email')}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500 p-4 rounded-none flex flex-col items-center justify-center gap-2 group transition-all text-center focus:outline-none"
                    id="contact-email-btn"
                  >
                    <div className="p-2.5 rounded-none bg-blue-500/5 border border-blue-500/20 text-blue-400">
                      {copiedText === 'email' ? <Check className="w-5 h-5 text-emerald-400" /> : <Mail className="w-5 h-5" />}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Email Address</p>
                    <p className="text-xs sm:text-sm font-semibold text-white font-mono break-all group-hover:text-blue-400 transition-colors">
                      {portfolio.contactEmail}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      <Copy className="w-3 h-3 text-blue-400" /> {copiedText === 'email' ? 'Copied!' : 'Click to Copy'}
                    </span>
                  </button>
                )}

                {/* Phone Copier */}
                {portfolio.phone && (
                  <button
                    onClick={() => handleCopy(portfolio.phone, 'phone')}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500 p-4 rounded-none flex flex-col items-center justify-center gap-2 group transition-all text-center focus:outline-none"
                    id="contact-phone-btn"
                  >
                    <div className="p-2.5 rounded-none bg-blue-500/5 border border-blue-500/20 text-blue-400">
                      {copiedText === 'phone' ? <Check className="w-5 h-5 text-emerald-400" /> : <Phone className="w-5 h-5" />}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Phone Number</p>
                    <p className="text-xs sm:text-sm font-semibold text-white font-mono group-hover:text-blue-400 transition-colors">
                      {portfolio.phone}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      <Copy className="w-3 h-3 text-blue-400" /> {copiedText === 'phone' ? 'Copied!' : 'Click to Copy'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer id="footer" className="border-t border-slate-800 bg-[#0A0C10] mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center font-display font-bold text-white text-xs">
              AK
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">{portfolio.title}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">© {new Date().getFullYear()} {portfolio.title}. All rights reserved.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-500 uppercase">
            {isSectionEnabled('experience') && <a href="#experience" className="hover:text-blue-500 transition-colors">Experience</a>}
            {isSectionEnabled('work') && <a href="#projects" className="hover:text-blue-500 transition-colors">Projects</a>}
            <a href="#skills" className="hover:text-blue-500 transition-colors">Skills</a>
            <a href="#header" className="p-2 rounded-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all">
              ↑ Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
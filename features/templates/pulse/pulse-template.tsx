'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from 'next/font/google';
import {
  GithubIcon as Github,
  LinkedinIcon as Linkedin,
} from '@/components/icons';
import { TemplateProjectPreview } from '@/components/template-project-preview';
import {
  Terminal, Cpu, MessageSquare, MapPin, Phone, Globe, Copy, Check, Server, Database, ChevronRight,
  Briefcase, GraduationCap, Calendar, Award, Search, Star, Layers, Cloud, GitFork,
  ExternalLink, Play, CheckCircle2, RotateCcw, Network, ShieldCheck, FileText,
  Target, Zap, Sparkles, Send, Inbox, Clock, Trash2, RefreshCw, Mail, Code, Menu, X
} from 'lucide-react';
import type { PortfolioData, PortfolioCustomization } from '../types';
import styles from './pulse-template.module.css';

// ==========================================
// 1. TYPES (derived from the shared PortfolioData contract)
// ==========================================
type PortfolioMeta = PortfolioData['portfolio'];
type Experience = PortfolioData['experiences'][number];
type Education = PortfolioData['educations'][number];
type Skill = PortfolioData['skills'][number];
type Project = PortfolioData['projects'][number];
type Article = PortfolioData['articles'][number];
type SocialProfile = PortfolioData['socialProfiles'][number];
type Certification = PortfolioData['certifications'][number];
type Achievement = PortfolioData['achievements'][number];
type CustomSection = PortfolioData['customSections'][number];

interface AppProps {
  data: PortfolioData;
}

// ==========================================
// SHARED HELPERS (null-safety for fields that are optional on the real data)
// ==========================================
const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-bluish-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-bluish-display',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-bluish-serif',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-bluish-mono',
});

/** Formats an ISO-ish date string as "Mon YYYY"; returns a fallback for null/invalid input. */
function formatMonthYear(dateStr: string | null, fallback = 'N/A'): string {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Extracts just the year from a date string, falling back gracefully. */
function formatYear(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (!Number.isNaN(date.getTime())) return String(date.getFullYear());
  return dateStr.split('-')[0] || 'N/A';
}

/** experiences/educations duration calc — guards against a missing start date. */
function getDuration(start: string | null, end: string | null): string {
  if (!start) return '';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (Number.isNaN(startDate.getTime())) return '';

  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();

  let totalMonths = years * 12 + months;
  if (totalMonths <= 0) totalMonths = 1;

  const displayYears = Math.floor(totalMonths / 12);
  const displayMonths = totalMonths % 12;

  let durationStr = '';
  if (displayYears > 0) {
    durationStr += `${displayYears} yr${displayYears > 1 ? 's' : ''} `;
  }
  if (displayMonths > 0) {
    durationStr += `${displayMonths} mo${displayMonths > 1 ? 's' : ''}`;
  }
  return durationStr.trim();
}

/** skills.level is now a numeric score (0-5) or null — map it to a label + progress meter. */
function getSkillLevelInfo(level: number | null): { label: string; value: number; color: string } {
  if (level === null || level === undefined) {
    return { label: 'N/A', value: 40, color: 'from-slate-500 to-slate-400' };
  }
  if (level >= 4.5) return { label: 'Expert', value: 95, color: 'from-blue-500 to-indigo-500' };
  if (level >= 3.5) return { label: 'Advanced', value: 80, color: 'from-emerald-500 to-teal-500' };
  if (level >= 2) return { label: 'Intermediate', value: 65, color: 'from-amber-500 to-orange-500' };
  return { label: 'Familiar', value: 50, color: 'from-slate-500 to-slate-400' };
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

/** cachedStats is Record<string, unknown> | null; read known fields safely. */
function getStat(stats: Record<string, unknown> | null, key: string): number {
  if (!stats) return 0;
  const val = stats[key];
  return typeof val === 'number' ? val : 0;
}

// ==========================================
// 2. HEADER COMPONENT
// ==========================================
interface HeaderProps {
  portfolioTitle: string;
  activeSection: string;
  setActiveSection: (section: string) => void;
  primaryColor: string;
  accentColors: { name: string; hex: string; className: string }[];
  setPrimaryColor: (hex: string) => void;
}

function Header({
  portfolioTitle,
  activeSection,
  setActiveSection,
  primaryColor,
  accentColors,
  setPrimaryColor,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Credentials' },
    { id: 'contact', label: 'Connect' },
  ];

  const handleScroll = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 @sm:px-6 @lg:px-8">
        {/* Logo/Brand */}
        <div
          onClick={() => handleScroll('about')}
          className="flex cursor-pointer items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white hover:opacity-95"
          id="header-brand-logo"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 transition-colors"
            style={{ color: primaryColor }}
          >
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <span className="hidden max-w-48 truncate @sm:inline">{portfolioTitle}</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden @md:flex items-center gap-1" id="header-nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className={`relative px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold transition-colors duration-200 rounded-md hover:text-white ${
                activeSection === item.id
                  ? 'text-white bg-white/5'
                  : 'text-slate-400'
              }`}
              id={`nav-item-${item.id}`}
            >
              {item.label}
              {activeSection === item.id && (
                <span
                  className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Customization Quick Controls */}
        <div className="flex items-center gap-2 @sm:gap-4" id="header-customizer-controls">
          <div className="flex items-center gap-2 bg-white/5 px-2 @sm:px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold hidden @sm:inline">Accent:</span>
            <div className="flex gap-1.5">
              {accentColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setPrimaryColor(color.hex)}
                  className={`h-4 w-4 rounded-full border transition-all ${
                    primaryColor === color.hex
                      ? 'scale-125 border-white ring-2 ring-slate-950'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} Accent`}
                  id={`accent-picker-${color.name.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handleScroll('contact')}
            className="hidden @sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold font-display bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:border-white/20"
            id="header-cta-connect"
          >
            <MessageSquare className="h-3.5 w-3.5" style={{ color: primaryColor }} />
            <span>Connect</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="@md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-white/10 bg-[#0a0a0a]/95 px-4 py-3 @md:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScroll(item.id)}
                className={`rounded-lg px-3 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wider ${
                  activeSection === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

// ==========================================
// 3. HERO COMPONENT
// ==========================================
interface HeroProps {
  portfolio: PortfolioMeta;
  primaryColor: string;
}

function Hero({ portfolio, primaryColor }: HeroProps) {
  const [copied, setCopied] = useState(false);
  const [simulatedLoad, setSimulatedLoad] = useState(12);
  const [activeTab, setActiveTab] = useState<'details' | 'runtime'>('details');

  const handleCopyEmail = () => {
    if (!portfolio.contactEmail) return;
    navigator.clipboard.writeText(portfolio.contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${portfolio.title.toLowerCase().replace(/\s+/g, '_')}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedLoad(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return Math.max(5, Math.min(35, next));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-0 pt-8 pb-14 @sm:pt-12 @sm:pb-20 @md:py-28" id="about">
      {/* Absolute Ambient Glow */}
      <div
        className="absolute -top-40 right-0 h-96 w-96 rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-20 left-10 h-72 w-72 rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="grid grid-cols-1 @lg:grid-cols-12 gap-12 @lg:gap-16 items-center">

          {/* Left Column: Core Bio */}
          <div className="@lg:col-span-7 space-y-8" id="hero-bio-container">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available for Core Engineering Roles</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-3xl @sm:text-5xl @lg:text-6xl font-normal italic tracking-tight text-white leading-tight break-words">
                Hi, I&apos;m <span className="block mt-1 relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 not-italic font-sans font-bold">
                  {portfolio.title}
                </span>
              </h1>

              <h2
                className="font-display text-xl @sm:text-2xl font-medium tracking-tight"
                style={{ color: primaryColor }}
              >
                {portfolio.headline}
              </h2>

              <p className="font-sans text-base @sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                {portfolio.summary}
              </p>
            </div>

            {/* Quick Contact Specs */}
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-400 font-mono" id="hero-quick-specs">
              {portfolio.location && (
                <div className="flex min-w-0 items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>{portfolio.location}</span>
                </div>
              )}
              {portfolio.phone && (
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                  <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>{portfolio.phone}</span>
                </div>
              )}
              {portfolio.websiteUrl && (
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                  <Globe className="h-4 w-4 text-slate-500 shrink-0" />
                  <a
                    href={portfolio.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-all hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
                  >
                    {portfolio.websiteUrl.replace('https://', '')}
                  </a>
                </div>
              )}
              {portfolio.contactEmail && (
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="truncate">{portfolio.contactEmail}</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-all shrink-0"
                    title="Copy Email Address"
                    id="hero-copy-email-btn"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* CTAs */}
            {/* <div className="flex flex-col @sm:flex-row @sm:flex-wrap items-stretch @sm:items-center gap-3 @sm:gap-4 pt-4" id="hero-cta-buttons">
              <button
                onClick={() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full @sm:w-auto justify-center px-6 py-3.5 rounded-xl text-sm font-semibold font-display bg-white hover:bg-slate-100 text-slate-950 shadow-lg shadow-white/5 transition-all flex items-center gap-2 group hover:scale-[1.02]"
                id="hero-cta-hire"
              >
                <span>Hire {portfolio.title.split(' ')[0]}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleDownloadJSON}
                className="w-full @sm:w-auto justify-center px-6 py-3.5 rounded-xl text-sm font-semibold font-display bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-2 hover:scale-[1.02]"
                id="hero-cta-json-download"
              >
                <Terminal className="h-4 w-4 text-slate-500" style={{ color: primaryColor }} />
                <span>Export Profile Schema</span>
              </button>
            </div> */}
          </div>

          {/* Right Column: Avatar Frame & Interactive Virtual Server Panel */}
          <div className="@lg:col-span-5 flex flex-col items-center justify-center" id="hero-interactive-column">

            {/* Frame Box */}
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a]/60 p-5 shadow-2xl backdrop-blur-sm">

              {/* Tab Selector */}
              <div className="flex border-b border-white/10 mb-5 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 pb-2.5 font-medium transition-colors border-b ${
                    activeTab === 'details'
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={{ borderBottomColor: activeTab === 'details' ? primaryColor : 'transparent' }}
                  id="tab-hero-avatar"
                >
                  ENGINEER PROFILE
                </button>
                <button
                  onClick={() => setActiveTab('runtime')}
                  className={`flex-1 pb-2.5 font-medium transition-colors border-b ${
                    activeTab === 'runtime'
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={{ borderBottomColor: activeTab === 'runtime' ? primaryColor : 'transparent' }}
                  id="tab-hero-runtime"
                >
                  SYSTEM STATS
                </button>
              </div>

              {/* Tab Content 1: Avatar Profile */}
              {activeTab === 'details' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Avatar wrapper */}
                  {/* <div className="relative mx-auto h-48 w-48 rounded-2xl overflow-hidden group">
                    <div
                      className="absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none z-10 opacity-70 group-hover:opacity-100"
                      style={{ borderColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}20` }}
                    />
                    <img
                      src={portfolio.avatarUrl ?? FALLBACK_AVATAR}
                      alt={portfolio.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-[#0a0a0a]/90 border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono text-center text-slate-300 z-20">
                      SYS_OP_POOL_OK
                    </div>
                  </div> */}

                  {/* Profile Metadata Spec Table */}
                  <div className="space-y-2.5 font-mono text-xs text-slate-400 bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-slate-500">ENGINE</span>
                      <span className="text-white font-medium">Bun v1.1.20</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-slate-500">PRIMARY_STACK</span>
                      <span className="text-white font-medium">TypeScript, NextJS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">CORE_VIBE</span>
                      <span className="font-semibold px-1.5 py-0.5 rounded text-[10px]" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                        BACKEND_FIRST
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Runtime Sandbox Stats */}
              {activeTab === 'runtime' && (
                <div className="space-y-4 font-mono text-xs animate-fadeIn">

                  {/* CPU Load Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                        Node Event Pool
                      </span>
                      <span className="text-white font-semibold">{simulatedLoad}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${simulatedLoad}%`, backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>

                  {/* Caching / DB index visualizer */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 text-[11px] font-bold">
                      <Server className="h-3.5 w-3.5 text-slate-500" />
                      <span>Redis Caching Cache HITs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Queries</span>
                      <span className="text-white">4.8k / sec</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cache Hit Rate</span>
                      <span className="text-emerald-400 font-medium">98.42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Index Lookup Latency</span>
                      <span className="text-white">~0.42ms</span>
                    </div>
                  </div>

                  {/* Microservices Status Indicator */}
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 font-bold">
                      <Database className="h-3.5 w-3.5 text-slate-500" />
                      <span>Workspace Gateway</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Webhook Sync Queue</span>
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Operational
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">TCP Pool Handshakes</span>
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Healthy
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom decorative stats bar */}
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>PORT: 3000 // STABLE</span>
                <span>{portfolio.location ?? 'Remote'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ==========================================
// 4. TIMELINE COMPONENT
// ==========================================
interface TimelineProps {
  experiences: Experience[];
  educations: Education[];
  primaryColor: string;
}

function Timeline({ experiences, educations, primaryColor }: TimelineProps) {
  return (
    <section className="py-20 bg-transparent" id="experience">
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">

        {/* Section Heading */}
        <div className="text-center @md:text-left mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Milestones & Journeys</span>
          </div>
          <h2 className="font-serif text-3xl @sm:text-4xl font-normal italic tracking-tight text-white">
            Professional History
          </h2>
          <p className="font-sans text-sm @sm:text-base text-slate-400 max-w-xl">
            A comprehensive track record of leading complex backend architectures, full-stack deployment setups, and high-concurrency systems.
          </p>
        </div>

        <div className="grid grid-cols-1 @lg:grid-cols-12 gap-16">

          {/* Work Experience: Left Column (7/12) */}
          {experiences.length > 0 && (
            <div className="@lg:col-span-7 space-y-10" id="timeline-experience-list">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                  style={{ color: primaryColor }}
                >
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Engineering Experience</h3>
              </div>

              <div className="relative border-l border-white/10 pl-6 ml-5 space-y-12">
                {experiences.map((exp) => {
                  const bulletPoints = exp.description.split('\n').filter(p => p.trim().length > 0);
                  const duration = getDuration(exp.startDate, exp.endDate);
                  return (
                    <div key={exp.id} className="relative group" id={`experience-card-${exp.id}`}>

                      {/* Timeline Node Point */}
                      <div
                        className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0a0a0a] border-2 transition-all group-hover:scale-125"
                        style={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 10px ${primaryColor}40`
                        }}
                      />

                      <div className="space-y-4">
                        {/* Title & Metadata Card Header */}
                        <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-display text-lg font-bold text-white group-hover:text-slate-200 transition-colors">
                              {exp.role}
                            </h4>
                            <span
                              className="font-sans text-sm font-semibold transition-colors"
                              style={{ color: primaryColor }}
                            >
                              {exp.company}
                            </span>
                          </div>

                          {/* Period Tag */}
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md self-start @sm:self-center">
                            <Calendar className="h-3 w-3" />
                            <span>{formatMonthYear(exp.startDate)} – {exp.endDate ? formatMonthYear(exp.endDate) : 'Present'}</span>
                            {duration && (
                              <>
                                <span className="text-white/10">|</span>
                                <span className="text-slate-400">{duration}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Location details */}
                        {exp.location && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span>{exp.location}</span>
                          </div>
                        )}

                        {/* Decoded Bullet Points */}
                        <ul className="space-y-3 pt-1" id={`experience-bullets-${exp.id}`}>
                          {bulletPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700 group-hover:bg-slate-400 transition-colors" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education: Right Column (5/12) */}
          {educations.length > 0 && (
            <div className="@lg:col-span-5 space-y-10" id="timeline-education-list">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                  style={{ color: primaryColor }}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Academic Foundation</h3>
              </div>

              <div className="space-y-8">
                {educations.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all shadow-xl space-y-4"
                    id={`education-card-${edu.id}`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-display text-base font-bold text-white">
                          {edu.degree}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-[#0a0a0a]/80 px-2 py-0.5 rounded border border-white/10">
                          <Calendar className="h-3 w-3" />
                          <span>{formatYear(edu.startDate)} – {formatYear(edu.endDate)}</span>
                        </div>
                      </div>
                      {edu.field && (
                        <p className="font-sans text-sm text-slate-400 font-medium">
                          {edu.field}
                        </p>
                      )}
                      <p
                        className="font-display text-xs font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {edu.institution}
                      </p>
                    </div>

                    {/* GPA Visualizer */}
                    {edu.gpa && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Cumulative GPA Score:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 items-center gap-1 bg-[#0a0a0a]/85 px-2.5 py-0.5 rounded border border-white/10 text-white font-bold">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            <span>{edu.gpa}</span>
                            <span className="text-slate-500 font-normal">/ 10</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Micro details panel */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-400 space-y-3.5">
                <span className="text-slate-300 font-bold tracking-wider uppercase block">Research Interests</span>
                <p className="leading-relaxed text-[11px] text-slate-500">
                  Focused on runtime architecture performance benchmarks, compiler extensions, and memory profiling within V8 & Bun runtimes during university capstone projects.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-1 rounded bg-[#0a0a0a] border border-white/10 text-[10px]">Event Loop Pools</span>
                  <span className="px-2 py-1 rounded bg-[#0a0a0a] border border-white/10 text-[10px]">Data Indexing</span>
                  <span className="px-2 py-1 rounded bg-[#0a0a0a] border border-white/10 text-[10px]">System Telemetry</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

// ==========================================
// 5. SKILLS MATRIX COMPONENT
// ==========================================
interface SkillsMatrixProps {
  skills: Skill[];
  primaryColor: string;
}

function SkillsMatrix({ skills, primaryColor }: SkillsMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const list = new Set(skills.map(s => s.category));
    return ['All', ...Array.from(list)];
  }, [skills]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'languages':
        return <Code className="h-4 w-4" />;
      case 'runtimes':
        return <Cpu className="h-4 w-4" />;
      case 'frameworks':
        return <Layers className="h-4 w-4" />;
      case 'databases':
      case 'orms':
        return <Database className="h-4 w-4" />;
      case 'cloud':
        return <Cloud className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const levelLabel = getSkillLevelInfo(skill.level).label;
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            levelLabel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, selectedCategory]);

  return (
    <section className="py-20 bg-transparent border-y border-white/10" id="skills">
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">

        {/* Header Grid */}
        <div className="flex flex-col @md:flex-row @md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3 text-center @md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span>Full-Stack Capabilities</span>
            </div>
            <h2 className="font-serif text-3xl @sm:text-4xl font-normal italic tracking-tight text-white">
              Technical Skill Matrix
            </h2>
            <p className="font-sans text-sm @sm:text-base text-slate-400 max-w-xl">
              A detailed categorization of my technical stack with real proficiency scores and execution domains.
            </p>
          </div>

          {/* Search Input Filter */}
          <div className="relative w-full max-w-sm shrink-0 mx-auto @md:mx-0" id="skill-search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search stack (e.g. Bun, Elysia, PostgreSQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm font-sans placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-700 focus:border-slate-700 transition-all"
              id="skills-search-input"
            />
          </div>
        </div>

        {/* Category Tabs Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-6 scrollbar-thin border-b border-white/10 mb-10" id="skills-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded-xl text-xs font-mono font-medium tracking-wide uppercase transition-all whitespace-nowrap border flex items-center gap-2 ${
                selectedCategory === cat
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
              id={`skills-tab-${cat.toLowerCase()}`}
            >
              {cat !== 'All' && getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-6" id="skills-matrix-grid">
          {filteredSkills.map((skill) => {
            const prof = getSkillLevelInfo(skill.level);
            return (
              <div
                key={skill.id}
                className="relative min-h-36 overflow-hidden p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between gap-4 group"
                id={`skill-card-${skill.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 space-y-1">
                    <span className="block break-words text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {skill.category}
                    </span>
                    <h4 className="line-clamp-2 break-words font-display text-base font-bold text-white group-hover:text-white">
                      {skill.name}
                    </h4>
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0a] border border-white/10 text-slate-400 group-hover:text-white transition-colors"
                  >
                    {getCategoryIcon(skill.category)}
                  </div>
                </div>

                {/* Meter Visualizer */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">Execution proficiency:</span>
                    <span className="text-slate-300 font-bold">{prof.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${prof.color} transition-all duration-500`}
                      style={{ width: `${prof.value}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSkills.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs">
              No specific technology matching &quot;{searchQuery}&quot; located in the skills record.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

// ==========================================
// 6. PROJECTS SHOWCASE COMPONENT
// ==========================================
interface ProjectsShowcaseProps {
  projects: Project[];
  primaryColor: string;
  livePreviewProjectIds: string[];
}

function ProjectsShowcase({
  projects,
  primaryColor,
  livePreviewProjectIds,
}: ProjectsShowcaseProps) {
  const firstTwo = projects.slice(0, 2);
  const [selectedSimId, setSelectedSimId] = useState<string>(firstTwo[0]?.id ?? '');
  const [simPayload, setSimPayload] = useState<string>(
    JSON.stringify({ event: 'push', repository: firstTwo[0]?.title ?? 'repo', commits: 5, ref: 'refs/heads/main' }, null, 2)
  );
  const [simOutput, setSimOutput] = useState<string[]>([
    'System ready. Select a service above and click "Simulate Pipeline Execution" to run.',
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const selectSimulation = (project: Project) => {
    setSelectedSimId(project.id);
    setSimPayload(JSON.stringify({ event: 'push', repository: project.title, commits: 5, ref: 'refs/heads/main' }, null, 2));
    setSimOutput([`System ready. Click "Simulate Pipeline" to trigger a run against ${project.title}.`]);
    setSimStep(0);
  };

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);

    const logs: string[] = [];
    const pushLog = (msg: string) => {
      logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setSimOutput([...logs]);
    };

    pushLog('⚡ Incoming event detected on service gateway');

    await new Promise(r => setTimeout(r, 600));
    setSimStep(2);
    pushLog('🔍 Parsing payload signature & validating checksum...');

    await new Promise(r => setTimeout(r, 700));
    setSimStep(3);
    pushLog('📦 Event loop checking pool congestion. Allocating thread task queue...');

    await new Promise(r => setTimeout(r, 800));
    setSimStep(4);
    pushLog('💾 Querying local cache for related state...');
    pushLog('🟢 CACHE HIT - bypassed database lookup to avoid redundant connections');

    await new Promise(r => setTimeout(r, 900));
    setSimStep(5);
    pushLog('🚀 Dispatching asynchronous task to microservice workers...');
    pushLog('✅ System completed dispatch. Status: 202 Accepted.');

    setIsSimulating(false);
  };

  return (
    <section className="py-20" id="projects">
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">

        {/* Header Title */}
        <div className="text-center @md:text-left mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Interactive Engineering Portfolio</span>
          </div>
          <h2 className="font-serif text-3xl @sm:text-4xl font-normal italic tracking-tight text-white">
            System Code & Showcases
          </h2>
          <p className="font-sans text-sm @sm:text-base text-slate-400 max-w-xl">
            A hand-picked selection of high-concurrency systems, synchronization engines, and low-latency API architectures built with clean interfaces.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-8 mb-20" id="projects-grid-list">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`relative overflow-hidden rounded-3xl bg-white/5 border transition-all hover:bg-white/10 hover:scale-[1.01] flex flex-col justify-between ${
                project.featured
                  ? 'border-white/20 ring-1 ring-white/10'
                  : 'border-white/10'
              }`}
              id={`project-card-${project.id}`}
            >

              {/* Card Body */}
              <div className="p-6 @sm:p-8 space-y-6">

                {/* Visual Image Header */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10">
                  <TemplateProjectPreview
                    templateId="bluish"
                    liveUrl={project.liveUrl}
                    projectId={project.id}
                    livePreviewProjectIds={livePreviewProjectIds}
                    alt={project.title}
                    loading="lazy"
                    containerClassName="h-full aspect-auto bg-[#0a0a0a]"
                    className="h-full w-full object-cover object-top opacity-75 transition-all duration-300 group-hover:opacity-90"
                  />
                  {/* Category overlay */}
                  {project.language && (
                    <div className="absolute top-4 left-4 max-w-[45%] truncate bg-[#0a0a0a]/95 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300">
                      {project.language}
                    </div>
                  )}

                  {project.featured && (
                    <div className="absolute top-4 right-4 max-w-[45%] truncate bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-right text-[11px] font-mono text-white font-semibold">
                      Featured Build
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-white leading-tight">
                    {project.title}
                  </h3>
                  <p className="font-sans text-sm text-slate-400 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Badges */}
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg bg-[#0a0a0a] border border-white/10 text-xs font-mono text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata and Links */}
              <div className="px-6 @sm:px-8 py-5 border-t border-white/10 bg-white/2 flex flex-wrap justify-between items-center gap-4">

                {/* Git Statistics */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
                    <Star className="h-3.5 w-3.5" />
                    <span>{project.githubStars ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
                    <GitFork className="h-3.5 w-3.5" />
                    <span>{project.githubForks ?? 0}</span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex items-center gap-2">
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-[#0a0a0a] hover:bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all"
                      id={`project-source-link-${project.id}`}
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Source</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-white hover:bg-slate-100 text-slate-950 transition-all shadow"
                      id={`project-live-link-${project.id}`}
                    >
                      <span>Launch</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Architectural Playground Section */}
        {firstTwo.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-4 @sm:p-10 shadow-2xl space-y-8" id="system-sandbox">

            {/* Headline and controls */}
            <div className="flex flex-col @md:flex-row @md:items-start justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-2">
                <h3 className="font-display text-xl @sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>Architectural Execution Playground</span>
                </h3>
                <p className="font-sans text-xs @sm:text-sm text-slate-400 max-w-xl">
                  Simulate low-level event flows, webhook triggers, and runtime socket handshakes built natively on my core components.
                </p>
              </div>

              {/* Sim Switcher */}
              <div className="flex max-w-full gap-2 overflow-x-auto bg-white/5 p-1.5 rounded-xl border border-white/10 self-stretch @md:self-start">
                {firstTwo.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => selectSimulation(project)}
                    className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      selectedSimId === project.id
                        ? 'bg-[#0a0a0a] text-white border border-white/10 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id={`sim-selector-${project.id}`}
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox workspace */}
            <div className="grid grid-cols-1 @lg:grid-cols-12 gap-8 items-stretch">

              {/* Left Block: JSON Input and Action (5/12) */}
              <div className="@lg:col-span-5 flex flex-col justify-between space-y-5" id="sim-input-card">
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    Interactive Event Payload (Editable)
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]/80">
                    <textarea
                      rows={7}
                      value={simPayload}
                      onChange={(e) => setSimPayload(e.target.value)}
                      className="w-full bg-transparent p-4 font-mono text-xs text-slate-300 focus:outline-none focus:ring-0 placeholder-slate-600 leading-relaxed resize-none"
                      id="sim-payload-editor"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      JSON Format
                    </div>
                  </div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="h-auto w-full whitespace-normal text-center leading-snug flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 transition-colors shadow"
                  id="sim-trigger-btn"
                >
                  {isSimulating ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      <span>Executing pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-slate-700 fill-current" />
                      <span>Simulate Pipeline</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Block: Flow chart & Live Terminal logs (7/12) */}
              <div className="@lg:col-span-7 flex flex-col justify-between space-y-6">

                {/* Flowchart Diagram tracker */}
                <div className="bg-white/5 p-4 @sm:p-5 rounded-2xl border border-white/10 space-y-4">
                  <span className="block text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    Visual Architecture Process Sequence
                  </span>
                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 text-center text-[10px] font-mono">
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        simStep === 1 || simStep === 2
                          ? 'border-blue-500 text-white bg-blue-500/10 scale-105'
                          : simStep > 1
                            ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'
                            : 'border-white/10 bg-[#0a0a0a]/50'
                      }`}
                    >
                      <Network className="h-4 w-4 mx-auto mb-1.5 text-slate-500" style={{ color: simStep === 1 ? primaryColor : undefined }} />
                      <span className="block font-bold">1. RECEIVE</span>
                      <span className="text-[9px] text-slate-500">Gateway Port</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        simStep === 3 || simStep === 4
                          ? 'border-blue-500 text-white bg-blue-500/10 scale-105'
                          : simStep > 3
                            ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'
                            : 'border-white/10 bg-[#0a0a0a]/50'
                      }`}
                    >
                      <Cpu className="h-4 w-4 mx-auto mb-1.5 text-slate-500" style={{ color: simStep === 3 ? primaryColor : undefined }} />
                      <span className="block font-bold">2. PROCESS</span>
                      <span className="text-[9px] text-slate-500">Event Loop Pool</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        simStep === 5
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 scale-105'
                          : 'border-white/10 bg-[#0a0a0a]/50'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 mx-auto mb-1.5 text-slate-500" style={{ color: simStep === 5 ? '#10b981' : undefined }} />
                      <span className="block font-bold">3. DISPATCH</span>
                      <span className="text-[9px] text-slate-500">Sync Success</span>
                    </div>
                  </div>
                </div>

                {/* Live Terminal Output Console */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between h-48">

                  {/* Console header */}
                  <div className="bg-white/5 border-b border-white/10 px-3 @sm:px-4 py-2 flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                      <span className="ml-1.5 text-slate-400">system-compiler-logs</span>
                    </div>
                    <span>UTF-8 // BUN_SHELL</span>
                  </div>

                  {/* Console body */}
                  <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto [overflow-wrap:anywhere] space-y-2 text-slate-300">
                    {simOutput.map((log, idx) => (
                      <div key={idx} className={idx === 0 && isSimulating ? 'text-white font-bold animate-pulse' : 'opacity-85'}>
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Console footer */}
                  <div className="bg-[#0a0a0a] border-t border-white/5 px-3 @sm:px-4 py-1.5 flex flex-wrap justify-between items-center gap-2 text-[9px] font-mono text-slate-500">
                    <span>MEMORY_USAGE: 24.8MB</span>
                    <span>LATENCY: 0.04ms</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

// ==========================================
// 7. ARTICLES AND SOCIALS COMPONENT
// ==========================================
interface ArticlesAndSocialsProps {
  articles: Article[];
  socialProfiles: SocialProfile[];
  certifications: Certification[];
  achievements: Achievement[];
  customSections: CustomSection[];
  primaryColor: string;
}

function ArticlesAndSocials({
  articles,
  socialProfiles,
  certifications,
  achievements,
  customSections,
  primaryColor,
}: ArticlesAndSocialsProps) {
  const [certVerified, setCertVerified] = useState<string | null>(null);

  const handleVerifyCert = (certId: string) => {
    setCertVerified(certId);
    setTimeout(() => {
      setCertVerified(null);
    }, 3000);
  };

  return (
    <section className="py-20 bg-transparent" id="achievements">
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">

        <div className="grid grid-cols-1 @lg:grid-cols-12 gap-10 @lg:gap-16">

          {/* Left Block: Papers, Certs, & Custom Focus (7/12) */}
          <div className="@lg:col-span-7 space-y-12">

            {/* Certifications Card list */}
            {certifications.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                    style={{ color: primaryColor }}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Professional Credentials</h3>
                </div>

                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col @sm:flex-row @sm:items-center justify-between gap-4 group hover:border-white/20 transition-all"
                      id={`cert-card-${cert.id}`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-display text-base font-bold text-white">
                          {cert.name}
                        </h4>
                        <p className="font-sans text-xs text-slate-400">
                          Issued by <span className="font-semibold text-slate-300">{cert.issuer}</span>
                          {cert.issueDate && <> &bull; {formatMonthYear(cert.issueDate)}</>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start @sm:self-center shrink-0">
                        <button
                          onClick={() => handleVerifyCert(cert.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                            certVerified === cert.id
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-[#0a0a0a] text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                          }`}
                          id={`cert-verify-btn-${cert.id}`}
                        >
                          {certVerified === cert.id ? '✓ CREDENTIAL_VALID' : 'Verify TLS Checksum'}
                        </button>
                        {cert.url && (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#0a0a0a] text-slate-500 hover:text-white border border-white/10 rounded-lg transition-colors"
                            title="Open Credential"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Articles */}
            {articles.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                    style={{ color: primaryColor }}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Engineering Papers & Articles</h3>
                </div>

                <div className="space-y-4">
                  {articles.map((art) => (
                    <a
                      key={art.id}
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 block group hover:bg-white/10 transition-all space-y-3"
                      id={`article-card-${art.id}`}
                    >
                      <div className="space-y-1">
                        {art.publishedAt && (
                          <span className="text-[10px] font-mono text-slate-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-white/10">
                            {formatMonthYear(art.publishedAt)}
                          </span>
                        )}
                        <h4 className="font-display text-base font-bold text-white group-hover:text-white leading-snug pt-1">
                          {art.title}
                        </h4>
                        {art.description && (
                          <p className="font-sans text-xs text-slate-400 leading-relaxed line-clamp-2">{art.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                        <span>Read entire publication{art.readTime ? ` · ${art.readTime} min` : ''}</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Sections: dynamic, shape defined per section */}
            {customSections.map((section) => (
              <div key={section.id} className="space-y-6" id={`custom-section-${section.id}`}>
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                    style={{ color: primaryColor }}
                  >
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{section.label}</h3>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => {
                    const { name, description } = getCustomItemFields(item);
                    return (
                      <div
                        key={itemIdx}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                      >
                        <h4 className="font-display text-base font-bold text-white flex items-center gap-2">
                          <Zap className="h-4.5 w-4.5 shrink-0" style={{ color: primaryColor }} />
                          <span>{name}</span>
                        </h4>
                        {description && (
                          <p className="font-sans text-sm text-slate-400 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>

          {/* Right Block: Milestones, Accolades, & Social stats (5/12) */}
          <div className="@lg:col-span-5 space-y-12">

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                    style={{ color: primaryColor }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Honors & Competitions</h3>
                </div>

                <div className="relative pl-4 space-y-8">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="relative pl-6 border-l border-white/10 space-y-2 group"
                      id={`achievement-card-${ach.id}`}
                    >
                      <div
                        className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-800 border transition-all duration-300 group-hover:scale-125"
                        style={{ borderColor: primaryColor }}
                      />
                      <div className="space-y-1">
                        {ach.date && (
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {formatMonthYear(ach.date)}
                          </span>
                        )}
                        <h4 className="font-display text-sm font-bold text-white leading-snug group-hover:text-slate-300 transition-colors">
                          {ach.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social profiles with stats */}
            {socialProfiles.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10"
                    style={{ color: primaryColor }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Operational Hubs</h3>
                </div>

                <div className="space-y-4">
                  {socialProfiles.map((prof) => {
                    const isGitHub = prof.platform.toLowerCase() === 'github';
                    const followers = getStat(prof.cachedStats, 'followers');
                    const publicRepos = getStat(prof.cachedStats, 'publicRepos');
                    const connections = getStat(prof.cachedStats, 'connections');
                    return (
                      <a
                        key={prof.platform}
                        href={prof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 block group hover:bg-white/10 transition-all"
                        id={`social-card-${prof.platform}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0a] border border-white/10 text-slate-300 group-hover:text-white transition-colors">
                              {isGitHub ? <Github className="h-5 w-5" /> : <Linkedin className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-display text-base font-bold text-white uppercase tracking-wide">
                                {prof.platform}
                              </h4>
                              {prof.username && <span className="font-mono text-xs text-slate-400">@{prof.username}</span>}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                        </div>

                        {/* Display Cached Stats beautifully */}
                        {prof.cachedStats && (
                          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-center font-mono text-xs">
                            {isGitHub ? (
                              <>
                                <div>
                                  <span className="block text-[11px] text-slate-500 uppercase">Followers</span>
                                  <span className="font-bold text-white text-sm">{followers}</span>
                                </div>
                                <div>
                                  <span className="block text-[11px] text-slate-500 uppercase">Repositories</span>
                                  <span className="font-bold text-white text-sm">{publicRepos}</span>
                                </div>
                              </>
                            ) : (
                              <div className="col-span-2 text-left px-2">
                                <span className="inline-block text-[11px] text-slate-500 uppercase mr-2">Connections:</span>
                                <span className="font-bold text-emerald-400 text-sm">{connections}+ Industry Experts</span>
                              </div>
                            )}
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

// ==========================================
// 8. CONTACT CRM COMPONENT
// ==========================================
interface ContactCRMProps {
  contactEmail: string | null;
  primaryColor: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  org: string;
  topic: string;
  text: string;
  timestamp: string;
}

function isStoredMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;

  const message = value as Record<string, unknown>;
  return (
    typeof message.id === 'string' &&
    typeof message.name === 'string' &&
    typeof message.email === 'string' &&
    typeof message.org === 'string' &&
    typeof message.topic === 'string' &&
    typeof message.text === 'string' &&
    typeof message.timestamp === 'string'
  );
}

function ContactCRM({ contactEmail, primaryColor }: ContactCRMProps) {
  const messageStorageKey = `pulse_portfolio_messages:${contactEmail ?? 'anonymous'}`;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [topic, setTopic] = useState('Hiring');
  const [text, setText] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiLogs, setApiLogs] = useState<string[]>(['REST listener listening on port 3000...']);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(messageStorageKey);
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (!Array.isArray(parsed) || !parsed.every(isStoredMessage)) {
            throw new Error('Saved messages have an invalid format');
          }

          setMessages(parsed);
          return;
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : 'Unknown storage error';
          localStorage.removeItem(messageStorageKey);
          setApiLogs((current) => [
            `[storage] Invalid saved inbox was reset: ${reason}`,
            ...current,
          ]);
        }
      }

      const starterMessages: Message[] = [
        {
          id: 'msg_starter_1',
          name: 'Sarah Jenkins',
          email: 'sjenkins@techstaffing.io',
          org: 'Prism Tech Partners',
          topic: 'Hiring',
          text: 'Hi, loved your open-source work. We are currently scouting a Lead Engineer with expertise in high-throughput backend systems. Let me know if you would be open to a casual discovery chat sometime next week!',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ];
      setMessages(starterMessages);
      localStorage.setItem(messageStorageKey, JSON.stringify(starterMessages));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [messageStorageKey]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !text) return;

    setIsSubmitting(true);
    const newLogs = [...apiLogs];
    newLogs.unshift(`[${new Date().toLocaleTimeString()}] 📨 Incoming HTTP POST request /api/v1/contact`);
    setApiLogs(newLogs);

    await new Promise(resolve => setTimeout(resolve, 800));

    const newMessage: Message = {
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      org: org || 'Independent Recruiter',
      topic,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem(messageStorageKey, JSON.stringify(updatedMessages));

    setName('');
    setEmail('');
    setOrg('');
    setTopic('Hiring');
    setText('');
    setIsSubmitting(false);

    const completedLogs = [
      `[${new Date().toLocaleTimeString()}] ✅ DB Transaction SUCCESS - Message stored securely (ID: ${newMessage.id})`,
      `[${new Date().toLocaleTimeString()}] 💾 Allocated index lookup block for payload validation`,
      ...newLogs
    ];
    setApiLogs(completedLogs);
  };

  const handleClearMessages = () => {
    localStorage.removeItem(messageStorageKey);
    setMessages([]);
    setApiLogs([`[${new Date().toLocaleTimeString()}] 🗑️ Cleared client database logs`]);
  };

  return (
    <section className="py-20 border-t border-white/10" id="contact">
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">

        {/* Title Heading */}
        <div className="text-center @md:text-left mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Interactive Contact Gateway</span>
          </div>
          <h2 className="font-serif text-3xl @sm:text-4xl font-normal italic tracking-tight text-white">
            Secure Message Dispatcher
          </h2>
          <p className="font-sans text-sm @sm:text-base text-slate-400 max-w-xl">
            A real-time reactive REST transaction log dashboard representing custom CRM databases running server-side.
          </p>
        </div>

        <div className="grid grid-cols-1 @lg:grid-cols-12 gap-12 items-stretch">

          {/* Left Block: Interactive Contact Form (7/12) */}
          <div className="@lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-6 @sm:p-8 space-y-6" id="contact-form-card">
            <div className="flex flex-col @sm:flex-row @sm:justify-between @sm:items-center gap-3 border-b border-white/10 pb-4">
              <h3 className="font-display text-base @sm:text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-4.5 w-4.5" style={{ color: primaryColor }} />
                Initialize REST Connection
              </h3>
              <button
                onClick={() => setInboxOpen(!inboxOpen)}
                className={`self-start px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                  inboxOpen
                    ? 'bg-[#0a0a0a] text-white border-white/15'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
                id="contact-inbox-toggle-btn"
              >
                <Inbox className="h-4 w-4" />
                <span>Inbox ({messages.length})</span>
              </button>
            </div>

            {!inboxOpen ? (
              <form onSubmit={handleSendMessage} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold uppercase tracking-wide">Client/Recruiter Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white/30 transition-colors"
                      id="contact-input-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold uppercase tracking-wide">Secure Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white/30 transition-colors"
                      id="contact-input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold uppercase tracking-wide">Organization name</label>
                    <input
                      type="text"
                      placeholder="Acme Systems"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white/30 transition-colors"
                      id="contact-input-organization"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold uppercase tracking-wide">Inquiry Topic Domain</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white/30 transition-colors"
                      id="contact-input-topic"
                    >
                      <option value="Hiring">Hiring / Core Role Opportunity</option>
                      <option value="Consultancy">Consultancy / Tech Architecture</option>
                      <option value="OpenSource">Open-Source Discussion</option>
                      <option value="Other">General / Saying Hi</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wide">Encrypted Message Payload</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your engineering vacancy, stack demands, or consultancy request here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white p-4 rounded-xl text-sm focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                    id="contact-input-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-auto w-full whitespace-normal text-center leading-snug flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 transition-colors"
                  id="contact-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Transmitting HTTP POST Packet...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-slate-800" />
                      <span>Transmit REST Request Packet</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-fadeIn font-mono">
                <div className="flex flex-col @sm:flex-row @sm:justify-between @sm:items-center gap-3">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Stored REST Records (Local DB Storage)</span>
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearMessages}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/5 px-2.5 py-1 rounded border border-red-500/10 transition-colors"
                      id="contact-clear-db-btn"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Records</span>
                    </button>
                  )}
                </div>

                {messages.length > 0 ? (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1" id="contact-inbox-scroller">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-2.5"
                      >
                        <div className="flex flex-col @sm:flex-row @sm:justify-between @sm:items-start gap-3 @sm:gap-4">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{msg.name}</span>
                              <span className="text-[10px] font-normal text-slate-500">of</span>
                              <span className="text-xs text-slate-300 font-semibold">{msg.org}</span>
                            </h4>
                            <p className="break-all text-[10px] text-slate-500 lowercase pt-0.5">{msg.email}</p>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{
                              color: primaryColor,
                              backgroundColor: `${primaryColor}10`,
                              borderColor: `${primaryColor}20`
                            }}
                          >
                            {msg.topic}
                          </span>
                        </div>

                        <p className="font-sans text-xs text-slate-300 leading-relaxed bg-[#0a0a0a] border border-white/5 p-2.5 rounded-lg">
                          {msg.text}
                        </p>

                        <div className="flex flex-col @sm:flex-row @sm:justify-between @sm:items-center gap-1 text-[9px] text-slate-500 pt-1">
                          <span className="break-all">REST_TRANSACTION_ID: {msg.id}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#0a0a0a] border border-dashed border-white/10 rounded-2xl space-y-3 font-mono">
                    <p className="text-xs text-slate-500">Your recruiting inbox is completely empty.</p>
                    <button
                      onClick={() => setInboxOpen(false)}
                      className="text-[11px] font-semibold px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 transition-colors"
                    >
                      Write Starter Message
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Block: Live API Transaction Log Terminal (5/12) */}
          <div className="@lg:col-span-5 flex flex-col justify-between" id="api-transaction-console">

            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between h-full min-h-[300px]">

              {/* Header */}
              <div className="bg-white/5 border-b border-white/10 px-4 py-3.5 flex flex-wrap justify-between items-center gap-2 text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-4 w-4" style={{ color: primaryColor }} />
                  <span className="text-slate-400 font-semibold">express-server-logs</span>
                </div>
                <span>Port 3000 // Bun</span>
              </div>

              {/* Logs terminal body */}
              <div className="flex-1 p-5 font-mono text-[10.5px] leading-relaxed text-slate-400 overflow-y-auto [overflow-wrap:anywhere] max-h-[320px] space-y-2.5">
                {apiLogs.map((log, idx) => {
                  let logColor = 'text-slate-400';
                  if (log.includes('📨 Incoming')) logColor = 'text-blue-400 font-semibold';
                  if (log.includes('✅ DB Transaction')) logColor = 'text-emerald-400 font-semibold';
                  if (log.includes('🗑️')) logColor = 'text-amber-400 font-semibold';

                  return (
                    <div key={idx} className={logColor}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {/* Status footer */}
              <div className="p-4 border-t border-white/10 bg-white/2 flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>POSTGRES_POOL_STATUS: ACTIVE</span>
                <span>IDLE: 0.0ms</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

// ==========================================
// 9. MAIN APP COMPONENT
// ==========================================
export function PulseTemplate({ data }: AppProps) {
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

  const customization: PortfolioCustomization = portfolio.customization ?? {};
  const initialPrimaryColor =
    typeof customization.primaryColor === 'string' ? customization.primaryColor : '#3b82f6';

  const [activeSection, setActiveSection] = useState('about');
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);

  const accentColors = [
    { name: 'Blue', hex: '#3b82f6', className: 'bg-blue-500' },
    { name: 'Emerald', hex: '#10b981', className: 'bg-emerald-500' },
    { name: 'Purple', hex: '#8b5cf6', className: 'bg-purple-500' },
    { name: 'Orange', hex: '#f97316', className: 'bg-orange-500' },
    { name: 'Pink', hex: '#ec4899', className: 'bg-pink-500' },
  ];

  useEffect(() => {
    const handleScrollActive = () => {
      const sections = ['about', 'experience', 'skills', 'projects', 'achievements', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollActive);
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, []);

  return (
    <div
      className={`${styles.root} ${inter.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable} @container flex min-w-0 flex-col overflow-x-hidden font-sans selection:bg-slate-800 selection:text-white`}
    >
      {/* Dynamic glow overlay */}
      <div
        className="fixed top-0 left-1/4 h-[40vh] w-[50vw] rounded-full blur-[140px] opacity-10 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Primary Header/Nav */}
      <Header
        portfolioTitle={portfolio.title}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        primaryColor={primaryColor}
        accentColors={accentColors}
        setPrimaryColor={setPrimaryColor}
      />

      {/* Main Content Sections */}
      <main className="flex-1" id="main-content-stream">

        {/* 1. Hero Bio Intro */}
        <Hero
          portfolio={portfolio}
          primaryColor={primaryColor}
        />

        {/* 2. Professional experience/educations Timeline */}
        <Timeline
          experiences={experiences}
          educations={educations}
          primaryColor={primaryColor}
        />

        {/* 3. Searchable Skills Matrix */}
        <SkillsMatrix
          skills={skills}
          primaryColor={primaryColor}
        />

        {/* 4. Projects Showcase & Architectural Playground */}
        <ProjectsShowcase
          projects={projects}
          primaryColor={primaryColor}
          livePreviewProjectIds={livePreviewProjectIds}
        />

        {/* 5. Articles, Certifications, achievements, and Focus list */}
        <ArticlesAndSocials
          articles={articles}
          socialProfiles={socialProfiles}
          certifications={certifications}
          achievements={achievements}
          customSections={customSections}
          primaryColor={primaryColor}
        />

        {/* 6. Message Dispatcher Form and Recruiter Console */}
        <ContactCRM
          contactEmail={portfolio.contactEmail}
          primaryColor={primaryColor}
        />

      </main>

      {/* Primary Footer */}
      <footer className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono tracking-widest text-slate-500 py-8 mx-auto w-full max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="flex flex-col @md:flex-row items-center justify-between w-full gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" style={{ color: primaryColor }} />
            <span>{portfolio.title.toUpperCase()}</span>
          </div>

          <p className="text-center @md:text-right">
            &copy; {new Date().getFullYear()} {portfolio.title.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
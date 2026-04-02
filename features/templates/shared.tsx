import { cn } from "@/lib/utils";
import type {
  PortfolioCustomization,
  PortfolioData,
  TemplateNavbarCustomization,
  TemplateSectionId,
} from "./types";
import { getPlatformIcon } from "./utils";

const TEMPLATE_SECTION_LABELS: Record<TemplateSectionId, string> = {
  about: "About",
  work: "Work",
  experience: "Experience",
  profiles: "Profiles",
};

const HERO_PROFILE_PLATFORMS = ["github", "linkedin"] as const;

export function getTemplateNavbarCustomization(
  customization: PortfolioCustomization | Record<string, unknown> | null | undefined
): TemplateNavbarCustomization {
  const navbar =
    customization &&
    typeof customization === "object" &&
    "navbar" in customization &&
    customization.navbar &&
    typeof customization.navbar === "object"
      ? (customization.navbar as TemplateNavbarCustomization)
      : {};

  const sections =
    navbar.sections && typeof navbar.sections === "object" ? navbar.sections : {};

  return {
    enabled: navbar.enabled !== false,
    sections,
  };
}

export function buildTemplateSections(data: PortfolioData) {
  const navbar = getTemplateNavbarCustomization(data.portfolio.customization);
  const hasProfiles =
    data.socialProfiles.length > 0 ||
    Boolean(
      data.portfolio.contactEmail ||
        data.portfolio.phone ||
        data.portfolio.websiteUrl ||
        data.portfolio.location
    );

  const availableSections: TemplateSectionId[] = [
    data.portfolio.summary ? "about" : null,
    data.projects.length > 0 ? "work" : null,
    data.experiences.length > 0 ? "experience" : null,
    hasProfiles ? "profiles" : null,
  ].filter((section): section is TemplateSectionId => Boolean(section));

  const sections = availableSections
    .filter((section) => navbar.sections?.[section] !== false)
    .slice(0, 4)
    .map((section) => ({
      id: section,
      label: TEMPLATE_SECTION_LABELS[section],
    }));

  return {
    navbarEnabled: navbar.enabled !== false && sections.length > 0,
    sections,
    hasProfiles,
  };
}

export function TemplateNavbar({
  items,
  className,
  linkClassName,
}: {
  items: Array<{ id: string; label: string }>;
  className?: string;
  linkClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 overflow-x-auto border backdrop-blur-xl",
        className
      )}
    >
      <div className="flex min-w-max items-center gap-2 p-2">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={linkClassName}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function splitDescription(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function DescriptionBlock({
  text,
  paragraphClassName,
  listClassName,
}: {
  text: string;
  paragraphClassName?: string;
  listClassName?: string;
}) {
  const lines = splitDescription(text);

  if (lines.length <= 1) {
    return <p className={paragraphClassName}>{text}</p>;
  }

  return (
    <ul className={listClassName}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export function ContactChips({
  portfolio,
  chipClassName,
}: {
  portfolio: PortfolioData["portfolio"];
  chipClassName?: string;
}) {
  const items = [
    portfolio.location,
    portfolio.contactEmail,
    portfolio.phone,
    portfolio.websiteUrl?.replace(/^https?:\/\//, ""),
  ].filter(Boolean) as string[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={chipClassName}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function SocialPills({
  profiles,
  className,
  showUsername = false,
}: {
  profiles: PortfolioData["socialProfiles"];
  className?: string;
  showUsername?: boolean;
}) {
  if (profiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {profiles.map((profile) => (
        <a
          key={`${profile.platform}-${profile.url}`}
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {getPlatformIcon(profile.platform)}
          {showUsername && profile.username ? ` · @${profile.username}` : ""}
        </a>
      ))}
    </div>
  );
}

export function HeroProfileButtons({
  profiles,
  className,
}: {
  profiles: PortfolioData["socialProfiles"];
  className?: string;
}) {
  const preferredProfiles = HERO_PROFILE_PLATFORMS.map((platform) =>
    profiles.find((profile) => profile.platform.toLowerCase() === platform)
  ).filter((profile): profile is NonNullable<(typeof profiles)[number]> => Boolean(profile));

  if (preferredProfiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {preferredProfiles.map((profile) => (
        <a
          key={`${profile.platform}-${profile.url}`}
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {getPlatformIcon(profile.platform)}
        </a>
      ))}
    </div>
  );
}

export function ProjectActions({
  liveUrl,
  sourceUrl,
  liveClassName,
  sourceClassName,
}: {
  liveUrl: string | null;
  sourceUrl: string | null;
  liveClassName?: string;
  sourceClassName?: string;
}) {
  if (!liveUrl && !sourceUrl) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={liveClassName}
        >
          Live Demo
        </a>
      )}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={sourceClassName}
        >
          Source
        </a>
      )}
    </div>
  );
}

export function StatStrip({
  items,
  className,
  labelClassName,
  valueClassName,
}: {
  items: Array<{ label: string; value: string | number | null | undefined }>;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  const visibleItems = items.filter((item) => item.value !== null && item.value !== undefined);

  if (visibleItems.length === 0) return null;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {visibleItems.map((item) => (
        <div key={item.label} className="rounded-2xl border p-4">
          <div className={valueClassName}>{item.value}</div>
          <div className={labelClassName}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ProfileLinksSection({
  portfolio,
  profiles,
  chipClassName,
  pillClassName,
  titleClassName,
  textClassName,
}: {
  portfolio: PortfolioData["portfolio"];
  profiles: PortfolioData["socialProfiles"];
  chipClassName?: string;
  pillClassName?: string;
  titleClassName?: string;
  textClassName?: string;
}) {
  const hasProfiles =
    profiles.length > 0 ||
    Boolean(
      portfolio.contactEmail ||
        portfolio.phone ||
        portfolio.websiteUrl ||
        portfolio.location
    );

  if (!hasProfiles) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className={cn("text-sm font-medium", titleClassName)}>Reach out</p>
        <p className={cn("mt-2 text-sm", textClassName)}>
          Use these links to connect, collaborate, or explore more work.
        </p>
      </div>

      <ContactChips portfolio={portfolio} chipClassName={chipClassName} />
      <SocialPills profiles={profiles} showUsername className={pillClassName} />
    </div>
  );
}

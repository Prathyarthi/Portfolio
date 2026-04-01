import {
  formatDate,
  formatDateRange,
  groupSkillsByCategory,
  getPlatformIcon,
} from "@/features/templates/utils";
import type { PortfolioData } from "@/features/templates/types";

export default function CreativeTemplate({ data }: { data: PortfolioData }) {
  const { portfolio, experiences, educations, skills, projects, socialProfiles, certifications } =
    data;
  const skillsByCategory = groupSkillsByCategory(skills);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-pink-300/40">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gray-50">
        {/* Background decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/30 via-orange-200/30 to-yellow-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-orange-300/20 via-pink-200/20 to-purple-200/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-5 md:py-32">
          {/* Left: Text (3 cols) */}
          <div className="md:col-span-3">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
              Portfolio
            </p>
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
              <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {portfolio.title}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-xl leading-relaxed text-gray-600">
              {portfolio.headline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {portfolio.location && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                  </svg>
                  {portfolio.location}
                </span>
              )}
              {portfolio.contactEmail && (
                <a
                  href={`mailto:${portfolio.contactEmail}`}
                  className="text-pink-500 underline decoration-pink-200 underline-offset-2 hover:decoration-pink-400 transition-colors"
                >
                  {portfolio.contactEmail}
                </a>
              )}
            </div>
          </div>

          {/* Right: Avatar (2 cols) */}
          <div className="flex justify-center md:col-span-2 md:justify-end">
            {portfolio.avatarUrl ? (
              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 opacity-60 blur-xl" />
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.title}
                  className="relative h-56 w-56 rounded-3xl object-cover shadow-2xl ring-4 ring-white md:h-72 md:w-72"
                />
              </div>
            ) : (
              <div className="relative h-56 w-56 rounded-3xl bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 shadow-2xl md:h-72 md:w-72" />
            )}
          </div>
        </div>
      </header>

      {/* About: Split Layout */}
      {portfolio.summary && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-5">
            <div className="md:col-span-3">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
                About
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                {portfolio.summary}
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-gray-50 p-6 space-y-4">
                {portfolio.location && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Location</p>
                    <p className="mt-1 text-gray-700">{portfolio.location}</p>
                  </div>
                )}
                {portfolio.contactEmail && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email</p>
                    <p className="mt-1 text-gray-700">{portfolio.contactEmail}</p>
                  </div>
                )}
                {portfolio.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Phone</p>
                    <p className="mt-1 text-gray-700">{portfolio.phone}</p>
                  </div>
                )}
                {portfolio.websiteUrl && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Website</p>
                    <a
                      href={portfolio.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-pink-500 underline decoration-pink-200 underline-offset-2 hover:decoration-pink-400 transition-colors"
                    >
                      {portfolio.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {experiences.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Experience</p>
                    <p className="mt-1 text-gray-700">{experiences.length} roles</p>
                  </div>
                )}
                {projects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Projects</p>
                    <p className="mt-1 text-gray-700">{projects.length} showcased</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Experience: Horizontal Timeline */}
      {experiences.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="mb-12 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
              Experience
            </h2>
            <div className="relative">
              {/* Horizontal line */}
              <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-gradient-to-r from-pink-300 via-orange-300 to-yellow-300 md:block" />
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative">
                    {/* Dot on timeline */}
                    <div className="relative mb-4 hidden md:block">
                      <div className="mx-auto h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 p-0.5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-50">
                          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-pink-100 transition-all duration-300">
                      <p className="text-xs font-medium text-orange-500">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-gray-900">
                        {exp.role}
                      </h3>
                      <p className="text-sm font-medium text-pink-500">
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="mt-1 text-xs text-gray-400">{exp.location}</p>
                      )}
                      {exp.description && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-4">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Skills: Gradient Pills */}
      {skills.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="mb-12 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
              Skills
            </h2>
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {categorySkills.map((skill, idx) => {
                      // Rotate through gradient variations for visual interest
                      const gradients = [
                        "from-pink-500 to-orange-500",
                        "from-orange-500 to-yellow-500",
                        "from-yellow-500 to-pink-500",
                        "from-pink-500 to-purple-500",
                        "from-orange-400 to-pink-500",
                      ];
                      const gradient = gradients[idx % gradients.length];
                      return (
                        <span
                          key={skill}
                          className="group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm"
                        >
                          {/* Animated gradient background */}
                          <span
                            className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90 transition-transform duration-500 group-hover:scale-110`}
                          />
                          <span
                            className={`absolute inset-0 bg-gradient-to-l ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-90`}
                          />
                          <span className="relative">{skill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects: Large Image-First Masonry Grid */}
      {projects.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="mb-12 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
              Projects
            </h2>
            <div className="columns-1 gap-6 space-y-6 md:columns-2">
              {projects.map((project, idx) => {
                // Alternate height for masonry effect
                const isTall = idx % 3 === 0;
                return (
                  <div
                    key={project.id}
                    className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    {project.imageUrl ? (
                      <div className={`relative overflow-hidden ${isTall ? "h-72" : "h-52"}`}>
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Title overlaid on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">
                              {project.title}
                            </h3>
                            {project.featured && (
                              <span className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                Featured
                              </span>
                            )}
                          </div>
                          {project.language && (
                            <p className="mt-1 text-xs text-white/70">{project.language}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`relative flex items-end bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 p-5 ${isTall ? "h-52" : "h-40"}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">
                              {project.title}
                            </h3>
                            {project.featured && (
                              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                Featured
                              </span>
                            )}
                          </div>
                          {project.language && (
                            <p className="mt-1 text-xs text-white/80">{project.language}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-sm leading-relaxed text-gray-500 line-clamp-3">
                        {project.description}
                      </p>

                      {project.techStack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-4">
                        {project.githubStars != null && project.githubStars > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {project.githubStars}
                          </span>
                        )}
                        {project.githubForks != null && project.githubForks > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm7.5-9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM5 12.75v-1a4 4 0 0 1 4-4h1.25v-1A2.25 2.25 0 0 1 12.5 4.5V3.25a2.25 2.25 0 1 0-4.5 0v1.25A4 4 0 0 0 4 8.5v1a2.25 2.25 0 1 0 1 3.25ZM4.25 11a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM11.5 1a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                            </svg>
                            {project.githubForks}
                          </span>
                        )}
                        <div className="flex-1" />
                        {project.sourceUrl && (
                          <a
                            href={project.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors"
                          >
                            Source
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Education & Certifications */}
      {(educations.length > 0 || certifications.length > 0) && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-16 md:grid-cols-2">
              {/* Education */}
              {educations.length > 0 && (
                <div>
                  <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
                    Education
                  </h2>
                  <div className="space-y-6">
                    {educations.map((edu) => (
                      <div key={edu.id}>
                        <h3 className="font-bold text-gray-900">
                          {edu.degree}
                          {edu.field && (
                            <span className="font-normal text-gray-500"> in {edu.field}</span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{edu.institution}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatDateRange(edu.startDate, edu.endDate)}
                          {edu.gpa && ` | GPA: ${edu.gpa}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div>
                  <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.15em] text-pink-500">
                    Certifications
                  </h2>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-400">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {cert.url ? (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-500 hover:text-pink-600 transition-colors"
                              >
                                {cert.name}
                              </a>
                            ) : (
                              cert.name
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {cert.issuer}
                            {cert.issueDate && ` | ${formatDate(cert.issueDate)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA Footer */}
      <footer className="relative overflow-hidden bg-gray-950">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Let&apos;s create something{" "}
            <span className="bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              amazing
            </span>{" "}
            together.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-gray-400">
            Got a project in mind? I&apos;d love to hear about it.
          </p>

          {portfolio.contactEmail && (
            <a
              href={`mailto:${portfolio.contactEmail}`}
              className="mt-8 inline-block rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-shadow"
            >
              Get in Touch
            </a>
          )}

          {/* Social links */}
          {socialProfiles.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              {socialProfiles.map((profile) => (
                <a
                  key={profile.platform}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-pink-400 transition-colors"
                >
                  {getPlatformIcon(profile.platform)}
                </a>
              ))}
              {portfolio.websiteUrl && (
                <a
                  href={portfolio.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-pink-400 transition-colors"
                >
                  Website
                </a>
              )}
            </div>
          )}

          {portfolio.phone && (
            <p className="mt-6 text-sm text-gray-600">
              <a
                href={`tel:${portfolio.phone}`}
                className="hover:text-gray-400 transition-colors"
              >
                {portfolio.phone}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

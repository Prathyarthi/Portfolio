import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-base px-4 py-10">
      <div className="hero-blob" aria-hidden />
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" aria-label="Foliofy home">
            <span
              className="font-display text-[24px] font-bold tracking-[-0.01em] text-brand-primary"
            >
              Foliofy
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/6 px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          <div className="gradient-text text-lg font-bold">Foliofy</div>
          <p className="mt-1 text-sm text-zinc-500">
            Build a portfolio site that feels like a product, not a placeholder.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>
            &copy; {new Date().getFullYear()}
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-zinc-700 md:block" />
          <Link href="/sign-in" className="transition-colors hover:text-zinc-200">
            Sign In
          </Link>
          <Link href="/sign-up" className="transition-colors hover:text-zinc-200">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}

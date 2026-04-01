import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">Foliofy</span>
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/sign-in" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="hover:text-foreground transition-colors">
            Sign Up
          </Link>
        </nav>
      </div>
    </footer>
  );
}

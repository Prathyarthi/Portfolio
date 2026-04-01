import Link from "next/link";

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        This portfolio doesn&apos;t exist or isn&apos;t published yet.
      </p>
      <Link
        href="/"
        className="text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}

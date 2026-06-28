"use client";

import { useState } from "react";
import { signIn, type SignInOptions, type SignInResponse } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { Loader2 } from "lucide-react";
import { OAuthSignInButtons } from "@/features/auth/components/oauth-sign-in-buttons";

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered. Sign in with email and password instead.",
  Configuration:
    "Social sign-in is misconfigured. Check server environment variables.",
  AccessDenied: "Sign-in was cancelled or denied.",
  GitHubEmailRequired:
    "GitHub did not share a verified email. Make one primary in GitHub settings and try again.",
  GoogleEmailRequired:
    "Google did not share an email address. Try another account or use email sign-in.",
};

type SignInFormProps = {
  githubEnabled: boolean;
  googleEnabled: boolean;
};

export function SignInForm({ githubEnabled, googleEnabled }: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const queryError = searchParams.get("error");
  const authError = queryError
    ? AUTH_ERRORS[queryError] ?? "Sign in failed. Please try again."
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = (await signIn("credentials", {
      redirect: false,
      email,
      password,
    } as SignInOptions)) as SignInResponse | undefined;

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
  };

  const showOAuthDivider = googleEnabled || githubEnabled;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your {siteConfig.name} account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthSignInButtons
          googleEnabled={googleEnabled}
          githubEnabled={githubEnabled}
        />

        {showOAuthDivider ? (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-border" aria-hidden />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none select-none"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none select-none"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {(error || authError) && (
            <p className="text-sm text-destructive text-center">
              {error || authError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

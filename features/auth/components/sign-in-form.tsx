"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { OAuthSignInButtons } from "@/features/auth/components/oauth-sign-in-buttons";

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method. Try Google or GitHub instead.",
  Configuration:
    "Social sign-in is misconfigured. Check server environment variables.",
  AccessDenied: "Sign-in was cancelled or denied.",
  GitHubEmailRequired:
    "GitHub did not share a verified email. Make one primary in GitHub settings and try again.",
  GoogleEmailRequired:
    "Google did not share an email address. Try another account.",
};

type SignInFormProps = {
  githubEnabled: boolean;
  googleEnabled: boolean;
};

export function SignInForm({ githubEnabled, googleEnabled }: SignInFormProps) {
  const searchParams = useSearchParams();

  const queryError = searchParams.get("error");
  const authError = queryError
    ? AUTH_ERRORS[queryError] ?? "Sign in failed. Please try again."
    : "";

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

        {authError ? (
          <p className="text-sm text-destructive text-center">{authError}</p>
        ) : null}

        {/* Email/password sign-in disabled — OAuth only.
        <form onSubmit={handleSubmit} className="space-y-4">
          ...
        </form>
        */}
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

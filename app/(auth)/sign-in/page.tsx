import { Suspense } from "react";
import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/lib/auth-providers";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm
        githubEnabled={isGitHubAuthEnabled()}
        googleEnabled={isGoogleAuthEnabled()}
      />
    </Suspense>
  );
}

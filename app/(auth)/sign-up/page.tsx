import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/lib/auth-providers";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <SignUpForm
      githubEnabled={isGitHubAuthEnabled()}
      googleEnabled={isGoogleAuthEnabled()}
    />
  );
}

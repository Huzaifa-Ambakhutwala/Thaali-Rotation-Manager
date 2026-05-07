import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function errorBody(error: string | undefined): { title: string; description: string } {
  switch (error) {
    case "AccessDenied":
      return {
        title: "Access denied",
        description:
          "Your Google email is not allowlisted yet. Ask an administrator to add you as a coordinator (with your zone), or confirm SUPER_ADMIN_EMAIL in the server environment matches your address.",
      };
    case "Configuration":
      return {
        title: "Authentication isn’t configured",
        description:
          "Check NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, and SUPABASE_* keys (for allowlist lookup). Restart the dev server after changing .env.",
      };
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
      return {
        title: "Google sign-in didn’t finish",
        description:
          "Google rejected the OAuth flow or the callback URL mismatch. Verify the authorized redirect URI in Google Cloud includes http://localhost:3000/api/auth/callback/google (and NEXTAUTH_URL is http://localhost:3000 for local dev).",
      };
    default:
      return {
        title: "We can’t sign you in",
        description:
          "Something went wrong during sign-in. If this keeps happening, check server logs or ask your administrator.",
      };
  }
}

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage(props: PageProps) {
  const { error } = await props.searchParams;
  const { title, description } = errorBody(error);

  return (
    <AppShell title={title} showNav={false}>
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            <Link href="/" className={cn(buttonVariants())}>
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

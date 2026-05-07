import Image from "next/image";

import { AppShell } from "@/components/app-shell";
import { SignInButton } from "@/components/sign-in-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <AppShell title="Sign in" nav="coordinator" showNav={false}>
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Thaali Rotation Manager"
                width={40}
                height={40}
                className="h-auto w-10 rounded-lg"
                priority
                style={{ height: "auto" }}
              />
              <span>Thaali Rotation Manager</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in with Google to manage your zone roster, rotations calendar,
              and reminder notifications.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SignInButton />
            </div>
            <p className="text-xs text-muted-foreground">
              If your email is not allowlisted, you’ll be redirected to{" "}
              <span className="font-medium text-foreground">/auth/error</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

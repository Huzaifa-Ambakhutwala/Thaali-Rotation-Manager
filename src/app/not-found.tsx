import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <AppShell title="Not found" showNav={false}>
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Page not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The page you’re looking for doesn’t exist.
            </p>
            <Link href="/" className={cn(buttonVariants())}>
              Go home
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


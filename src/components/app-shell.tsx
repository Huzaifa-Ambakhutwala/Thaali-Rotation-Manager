"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { href: string; label: string };

const coordinatorNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/members", label: "Zone Members" },
  { href: "/dashboard/rotations", label: "Rotations" },
  { href: "/dashboard/auto-assign", label: "Auto Assign" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/zones", label: "Zones" },
  { href: "/admin/coordinators", label: "Coordinators" },
];

function SideNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  nav = "coordinator",
  title,
  showNav = true,
}: {
  children: React.ReactNode;
  nav?: "coordinator" | "admin";
  title?: string;
  showNav?: boolean;
}) {
  const items = nav === "admin" ? adminNav : coordinatorNav;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            {showNav ? (
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger
                    render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
                  >
                    <Menu className="h-4 w-4" />
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Image
                          src="/logo.png"
                          alt="Thaali Rotation Manager"
                          width={22}
                          height={22}
                          className="h-auto w-[22px] rounded-md"
                          style={{ height: "auto" }}
                        />
                        <span className="text-sm font-semibold">
                          Thaali Rotation Manager
                        </span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SideNav items={items} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Thaali Rotation Manager"
                width={22}
                height={22}
                className="h-auto w-[22px] rounded-md"
                priority
                style={{ height: "auto" }}
              />
              <span className="hidden text-sm font-semibold md:inline">
                Thaali Rotation Manager
              </span>
            </Link>
          </div>

          {title ? (
            <>
              <Separator orientation="vertical" className="mx-2 h-6" />
              <div className="text-sm font-medium text-foreground">{title}</div>
            </>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {showNav ? (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <div className="rounded-xl border bg-card p-3">
              <div className="px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground">
                {nav === "admin" ? "Admin" : "Zone Coordinator"}
              </div>
              <SideNav items={items} />
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-7xl px-4 py-12">{children}</main>
      )}
    </div>
  );
}


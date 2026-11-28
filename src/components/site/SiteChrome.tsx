"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button, Logo } from "@/components/atlas";
import { useAuthStore } from "@/lib/auth/authStore";
import { cn } from "@/lib/utils";

const LINKS = [["/features", "Features"], ["/how-it-works", "How it works"], ["/about", "About"], ["/contact", "Contact"]] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1220px] items-center gap-6 px-4 md:px-6">
        <Logo />
        <nav aria-label="Site" className="hidden gap-1 md:flex">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
              className={cn("rounded-pill px-3 py-1.5 text-[15px] font-medium transition-colors", pathname === href ? "text-ink" : "text-ink-2 hover:text-ink")}>{label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Both icons render; CSS picks one, so server and client HTML match (resolvedTheme is unknown on the server). */}
          <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme"
            className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
            <Sun className="hidden size-[18px] dark:block" aria-hidden /><Moon className="size-[18px] dark:hidden" aria-hidden />
          </button>
          {user ? <Button variant="pri" size="sm" asChild><Link href="/today">Open the app</Link></Button> : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link href="/login">Log in</Link></Button>
              <Button variant="pri" size="sm" asChild><Link href="/signup">Get started</Link></Button>
            </>
          )}
          <button type="button" className="grid size-10 place-items-center rounded-full md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav aria-label="Site" className="border-t border-line bg-bg px-4 py-3 md:hidden">
          {LINKS.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-[12px] px-3 py-2.5 font-medium">{label}</Link>)}
          {!user ? <Link href="/login" className="block rounded-[12px] px-3 py-2.5 font-medium">Log in</Link> : null}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1220px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-2">A reading companion that explains any research paper, cites every claim, and shows what to learn next.</p>
        </div>
        {[["Product", [["/features", "Features"], ["/how-it-works", "How it works"], ["/signup", "Get started"], ["/login", "Log in"]]],
          ["Company", [["/about", "About"], ["/contact", "Contact"]]],
          ["Legal", [["/about#privacy", "Privacy"], ["/about#terms", "Terms"]]]].map(([h, links]) => (
          <div key={h as string}>
            <p className="text-[13px] font-semibold text-ink-3">{h as string}</p>
            <ul className="mt-3 space-y-2 text-[15px]">{(links as string[][]).map(([href, l]) => <li key={href}><Link href={href} className="hover:text-moss-text">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-[1220px] px-4 pb-8 text-[13px] text-ink-3 md:px-6">© {new Date().getFullYear()} OpenResearch · insightway.in · Made for readers in every field.</p>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg"><SiteHeader /><main id="main">{children}</main><SiteFooter /></div>;
}

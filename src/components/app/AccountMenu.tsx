"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Globe, GraduationCap, LogOut, Settings } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/auth/authStore";
import { useLibrary } from "@/lib/data";
import { fieldKey, fieldVar } from "@/lib/fields";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Avatar with a ring showing the fields the reader reads most. */
export function FieldRingAvatar({ size = 40 }: { size?: number }) {
  const user = useAuthStore((s) => s.user);
  const { papers } = useLibrary();
  const counts = new Map<string, number>();
  for (const p of papers ?? []) {
    if (p.field) { const k = fieldKey(p.field); counts.set(k, (counts.get(k) ?? 0) + 1); }
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  let acc = 0;
  const stops = total
    ? [...counts.entries()].map(([k, n]) => { const from = (acc / total) * 360; acc += n; return `${fieldVar(k as never)} ${from}deg ${(acc / total) * 360}deg`; }).join(", ")
    : "var(--moss) 0deg 360deg";
  const initial = (user?.displayName?.[0] || user?.email?.[0] || "R").toUpperCase();
  return (
    <span className="grid shrink-0 place-items-center rounded-full p-[3px]" style={{ width: size, height: size, background: `conic-gradient(${stops})` }}>
      <span className="grid size-full place-items-center overflow-hidden rounded-full bg-surface text-[15px] font-semibold">
        {/* External Google profile photo: next/image would need every provider domain whitelisted. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {user?.photoURL ? <img src={user.photoURL} alt="" className="size-full object-cover" referrerPolicy="no-referrer" /> : initial}
      </span>
    </span>
  );
}

export function AccountMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = async () => { await signOut(auth); router.push("/signed-out"); };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Account menu" className="rounded-full transition-transform duration-[var(--t-med)] ease-spring hover:scale-105">
          <FieldRingAvatar />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-lg p-1.5">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold">{user?.displayName || "Your account"}</p>
          <p className="truncate text-xs text-ink-3">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/learning"><GraduationCap /> My learning</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/settings"><Settings /> Settings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/"><Globe /> Public site</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()}><LogOut /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { BookOpen, GraduationCap, House, Library } from "lucide-react";

export const APP_NAV = [
  { key: "today", label: "Today", href: "/today", icon: House },
  { key: "reading", label: "Reading", href: "/papers", icon: BookOpen },
  { key: "resources", label: "Resources", href: "/resources", icon: Library },
  { key: "learning", label: "My learning", href: "/learning", icon: GraduationCap },
] as const;

export function activeNav(pathname: string) {
  if (pathname.startsWith("/papers")) return "reading";
  if (pathname.startsWith("/resources")) return "resources";
  if (pathname.startsWith("/learning")) return "learning";
  if (pathname.startsWith("/today")) return "today";
  return null;
}

/**
 * Re-mounts on every app navigation (that's what a template is for), so each page fades in.
 * Opacity only: a transform here would trap the workspace's fixed ask bar inside the page while it animates.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
